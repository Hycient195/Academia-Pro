import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('user_sessions')
@Index(['userId', 'isActive'])
@Index(['sessionToken'], { unique: true })
@Index(['expiresAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'session_token', type: 'varchar', length: 500, unique: true })
  sessionToken: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    deviceModel: string;
    os: string;
    osVersion: string;
    browser?: string;
    browserVersion?: string;
  };

  @Column({ name: 'location_info', type: 'jsonb', nullable: true })
  locationInfo: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
  };

  @Column({ name: 'last_activity_at', type: 'timestamp' })
  lastActivityAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'login_at', type: 'timestamp' })
  loginAt: Date;

  @Column({ name: 'logout_at', type: 'timestamp', nullable: true })
  logoutAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'login_attempts', type: 'int', default: 0 })
  loginAttempts: number;

  @Column({ name: 'suspicious_activity_count', type: 'int', default: 0 })
  suspiciousActivityCount: number;

  @Column({ name: 'security_flags', type: 'jsonb', nullable: true })
  securityFlags: {
    ipChanged: boolean;
    userAgentChanged: boolean;
    locationChanged: boolean;
    unusualLoginTime: boolean;
    multipleFailedAttempts: boolean;
  };

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at_db' })
  createdAtDb: Date;

  @UpdateDateColumn({ name: 'updated_at_db' })
  updatedAtDb: Date;

  // Virtual properties for easier access
  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isBlocked(): boolean {
    return this.status === SessionStatus.REVOKED || this.suspiciousActivityCount > 5;
  }

  get lastActivity(): Date {
    return this.lastActivityAt;
  }

  set lastActivity(value: Date) {
    this.lastActivityAt = value;
  }

  // Methods
  markAsExpired(): void {
    this.status = SessionStatus.EXPIRED;
    this.isActive = false;
  }

  markAsRevoked(): void {
    this.status = SessionStatus.REVOKED;
    this.isActive = false;
    this.logoutAt = new Date();
  }

  updateActivity(ipAddress: string, userAgent: string): void {
    this.lastActivityAt = new Date();
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
  }

  incrementSuspiciousActivity(): void {
    this.suspiciousActivityCount++;
    if (this.suspiciousActivityCount > 5) {
      this.markAsRevoked();
    }
  }

  resetSuspiciousActivity(): void {
    this.suspiciousActivityCount = 0;
  }
}