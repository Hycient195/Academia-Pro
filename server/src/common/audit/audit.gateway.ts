import { Injectable, Logger, Inject, Optional, OnModuleDestroy, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorageService } from '@nestjs/throttler';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity, AuditLogData } from '../../security/types/audit.types';
import { AuditConfigService } from './audit.config';
import { AuditSubscriptionService, ClientSubscription, SubscriptionFilter } from './audit-subscription.service';
import { AuditSocketGuard } from './audit-socket.guard';
import { AuditSocketInterceptor } from './audit-socket.interceptor';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

interface AuthenticatedSocket {
  id: string;
  handshake: {
    address: string;
    headers: Record<string, any>;
    auth?: { token?: string };
    query?: Record<string, any>;
  };
  emit(event: string, data: any): void;
  disconnect(): void;
  userId?: string;
  userRole?: string;
  schoolId?: string;
  sessionId?: string;
}

interface SubscriptionData {
  eventTypes?: string[];
  severities?: string[];
  resources?: string[];
  users?: string[];
  minSeverity?: string;
}

// Using ClientSubscription from audit-subscription.service.ts

interface AuditEventPayload {
  event: AuditLogData;
  timestamp: Date;
  broadcastId: string;
}

interface MetricsUpdatePayload {
  metrics: {
    totalActivities: number;
    activeUsers: number;
    apiRequests: number;
    securityEvents: number;
    activitiesGrowth?: number;
    usersGrowth?: number;
    apiGrowth?: number;
    securityGrowth?: number;
  };
  timestamp: Date;
  updateId: string;
}

@Injectable()
@UseInterceptors(AuditSocketInterceptor)
@WebSocketGateway({
  namespace: '/audit',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class AuditGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer()
  server: any;

  private readonly logger = new Logger(AuditGateway.name);
  private readonly connectedClients = new Map<string, ClientSubscription>();
  private readonly connectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    peakConnections: 0,
    connectionErrors: 0,
    messagesSent: 0,
    messagesReceived: 0,
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // TODO: Once @nestjs/websockets is installed, uncomment and use these decorators:

  constructor(
    private readonly jwtService: JwtService,
    private readonly auditConfig: AuditConfigService,
    @Optional()
    private readonly auditService?: AuditService,
    @Inject('ThrottlerStorageService')
    @Optional()
    private readonly throttlerStorage?: ThrottlerStorageService,
  ) {
    // Register gateway globally to avoid circular dependency
    (global as any).auditGateway = this;
    console.log('🔌🔌🔌 AUDIT GATEWAY CONSTRUCTOR CALLED - THIS SHOULD BE VISIBLE');
    this.logger.log('🔌 Audit Gateway initialized and registered globally');
    this.logger.log(`📡 Gateway namespace: /audit`);
    this.logger.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    this.logger.log('🚀 Audit Gateway constructor called successfully');
  }
  /**
   * Initialize the gateway with a WebSocket server instance
   * This will be called when WebSocket packages are available
   */
  setServer(server: any): void {
    this.server = server;
    this.logger.log('Audit WebSocket Gateway initialized with server instance');
    this.startHeartbeat();
    this.startCleanupInterval();
  }

  /**
   * Broadcast audit event to subscribed clients
   */
  async broadcastAuditEvent(event: AuditLogData): Promise<void> {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized - cannot broadcast audit event');
      return;
    }

    const payload: AuditEventPayload = {
      event,
      timestamp: new Date(),
      broadcastId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    let broadcastCount = 0;

    for (const [socketId, subscription] of this.connectedClients) {
      try {
        if (this.shouldSendEventToClient(event, subscription)) {
          // Use the correct Socket.io v4 API to get socket
          const socket = (this.server as any).sockets?.sockets?.get(socketId);
          if (socket) {
            socket.emit('audit_event', payload);
            broadcastCount++;
          } else {
            this.logger.warn(`Socket ${socketId} not found in server sockets`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to send event to ${socketId}: ${error.message}`);
      }
    }

    this.connectionMetrics.messagesSent += broadcastCount;

    if (broadcastCount > 0) {
      this.logger.debug(`Broadcasted audit event to ${broadcastCount} clients`);
    }
  }

  /**
   * Broadcast metrics update to all connected clients
   */
  async broadcastMetricsUpdate(metrics: MetricsUpdatePayload['metrics']): Promise<void> {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized - cannot broadcast metrics update');
      return;
    }

    const payload: MetricsUpdatePayload = {
      metrics,
      timestamp: new Date(),
      updateId: `metrics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    let broadcastCount = 0;

    for (const [socketId] of this.connectedClients) {
      try {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('metrics_update', payload);
          broadcastCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to send metrics to ${socketId}: ${error.message}`);
      }
    }

    this.connectionMetrics.messagesSent += broadcastCount;

    if (broadcastCount > 0) {
      this.logger.debug(`Broadcasted metrics update to ${broadcastCount} clients`);
    }
  }

  /**
   * Handle WebSocket connection
   */
  async handleConnection(client: any): Promise<void> {
    try {
      this.logger.log(`WebSocket client connected: ${client.id}`);

      // Authenticate the client
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`No token provided for client ${client.id}`);
        client.disconnect();
        return;
      }

      const user = await this.authenticateUser(token);
      if (!user) {
        this.logger.warn(`Authentication failed for client ${client.id}`);
        client.disconnect();
        return;
      }

      if (!this.hasAuditAccess(user.role)) {
        this.logger.warn(`User ${user.id} does not have audit access`);
        client.disconnect();
        return;
      }

      // Add client to connected clients
      this.addClient(client.id, user.id, {
        eventTypes: ['*'],
        severities: ['*'],
        resources: ['*'],
        users: ['*'],
        minSeverity: 'low',
      });

      // Send welcome message
      client.emit('connected', {
        message: 'Connected to audit WebSocket',
        userId: user.id,
        timestamp: new Date(),
      });

      this.logger.log(`WebSocket client authenticated: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.error(`Error handling WebSocket connection: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  async handleDisconnect(client: any): Promise<void> {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
    this.removeClient(client.id);
  }

  /**
   * Handle subscription to audit events
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @MessageBody() data: SubscriptionData,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    try {
      const subscription = this.connectedClients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      // Update subscription filters
      subscription.filters = {
        ...subscription.filters,
        ...data,
      };

      subscription.lastActivity = new Date();

      client.emit('subscribed', {
        message: 'Successfully subscribed to audit events',
        filters: subscription.filters,
        timestamp: new Date(),
      });

      this.logger.log(`Client ${client.id} updated subscription filters`);
    } catch (error) {
      this.logger.error(`Error handling subscription: ${error.message}`);
      client.emit('error', { message: 'Failed to update subscription' });
    }
  }

  /**
   * Handle unsubscription from audit events
   */
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(@ConnectedSocket() client: any): Promise<void> {
    try {
      const subscription = this.connectedClients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      // Reset filters to default (no events)
      subscription.filters = {
        eventTypes: [],
        severities: [],
        resources: [],
        users: [],
        minSeverity: 'critical',
      };

      subscription.lastActivity = new Date();

      client.emit('unsubscribed', {
        message: 'Successfully unsubscribed from audit events',
        timestamp: new Date(),
      });

      this.logger.log(`Client ${client.id} unsubscribed from audit events`);
    } catch (error) {
      this.logger.error(`Error handling unsubscription: ${error.message}`);
      client.emit('error', { message: 'Failed to unsubscribe' });
    }
  }

  /**
   * Handle ping/pong for connection health
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: any): Promise<void> {
    try {
      const subscription = this.connectedClients.get(client.id);
      if (subscription) {
        subscription.lastActivity = new Date();
      }

      client.emit('pong', {
        timestamp: new Date(),
        serverTime: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error handling ping: ${error.message}`);
    }
  }

  /**
   * Handle request for connection info
   */
  @SubscribeMessage('get_connection_info')
  async handleGetConnectionInfo(@ConnectedSocket() client: any): Promise<void> {
    try {
      const subscription = this.connectedClients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      client.emit('connection_info', {
        clientId: client.id,
        userId: subscription.userId,
        connectedAt: subscription.createdAt,
        lastActivity: subscription.lastActivity,
        filters: subscription.filters,
        messageCount: subscription.messageCount,
        isActive: subscription.isActive,
        serverMetrics: this.getConnectionMetrics(),
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling connection info request: ${error.message}`);
      client.emit('error', { message: 'Failed to get connection info' });
    }
  }

  /**
   * Check if event should be sent to specific client based on subscription
   */
  private shouldSendEventToClient(event: AuditLogData, subscription: ClientSubscription): boolean {
    const { filters: sub } = subscription;

    // Check event types
    if (sub.eventTypes && sub.eventTypes.length > 0 && !sub.eventTypes.includes('*')) {
      const eventType = this.getEventType(event);
      if (!sub.eventTypes.includes(eventType)) {
        return false;
      }
    }

    // Check severities
    if (sub.severities && sub.severities.length > 0 && !sub.severities.includes('*')) {
      if (!sub.severities.includes(event.severity || 'medium')) {
        return false;
      }
    }

    // Check minimum severity
    if (sub.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const eventLevel = severityLevels[event.severity || 'medium'];
      const minLevel = severityLevels[sub.minSeverity as keyof typeof severityLevels];
      if (eventLevel < minLevel) {
        return false;
      }
    }

    // Check resources
    if (sub.resources && sub.resources.length > 0 && !sub.resources.includes('*')) {
      if (!sub.resources.includes(event.resource)) {
        return false;
      }
    }

    // Check users
    if (sub.users && sub.users.length > 0 && !sub.users.includes('*')) {
      if (!sub.users.includes(event.userId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract event type from audit event
   */
  private getEventType(event: AuditLogData): string {
    if (event.details?.eventType) {
      return event.details.eventType;
    }

    // Map action to event type
    const actionToType: Record<string, string> = {
      [AuditAction.LOGIN]: 'authentication',
      [AuditAction.LOGOUT]: 'authentication',
      [AuditAction.USER_CREATED]: 'user_management',
      [AuditAction.USER_UPDATED]: 'user_management',
      [AuditAction.USER_DELETED]: 'user_management',
      [AuditAction.DATA_CREATED]: 'data_operation',
      [AuditAction.DATA_UPDATED]: 'data_operation',
      [AuditAction.DATA_DELETED]: 'data_operation',
      [AuditAction.SECURITY_ALERT]: 'security',
      [AuditAction.SYSTEM_CONFIG_CHANGED]: 'system',
    };

    return actionToType[event.action as string] || 'general';
  }

  /**
   * Extract JWT token from handshake
   */
  private extractTokenFromHandshake(client: any): string | null {
    const token = client.handshake.auth?.token ||
                  client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  client.handshake.query?.token as string;

    return token || null;
  }

  /**
   * Authenticate user from JWT token
   */
  private async authenticateUser(token: string): Promise<any> {
    try {
      // Allow development token for testing
      if (token === 'dev-token-placeholder') {
        this.logger.log('🔧 Using development token for authentication');
        return {
          id: 'dev-user-123',
          role: 'super-admin',
          schoolId: null,
          sessionId: 'dev-session-123',
        };
      }

      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        role: payload.role,
        schoolId: payload.schoolId,
        sessionId: payload.sessionId,
      };
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user role has audit access
   */
  private hasAuditAccess(role: string): boolean {
    const allowedRoles = ['super-admin', 'admin', 'auditor'];
    return allowedRoles.includes(role);
  }

  /**
   * Get connection metrics
   */
  private getConnectionMetrics() {
    return {
      ...this.connectionMetrics,
      connectedClients: this.connectedClients.size,
    };
  }

  /**
   * Start heartbeat to check client connections
   */
  private startHeartbeat(): void {
    if (!this.server) return;

    this.heartbeatInterval = setInterval(() => {
      if (this.server) {
        this.server.emit('heartbeat', { timestamp: new Date() });
      }
    }, 30000); // 30 seconds
  }

  /**
   * Start cleanup interval for stale connections
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000); // 1 minute
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections(): void {
    if (!this.server) return;

    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, subscription] of this.connectedClients) {
      if (now - subscription.lastActivity.getTime() > staleThreshold) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          this.logger.warn(`Cleaning up stale connection: ${socketId}`);
          socket.disconnect();
        }
      }
    }
  }

  /**
   * Add a client connection (for manual management)
   */
  addClient(clientId: string, userId: string, subscription?: Partial<SubscriptionData>): void {
    const clientSubscription: ClientSubscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      userId,
      filters: {
        eventTypes: subscription?.eventTypes || ['*'],
        severities: subscription?.severities || ['*'],
        resources: subscription?.resources || ['*'],
        users: subscription?.users || ['*'],
        minSeverity: subscription?.minSeverity || 'low',
      },
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      messageCount: 0,
      preferences: {},
    };

    this.connectedClients.set(clientId, clientSubscription);
    this.connectionMetrics.activeConnections++;
    this.connectionMetrics.totalConnections++;
    this.connectionMetrics.peakConnections = Math.max(
      this.connectionMetrics.peakConnections,
      this.connectionMetrics.activeConnections,
    );

    this.logger.log(`Client added manually: ${clientId} (User: ${userId})`);
  }

  /**
   * Remove a client connection
   */
  removeClient(clientId: string): void {
    const subscription = this.connectedClients.get(clientId);
    if (subscription) {
      this.connectedClients.delete(clientId);
      this.connectionMetrics.activeConnections--;
      this.logger.log(`Client removed: ${clientId}`);
    }
  }

  /**
   * Force disconnect a client
   */
  disconnectClient(clientId: string): void {
    if (!this.server) return;

    const socket = this.server.sockets.sockets.get(clientId);
    if (socket) {
      socket.disconnect();
      this.logger.log(`Force disconnected client: ${clientId}`);
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.logger.log('Audit Gateway destroyed - cleaned up intervals');
  }
}