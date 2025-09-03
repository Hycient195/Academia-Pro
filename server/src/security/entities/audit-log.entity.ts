import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AuditAction, AuditSeverity } from '../types/audit.types';

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['resource', 'timestamp'])
@Index(['severity', 'timestamp'])
@Index(['schoolId', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId: string;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
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
      userId: 'system',
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