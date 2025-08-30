import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Student } from '../../students/student.entity';
import { StudentActivityLog } from './student-activity-log.entity';

export enum StudentPortalAccessLevel {
  BASIC = 'basic',           // Basic access to essential features
  STANDARD = 'standard',     // Standard access with most features
  PREMIUM = 'premium',       // Full access to all features
  RESTRICTED = 'restricted', // Limited access for disciplinary reasons
}

export enum StudentPortalStatus {
  PENDING = 'pending',       // Awaiting activation
  ACTIVE = 'active',         // Fully active
  SUSPENDED = 'suspended',   // Temporarily suspended
  BLOCKED = 'blocked',       // Permanently blocked
  GRADUATED = 'graduated',   // Student has graduated
}

@Entity('student_portal_access')
@Index(['studentId', 'schoolId'])
@Index(['status', 'schoolId'])
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

  @Column({ name: 'is_parent_approved', type: 'boolean', default: false })
  isParentApproved: boolean;

  @Column({ name: 'parent_approval_date', type: 'timestamp', nullable: true })
  parentApprovalDate: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

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

  @Column({ name: 'biometric_enabled', type: 'boolean', default: false })
  biometricEnabled: boolean;

  @Column({ name: 'biometric_data', type: 'jsonb', nullable: true })
  biometricData: {
    fingerprintHash?: string;
    facialData?: string;
    voicePrint?: string;
  };

  @Column({ name: 'device_fingerprint', type: 'jsonb', nullable: true })
  deviceFingerprint: {
    userAgent: string;
    ipAddress: string;
    deviceId: string;
    lastUsed: Date;
  };

  @Column({ name: 'portal_preferences', type: 'jsonb', nullable: true })
  portalPreferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboardLayout: string[];
    accessibility: {
      fontSize: 'small' | 'medium' | 'large';
      highContrast: boolean;
      screenReader: boolean;
    };
  };

  @Column({ name: 'privacy_settings', type: 'jsonb', nullable: true })
  privacySettings: {
    profileVisibility: 'public' | 'school' | 'private';
    shareAchievements: boolean;
    shareAttendance: boolean;
    shareGrades: boolean;
    dataRetentionPeriod: number; // days
  };

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 10, nullable: true })
  section: string;

  @Column({ name: 'roll_number', type: 'varchar', length: 20, nullable: true })
  rollNumber: string;

  @Column({ name: 'graduation_date', type: 'timestamp', nullable: true })
  graduationDate: Date;

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

  @OneToMany(() => StudentActivityLog, log => log.studentPortalAccess)
  activityLogs: StudentActivityLog[];
}