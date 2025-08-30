// Academia Pro - Installment Plan Entity
// Database entity for managing fee installment plans

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum InstallmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DEFAULTED = 'defaulted',
  SUSPENDED = 'suspended',
}

export enum InstallmentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  CUSTOM = 'custom',
}

@Entity('installment_plans')
@Index(['studentId', 'status'])
@Index(['studentId', 'academicYear'])
@Index(['schoolId', 'status'])
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'fee_structure_id', type: 'uuid' })
  feeStructureId: string;

  @Column({ name: 'plan_name', type: 'varchar', length: 200 })
  planName: string;

  @Column({ name: 'plan_description', type: 'text', nullable: true })
  planDescription: string;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.ACTIVE,
  })
  status: InstallmentStatus;

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: InstallmentFrequency,
    default: InstallmentFrequency.MONTHLY,
  })
  frequency: InstallmentFrequency;

  // Financial Information
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'down_payment', type: 'decimal', precision: 10, scale: 2, default: 0 })
  downPayment: number;

  @Column({ name: 'installment_amount', type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ name: 'total_installments', type: 'int' })
  totalInstallments: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Schedule Information
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'first_installment_date', type: 'timestamp' })
  firstInstallmentDate: Date;

  @Column({ name: 'grace_period_days', type: 'int', default: 7 })
  gracePeriodDays: number;

  // Payment Tracking
  @Column({ name: 'installments_paid', type: 'int', default: 0 })
  installmentsPaid: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'remaining_amount', type: 'decimal', precision: 10, scale: 2 })
  remainingAmount: number;

  @Column({ name: 'next_due_date', type: 'timestamp', nullable: true })
  nextDueDate: Date;

  @Column({ name: 'last_payment_date', type: 'timestamp', nullable: true })
  lastPaymentDate: Date;

  // Late Payment Configuration
  @Column({ name: 'late_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  lateFeePercentage: number;

  @Column({ name: 'late_fee_fixed_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFeeFixedAmount: number;

  @Column({ name: 'late_fee_grace_days', type: 'int', default: 0 })
  lateFeeGraceDays: number;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Approval and Authorization
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_by_name', type: 'varchar', length: 100, nullable: true })
  approvedByName: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  // Terms and Conditions
  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  termsConditions: string;

  @Column({ name: 'auto_debit_enabled', type: 'boolean', default: false })
  autoDebitEnabled: boolean;

  @Column({ name: 'payment_method_restriction', type: 'jsonb', nullable: true })
  paymentMethodRestriction: string[];

  // Communication Preferences
  @Column({ name: 'reminder_enabled', type: 'boolean', default: true })
  reminderEnabled: boolean;

  @Column({ name: 'reminder_days_before', type: 'int', default: 7 })
  reminderDaysBefore: number;

  @Column({ name: 'parent_notification_enabled', type: 'boolean', default: true })
  parentNotificationEnabled: boolean;

  // Default and Suspension
  @Column({ name: 'default_threshold_days', type: 'int', default: 30 })
  defaultThresholdDays: number;

  @Column({ name: 'suspension_date', type: 'timestamp', nullable: true })
  suspensionDate: Date;

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ name: 'reactivation_date', type: 'timestamp', nullable: true })
  reactivationDate: Date;

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    campaign?: string;
    specialConditions?: string;
    externalReference?: string;
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_by_name', type: 'varchar', length: 100 })
  createdByName: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'updated_by_name', type: 'varchar', length: 100, nullable: true })
  updatedByName: string;

  // Relations
  @OneToMany(() => InstallmentSchedule, schedule => schedule.installmentPlan)
  schedules: InstallmentSchedule[];
}

@Entity('installment_schedules')
@Index(['installmentPlanId', 'dueDate'])
@Index(['installmentPlanId', 'status'])
export class InstallmentSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'installment_plan_id', type: 'uuid' })
  installmentPlanId: string;

  @Column({ name: 'installment_number', type: 'int' })
  installmentNumber: number;

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'amount_due', type: 'decimal', precision: 10, scale: 2 })
  amountDue: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'late_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFee: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'paid', 'overdue', 'partially_paid', 'waived'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'waived';

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ name: 'payment_transaction_id', type: 'varchar', length: 100, nullable: true })
  paymentTransactionId: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => InstallmentPlan)
  @JoinColumn({ name: 'installment_plan_id' })
  installmentPlan: InstallmentPlan;
}