import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsDateString, IsObject, IsBoolean, ValidateNested, Min, Max, IsUrl } from 'class-validator';

// Enums
export enum FeeType {
  TUITION = 'tuition',
  TRANSPORTATION = 'transportation',
  MEALS = 'meals',
  BOOKS = 'books',
  UNIFORMS = 'uniforms',
  ACTIVITIES = 'activities',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum FeeStatus {
  PENDING = 'pending',
  DUE = 'due',
  OVERDUE = 'overdue',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  WAIVED = 'waived',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  ONLINE_WALLET = 'online_wallet',
  INSTALLMENT = 'installment',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Request DTOs
export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Student ID for the payment',
    example: 'student-123',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 1500.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment method details (card info, bank details, etc.)',
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    walletId?: string;
  };

  @ApiPropertyOptional({
    description: 'Specific fee IDs to pay for',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feeIds?: string[];

  @ApiPropertyOptional({
    description: 'Payment description/notes',
    example: 'Monthly tuition payment',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether to save payment method for future use',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;
}

// Response DTOs
export class FeeSummaryResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Total fees for the year',
    example: 12000.00,
  })
  totalFees: number;

  @ApiProperty({
    description: 'Total amount paid',
    example: 8000.00,
  })
  totalPaid: number;

  @ApiProperty({
    description: 'Outstanding balance',
    example: 4000.00,
  })
  outstandingBalance: number;

  @ApiProperty({
    description: 'Next payment due date',
  })
  nextDueDate: Date;

  @ApiProperty({
    description: 'Next payment amount',
    example: 1500.00,
  })
  nextPaymentAmount: number;

  @ApiProperty({
    description: 'Payment status summary',
  })
  statusSummary: {
    paid: number;
    pending: number;
    overdue: number;
    waived: number;
  };

  @ApiProperty({
    description: 'Recent payments',
    type: [Object],
  })
  recentPayments: Array<{
    paymentId: string;
    amount: number;
    date: Date;
    status: PaymentStatus;
  }>;
}

export class FeeDetailsResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Fee breakdown by type',
    type: [Object],
  })
  feeBreakdown: Array<{
    feeId: string;
    type: FeeType;
    description: string;
    amount: number;
    dueDate: Date;
    status: FeeStatus;
    paidAmount: number;
    outstandingAmount: number;
    lastPaymentDate?: Date;
  }>;

  @ApiProperty({
    description: 'Monthly fee schedule',
    type: [Object],
  })
  monthlySchedule: Array<{
    month: string;
    totalAmount: number;
    paidAmount: number;
    dueDate: Date;
    status: FeeStatus;
  }>;

  @ApiProperty({
    description: 'Fee summary',
  })
  summary: {
    totalFees: number;
    totalPaid: number;
    outstandingBalance: number;
    overdueAmount: number;
    nextPayment: {
      amount: number;
      dueDate: Date;
    };
  };

  @ApiProperty({
    description: 'Applied discounts and waivers',
    type: [Object],
  })
  discounts: Array<{
    discountId: string;
    type: string;
    description: string;
    amount: number;
    appliedDate: Date;
  }>;
}

export class PaymentHistoryResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'payment-123',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 1500.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment date',
  })
  paymentDate: Date;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'TXN-2024-001',
  })
  transactionReference: string;

  @ApiPropertyOptional({
    description: 'Payment description',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Receipt download URL',
  })
  receiptUrl?: string;

  @ApiProperty({
    description: 'Fees covered by this payment',
    type: [Object],
  })
  feeAllocations: Array<{
    feeId: string;
    feeType: FeeType;
    amount: number;
  }>;

  @ApiPropertyOptional({
    description: 'Payment failure reason (if failed)',
  })
  failureReason?: string;
}

export class PaymentMethodsResponseDto {
  @ApiProperty({
    description: 'Available payment methods',
    type: [Object],
  })
  paymentMethods: Array<{
    method: PaymentMethod;
    name: string;
    description: string;
    isEnabled: boolean;
    processingFee?: number;
    estimatedProcessingTime: string;
    supportedCurrencies: string[];
    minimumAmount?: number;
    maximumAmount?: number;
    requiresSetup: boolean;
    setupInstructions?: string;
  }>;

  @ApiProperty({
    description: 'Saved payment methods',
    type: [Object],
  })
  savedPaymentMethods: Array<{
    paymentMethodId: string;
    method: PaymentMethod;
    maskedDetails: string;
    isDefault: boolean;
    lastUsed?: Date;
    expiryDate?: Date;
  }>;
}

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'payment-123',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment amount',
    example: 1500.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'TXN-2024-001',
  })
  transactionReference: string;

  @ApiProperty({
    description: 'Payment timestamp',
  })
  paymentDate: Date;

  @ApiPropertyOptional({
    description: 'Receipt URL',
  })
  receiptUrl?: string;

  @ApiPropertyOptional({
    description: 'Redirect URL for external payment processing',
  })
  redirectUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment confirmation message',
  })
  message?: string;
}

export class FeeAlertsResponseDto {
  @ApiProperty({
    description: 'Fee alerts and notifications',
    type: [Object],
  })
  alerts: Array<{
    alertId: string;
    type: 'due_soon' | 'overdue' | 'payment_failed' | 'discount_available' | 'installment_due';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    studentId: string;
    studentName: string;
    amount?: number;
    dueDate?: Date;
    actionRequired: boolean;
    actionUrl?: string;
    createdAt: Date;
    acknowledgedAt?: Date;
  }>;

  @ApiProperty({
    description: 'Alert summary',
  })
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    actionRequired: number;
    acknowledgedToday: number;
  };
}

export class FeeProjectionsResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Projection period in months',
    example: 6,
  })
  projectionPeriod: number;

  @ApiProperty({
    description: 'Current outstanding balance',
    example: 4000.00,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Projected payments',
    type: [Object],
  })
  projectedPayments: Array<{
    month: string;
    projectedDate: Date;
    amount: number;
    description: string;
    isEstimated: boolean;
    confidence: 'high' | 'medium' | 'low';
  }>;

  @ApiProperty({
    description: 'Available discounts and scholarships',
    type: [Object],
  })
  availableDiscounts: Array<{
    discountId: string;
    name: string;
    description: string;
    amount: number;
    type: 'percentage' | 'fixed_amount';
    eligibilityCriteria: string[];
    applicationDeadline?: Date;
    autoApplied: boolean;
  }>;

  @ApiProperty({
    description: 'Projection summary',
  })
  summary: {
    totalProjectedPayments: number;
    totalAvailableDiscounts: number;
    netProjectedAmount: number;
    monthlyAverage: number;
    recommendedSavings: number;
  };

  @ApiProperty({
    description: 'Payment recommendations',
    type: [Object],
  })
  recommendations: Array<{
    type: 'early_payment' | 'installment_plan' | 'scholarship_application' | 'discount_eligibility';
    title: string;
    description: string;
    potentialSavings: number;
    actionUrl?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// List Response DTOs
export class FeeSummaryListResponseDto {
  @ApiProperty({
    description: 'Fee summaries for all children',
    type: [FeeSummaryResponseDto],
  })
  summaries: FeeSummaryResponseDto[];

  @ApiProperty({
    description: 'Overall summary',
  })
  overallSummary: {
    totalChildren: number;
    totalOutstanding: number;
    totalOverdue: number;
    nextPaymentDate: Date;
    nextPaymentAmount: number;
  };
}

export class FeeDetailsListResponseDto {
  @ApiProperty({
    description: 'Fee details',
    type: [FeeDetailsResponseDto],
  })
  feeDetails: FeeDetailsResponseDto[];

  @ApiProperty({
    description: 'Total count',
    example: 1,
  })
  total: number;
}

export class PaymentHistoryListResponseDto {
  @ApiProperty({
    description: 'Payment history',
    type: [PaymentHistoryResponseDto],
  })
  payments: PaymentHistoryResponseDto[];

  @ApiProperty({
    description: 'Total count',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Payment summary',
  })
  summary: {
    totalPaid: number;
    totalPayments: number;
    averagePayment: number;
    lastPaymentDate: Date;
  };

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 20,
  })
  limit: number;
}

// Index export
export * from './fee.dto';