import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PortalActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW_GRADES = 'view_grades',
  VIEW_ATTENDANCE = 'view_attendance',
  VIEW_ASSIGNMENTS = 'view_assignments',
  VIEW_TIMETABLE = 'view_timetable',
  SEND_MESSAGE = 'send_message',
  VIEW_MESSAGES = 'view_messages',
  BOOK_APPOINTMENT = 'book_appointment',
  VIEW_FEES = 'view_fees',
  MAKE_PAYMENT = 'make_payment',
  DOWNLOAD_DOCUMENT = 'download_document',
  VIEW_REPORTS = 'view_reports',
  UPDATE_PROFILE = 'update_profile',
  CHANGE_PASSWORD = 'change_password',
  VIEW_TRANSPORTATION = 'view_transportation',
  VIEW_HEALTH_RECORDS = 'view_health_records',
  EMERGENCY_CONTACT = 'emergency_contact',
  ACCESS_RESOURCE = 'access_resource',
  EXPORT_DATA = 'export_data',
  FAILED_LOGIN = 'failed_login',
  SESSION_TIMEOUT = 'session_timeout',
  PASSWORD_RESET = 'password_reset',
}

export enum PortalActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('portal_activity_logs')
@Index(['parentPortalAccessId', 'timestamp'])
@Index(['studentId', 'timestamp'])
@Index(['activityType', 'timestamp'])
@Index(['ipAddress', 'timestamp'])
@Index(['severity', 'timestamp'])
export class PortalActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: PortalActivityType,
  })
  activityType: PortalActivityType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: PortalActivitySeverity,
    default: PortalActivitySeverity.LOW,
  })
  severity: PortalActivitySeverity;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 100, nullable: true })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    userAgent?: string;
    deviceId?: string;
    sessionId?: string;
    correlationId?: string;
    requestId?: string;
    apiEndpoint?: string;
    httpMethod?: string;
    responseStatus?: number;
    processingTime?: number;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      coordinates?: [number, number];
    };
    additionalContext?: Record<string, any>;
  };

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId: string;

  @Column({ name: 'correlation_id', type: 'varchar', length: 255, nullable: true })
  correlationId: string;

  @Column({ name: 'request_id', type: 'varchar', length: 255, nullable: true })
  requestId: string;

  @Column({ name: 'api_endpoint', type: 'varchar', length: 500, nullable: true })
  apiEndpoint: string;

  @Column({ name: 'http_method', type: 'varchar', length: 10, nullable: true })
  httpMethod: string;

  @Column({ name: 'response_status', type: 'int', nullable: true })
  responseStatus: number;

  @Column({ name: 'processing_time_ms', type: 'int', nullable: true })
  processingTimeMs: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  errorCode: string;

  @Column({ name: 'success', type: 'boolean', default: true })
  success: boolean;

  @Column({ name: 'anomaly_detected', type: 'boolean', default: false })
  anomalyDetected: boolean;

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ name: 'compliance_flags', type: 'simple-array', nullable: true })
  complianceFlags: string[];

  @Column({ name: 'retention_period_days', type: 'int', default: 2555 }) // 7 years
  retentionPeriodDays: number;

  @Column({ name: 'archived', type: 'boolean', default: false })
  archived: boolean;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt: Date;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  // Helper methods
  isSuccessful(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }

  isHighRisk(): boolean {
    return this.severity === PortalActivitySeverity.HIGH ||
           this.severity === PortalActivitySeverity.CRITICAL ||
           this.riskScore > 0.7;
  }

  isAnomalous(): boolean {
    return this.anomalyDetected || this.riskScore > 0.5;
  }

  requiresComplianceReview(): boolean {
    return this.complianceFlags && this.complianceFlags.length > 0;
  }

  getLocationInfo(): string {
    if (!this.metadata?.location) return 'Unknown';
    const { country, region, city } = this.metadata.location;
    return [city, region, country].filter(Boolean).join(', ') || 'Unknown';
  }

  calculateRetentionExpiry(): Date {
    const expiry = new Date(this.timestamp);
    expiry.setDate(expiry.getDate() + this.retentionPeriodDays);
    return expiry;
  }

  shouldBeArchived(): boolean {
    return new Date() > this.calculateRetentionExpiry();
  }

  // Static factory methods for common activities
  static createLoginActivity(
    parentPortalAccessId: string,
    schoolId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    metadata?: any,
  ): Partial<PortalActivityLog> {
    return {
      parentPortalAccessId,
      schoolId,
      activityType: success ? PortalActivityType.LOGIN : PortalActivityType.FAILED_LOGIN,
      severity: success ? PortalActivitySeverity.LOW : PortalActivitySeverity.MEDIUM,
      description: success ? 'Parent successfully logged into portal' : 'Failed login attempt',
      action: 'login',
      ipAddress,
      userAgent,
      success,
      metadata: {
        ...metadata,
        loginMethod: 'password',
      },
    };
  }

  static createDataAccessActivity(
    parentPortalAccessId: string,
    studentId: string,
    schoolId: string,
    activityType: PortalActivityType,
    resourceType: string,
    resourceId: string,
    ipAddress: string,
    metadata?: any,
  ): Partial<PortalActivityLog> {
    const descriptions = {
      [PortalActivityType.VIEW_GRADES]: 'Viewed student grades',
      [PortalActivityType.VIEW_ATTENDANCE]: 'Viewed student attendance',
      [PortalActivityType.VIEW_ASSIGNMENTS]: 'Viewed student assignments',
      [PortalActivityType.VIEW_TIMETABLE]: 'Viewed student timetable',
      [PortalActivityType.VIEW_FEES]: 'Viewed fee information',
      [PortalActivityType.DOWNLOAD_DOCUMENT]: 'Downloaded document',
      [PortalActivityType.VIEW_REPORTS]: 'Viewed student reports',
    };

    return {
      parentPortalAccessId,
      studentId,
      schoolId,
      activityType,
      severity: PortalActivitySeverity.LOW,
      description: descriptions[activityType] || `${activityType.replace('_', ' ')} access`,
      resourceType,
      resourceId,
      action: activityType.replace('_', ' '),
      ipAddress,
      success: true,
      metadata,
    };
  }

  static createCommunicationActivity(
    parentPortalAccessId: string,
    studentId: string,
    schoolId: string,
    activityType: PortalActivityType,
    description: string,
    ipAddress: string,
    metadata?: any,
  ): Partial<PortalActivityLog> {
    return {
      parentPortalAccessId,
      studentId,
      schoolId,
      activityType,
      severity: PortalActivitySeverity.LOW,
      description,
      action: activityType.replace('_', ' '),
      ipAddress,
      success: true,
      metadata,
    };
  }

  static createSecurityActivity(
    parentPortalAccessId: string,
    schoolId: string,
    activityType: PortalActivityType,
    severity: PortalActivitySeverity,
    description: string,
    ipAddress: string,
    metadata?: any,
  ): Partial<PortalActivityLog> {
    return {
      parentPortalAccessId,
      schoolId,
      activityType,
      severity,
      description,
      action: activityType.replace('_', ' '),
      ipAddress,
      success: true,
      metadata,
    };
  }
}