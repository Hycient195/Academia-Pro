// Academia Pro - Fee Discount Entity
// Database entity for managing scholarships, discounts, and waivers

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum DiscountType {
  SCHOLARSHIP = 'scholarship',
  MERIT_BASED = 'merit_based',
  NEED_BASED = 'need_based',
  SIBLING_DISCOUNT = 'sibling_discount',
  EARLY_PAYMENT = 'early_payment',
  STAFF_CHILD = 'staff_child',
  ALUMNI_CHILD = 'alumni_child',
  SPECIAL_DISCOUNT = 'special_discount',
  PROMOTIONAL = 'promotional',
  OTHER = 'other',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING_APPROVAL = 'pending_approval',
}

export enum DiscountApplicationType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  WAIVER = 'waiver',
}

@Entity('fee_discounts')
@Index(['studentId', 'discountType'])
@Index(['studentId', 'status'])
@Index(['schoolId', 'academicYear'])
@Index(['schoolId', 'discountType'])
export class FeeDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({ name: 'discount_name', type: 'varchar', length: 200 })
  discountName: string;

  @Column({ name: 'discount_description', type: 'text', nullable: true })
  discountDescription: string;

  @Column({
    name: 'application_type',
    type: 'enum',
    enum: DiscountApplicationType,
    default: DiscountApplicationType.PERCENTAGE,
  })
  applicationType: DiscountApplicationType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number; // Percentage or fixed amount

  @Column({ name: 'maximum_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount: number;

  @Column({
    type: 'enum',
    enum: DiscountStatus,
    default: DiscountStatus.ACTIVE,
  })
  status: DiscountStatus;

  // Validity Period
  @Column({ name: 'effective_from', type: 'timestamp' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamp', nullable: true })
  effectiveTo: Date;

  @Column({ name: 'is_renewable', type: 'boolean', default: false })
  isRenewable: boolean;

  @Column({ name: 'renewal_criteria', type: 'text', nullable: true })
  renewalCriteria: string;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Application and Approval
  @Column({ name: 'application_date', type: 'timestamp' })
  applicationDate: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_by_name', type: 'varchar', length: 100, nullable: true })
  approvedByName: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  // Supporting Documents
  @Column({ name: 'supporting_documents', type: 'jsonb', default: [] })
  supportingDocuments: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadDate: Date;
    verified: boolean;
  }>;

  // Financial Impact
  @Column({ name: 'annual_discount_amount', type: 'decimal', precision: 10, scale: 2 })
  annualDiscountAmount: number;

  @Column({ name: 'total_discount_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDiscountApplied: number;

  @Column({ name: 'remaining_discount_amount', type: 'decimal', precision: 10, scale: 2 })
  remainingDiscountAmount: number;

  // Eligibility Criteria
  @Column({ name: 'eligibility_criteria', type: 'jsonb', nullable: true })
  eligibilityCriteria: {
    minimumGPA?: number;
    maximumFamilyIncome?: number;
    specialCategory?: string[];
    geographicCriteria?: string;
    otherConditions?: string;
  };

  // Communication
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'notification_date', type: 'timestamp', nullable: true })
  notificationDate: Date;

  // Review and Renewal
  @Column({ name: 'review_required', type: 'boolean', default: false })
  reviewRequired: boolean;

  @Column({ name: 'next_review_date', type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    sponsor?: string;
    fundingSource?: string;
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
}