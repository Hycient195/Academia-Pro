import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export enum AuditAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILED = 'authentication_failed',
  AUTHORIZATION_SUCCESS = 'authorization_success',
  AUTHORIZATION_FAILED = 'authorization_failed',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',

  // Data Operations
  DATA_CREATED = 'data_created',
  DATA_UPDATED = 'data_updated',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_ACCESSED = 'data_accessed',

  // Security Events
  SECURITY_CONFIG_CHANGED = 'security_config_changed',
  AUDIT_LOG_ACCESSED = 'audit_log_accessed',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_ALERT = 'security_alert',

  // System Operations
  SYSTEM_CONFIG_CHANGED = 'system_config_changed',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  MAINTENANCE_MODE_ENABLED = 'maintenance_mode_enabled',
  MAINTENANCE_MODE_DISABLED = 'maintenance_mode_disabled',

  // API Operations
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  WEBHOOK_CREATED = 'webhook_created',
  WEBHOOK_DELETED = 'webhook_deleted',
  INTEGRATION_CREATED = 'integration_created',
  INTEGRATION_UPDATED = 'integration_updated',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditLogData {
  userId: string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
  schoolId?: string;
  sessionId?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async logActivity(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: data.userId,
        action: data.action as AuditAction,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
        severity: data.severity || AuditSeverity.MEDIUM,
        schoolId: data.schoolId,
        sessionId: data.sessionId,
        correlationId: data.correlationId,
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);

      // Log to console for development
      this.logger.log(`Audit: ${data.action} by ${data.userId} on ${data.resource}${data.resourceId ? ` (${data.resourceId})` : ''}`);

    } catch (error) {
      this.logger.error(`Failed to log audit event: ${error.message}`, error.stack);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log user authentication event
   */
  async logAuthentication(
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.logActivity({
      userId,
      action: success ? AuditAction.AUTHENTICATION_SUCCESS : AuditAction.AUTHENTICATION_FAILED,
      resource: 'authentication',
      resourceId: userId,
      details: {
        success,
        ...details,
      },
      ipAddress,
      userAgent,
      severity: success ? AuditSeverity.LOW : AuditSeverity.HIGH,
    });
  }

  /**
   * Log user authorization event
   */
  async logAuthorization(
    userId: string,
    resource: string,
    action: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.logActivity({
      userId,
      action: success ? AuditAction.AUTHORIZATION_SUCCESS : AuditAction.AUTHORIZATION_FAILED,
      resource,
      details: {
        requestedAction: action,
        success,
        ...details,
      },
      ipAddress,
      userAgent,
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
    });
  }

  /**
   * Log data access event
   */
  async logDataAccess(
    userId: string,
    action: 'read' | 'create' | 'update' | 'delete' | 'export',
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Promise<void> {
    const auditAction = this.getDataAction(action);

    await this.logActivity({
      userId,
      action: auditAction,
      resource,
      resourceId,
      details: {
        dataAction: action,
        ...details,
      },
      ipAddress,
      userAgent,
      severity: this.getDataAccessSeverity(action, resource),
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    userId: string,
    eventType: string,
    severity: AuditSeverity,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.SECURITY_ALERT,
      resource: 'security',
      details: {
        eventType,
        ...details,
      },
      ipAddress,
      userAgent,
      severity,
    });
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(options: {
    userId?: string;
    action?: string;
    resource?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<[AuditLog[], number]> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (options.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: options.userId });
    }

    if (options.action) {
      queryBuilder.andWhere('audit.action = :action', { action: options.action });
    }

    if (options.resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: options.resource });
    }

    if (options.severity) {
      queryBuilder.andWhere('audit.severity = :severity', { severity: options.severity });
    }

    if (options.startDate && options.endDate) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options.startDate) {
      queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    } else if (options.endDate) {
      queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate: options.endDate });
    }

    queryBuilder
      .orderBy('audit.timestamp', 'DESC')
      .limit(options.limit || 50)
      .offset(options.offset || 0);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(options: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsBySeverity: Record<string, number>;
    logsByResource: Record<string, number>;
    recentActivity: AuditLog[];
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (options.startDate && options.endDate) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options.startDate) {
      queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    }

    if (options.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: options.userId });
    }

    // Get total count
    const totalLogs = await queryBuilder.getCount();

    // Get logs by action
    const actionStats = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const logsByAction = actionStats.reduce((acc, stat) => {
      acc[stat.action] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by severity
    const severityStats = await queryBuilder
      .select('audit.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.severity')
      .getRawMany();

    const logsBySeverity = severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by resource
    const resourceStats = await queryBuilder
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .getRawMany();

    const logsByResource = resourceStats.reduce((acc, stat) => {
      acc[stat.resource] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity
    const recentActivity = await this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: 10,
    });

    // Get top users
    const userStats = await queryBuilder
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = userStats.map(stat => ({
      userId: stat.userId,
      count: parseInt(stat.count),
    }));

    return {
      totalLogs,
      logsByAction,
      logsBySeverity,
      logsByResource,
      recentActivity,
      topUsers,
    };
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository.delete({
      timestamp: Between(new Date(0), cutoffDate),
    });

    this.logger.log(`Cleaned up ${result.affected} old audit logs older than ${retentionDays} days`);

    return result.affected || 0;
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(options: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    format: 'json' | 'csv';
  }): Promise<string> {
    const [logs] = await this.getAuditLogs({
      ...options,
      limit: 10000, // Reasonable limit for export
    });

    if (options.format === 'csv') {
      return this.convertToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  private getDataAction(action: string): AuditAction {
    switch (action) {
      case 'create': return AuditAction.DATA_CREATED;
      case 'update': return AuditAction.DATA_UPDATED;
      case 'delete': return AuditAction.DATA_DELETED;
      case 'export': return AuditAction.DATA_EXPORTED;
      case 'read': return AuditAction.DATA_ACCESSED;
      default: return AuditAction.DATA_ACCESSED;
    }
  }

  private getDataAccessSeverity(action: string, resource: string): AuditSeverity {
    // High severity for sensitive data or destructive actions
    if (action === 'delete' || action === 'export') {
      return AuditSeverity.HIGH;
    }

    // Medium severity for sensitive resources
    if (['user', 'security', 'audit'].includes(resource)) {
      return AuditSeverity.MEDIUM;
    }

    return AuditSeverity.LOW;
  }

  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'timestamp',
      'userId',
      'action',
      'resource',
      'resourceId',
      'severity',
      'ipAddress',
      'userAgent',
      'details',
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.resource,
      log.resourceId || '',
      log.severity,
      log.ipAddress,
      log.userAgent,
      JSON.stringify(log.details),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}