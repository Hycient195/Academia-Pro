// Academia Pro - Fee Management Types
// Shared type definitions for fee management module

// Enums
export enum TFeeType {
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

export enum TFeeFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  GRADE_WISE = 'grade_wise',
}

export enum TFeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum TPaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TPaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  ONLINE = 'online',
  CARD = 'card',
  WALLET = 'wallet',
}

export enum TDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  SCHOLARSHIP = 'scholarship',
  SIBLING = 'sibling',
  EARLY_BIRD = 'early_bird',
  OTHER = 'other',
}

// Interfaces
export interface IFeeStructure {
  id: string;
  schoolId: string;
  feeType: TFeeType;
  feeName: string;
  feeDescription?: string;
  frequency: TFeeFrequency;
  status: TFeeStatus;
  baseAmount: number;
  currency: string;
  taxPercentage: number;
  lateFeePercentage: number;
  lateFeeFixedAmount: number;
  academicYear: string;
  gradeLevel?: string;
  section?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isMandatory: boolean;
  allowPartialPayment: boolean;
  minimumPartialAmount?: number;
  paymentDeadlineDays: number;
  allowDiscounts: boolean;
  maximumDiscountPercentage: number;
  allowInstallments: boolean;
  maximumInstallments: number;
  installmentInterestRate: number;
  priorityOrder: number;
  isRefundable: boolean;
  refundPolicy?: string;
  tags: string[];
  metadata?: {
    category?: string;
    subcategory?: string;
    applicableTo?: string[];
    specialConditions?: string;
    externalReference?: string;
  };
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface IPayment {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  currency: string;
  status: TPaymentStatus;
  paymentMethod: TPaymentMethod;
  transactionId?: string;
  paymentDate: Date;
  dueDate: Date;
  paidAmount: number;
  outstandingAmount: number;
  lateFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  receiptNumber?: string;
  notes?: string;
  paymentProof?: string;
  processedBy: string;
  processedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscount {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  discountType: TDiscountType;
  discountValue: number;
  discountAmount: number;
  reason: string;
  approvedBy: string;
  approvedByName: string;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstallment {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: Date;
  paidAmount: number;
  outstandingAmount: number;
  status: TPaymentStatus;
  lateFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: Date;
  status: TPaymentStatus;
  items: Array<{
    feeStructureId: string;
    feeName: string;
    amount: number;
    discount: number;
    tax: number;
    total: number;
  }>;
  payments: IPayment[];
  generatedAt: Date;
  generatedBy: string;
  generatedByName: string;
}

// Request Interfaces
export interface ICreateFeeStructureRequest {
  schoolId: string;
  feeType: TFeeType;
  feeName: string;
  feeDescription?: string;
  frequency?: TFeeFrequency;
  baseAmount: number;
  currency?: string;
  taxPercentage?: number;
  lateFeePercentage?: number;
  lateFeeFixedAmount?: number;
  academicYear: string;
  gradeLevel?: string;
  section?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isMandatory?: boolean;
  allowPartialPayment?: boolean;
  minimumPartialAmount?: number;
  paymentDeadlineDays?: number;
  allowDiscounts?: boolean;
  maximumDiscountPercentage?: number;
  allowInstallments?: boolean;
  maximumInstallments?: number;
  installmentInterestRate?: number;
  priorityOrder?: number;
  isRefundable?: boolean;
  refundPolicy?: string;
  tags?: string[];
  metadata?: any;
  internalNotes?: string;
}

export interface IUpdateFeeStructureRequest {
  feeType?: TFeeType;
  feeName?: string;
  feeDescription?: string;
  frequency?: TFeeFrequency;
  status?: TFeeStatus;
  baseAmount?: number;
  currency?: string;
  taxPercentage?: number;
  lateFeePercentage?: number;
  lateFeeFixedAmount?: number;
  academicYear?: string;
  gradeLevel?: string;
  section?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isMandatory?: boolean;
  allowPartialPayment?: boolean;
  minimumPartialAmount?: number;
  paymentDeadlineDays?: number;
  allowDiscounts?: boolean;
  maximumDiscountPercentage?: number;
  allowInstallments?: boolean;
  maximumInstallments?: number;
  installmentInterestRate?: number;
  priorityOrder?: number;
  isRefundable?: boolean;
  refundPolicy?: string;
  tags?: string[];
  metadata?: any;
  internalNotes?: string;
}

export interface ICreatePaymentRequest {
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  paymentMethod: TPaymentMethod;
  paymentType?: string;
  amountPaid: number;
  currency?: string;
  paymentDate: string;
  dueDate: string;
  academicYear: string;
  gradeLevel: string;
  section?: string;
  installmentNumber?: number;
  installmentPlanId?: string;
  bankName?: string;
  bankReference?: string;
  chequeNumber?: string;
  cardLastFour?: string;
  parentNotified?: boolean;
  notes?: string;
  metadata?: any;
}

export interface IApplyDiscountRequest {
  studentId: string;
  feeStructureId: string;
  discountType: TDiscountType;
  discountValue: number;
  reason: string;
  validFrom: string;
  validTo?: string;
}

export interface ICreateInstallmentPlanRequest {
  studentId: string;
  feeStructureId: string;
  numberOfInstallments: number;
  startDate: string;
  interestRate?: number;
}

export interface IProcessPaymentRequest {
  paymentId: string;
  gatewayTransactionId?: string;
  gatewayName?: string;
  gatewayResponse?: any;
  processingNotes?: string;
}

export interface IRefundPaymentRequest {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
  refundProcessingDate?: string;
  refundNotes?: string;
}

export interface IProcessRefundRequest {
  paymentId: string;
  refundAmount: number;
  reason: string;
  refundMethod: TPaymentMethod;
}

// Response Interfaces
export interface IFeeStructureResponse extends Omit<IFeeStructure, 'createdBy' | 'updatedBy'> {
  usageCount: number;
  totalRevenue: number;
  studentCount: number;
}

export interface IPaymentResponse extends Omit<IPayment, 'processedBy'> {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  feeStructure?: {
    id: string;
    feeName: string;
    feeType: TFeeType;
  };
  processor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface IDiscountResponse extends IDiscount {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  feeStructure?: {
    id: string;
    feeName: string;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface IInstallmentResponse extends IInstallment {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  feeStructure?: {
    id: string;
    feeName: string;
  };
}

export interface IFeeInvoiceResponse extends IFeeInvoice {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    grade: string;
    section: string;
  };
  school?: {
    id: string;
    name: string;
    address: string;
  };
}

// List Responses
export interface IFeeStructureListResponse {
  feeStructures: IFeeStructureResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalStructures: number;
    activeStructures: number;
    totalRevenue: number;
    byType: Record<TFeeType, number>;
  };
}

export interface IPaymentListResponse {
  payments: IPaymentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
    byStatus: Record<TPaymentStatus, number>;
    byMethod: Record<TPaymentMethod, number>;
  };
}

export interface IStudentFeeSummaryResponse {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  grade: string;
  section: string;
  academicYear: string;
  feeSummary: {
    totalFees: number;
    paidAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
    nextDueDate?: Date;
    nextDueAmount?: number;
  };
  feeBreakdown: Array<{
    feeStructureId: string;
    feeName: string;
    feeType: TFeeType;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    dueDate: Date;
    status: TPaymentStatus;
  }>;
  paymentHistory: IPaymentResponse[];
  discounts: IDiscountResponse[];
  installments: IInstallmentResponse[];
}

// Filter and Query Interfaces
export interface IFeeStructureFilters {
  schoolId: string;
  feeType?: TFeeType;
  frequency?: TFeeFrequency;
  status?: TFeeStatus;
  academicYear?: string;
  gradeLevel?: string;
  section?: string;
  isMandatory?: boolean;
  allowDiscounts?: boolean;
  allowInstallments?: boolean;
  search?: string;
}

export interface IPaymentFilters {
  schoolId: string;
  studentId?: string;
  feeStructureId?: string;
  status?: TPaymentStatus;
  paymentMethod?: TPaymentMethod;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface IDiscountFilters {
  schoolId: string;
  studentId?: string;
  feeStructureId?: string;
  discountType?: TDiscountType;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  approvedBy?: string;
  search?: string;
}

// Statistics and Analytics
export interface IFeeStatistics {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  collectionRate: number;
  averagePaymentDelay: number;
  byFeeType: Record<TFeeType, {
    count: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }>;
  byPaymentMethod: Record<TPaymentMethod, {
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  byStatus: Record<TPaymentStatus, {
    count: number;
    totalAmount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    payments: number;
    outstanding: number;
  }>;
  topDefaulters: Array<{
    studentId: string;
    studentName: string;
    outstandingAmount: number;
    overdueDays: number;
  }>;
}

// Bulk Operations
export interface IBulkFeeUpdateRequest {
  feeStructureIds: string[];
  updates: Partial<ICreateFeeStructureRequest>;
}

export interface IBulkPaymentRequest {
  payments: ICreatePaymentRequest[];
}

export interface IBulkDiscountRequest {
  discounts: IApplyDiscountRequest[];
}

// Notification Templates
export interface IFeeNotificationTemplate {
  id: string;
  schoolId: string;
  type: 'payment_due' | 'payment_overdue' | 'payment_reminder' | 'invoice_generated' | 'discount_applied';
  subject: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Integration Interfaces
export interface IPaymentGatewayConfig {
  gateway: 'stripe' | 'paypal' | 'razorpay' | 'paystack' | 'flutterwave';
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  isActive: boolean;
  testMode: boolean;
  supportedCurrencies: string[];
  minimumAmount: number;
  maximumAmount: number;
  processingFee: number;
  settlementPeriod: number;
}

export interface IPaymentGatewayResponse {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  gatewayReference: string;
  gatewayResponse: any;
  processedAt: Date;
}