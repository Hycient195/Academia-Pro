// Academia Pro - Create Payment DTO
// DTO for processing fee payments

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, IsObject, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TPaymentMethod, ICreatePaymentRequest } from '@academia-pro/types/fee';

export class CreatePaymentDto implements ICreatePaymentRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-456',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiProperty({
    description: 'Fee Structure ID',
    example: 'fee-structure-uuid-789',
  })
  @IsNotEmpty({ message: 'Fee Structure ID is required' })
  @IsString({ message: 'Fee Structure ID must be a string' })
  feeStructureId: string;

  @ApiProperty({
    description: 'Payment method',
    example: TPaymentMethod.ONLINE,
    enum: TPaymentMethod,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(TPaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: TPaymentMethod;

  @ApiPropertyOptional({
    description: 'Type of payment',
    example: 'full_payment',
  })
  @IsOptional()
  paymentType?: string;

  @ApiProperty({
    description: 'Amount paid',
    example: 500.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'Amount paid is required' })
  @IsNumber({}, { message: 'Amount paid must be a number' })
  @Min(0.01, { message: 'Amount paid must be greater than 0' })
  amountPaid: number;

  @ApiProperty({
    description: 'Amount (duplicate for interface compatibility)',
    example: 500.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'NGN',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency cannot exceed 3 characters' })
  currency?: string;

  @ApiProperty({
    description: 'Payment date',
    example: '2024-03-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Payment date is required' })
  @IsDateString({}, { message: 'Payment date must be a valid date' })
  paymentDate: string;

  @ApiProperty({
    description: 'Due date',
    example: '2024-03-15T23:59:59Z',
  })
  @IsNotEmpty({ message: 'Due date is required' })
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2023-2024',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear: string;

  @ApiProperty({
    description: 'Grade level',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Grade level is required' })
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel: string;

  @ApiPropertyOptional({
    description: 'Section',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Installment number (if applicable)',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Installment number must be a number' })
  @Min(1, { message: 'Installment number must be at least 1' })
  installmentNumber?: number;

  @ApiPropertyOptional({
    description: 'Installment plan ID (if applicable)',
    example: 'installment-plan-uuid-123',
  })
  @IsOptional()
  @IsString({ message: 'Installment plan ID must be a string' })
  installmentPlanId?: string;

  @ApiPropertyOptional({
    description: 'Bank name (for bank transfers)',
    example: 'First National Bank',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Bank name must be a string' })
  @MaxLength(100, { message: 'Bank name cannot exceed 100 characters' })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank reference number',
    example: 'REF123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Bank reference must be a string' })
  @MaxLength(100, { message: 'Bank reference cannot exceed 100 characters' })
  bankReference?: string;

  @ApiPropertyOptional({
    description: 'Cheque number (for cheque payments)',
    example: 'CHQ001234',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Cheque number must be a string' })
  @MaxLength(50, { message: 'Cheque number cannot exceed 50 characters' })
  chequeNumber?: string;

  @ApiPropertyOptional({
    description: 'Last four digits of card (for card payments)',
    example: '1234',
    maxLength: 4,
  })
  @IsOptional()
  @IsString({ message: 'Card last four must be a string' })
  @MaxLength(4, { message: 'Card last four cannot exceed 4 characters' })
  cardLastFour?: string;

  @ApiPropertyOptional({
    description: 'Whether parents have been notified',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Parent notified must be a boolean' })
  parentNotified?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Payment made through school portal',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      source: 'online_portal',
      campaign: 'early_payment_discount',
      deviceInfo: { type: 'mobile', os: 'iOS' }
    },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: any;
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Payment ID to process',
    example: 'payment-uuid-123',
  })
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsString({ message: 'Payment ID must be a string' })
  paymentId: string;

  @ApiPropertyOptional({
    description: 'Gateway transaction ID',
    example: 'gw_txn_123456789',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Gateway transaction ID must be a string' })
  @MaxLength(255, { message: 'Gateway transaction ID cannot exceed 255 characters' })
  gatewayTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Gateway name',
    example: 'Stripe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Gateway name must be a string' })
  @MaxLength(100, { message: 'Gateway name cannot exceed 100 characters' })
  gatewayName?: string;

  @ApiPropertyOptional({
    description: 'Gateway response data',
    example: { status: 'success', transactionId: 'txn_123' },
  })
  @IsOptional()
  @IsObject({ message: 'Gateway response must be an object' })
  gatewayResponse?: any;

  @ApiPropertyOptional({
    description: 'Processing notes',
    example: 'Payment processed successfully via Stripe',
  })
  @IsOptional()
  @IsString({ message: 'Processing notes must be a string' })
  processingNotes?: string;
}

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Payment ID to refund',
    example: 'payment-uuid-123',
  })
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsString({ message: 'Payment ID must be a string' })
  paymentId: string;

  @ApiProperty({
    description: 'Refund amount',
    example: 100.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'Refund amount is required' })
  @IsNumber({}, { message: 'Refund amount must be a number' })
  @Min(0.01, { message: 'Refund amount must be greater than 0' })
  refundAmount: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Student withdrew from program',
  })
  @IsNotEmpty({ message: 'Refund reason is required' })
  @IsString({ message: 'Refund reason must be a string' })
  refundReason: string;

  @ApiPropertyOptional({
    description: 'Refund processing date',
    example: '2024-03-16T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Refund processing date must be a valid date' })
  refundProcessingDate?: string;

  @ApiPropertyOptional({
    description: 'Additional refund notes',
    example: 'Processed as per school refund policy',
  })
  @IsOptional()
  @IsString({ message: 'Refund notes must be a string' })
  refundNotes?: string;
}