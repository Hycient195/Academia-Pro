import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SecurityEventType {
  // Authentication Events
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILED = 'authentication_failed',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILED = 'password_reset_failed',

  // Session Events
  SESSION_CREATED = 'session_created',
  SESSION_DESTROYED = 'session_destroyed',
  SESSION_EXPIRED = 'session_expired',
  SESSION_INVALID = 'session_invalid',
  SESSION_REVOKED = 'session_revoked',

  // Authorization Events
  AUTHORIZATION_SUCCESS = 'authorization_success',
  AUTHORIZATION_FAILED = 'authorization_failed',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGED = 'role_changed',

  // Security Threats
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  IP_BLOCKED = 'ip_blocked',
  USER_BLOCKED = 'user_blocked',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // Data Access Events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  DATA_MODIFICATION = 'data_modification',
  GDPR_REQUEST = 'gdpr_request',

  // System Events
  SECURITY_CONFIG_CHANGED = 'security_config_changed',
  AUDIT_LOG_ACCESSED = 'audit_log_accessed',
  VULNERABILITY_DETECTED = 'vulnerability_detected',
  SECURITY_SCAN_COMPLETED = 'security_scan_completed',

  // API Events
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  API_ABUSE_DETECTED = 'api_abuse_detected',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('security_events')
@Index(['eventType', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
@Index(['severity', 'createdAt'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: SecurityEventType,
  })
  eventType: SecurityEventType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: SecurityEventSeverity,
    default: SecurityEventSeverity.MEDIUM,
  })
  severity: SecurityEventSeverity;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'location_info', type: 'jsonb', nullable: true })
  locationInfo: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
  };

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    deviceModel: string;
    os: string;
    osVersion: string;
    browser?: string;
    browserVersion?: string;
  };

  @Column({ name: 'resource', type: 'varchar', length: 100, nullable: true })
  resource: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ name: 'action', type: 'varchar', length: 100, nullable: true })
  action: string;

  @Column({ name: 'details', type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'alert_sent', type: 'boolean', default: false })
  alertSent: boolean;

  @Column({ name: 'alert_sent_at', type: 'timestamp', nullable: true })
  alertSentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Methods
  markAsResolved(resolvedBy: string, notes?: string): void {
    this.isResolved = true;
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    this.resolutionNotes = notes;
  }

  markAlertSent(): void {
    this.alertSent = true;
    this.alertSentAt = new Date();
  }

  // Static methods for creating common events
  static createAuthenticationEvent(
    eventType: SecurityEventType,
    userId: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>,
  ): SecurityEvent {
    const event = new SecurityEvent();
    event.eventType = eventType;
    event.userId = userId;
    event.ipAddress = ipAddress;
    event.userAgent = userAgent;
    event.details = details;
    event.severity = eventType.includes('FAILED') ? SecurityEventSeverity.HIGH : SecurityEventSeverity.LOW;
    return event;
  }

  static createSecurityThreatEvent(
    eventType: SecurityEventType,
    userId: string | null,
    ipAddress: string,
    details: Record<string, any>,
  ): SecurityEvent {
    const event = new SecurityEvent();
    event.eventType = eventType;
    event.userId = userId;
    event.ipAddress = ipAddress;
    event.details = details;
    event.severity = SecurityEventSeverity.HIGH;
    return event;
  }

  static createSystemEvent(
    eventType: SecurityEventType,
    details: Record<string, any>,
    severity: SecurityEventSeverity = SecurityEventSeverity.MEDIUM,
  ): SecurityEvent {
    const event = new SecurityEvent();
    event.eventType = eventType;
    event.details = details;
    event.severity = severity;
    return event;
  }
}