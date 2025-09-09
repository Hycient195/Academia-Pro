import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AuditAction, AuditSeverity } from '../types/audit.types';

// System user ID for audit events that don't have a specific user
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['resource', 'timestamp'])
@Index(['severity', 'timestamp'])
@Index(['schoolId', 'timestamp'])
@Index(['anomalyScore', 'timestamp'])
@Index(['isAnomaly', 'timestamp'])
@Index(['complianceStatus', 'timestamp'])
@Index(['gdprCompliant', 'timestamp'])
@Index(['responseTime', 'timestamp'])
@Index(['correlationId', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId: string;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId: string;

  @Column({ name: 'correlation_id', type: 'varchar', length: 100, nullable: true })
  correlationId: string;

  @Column({
    name: 'action',
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.MEDIUM,
  })
  severity: AuditSeverity;

  @Column({ name: 'resource', type: 'varchar', length: 100 })
  resource: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent: string;

  @Column({ name: 'details', type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  // Performance Metrics
  @Column({ name: 'response_time', type: 'int', nullable: true })
  responseTime: number; // milliseconds

  @Column({ name: 'memory_usage', type: 'bigint', nullable: true })
  memoryUsage: number; // bytes

  @Column({ name: 'cpu_usage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  cpuUsage: number; // percentage

  @Column({ name: 'query_execution_time', type: 'int', nullable: true })
  queryExecutionTime: number; // milliseconds

  // Anomaly Detection
  @Column({ name: 'anomaly_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  anomalyScore: number; // 0.0000 to 1.0000

  @Column({ name: 'is_anomaly', type: 'boolean', default: false })
  isAnomaly: boolean;

  @Column({ name: 'anomaly_type', type: 'varchar', length: 50, nullable: true })
  anomalyType: string;

  @Column({ name: 'anomaly_reason', type: 'text', nullable: true })
  anomalyReason: string;

  // Compliance and Retention
  @Column({ name: 'retention_period', type: 'int', nullable: true })
  retentionPeriod: number; // days

  @Column({ name: 'compliance_status', type: 'varchar', length: 50, nullable: true })
  complianceStatus: string;

  @Column({ name: 'gdpr_compliant', type: 'boolean', default: true })
  gdprCompliant: boolean;

  @Column({ name: 'data_retention_policy', type: 'varchar', length: 100, nullable: true })
  dataRetentionPolicy: string;

  // Additional Context
  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  };

  @Column({ name: 'location_info', type: 'jsonb', nullable: true })
  locationInfo: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Virtual properties
  get isRecent(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.timestamp > oneHourAgo;
  }

  get isCritical(): boolean {
    return this.severity === AuditSeverity.CRITICAL;
  }

  get isHighPriority(): boolean {
    return this.severity === AuditSeverity.HIGH || this.severity === AuditSeverity.CRITICAL;
  }

  // Methods
  markAsProcessed(): void {
    this.processedAt = new Date();
  }

  markAsArchived(): void {
    this.isArchived = true;
  }

  // Static factory methods
  static createLoginEvent(
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    details?: Record<string, any>,
  ): Partial<AuditLog> {
    return {
      userId,
      action: success ? AuditAction.LOGIN : AuditAction.AUTHENTICATION_FAILED,
      severity: success ? AuditSeverity.LOW : AuditSeverity.HIGH,
      resource: 'authentication',
      resourceId: userId,
      ipAddress,
      userAgent,
      details: {
        success,
        eventType: 'login',
        ...details,
      },
      timestamp: new Date(),
    };
  }

  static createDataAccessEvent(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Partial<AuditLog> {
    return {
      userId,
      action,
      severity: AuditSeverity.MEDIUM,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      details: {
        eventType: 'data_access',
        ...details,
      },
      timestamp: new Date(),
    };
  }

  static createSecurityEvent(
    userId: string,
    action: AuditAction,
    severity: AuditSeverity,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): Partial<AuditLog> {
    return {
      userId,
      action,
      severity,
      resource: 'security',
      ipAddress,
      userAgent,
      details: {
        eventType: 'security',
        ...details,
      },
      timestamp: new Date(),
    };
  }

  static createSystemEvent(
    action: AuditAction,
    severity: AuditSeverity,
    details?: Record<string, any>,
  ): Partial<AuditLog> {
    return {
      userId: SYSTEM_USER_ID,
      action,
      severity,
      resource: 'system',
      ipAddress: 'system',
      userAgent: 'system',
      details: {
        eventType: 'system',
        ...details,
      },
      timestamp: new Date(),
    };
  }
}