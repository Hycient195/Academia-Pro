import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ResourceType {
  DOCUMENT = 'document',
  REPORT = 'report',
  ASSIGNMENT = 'assignment',
  GRADE_BOOK = 'grade_book',
  TIMETABLE = 'timetable',
  ATTENDANCE = 'attendance',
  HEALTH_RECORD = 'health_record',
  FINANCIAL = 'financial',
  COMMUNICATION = 'communication',
  RESOURCE_LIBRARY = 'resource_library',
  OTHER = 'other',
}

export enum AccessAction {
  VIEW = 'view',
  DOWNLOAD = 'download',
  PRINT = 'print',
  SHARE = 'share',
  EXPORT = 'export',
  MODIFY = 'modify',
  DELETE = 'delete',
}

export enum AccessResult {
  SUCCESS = 'success',
  DENIED = 'denied',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}

@Entity('resource_access_logs')
@Index(['parentPortalAccessId', 'timestamp'])
@Index(['resourceType', 'timestamp'])
@Index(['accessResult', 'timestamp'])
@Index(['ipAddress', 'timestamp'])
export class ResourceAccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'resource_type',
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @Column({ name: 'resource_id', type: 'varchar', length: 100 })
  resourceId: string;

  @Column({ name: 'resource_name', type: 'varchar', length: 200 })
  resourceName: string;

  @Column({
    name: 'access_action',
    type: 'enum',
    enum: AccessAction,
  })
  accessAction: AccessAction;

  @Column({
    name: 'access_result',
    type: 'enum',
    enum: AccessResult,
    default: AccessResult.SUCCESS,
  })
  accessResult: AccessResult;

  @Column({ name: 'access_reason', type: 'varchar', length: 500, nullable: true })
  accessReason: string;

  @Column({ name: 'denial_reason', type: 'varchar', length: 500, nullable: true })
  denialReason: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId: string;

  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ name: 'file_size_bytes', type: 'int', nullable: true })
  fileSizeBytes: number;

  @Column({ name: 'download_duration_ms', type: 'int', nullable: true })
  downloadDurationMs: number;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    academicYear?: string;
    gradeLevel?: string;
    subject?: string;
    confidentialityLevel?: string;
    retentionPeriod?: number;
    accessCount?: number;
    lastAccessed?: Date;
    customFields?: Record<string, any>;
  };

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ name: 'anomaly_detected', type: 'boolean', default: false })
  anomalyDetected: boolean;

  @Column({ name: 'compliance_flags', type: 'simple-array', nullable: true })
  complianceFlags: string[];

  @Column({ name: 'retention_period_days', type: 'int', default: 2555 }) // 7 years
  retentionPeriodDays: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  // Helper methods
  isSuccessful(): boolean {
    return this.accessResult === AccessResult.SUCCESS;
  }

  isDenied(): boolean {
    return this.accessResult === AccessResult.DENIED;
  }

  isHighRisk(): boolean {
    return this.riskScore > 0.7 || this.anomalyDetected;
  }

  requiresComplianceReview(): boolean {
    return this.complianceFlags && this.complianceFlags.length > 0;
  }

  calculateRetentionExpiry(): Date {
    const expiry = new Date(this.timestamp);
    expiry.setDate(expiry.getDate() + this.retentionPeriodDays);
    return expiry;
  }

  shouldBeArchived(): boolean {
    return new Date() > this.calculateRetentionExpiry();
  }

  // Static factory methods
  static createAccessLog(
    parentPortalAccessId: string,
    schoolId: string,
    resourceType: ResourceType,
    resourceId: string,
    resourceName: string,
    accessAction: AccessAction,
    ipAddress: string,
    options?: {
      studentId?: string;
      accessResult?: AccessResult;
      denialReason?: string;
      userAgent?: string;
      sessionId?: string;
      deviceId?: string;
      fileSizeBytes?: number;
      metadata?: any;
    },
  ): Partial<ResourceAccessLog> {
    return {
      parentPortalAccessId,
      studentId: options?.studentId,
      schoolId,
      resourceType,
      resourceId,
      resourceName,
      accessAction,
      accessResult: options?.accessResult || AccessResult.SUCCESS,
      denialReason: options?.denialReason,
      ipAddress,
      userAgent: options?.userAgent,
      sessionId: options?.sessionId,
      deviceId: options?.deviceId,
      fileSizeBytes: options?.fileSizeBytes,
      metadata: options?.metadata,
    };
  }

  static createDownloadLog(
    parentPortalAccessId: string,
    schoolId: string,
    resourceId: string,
    resourceName: string,
    fileSizeBytes: number,
    ipAddress: string,
    durationMs: number,
    options?: {
      studentId?: string;
      userAgent?: string;
      sessionId?: string;
      metadata?: any;
    },
  ): Partial<ResourceAccessLog> {
    return {
      parentPortalAccessId,
      studentId: options?.studentId,
      schoolId,
      resourceType: ResourceType.DOCUMENT,
      resourceId,
      resourceName,
      accessAction: AccessAction.DOWNLOAD,
      accessResult: AccessResult.SUCCESS,
      ipAddress,
      userAgent: options?.userAgent,
      sessionId: options?.sessionId,
      fileSizeBytes,
      downloadDurationMs: durationMs,
      metadata: options?.metadata,
    };
  }
}