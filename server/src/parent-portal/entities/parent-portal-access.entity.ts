import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Parent } from '../../parent/parent.entity';
import { ParentStudentLink } from './parent-student-link.entity';

export enum ParentPortalAccessLevel {
  EMERGENCY = 'emergency',     // Emergency contact only
  VIEW_ONLY = 'view_only',     // View grades and basic info
  LIMITED = 'limited',         // View + basic communication
  FULL = 'full',              // Full access to all features
}

export enum ParentPortalStatus {
  PENDING = 'pending',         // Awaiting verification
  ACTIVE = 'active',           // Fully active
  SUSPENDED = 'suspended',     // Temporarily suspended
  BLOCKED = 'blocked',         // Permanently blocked
}

@Entity('parent_portal_access')
@Index(['parentId', 'schoolId'])
@Index(['status', 'schoolId'])
export class ParentPortalAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id', type: 'uuid' })
  parentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'access_level',
    type: 'enum',
    enum: ParentPortalAccessLevel,
    default: ParentPortalAccessLevel.VIEW_ONLY,
  })
  accessLevel: ParentPortalAccessLevel;

  @Column({
    type: 'enum',
    enum: ParentPortalStatus,
    default: ParentPortalStatus.PENDING,
  })
  status: ParentPortalStatus;

  @Column({ name: 'is_primary_guardian', type: 'boolean', default: false })
  isPrimaryGuardian: boolean;

  @Column({ name: 'relationship_type', type: 'varchar', length: 50, nullable: true })
  relationshipType: string;

  @Column({ name: 'emergency_contact', type: 'boolean', default: false })
  emergencyContact: boolean;

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

  @Column({ name: 'emergency_access_granted', type: 'boolean', default: false })
  emergencyAccessGranted: boolean;

  @Column({ name: 'emergency_access_expires', type: 'timestamp', nullable: true })
  emergencyAccessExpires: Date;

  @Column({ name: 'privacy_settings', type: 'jsonb', nullable: true })
  privacySettings: {
    shareWithSchool: boolean;
    shareWithTeachers: boolean;
    shareWithOtherParents: boolean;
    dataRetentionPeriod: number; // days
  };

  @Column({ name: 'notification_preferences', type: 'jsonb', nullable: true })
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    grades: boolean;
    attendance: boolean;
    assignments: boolean;
    events: boolean;
    fees: boolean;
  };

  @Column({ name: 'language_preference', type: 'varchar', length: 10, default: 'en' })
  languagePreference: string;

  @Column({ name: 'timezone', type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Parent)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @OneToMany(() => ParentStudentLink, link => link.parentPortalAccess)
  studentLinks: ParentStudentLink[];

  // Helper methods
  isActive(): boolean {
    return this.status === ParentPortalStatus.ACTIVE;
  }

  isLocked(): boolean {
    return this.accountLockedUntil && this.accountLockedUntil > new Date();
  }

  hasEmergencyAccess(): boolean {
    return this.emergencyAccessGranted &&
           (!this.emergencyAccessExpires || this.emergencyAccessExpires > new Date());
  }

  canAccessLevel(requiredLevel: ParentPortalAccessLevel): boolean {
    const levels = {
      [ParentPortalAccessLevel.EMERGENCY]: 1,
      [ParentPortalAccessLevel.VIEW_ONLY]: 2,
      [ParentPortalAccessLevel.LIMITED]: 3,
      [ParentPortalAccessLevel.FULL]: 4,
    };

    return levels[this.accessLevel] >= levels[requiredLevel];
  }

  incrementLoginCount(): void {
    this.loginCount++;
    this.lastLoginAt = new Date();
    this.failedLoginAttempts = 0; // Reset failed attempts on successful login
  }

  incrementFailedLogin(): void {
    this.failedLoginAttempts++;
    if (this.failedLoginAttempts >= 5) {
      // Lock account for 30 minutes after 5 failed attempts
      this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
  }

  generatePasswordResetToken(): string {
    this.passwordResetToken = Math.random().toString(36).substring(2, 15) +
                             Math.random().toString(36).substring(2, 15);
    this.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return this.passwordResetToken;
  }

  clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
  }

  isPasswordResetTokenValid(token: string): boolean {
    return this.passwordResetToken === token &&
           this.passwordResetExpires &&
           this.passwordResetExpires > new Date();
  }
}