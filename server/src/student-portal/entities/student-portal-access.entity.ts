import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Student } from '../../students/student.entity';
import { StudentProfile } from './student-profile.entity';

export enum StudentPortalAccessLevel {
  BASIC = 'basic',           // Basic access with parental supervision
  STANDARD = 'standard',     // Standard student access
  ADVANCED = 'advanced',     // Advanced features for older students
  FULL = 'full',            // Full access for mature students
}

export enum StudentPortalStatus {
  PENDING = 'pending',       // Awaiting parental approval
  ACTIVE = 'active',         // Fully active
  RESTRICTED = 'restricted', // Limited access due to behavior/grades
  SUSPENDED = 'suspended',   // Temporarily suspended
  BLOCKED = 'blocked',       // Permanently blocked
}

export enum ContentRating {
  G = 'G',                   // General audience
  PG = 'PG',                 // Parental guidance suggested
  PG13 = 'PG13',            // Parents strongly cautioned
  R = 'R',                   // Restricted
}

@Entity('student_portal_access')
@Index(['studentId', 'schoolId'])
@Index(['status', 'schoolId'])
@Index(['accessLevel', 'schoolId'])
export class StudentPortalAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'access_level',
    type: 'enum',
    enum: StudentPortalAccessLevel,
    default: StudentPortalAccessLevel.STANDARD,
  })
  accessLevel: StudentPortalAccessLevel;

  @Column({
    type: 'enum',
    enum: StudentPortalStatus,
    default: StudentPortalStatus.PENDING,
  })
  status: StudentPortalStatus;

  @Column({
    name: 'content_rating',
    type: 'enum',
    enum: ContentRating,
    default: ContentRating.PG,
  })
  contentRating: ContentRating;

  @Column({ name: 'parental_controls_enabled', type: 'boolean', default: true })
  parentalControlsEnabled: boolean;

  @Column({ name: 'parent_approval_required', type: 'boolean', default: true })
  parentApprovalRequired: boolean;

  @Column({ name: 'screen_time_limits', type: 'jsonb', nullable: true })
  screenTimeLimits: {
    dailyLimit: number;        // minutes per day
    sessionLimit: number;      // minutes per session
    breakRequired: number;     // minutes of break required
    restrictedHours: string[]; // time ranges when access is blocked
  };

  @Column({ name: 'feature_permissions', type: 'jsonb', nullable: true })
  featurePermissions: {
    messaging: boolean;
    socialFeatures: boolean;
    externalLinks: boolean;
    fileUploads: boolean;
    videoCalls: boolean;
    onlinePurchases: boolean;
    locationSharing: boolean;
    cameraAccess: boolean;
    microphoneAccess: boolean;
  };

  @Column({ name: 'privacy_settings', type: 'jsonb', nullable: true })
  privacySettings: {
    profileVisibility: 'private' | 'school_only' | 'public';
    activitySharing: boolean;
    locationTracking: boolean;
    dataCollection: boolean;
    thirdPartySharing: boolean;
  };

  @Column({ name: 'device_restrictions', type: 'jsonb', nullable: true })
  deviceRestrictions: {
    allowedDevices: string[];    // device IDs or types
    requireApproval: boolean;
    geoFencing: boolean;
    networkRestrictions: string[]; // allowed networks
  };

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

  @Column({ name: 'total_session_time', type: 'int', default: 0 }) // minutes
  totalSessionTime: number;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'account_locked_until', type: 'timestamp', nullable: true })
  accountLockedUntil: Date;

  @Column({ name: 'password_reset_token', type: 'varchar', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', type: 'varchar', nullable: true })
  twoFactorSecret: string;

  @Column({ name: 'emergency_access_granted', type: 'boolean', default: false })
  emergencyAccessGranted: boolean;

  @Column({ name: 'emergency_access_expires', type: 'timestamp', nullable: true })
  emergencyAccessExpires: Date;

  @Column({ name: 'behavior_score', type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  behaviorScore: number; // 1.0 to 10.0 scale

  @Column({ name: 'academic_performance_score', type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  academicPerformanceScore: number; // 1.0 to 10.0 scale

  @Column({ name: 'trust_level', type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  trustLevel: number; // 1.0 to 10.0 scale

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @OneToMany(() => StudentProfile, profile => profile.portalAccess)
  profiles: StudentProfile[];
}