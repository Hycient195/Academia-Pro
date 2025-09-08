import { Injectable, Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorageService } from '@nestjs/throttler';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity, AuditLogData } from '../../security/types/audit.types';
import { AuditConfigService } from './audit.config';

// Temporary interface until WebSocket packages are installed
interface Socket {
  id: string;
  handshake: {
    address: string;
    headers: Record<string, any>;
    auth?: { token?: string };
    query?: Record<string, any>;
  };
  emit(event: string, data: any): void;
  disconnect(): void;
}

interface Server {
  sockets: {
    sockets: Map<string, Socket>;
  };
  emit(event: string, data: any): void;
}

interface AuthenticatedSocket extends Socket {
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

interface ClientSubscription {
  socketId: string;
  userId: string;
  subscription: SubscriptionData;
  connectedAt: Date;
  lastActivity: Date;
}

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
export class AuditGateway implements OnModuleDestroy {
  private server: Server | null = null;

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

  constructor(
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
    @Inject('ThrottlerStorageService')
    private readonly throttlerStorage: ThrottlerStorageService,
  ) {}

  /**
   * Initialize the gateway with a WebSocket server instance
   * This will be called when WebSocket packages are available
   */
  setServer(server: Server): void {
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
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('audit_event', payload);
            broadcastCount++;
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
   * Placeholder methods for WebSocket functionality
   * These will be implemented when WebSocket packages are installed
   */
  async handleConnection(client: any): Promise<void> {
    this.logger.log('WebSocket connection handling not implemented yet');
  }

  async handleDisconnect(client: any): Promise<void> {
    this.logger.log('WebSocket disconnection handling not implemented yet');
  }

  async handleSubscribe(client: any, data: any): Promise<void> {
    this.logger.log('WebSocket subscription handling not implemented yet');
  }

  async handleUnsubscribe(client: any): Promise<void> {
    this.logger.log('WebSocket unsubscription handling not implemented yet');
  }

  /**
   * Check if event should be sent to specific client based on subscription
   */
  private shouldSendEventToClient(event: AuditLogData, subscription: ClientSubscription): boolean {
    const { subscription: sub } = subscription;

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
  private extractTokenFromHandshake(client: Socket): string | null {
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
      socketId: clientId,
      userId,
      subscription: {
        eventTypes: subscription?.eventTypes || ['*'],
        severities: subscription?.severities || ['*'],
        resources: subscription?.resources || ['*'],
        users: subscription?.users || ['*'],
        minSeverity: subscription?.minSeverity || 'low',
      },
      connectedAt: new Date(),
      lastActivity: new Date(),
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