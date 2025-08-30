// Academia Pro - Fee Structure Entity
// Database entity for managing fee structures and categories

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum FeeType {
  TUITION = 'tuition',
  TRANSPORT = 'transport',
  HOSTEL = 'hostel',
  EXAMINATION = 'examination',
  LIBRARY = 'library',
  LABORATORY = 'laboratory',
  SPORTS = 'sports',
  MEDICAL = 'medical',
  ACTIVITY = 'activity',
  OTHER = 'other',
}

export enum FeeFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  GRADE_WISE = 'grade_wise',
}

export enum FeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('fee_structures')
@Index(['schoolId', 'feeType'])
@Index(['schoolId', 'academicYear'])
@Index(['schoolId', 'gradeLevel'])
export class FeeStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'fee_type',
    type: 'enum',
    enum: FeeType,
  })
  feeType: FeeType;

  @Column({ name: 'fee_name', type: 'varchar', length: 200 })
  feeName: string;

  @Column({ name: 'fee_description', type: 'text', nullable: true })
  feeDescription: string;

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: FeeFrequency,
    default: FeeFrequency.ANNUAL,
  })
  frequency: FeeFrequency;

  @Column({
    type: 'enum',
    enum: FeeStatus,
    default: FeeStatus.ACTIVE,
  })
  status: FeeStatus;

  // Amount Configuration
  @Column({ name: 'base_amount', type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  @Column({ name: 'late_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  lateFeePercentage: number;

  @Column({ name: 'late_fee_fixed_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFeeFixedAmount: number;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Validity Period
  @Column({ name: 'effective_from', type: 'timestamp' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamp', nullable: true })
  effectiveTo: Date;

  // Payment Configuration
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'allow_partial_payment', type: 'boolean', default: false })
  allowPartialPayment: boolean;

  @Column({ name: 'minimum_partial_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumPartialAmount: number;

  @Column({ name: 'payment_deadline_days', type: 'int', default: 30 })
  paymentDeadlineDays: number;

  // Discount and Scholarship Configuration
  @Column({ name: 'allow_discounts', type: 'boolean', default: true })
  allowDiscounts: boolean;

  @Column({ name: 'maximum_discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 50 })
  maximumDiscountPercentage: number;

  // Installment Configuration
  @Column({ name: 'allow_installments', type: 'boolean', default: true })
  allowInstallments: boolean;

  @Column({ name: 'maximum_installments', type: 'int', default: 12 })
  maximumInstallments: number;

  @Column({ name: 'installment_interest_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  installmentInterestRate: number;

  // Additional Configuration
  @Column({ name: 'priority_order', type: 'int', default: 0 })
  priorityOrder: number;

  @Column({ name: 'is_refundable', type: 'boolean', default: false })
  isRefundable: boolean;

  @Column({ name: 'refund_policy', type: 'text', nullable: true })
  refundPolicy: string;

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    applicableTo?: string[];
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
  @ManyToOne(() => FeeStructure)
  @JoinColumn({ name: 'parent_fee_id' })
  parentFee: FeeStructure;

  @OneToMany(() => FeeStructure, fee => fee.parentFee)
  childFees: FeeStructure[];
}