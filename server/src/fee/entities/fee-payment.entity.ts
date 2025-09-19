// Academia Pro - Fee Payment Entity
// Database entity for managing fee payments and transactions

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ONLINE_BANKING = 'online_banking',
  MOBILE_WALLET = 'mobile_wallet',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  FULL_PAYMENT = 'full_payment',
  PARTIAL_PAYMENT = 'partial_payment',
  ADVANCE_PAYMENT = 'advance_payment',
  INSTALLMENT = 'installment',
  LATE_PAYMENT = 'late_payment',
  PENALTY = 'penalty',
  DISCOUNT = 'discount',
  REFUND = 'refund',
}

@Entity('fee_payments')
@Index(['studentId', 'paymentDate'])
@Index(['studentId', 'academicYear'])
@Index(['schoolId', 'paymentStatus'])
@Index(['schoolId', 'paymentDate'])
@Index(['transactionId'], { unique: true })
export class FeePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'fee_structure_id', type: 'uuid' })
  feeStructureId: string;

  // Payment Information
  @Column({ name: 'transaction_id', type: 'varchar', length: 100, unique: true })
  transactionId: string;

  @Column({ name: 'receipt_number', type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.FULL_PAYMENT,
  })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  // Amount Information
  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'late_fee_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFeeAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // Payment Dates
  @Column({ name: 'payment_date', type: 'timestamp' })
  paymentDate: Date;

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'processed_date', type: 'timestamp', nullable: true })
  processedDate: Date;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Payment Gateway Information
  @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 255, nullable: true })
  gatewayTransactionId: string;

  @Column({ name: 'gateway_name', type: 'varchar', length: 100, nullable: true })
  gatewayName: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: any;

  // Bank/Financial Information
  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ name: 'bank_reference', type: 'varchar', length: 100, nullable: true })
  bankReference: string;

  @Column({ name: 'cheque_number', type: 'varchar', length: 50, nullable: true })
  chequeNumber: string;

  @Column({ name: 'card_last_four', type: 'varchar', length: 4, nullable: true })
  cardLastFour: string;

  // Installment Information
  @Column({ name: 'installment_number', type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ name: 'total_installments', type: 'int', nullable: true })
  totalInstallments: number;

  @Column({ name: 'installment_plan_id', type: 'uuid', nullable: true })
  installmentPlanId: string;

  // Refund Information
  @Column({ name: 'is_refund', type: 'boolean', default: false })
  isRefund: boolean;

  @Column({ name: 'original_payment_id', type: 'uuid', nullable: true })
  originalPaymentId: string;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string;

  @Column({ name: 'refund_processed_date', type: 'timestamp', nullable: true })
  refundProcessedDate: Date;

  // Verification and Approval
  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_by_name', type: 'varchar', length: 100, nullable: true })
  verifiedByName: string;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_by_name', type: 'varchar', length: 100, nullable: true })
  approvedByName: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  // Communication
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'notification_date', type: 'timestamp', nullable: true })
  notificationDate: Date;

  @Column({ name: 'email_sent', type: 'boolean', default: false })
  emailSent: boolean;

  @Column({ name: 'sms_sent', type: 'boolean', default: false })
  smsSent: boolean;

  // Additional Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    campaign?: string;
    channel?: string;
    deviceInfo?: any;
    ipAddress?: string;
    userAgent?: string;
  };

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
  @ManyToOne(() => FeePayment)
  @JoinColumn({ name: 'original_payment_id' })
  originalPayment: FeePayment;

  @OneToMany(() => FeePayment, payment => payment.originalPayment)
  refunds: FeePayment[];
}