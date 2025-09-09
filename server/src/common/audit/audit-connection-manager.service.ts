import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { AuditGateway } from './audit.gateway';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

export interface ConnectionInfo {
  id: string;
  userId: string;
  userRole: string;
  connectedAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  subscriptionCount: number;
  messageCount: number;
  isActive: boolean;
}

export interface ConnectionLimits {
  maxConnectionsPerUser: number;
  maxTotalConnections: number;
  maxConnectionsPerIp: number;
  connectionTimeout: number;
  suspiciousActivityThreshold: number;
}

@Injectable()
export class AuditConnectionManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(AuditConnectionManagerService.name);
  private readonly connections = new Map<string, ConnectionInfo>();
  private readonly userConnections = new Map<string, Set<string>>();
  private readonly ipConnections = new Map<string, Set<string>>();
  private readonly suspiciousActivity = new Map<string, number>();

  private readonly limits: ConnectionLimits = {
    maxConnectionsPerUser: 5,
    maxTotalConnections: 1000,
    maxConnectionsPerIp: 10,
    connectionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    suspiciousActivityThreshold: 10,
  };

  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly auditGateway: AuditGateway,
    private readonly auditService: AuditService,
  ) {
    this.startCleanupInterval();
  }

  /**
   * Register a new connection
   */
  registerConnection(
    socketId: string,
    userId: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
  ): boolean {
    try {
      // Check connection limits
      if (!this.checkConnectionLimits(socketId, userId, ipAddress)) {
        this.logger.warn(`Connection rejected for user ${userId} from ${ipAddress} - limit exceeded`);
        this.auditService.logActivity({
          userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'connection_limit_exceeded',
          details: {
            eventType: 'websocket_connection_rejected',
            reason: 'connection_limit_exceeded',
            socketId,
            ipAddress,
            userAgent,
          },
          ipAddress,
          userAgent,
          severity: AuditSeverity.HIGH,
        });
        return false;
      }

      // Check for suspicious activity
      if (this.isSuspiciousActivity(userId, ipAddress)) {
        this.logger.warn(`Suspicious connection attempt from ${ipAddress} for user ${userId}`);
        this.auditService.logActivity({
          userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'suspicious_connection',
          details: {
            eventType: 'websocket_suspicious_connection',
            socketId,
            ipAddress,
            userAgent,
          },
          ipAddress,
          userAgent,
          severity: AuditSeverity.CRITICAL,
        });
        return false;
      }

      // Register the connection
      const connectionInfo: ConnectionInfo = {
        id: socketId,
        userId,
        userRole,
        connectedAt: new Date(),
        lastActivity: new Date(),
        ipAddress,
        userAgent,
        subscriptionCount: 0,
        messageCount: 0,
        isActive: true,
      };

      this.connections.set(socketId, connectionInfo);

      // Index by user
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(socketId);

      // Index by IP
      if (!this.ipConnections.has(ipAddress)) {
        this.ipConnections.set(ipAddress, new Set());
      }
      this.ipConnections.get(ipAddress)!.add(socketId);

      this.logger.log(`Connection registered: ${socketId} for user ${userId} from ${ipAddress}`);

      // Audit the successful connection
      this.auditService.logActivity({
        userId,
        action: AuditAction.DATA_ACCESSED,
        resource: 'websocket',
        resourceId: 'connection_established',
        details: {
          eventType: 'websocket_connection_established',
          socketId,
          ipAddress,
          userAgent,
          userRole,
        },
        ipAddress,
        userAgent,
        severity: AuditSeverity.LOW,
      });

      return true;

    } catch (error) {
      this.logger.error(`Failed to register connection ${socketId}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Unregister a connection
   */
  unregisterConnection(socketId: string): void {
    const connection = this.connections.get(socketId);
    if (!connection) return;

    connection.isActive = false;

    // Remove from indexes
    this.userConnections.get(connection.userId)?.delete(socketId);
    this.ipConnections.get(connection.ipAddress)?.delete(socketId);

    // Clean up empty sets
    if (this.userConnections.get(connection.userId)?.size === 0) {
      this.userConnections.delete(connection.userId);
    }
    if (this.ipConnections.get(connection.ipAddress)?.size === 0) {
      this.ipConnections.delete(connection.ipAddress);
    }

    this.logger.log(`Connection unregistered: ${socketId} for user ${connection.userId}`);

    // Audit the disconnection
    this.auditService.logActivity({
      userId: connection.userId,
      action: AuditAction.DATA_ACCESSED,
      resource: 'websocket',
      resourceId: 'connection_closed',
      details: {
        eventType: 'websocket_connection_closed',
        socketId,
        duration: Date.now() - connection.connectedAt.getTime(),
        messageCount: connection.messageCount,
        subscriptionCount: connection.subscriptionCount,
      },
      ipAddress: connection.ipAddress,
      userAgent: connection.userAgent,
      severity: AuditSeverity.LOW,
    });
  }

  /**
   * Update connection activity
   */
  updateConnectionActivity(socketId: string): void {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.lastActivity = new Date();
      connection.messageCount++;
    }
  }

  /**
   * Update subscription count for a connection
   */
  updateSubscriptionCount(socketId: string, count: number): void {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.subscriptionCount = count;
    }
  }

  /**
   * Check connection limits
   */
  private checkConnectionLimits(socketId: string, userId: string, ipAddress: string): boolean {
    // Check total connections
    if (this.connections.size >= this.limits.maxTotalConnections) {
      return false;
    }

    // Check connections per user
    const userConnectionCount = this.userConnections.get(userId)?.size || 0;
    if (userConnectionCount >= this.limits.maxConnectionsPerUser) {
      return false;
    }

    // Check connections per IP
    const ipConnectionCount = this.ipConnections.get(ipAddress)?.size || 0;
    if (ipConnectionCount >= this.limits.maxConnectionsPerIp) {
      return false;
    }

    return true;
  }

  /**
   * Check for suspicious activity
   */
  private isSuspiciousActivity(userId: string, ipAddress: string): boolean {
    const key = `${userId}:${ipAddress}`;
    const attempts = this.suspiciousActivity.get(key) || 0;

    if (attempts >= this.limits.suspiciousActivityThreshold) {
      return true;
    }

    // Increment suspicious activity counter
    this.suspiciousActivity.set(key, attempts + 1);

    // Reset counter after some time
    setTimeout(() => {
      const current = this.suspiciousActivity.get(key);
      if (current && current > 0) {
        this.suspiciousActivity.set(key, current - 1);
      }
    }, 60000); // Reset after 1 minute

    return false;
  }

  /**
   * Force disconnect connections for a user
   */
  async forceDisconnectUser(userId: string, reason: string = 'administrative_action'): Promise<number> {
    const userSockets = this.userConnections.get(userId);
    if (!userSockets) return 0;

    let disconnectedCount = 0;
    for (const socketId of userSockets) {
      const connection = this.connections.get(socketId);
      if (connection) {
        // Force disconnect through gateway
        this.auditGateway.disconnectClient(socketId);

        // Audit the forced disconnection
        this.auditService.logActivity({
          userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'forced_disconnection',
          details: {
            eventType: 'websocket_forced_disconnection',
            socketId,
            reason,
            ipAddress: connection.ipAddress,
          },
          ipAddress: connection.ipAddress,
          userAgent: connection.userAgent,
          severity: AuditSeverity.HIGH,
        });

        disconnectedCount++;
      }
    }

    this.logger.log(`Force disconnected ${disconnectedCount} connections for user ${userId}`);
    return disconnectedCount;
  }

  /**
   * Force disconnect connections from an IP
   */
  async forceDisconnectIp(ipAddress: string, reason: string = 'security_policy'): Promise<number> {
    const ipSockets = this.ipConnections.get(ipAddress);
    if (!ipSockets) return 0;

    let disconnectedCount = 0;
    for (const socketId of ipSockets) {
      const connection = this.connections.get(socketId);
      if (connection) {
        // Force disconnect through gateway
        this.auditGateway.disconnectClient(socketId);

        // Audit the forced disconnection
        this.auditService.logActivity({
          userId: connection.userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'ip_blocked',
          details: {
            eventType: 'websocket_ip_blocked',
            socketId,
            reason,
            ipAddress,
          },
          ipAddress,
          userAgent: connection.userAgent,
          severity: AuditSeverity.CRITICAL,
        });

        disconnectedCount++;
      }
    }

    this.logger.log(`Force disconnected ${disconnectedCount} connections from IP ${ipAddress}`);
    return disconnectedCount;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const now = Date.now();
    const activeConnections = Array.from(this.connections.values()).filter(conn => conn.isActive);
    const staleConnections = activeConnections.filter(conn =>
      now - conn.lastActivity.getTime() > this.limits.connectionTimeout
    );

    return {
      totalConnections: this.connections.size,
      activeConnections: activeConnections.length,
      staleConnections: staleConnections.length,
      connectionsByUser: this.userConnections.size,
      connectionsByIp: this.ipConnections.size,
      averageConnectionsPerUser: this.userConnections.size > 0
        ? activeConnections.length / this.userConnections.size
        : 0,
      topUsers: Array.from(this.userConnections.entries())
        .map(([userId, sockets]) => ({ userId, count: sockets.size }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topIps: Array.from(this.ipConnections.entries())
        .map(([ip, sockets]) => ({ ip, count: sockets.size }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  /**
   * Get connection info for a specific socket
   */
  getConnectionInfo(socketId: string): ConnectionInfo | null {
    return this.connections.get(socketId) || null;
  }

  /**
   * Get all connections for a user
   */
  getUserConnections(userId: string): ConnectionInfo[] {
    const socketIds = this.userConnections.get(userId);
    if (!socketIds) return [];

    return Array.from(socketIds)
      .map(socketId => this.connections.get(socketId))
      .filter(conn => conn && conn.isActive) as ConnectionInfo[];
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [socketId, connection] of this.connections.entries()) {
      if (!connection.isActive ||
          now - connection.lastActivity.getTime() > this.limits.connectionTimeout) {
        this.unregisterConnection(socketId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} stale connections`);
    }

    return cleanedCount;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Force disconnect all connections
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isActive);

    for (const connection of activeConnections) {
      this.auditGateway.disconnectClient(connection.id);
    }

    this.logger.log(`Connection manager destroyed - disconnected ${activeConnections.length} active connections`);
  }
}