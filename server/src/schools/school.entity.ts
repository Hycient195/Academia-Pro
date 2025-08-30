// Academia Pro - School Entity
// Core entity for multi-school architecture support

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

export enum SchoolType {
  PRESCHOOL = 'preschool',
  ELEMENTARY = 'elementary',
  MIDDLE_SCHOOL = 'middle_school',
  HIGH_SCHOOL = 'high_school',
  SENIOR_SECONDARY = 'senior_secondary',
  UNIVERSITY = 'university',
  COLLEGE = 'college',
  INSTITUTE = 'institute',
  TRAINING_CENTER = 'training_center',
}

export enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_MAINTENANCE = 'under_maintenance',
  CLOSED = 'closed',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // Unique school code (e.g., "SCH001")

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SchoolType,
    default: SchoolType.HIGH_SCHOOL,
  })
  type: SchoolType;

  @Column({
    type: 'enum',
    enum: SchoolStatus,
    default: SchoolStatus.ACTIVE,
  })
  status: SchoolStatus;

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  // Administrative Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  principalName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  principalPhone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  principalEmail?: string;

  // Operational Details
  @Column({ type: 'time', nullable: true })
  openingTime?: string;

  @Column({ type: 'time', nullable: true })
  closingTime?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  // Capacity and Statistics
  @Column({ type: 'int', default: 0 })
  maxStudents: number;

  @Column({ type: 'int', default: 0 })
  currentStudents: number;

  @Column({ type: 'int', default: 0 })
  maxStaff: number;

  @Column({ type: 'int', default: 0 })
  currentStaff: number;

  // Subscription and Billing
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.STANDARD,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionStartDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActiveSubscription: boolean;

  // Branding and Customization
  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 7, default: '#007bff' }) // Hex color
  primaryColor: string;

  @Column({ type: 'varchar', length: 7, default: '#6c757d' }) // Hex color
  secondaryColor: string;

  @Column({ type: 'jsonb', nullable: true })
  branding?: {
    logo?: string;
    favicon?: string;
    theme?: 'light' | 'dark' | 'auto';
    customCss?: string;
  };

  // Settings and Configuration
  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    features?: string[];
    modules?: string[];
    integrations?: string[];
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    security?: {
      mfaRequired?: boolean;
      passwordPolicy?: any;
      sessionTimeout?: number;
    };
    academic?: {
      gradingScale?: any;
      academicYear?: string;
      terms?: any[];
    };
  };

  // Audit Fields
  @Column({ type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.school)
  users: User[];

  @OneToMany(() => Student, student => student.school)
  students: Student[];

  // Virtual/Computed Properties
  get occupancyRate(): number {
    return this.maxStudents > 0 ? (this.currentStudents / this.maxStudents) * 100 : 0;
  }

  get isSubscriptionActive(): boolean {
    if (!this.subscriptionEndDate) return this.isActiveSubscription;
    return this.isActiveSubscription && this.subscriptionEndDate > new Date();
  }

  get daysUntilSubscriptionExpiry(): number {
    if (!this.subscriptionEndDate) return Infinity;
    const diffTime = this.subscriptionEndDate.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}