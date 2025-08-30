import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum TransferType {
  INTER_SCHOOL = 'inter_school',
  INTER_STATE = 'inter_state',
  INTER_COUNTRY = 'inter_country',
  GRADE_PROMOTION = 'grade_promotion',
  STREAM_CHANGE = 'stream_change',
  BOARD_CHANGE = 'board_change',
}

export enum TransferStatus {
  INITIATED = 'initiated',
  DOCUMENTS_SUBMITTED = 'documents_submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransferReason {
  PARENT_JOB_TRANSFER = 'parent_job_transfer',
  FAMILY_RELOCATION = 'family_relocation',
  ACADEMIC_PERFORMANCE = 'academic_performance',
  SCHOOL_FACILITIES = 'school_facilities',
  FINANCIAL_REASONS = 'financial_reasons',
  HEALTH_CONCERNS = 'health_concerns',
  PERSONAL_REASONS = 'personal_reasons',
  OTHER = 'other',
}

@Entity('student_transfers')
@Index(['studentId', 'status'])
@Index(['fromSchoolId', 'transferDate'])
@Index(['toSchoolId', 'transferDate'])
export class StudentTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'transfer_type',
    type: 'enum',
    enum: TransferType,
  })
  transferType: TransferType;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.INITIATED,
  })
  status: TransferStatus;

  @Column({
    name: 'transfer_reason',
    type: 'enum',
    enum: TransferReason,
  })
  transferReason: TransferReason;

  @Column({ name: 'reason_details', type: 'text', nullable: true })
  reasonDetails: string;

  // From School Information
  @Column({ name: 'from_school_id', type: 'uuid' })
  fromSchoolId: string;

  @Column({ name: 'from_school_name', type: 'varchar', length: 200 })
  fromSchoolName: string;

  @Column({ name: 'from_grade', type: 'varchar', length: 50 })
  fromGrade: string;

  @Column({ name: 'from_section', type: 'varchar', length: 20, nullable: true })
  fromSection: string;

  @Column({ name: 'from_roll_number', type: 'varchar', length: 20, nullable: true })
  fromRollNumber: string;

  // To School Information
  @Column({ name: 'to_school_id', type: 'uuid', nullable: true })
  toSchoolId: string;

  @Column({ name: 'to_school_name', type: 'varchar', length: 200, nullable: true })
  toSchoolName: string;

  @Column({ name: 'to_grade', type: 'varchar', length: 50, nullable: true })
  toGrade: string;

  @Column({ name: 'to_section', type: 'varchar', length: 20, nullable: true })
  toSection: string;

  @Column({ name: 'to_roll_number', type: 'varchar', length: 20, nullable: true })
  toRollNumber: string;

  // Transfer Timeline
  @Column({ name: 'application_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  applicationDate: Date;

  @Column({ name: 'transfer_date', type: 'timestamp' })
  transferDate: Date;

  @Column({ name: 'completion_date', type: 'timestamp', nullable: true })
  completionDate: Date;

  @Column({ name: 'expected_completion_date', type: 'timestamp', nullable: true })
  expectedCompletionDate: Date;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'last_gpa', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lastGPA: number;

  @Column({ name: 'total_credits', type: 'int', nullable: true })
  totalCredits: number;

  @Column({ name: 'academic_standing', type: 'varchar', length: 50, nullable: true })
  academicStanding: string;

  // Financial Information
  @Column({ name: 'outstanding_fees', type: 'decimal', precision: 10, scale: 2, default: 0 })
  outstandingFees: number;

  @Column({ name: 'fee_settlement_status', type: 'varchar', length: 50, default: 'pending' })
  feeSettlementStatus: 'pending' | 'cleared' | 'waived' | 'transferred';

  @Column({ name: 'fee_settlement_date', type: 'timestamp', nullable: true })
  feeSettlementDate: Date;

  // Document Information
  @Column({ name: 'required_documents', type: 'jsonb', default: [] })
  requiredDocuments: Array<{
    documentType: string;
    documentName: string;
    isRequired: boolean;
    isSubmitted: boolean;
    submissionDate?: Date;
    verifiedBy?: string;
    verificationDate?: Date;
    documentUrl?: string;
  }>;

  @Column({ name: 'transfer_certificate_issued', type: 'boolean', default: false })
  transferCertificateIssued: boolean;

  @Column({ name: 'transfer_certificate_number', type: 'varchar', length: 100, nullable: true })
  transferCertificateNumber: string;

  @Column({ name: 'transfer_certificate_date', type: 'timestamp', nullable: true })
  transferCertificateDate: Date;

  // Approval Workflow
  @Column({ name: 'initiated_by', type: 'uuid' })
  initiatedBy: string;

  @Column({ name: 'initiated_by_name', type: 'varchar', length: 100 })
  initiatedByName: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_by_name', type: 'varchar', length: 100, nullable: true })
  approvedByName: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Communication and Follow-up
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'parent_notification_date', type: 'timestamp', nullable: true })
  parentNotificationDate: Date;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  // Additional Information
  @Column({ name: 'special_considerations', type: 'text', nullable: true })
  specialConsiderations: string;

  @Column({ name: 'emergency_contact_updated', type: 'boolean', default: false })
  emergencyContactUpdated: boolean;

  @Column({ name: 'transportation_updated', type: 'boolean', default: false })
  transportationUpdated: boolean;

  @Column({ name: 'hostel_updated', type: 'boolean', default: false })
  hostelUpdated: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    category?: string;
    tags?: string[];
    internalNotes?: string;
    externalNotes?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}