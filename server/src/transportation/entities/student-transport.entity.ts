// Academia Pro - Student Transport Entity
// Entity for managing individual student transportation assignments

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum TransportType {
  REGULAR = 'regular',
  SPECIAL_NEEDS = 'special_needs',
  MEDICAL = 'medical',
  EMERGENCY = 'emergency',
  TEMPORARY = 'temporary',
}

export enum TransportStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ONE_TIME = 'one_time',
  CUSTOM = 'custom',
}

@Entity('student_transports')
@Index(['schoolId', 'studentId'])
@Index(['schoolId', 'transportStatus'])
@Index(['schoolId', 'routeId'])
@Index(['schoolId', 'pickupStopId'])
@Index(['schoolId', 'dropoffStopId'])
export class StudentTransport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'route_id', type: 'uuid' })
  routeId: string;

  @Column({ name: 'pickup_stop_id', type: 'uuid' })
  pickupStopId: string;

  @Column({ name: 'dropoff_stop_id', type: 'uuid' })
  dropoffStopId: string;

  @Column({
    name: 'transport_type',
    type: 'enum',
    enum: TransportType,
    default: TransportType.REGULAR,
  })
  transportType: TransportType;

  @Column({
    name: 'transport_status',
    type: 'enum',
    enum: TransportStatus,
    default: TransportStatus.ACTIVE,
  })
  transportStatus: TransportStatus;

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: TransportFrequency,
    default: TransportFrequency.DAILY,
  })
  frequency: TransportFrequency;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'pickup_time', type: 'time' })
  pickupTime: string;

  @Column({ name: 'dropoff_time', type: 'time' })
  dropoffTime: string;

  @Column({ name: 'estimated_pickup_duration', type: 'int', default: 5 })
  estimatedPickupDuration: number; // minutes

  @Column({ name: 'estimated_dropoff_duration', type: 'int', default: 5 })
  estimatedDropoffDuration: number; // minutes

  @Column({ name: 'transport_fee', type: 'decimal', precision: 10, scale: 2 })
  transportFee: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'final_fee', type: 'decimal', precision: 10, scale: 2 })
  finalFee: number;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'pending' })
  paymentStatus: string; // pending, paid, overdue, waived

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ name: 'medical_conditions', type: 'text', nullable: true })
  medicalConditions: string;

  @Column({ name: 'emergency_contacts', type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    priority: number;
  }>;

  @Column({ name: 'transport_history', type: 'jsonb', nullable: true })
  transportHistory: Array<{
    date: Date;
    pickupTime: string;
    dropoffTime: string;
    status: 'completed' | 'missed' | 'delayed' | 'cancelled';
    delayMinutes?: number;
    notes?: string;
  }>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    totalTrips: number;
    completedTrips: number;
    missedTrips: number;
    averageDelayMinutes: number;
    onTimeRate: number; // percentage
    parentSatisfaction: number; // 1-5 scale
  };

  @Column({ name: 'notification_preferences', type: 'jsonb', nullable: true })
  notificationPreferences: {
    pickupReminder: boolean;
    dropoffNotification: boolean;
    delayAlerts: boolean;
    emergencyAlerts: boolean;
    weeklyReports: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
  };

  @Column({ name: 'custom_schedule', type: 'jsonb', nullable: true })
  customSchedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    exceptions: Array<{
      date: Date;
      type: 'holiday' | 'sick_leave' | 'vacation' | 'other';
      reason: string;
    }>;
  };

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be added when other entities are created)
  // @ManyToOne(() => Student)
  // @JoinColumn({ name: 'student_id' })
  // student: Student;

  // @ManyToOne(() => TransportRoute)
  // @JoinColumn({ name: 'route_id' })
  // route: TransportRoute;

  // @ManyToOne(() => TransportStop)
  // @JoinColumn({ name: 'pickup_stop_id' })
  // pickupStop: TransportStop;

  // @ManyToOne(() => TransportStop)
  // @JoinColumn({ name: 'dropoff_stop_id' })
  // dropoffStop: TransportStop;
}