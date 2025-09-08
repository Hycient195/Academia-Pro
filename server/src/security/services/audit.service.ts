import { Injectable, Logger, Inject, Optional, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { createHash } from 'crypto';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction, AuditSeverity, AuditLogData } from '../types/audit.types';
import { AuditConfigService } from '../../common/audit/audit.config';

@Injectable()
export class AuditService implements OnModuleDestroy {
  private readonly logger = new Logger(AuditService.name);
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();
  private readonly auditBuffer: AuditLogData[] = [];
  private bufferFlushTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly auditConfig: AuditConfigService,
  ) {
    this.logger.log('AuditService constructor called - checking for circular dependency');
    this.startBufferFlushTimer();
  }

  /**
   * Start the buffer flush timer
   */
  private startBufferFlushTimer(): void {
    this.bufferFlushTimer = setInterval(() => {
      this.flushAuditBuffer();
    }, this.auditConfig.getFlushInterval());
  }

  /**
   * Stop the buffer flush timer
   */
  private stopBufferFlushTimer(): void {
    if (this.bufferFlushTimer) {
      clearInterval(this.bufferFlushTimer);
      this.bufferFlushTimer = null;
    }
  }

  /**
   * Generate a correlation ID
   */
  private generateCorrelationId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current audit context
   */
  private getAuditContext(): Map<string, any> | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Set audit context for the current request
   */
  setAuditContext(context: { userId?: string; correlationId?: string; schoolId?: string; sessionId?: string }): void {
    const store = this.getAuditContext() || new Map();
    if (context.userId) store.set('userId', context.userId);
    if (context.correlationId) store.set('correlationId', context.correlationId);
    if (context.schoolId) store.set('schoolId', context.schoolId);
    if (context.sessionId) store.set('sessionId', context.sessionId);
    this.asyncLocalStorage.enterWith(store);
  }

  /**
   * Run function within audit context
   */
  async runInAuditContext<T>(
    context: { userId?: string; correlationId?: string; schoolId?: string; sessionId?: string },
    fn: () => Promise<T>
  ): Promise<T> {
    const store = new Map();
    if (context.userId) store.set('userId', context.userId);
    if (context.correlationId) store.set('correlationId', context.correlationId);
    if (context.schoolId) store.set('schoolId', context.schoolId);
    if (context.sessionId) store.set('sessionId', context.sessionId);

    return this.asyncLocalStorage.run(store, fn);
  }

  /**
   * Flush audit buffer to database
   */
  private async flushAuditBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    const events = [...this.auditBuffer];
    this.auditBuffer.length = 0; // Clear buffer

    try {
      const auditLogs = events.map(event => this.auditLogRepository.create({
        userId: event.userId,
        action: event.action as AuditAction,
        resource: event.resource,
        resourceId: event.resourceId,
        details: event.details || {},
        ipAddress: event.ipAddress || 'unknown',
        userAgent: event.userAgent || 'unknown',
        severity: event.severity || AuditSeverity.MEDIUM,
        schoolId: event.schoolId,
        sessionId: event.sessionId,
        correlationId: event.correlationId,
        timestamp: new Date(),
      }));

      await this.auditLogRepository.save(auditLogs);
      this.logger.debug(`Flushed ${events.length} audit events to database`);
    } catch (error) {
      this.logger.error(`Failed to flush audit buffer: ${error.message}`, error.stack);
      // Re-add events to buffer for retry
      this.auditBuffer.unshift(...events);
    }
  }

  /**
   * Log an audit event
   */
  async logActivity(data: AuditLogData): Promise<void> {
    try {
      // Get context from AsyncLocalStorage
      const context = this.getAuditContext();
      const enrichedData = {
        ...data,
        userId: data.userId || context?.get('userId') || 'system',
        correlationId: data.correlationId || context?.get('correlationId') || this.generateCorrelationId(),
        schoolId: data.schoolId || context?.get('schoolId'),
        sessionId: data.sessionId || context?.get('sessionId'),
      };

      // Add to buffer instead of immediate save
      this.auditBuffer.push(enrichedData);

      // Flush if buffer is full
      if (this.auditBuffer.length >= this.auditConfig.getBufferSize()) {
        await this.flushAuditBuffer();
      }

      // Log to console for development
      this.logger.log(`Audit: ${enrichedData.action} by ${enrichedData.userId} on ${enrichedData.resource}${enrichedData.resourceId ? ` (${enrichedData.resourceId})` : ''}`);

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
   * Factory: Log user creation
   */
  async logUserCreated(userId: string, targetUserId: string, ipAddress: string, userAgent: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.USER_CREATED,
      resource: 'user',
      resourceId: targetUserId,
      details: { eventType: 'user_created', ...details },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
    });
  }

  /**
   * Factory: Log user update
   */
  async logUserUpdated(userId: string, targetUserId: string, changes: Record<string, any>, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.USER_UPDATED,
      resource: 'user',
      resourceId: targetUserId,
      details: { eventType: 'user_updated', changes },
      ipAddress,
      userAgent,
      severity: AuditSeverity.LOW,
    });
  }

  /**
   * Factory: Log user deletion
   */
  async logUserDeleted(userId: string, targetUserId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.USER_DELETED,
      resource: 'user',
      resourceId: targetUserId,
      details: { eventType: 'user_deleted' },
      ipAddress,
      userAgent,
      severity: AuditSeverity.HIGH,
    });
  }

  /**
   * Factory: Log student creation
   */
  async logStudentCreated(userId: string, studentId: string, schoolId: string, ipAddress: string, userAgent: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.DATA_CREATED,
      resource: 'student',
      resourceId: studentId,
      schoolId,
      details: { eventType: 'student_created', ...details },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
    });
  }

  /**
   * Factory: Log student update
   */
  async logStudentUpdated(userId: string, studentId: string, schoolId: string, changes: Record<string, any>, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.DATA_UPDATED,
      resource: 'student',
      resourceId: studentId,
      schoolId,
      details: { eventType: 'student_updated', changes },
      ipAddress,
      userAgent,
      severity: AuditSeverity.LOW,
    });
  }

  /**
   * Factory: Log school creation
   */
  async logSchoolCreated(userId: string, schoolId: string, ipAddress: string, userAgent: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.DATA_CREATED,
      resource: 'school',
      resourceId: schoolId,
      details: { eventType: 'school_created', ...details },
      ipAddress,
      userAgent,
      severity: AuditSeverity.HIGH,
    });
  }

  /**
   * Factory: Log school update
   */
  async logSchoolUpdated(userId: string, schoolId: string, changes: Record<string, any>, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.DATA_UPDATED,
      resource: 'school',
      resourceId: schoolId,
      details: { eventType: 'school_updated', changes },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
    });
  }

  /**
   * Factory: Log system configuration change
   */
  async logSystemConfigChanged(userId: string, configKey: string, oldValue: any, newValue: any, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resource: 'system',
      resourceId: configKey,
      details: {
        eventType: 'system_config_changed',
        configKey,
        oldValue,
        newValue,
      },
      ipAddress,
      userAgent,
      severity: AuditSeverity.HIGH,
    });
  }

  /**
   * Factory: Log API key creation
   */
  async logApiKeyCreated(userId: string, apiKeyId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.API_KEY_CREATED,
      resource: 'api_key',
      resourceId: apiKeyId,
      details: { eventType: 'api_key_created' },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
    });
  }

  /**
   * Factory: Log backup creation
   */
  async logBackupCreated(userId: string, backupId: string, backupType: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.logActivity({
      userId,
      action: AuditAction.BACKUP_CREATED,
      resource: 'backup',
      resourceId: backupId,
      details: { eventType: 'backup_created', backupType },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
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
  async cleanupOldLogs(retentionDays?: number): Promise<number> {
    const days = retentionDays || this.auditConfig.getRetentionDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.auditLogRepository.delete({
      timestamp: Between(new Date(0), cutoffDate),
    });

    this.logger.log(`Cleaned up ${result.affected} old audit logs older than ${days} days`);

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
      limit: this.auditConfig.getMaxExportRecords(),
    });

    if (options.format === 'csv') {
      return this.convertToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get audit buffer status
   */
  getBufferStatus(): { bufferSize: number; currentBufferLength: number; isFlushTimerActive: boolean } {
    return {
      bufferSize: this.auditConfig.getBufferSize(),
      currentBufferLength: this.auditBuffer.length,
      isFlushTimerActive: this.bufferFlushTimer !== null,
    };
  }

  /**
   * Force flush audit buffer
   */
  async forceFlushBuffer(): Promise<void> {
    await this.flushAuditBuffer();
  }

  /**
   * Cleanup method - flush buffer and stop timer
   */
  async onModuleDestroy(): Promise<void> {
    this.stopBufferFlushTimer();
    await this.flushAuditBuffer();
    this.logger.log('AuditService destroyed - buffer flushed and timer stopped');
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

  /**
   * Generate integrity hash for audit log data
   */
  private generateIntegrityHash(data: AuditLogData): string {
    const dataString = JSON.stringify({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      severity: data.severity,
      timestamp: new Date().toISOString(),
    });

    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Verify integrity of audit logs
   */
  async verifyAuditIntegrity(logs: AuditLog[]): Promise<{
    valid: AuditLog[];
    invalid: AuditLog[];
    verificationResults: Array<{ id: string; isValid: boolean; expectedHash?: string; actualHash?: string }>;
  }> {
    const valid: AuditLog[] = [];
    const invalid: AuditLog[] = [];
    const verificationResults: Array<{ id: string; isValid: boolean; expectedHash?: string; actualHash?: string }> = [];

    for (const log of logs) {
      try {
        // Recreate the hash from log data
        const data: AuditLogData = {
          userId: log.userId,
          action: log.action as AuditAction,
          resource: log.resource,
          resourceId: log.resourceId,
          details: log.details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          severity: log.severity as AuditSeverity,
        };

        const calculatedHash = this.generateIntegrityHash(data);
        const storedHash = (log as any).integrityHash; // Assuming we add this field to entity

        const isValid = !storedHash || calculatedHash === storedHash;

        if (isValid) {
          valid.push(log);
        } else {
          invalid.push(log);
        }

        verificationResults.push({
          id: log.id,
          isValid,
          expectedHash: storedHash,
          actualHash: calculatedHash,
        });
      } catch (error) {
        this.logger.error(`Error verifying integrity for log ${log.id}: ${error.message}`);
        invalid.push(log);
        verificationResults.push({
          id: log.id,
          isValid: false,
        });
      }
    }

    return { valid, invalid, verificationResults };
  }

  /**
   * Encrypt sensitive audit data (placeholder - implement with proper encryption)
   */
  private encryptSensitiveData(data: any): any {
    // TODO: Implement proper encryption using a library like crypto-js or node-forge
    // For now, return data as-is with a warning
    this.logger.warn('Audit data encryption not implemented - using plain text');
    return data;
  }

  /**
   * Decrypt sensitive audit data (placeholder)
   */
  private decryptSensitiveData(encryptedData: any): any {
    // TODO: Implement proper decryption
    this.logger.warn('Audit data decryption not implemented - returning as-is');
    return encryptedData;
  }

  /**
   * Enhanced logActivity with integrity verification
   */
  async logActivityWithIntegrity(data: AuditLogData): Promise<void> {
    // Generate integrity hash
    const integrityHash = this.generateIntegrityHash(data);

    // Add hash to details for storage
    const enhancedData = {
      ...data,
      details: {
        ...data.details,
        integrityHash,
      },
    };

    // Encrypt sensitive data if configured
    if (this.auditConfig.getConfig().sensitiveFields.length > 0) {
      enhancedData.details = this.encryptSensitiveData(enhancedData.details);
    }

    await this.logActivity(enhancedData);
  }
}