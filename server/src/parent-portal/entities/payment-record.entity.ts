import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentType {
  TUITION_FEE = 'tuition_fee',
  TRANSPORTATION_FEE = 'transportation_fee',
  LUNCH_FEE = 'lunch_fee',
  ACTIVITY_FEE = 'activity_fee',
  MATERIAL_FEE = 'material_fee',
  LATE_FEE = 'late_fee',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  ONLINE = 'online',
  OTHER = 'other',
}

@Entity('payment_records')
@Index(['parentPortalAccessId', 'paymentDate'])
@Index(['studentId', 'paymentDate'])
@Index(['status', 'paymentDate'])
@Index(['paymentType', 'paymentDate'])
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ name: 'description', type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'payment_date', type: 'timestamp' })
  paymentDate: Date;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

  @Column({ name: 'payment_gateway', type: 'varchar', length: 100, nullable: true })
  paymentGateway: string;

  @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 255, nullable: true })
  gatewayTransactionId: string;

  @Column({ name: 'fee_breakdown', type: 'jsonb', nullable: true })
  feeBreakdown: Array<{
    item: string;
    amount: number;
    description?: string;
  }>;

  @Column({ name: 'discount_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountApplied: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_frequency', type: 'varchar', length: 50, nullable: true })
  recurringFrequency: string; // 'monthly', 'quarterly', 'annually'

  @Column({ name: 'next_payment_date', type: 'timestamp', nullable: true })
  nextPaymentDate: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isOverdue(): boolean {
    return this.dueDate && this.dueDate < new Date() &&
           this.status === PaymentStatus.PENDING;
  }

  isSuccessful(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  getTotalAmount(): number {
    return this.amount + this.taxAmount + this.processingFee - this.discountApplied;
  }

  markAsCompleted(transactionId?: string): void {
    this.status = PaymentStatus.COMPLETED;
    if (transactionId) {
      this.transactionId = transactionId;
    }
  }

  markAsFailed(reason?: string): void {
    this.status = PaymentStatus.FAILED;
    if (reason) {
      this.notes = reason;
    }
  }

  applyRefund(amount: number, reason?: string): void {
    this.status = PaymentStatus.REFUNDED;
    if (reason) {
      this.notes = `Refunded: ${reason}`;
    }
  }
}