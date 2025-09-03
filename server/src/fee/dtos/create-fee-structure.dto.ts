// Academia Pro - Create Fee Structure DTO
// DTO for creating new fee structures

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, IsArray, IsObject, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateFeeStructureRequest, TFeeType, TFeeFrequency, TFeeStatus } from '@academia-pro/common/fee';

export class CreateFeeStructureDto implements ICreateFeeStructureRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Type of fee',
    example: TFeeType.TUITION,
    enum: TFeeType,
  })
  @IsNotEmpty({ message: 'Fee type is required' })
  @IsEnum(TFeeType, { message: 'Invalid fee type' })
  feeType: TFeeType;

  @ApiProperty({
    description: 'Name of the fee',
    example: 'Annual Tuition Fee',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Fee name is required' })
  @IsString({ message: 'Fee name must be a string' })
  @MaxLength(200, { message: 'Fee name cannot exceed 200 characters' })
  feeName: string;

  @ApiPropertyOptional({
    description: 'Description of the fee',
    example: 'Annual tuition fee for Grade 10 students',
  })
  @IsOptional()
  @IsString({ message: 'Fee description must be a string' })
  feeDescription?: string;

  @ApiPropertyOptional({
    description: 'Frequency of the fee',
    example: TFeeFrequency.ANNUAL,
    enum: TFeeFrequency,
  })
  @IsOptional()
  @IsEnum(TFeeFrequency, { message: 'Invalid fee frequency' })
  frequency?: TFeeFrequency;

  @ApiProperty({
    description: 'Base amount of the fee',
    example: 1200.00,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Base amount is required' })
  @IsNumber({}, { message: 'Base amount must be a number' })
  @Min(0, { message: 'Base amount cannot be negative' })
  baseAmount: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency cannot exceed 3 characters' })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Tax percentage',
    example: 5.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax percentage must be a number' })
  @Min(0, { message: 'Tax percentage cannot be negative' })
  @Max(100, { message: 'Tax percentage cannot exceed 100' })
  taxPercentage?: number;

  @ApiPropertyOptional({
    description: 'Late fee percentage',
    example: 2.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Late fee percentage must be a number' })
  @Min(0, { message: 'Late fee percentage cannot be negative' })
  @Max(100, { message: 'Late fee percentage cannot exceed 100' })
  lateFeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Fixed late fee amount',
    example: 10.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Late fee fixed amount must be a number' })
  @Min(0, { message: 'Late fee fixed amount cannot be negative' })
  lateFeeFixedAmount?: number;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Grade level',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel?: string;

  @ApiPropertyOptional({
    description: 'Section',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiProperty({
    description: 'Effective from date',
    example: '2024-08-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Effective from date is required' })
  @IsDateString({}, { message: 'Effective from date must be a valid date' })
  effectiveFrom: string;

  @ApiPropertyOptional({
    description: 'Effective to date',
    example: '2025-07-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Effective to date must be a valid date' })
  effectiveTo?: string;

  @ApiPropertyOptional({
    description: 'Whether the fee is mandatory',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is mandatory must be a boolean' })
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Whether partial payment is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow partial payment must be a boolean' })
  allowPartialPayment?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum partial payment amount',
    example: 100.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum partial amount must be a number' })
  @Min(0, { message: 'Minimum partial amount cannot be negative' })
  minimumPartialAmount?: number;

  @ApiPropertyOptional({
    description: 'Payment deadline in days',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Payment deadline days must be a number' })
  @Min(1, { message: 'Payment deadline days must be at least 1' })
  paymentDeadlineDays?: number;

  @ApiPropertyOptional({
    description: 'Whether discounts are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow discounts must be a boolean' })
  allowDiscounts?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum discount percentage',
    example: 50.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum discount percentage must be a number' })
  @Min(0, { message: 'Maximum discount percentage cannot be negative' })
  @Max(100, { message: 'Maximum discount percentage cannot exceed 100' })
  maximumDiscountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Whether installments are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow installments must be a boolean' })
  allowInstallments?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of installments',
    example: 12,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum installments must be a number' })
  @Min(1, { message: 'Maximum installments must be at least 1' })
  maximumInstallments?: number;

  @ApiPropertyOptional({
    description: 'Installment interest rate',
    example: 1.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Installment interest rate must be a number' })
  @Min(0, { message: 'Installment interest rate cannot be negative' })
  installmentInterestRate?: number;

  @ApiPropertyOptional({
    description: 'Priority order',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Priority order must be a number' })
  @Min(0, { message: 'Priority order cannot be negative' })
  priorityOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the fee is refundable',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is refundable must be a boolean' })
  isRefundable?: boolean;

  @ApiPropertyOptional({
    description: 'Refund policy',
    example: 'Refunds allowed within 30 days with 10% processing fee',
  })
  @IsOptional()
  @IsString({ message: 'Refund policy must be a string' })
  refundPolicy?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['tuition', 'mandatory', 'annual'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      category: 'academic',
      applicableTo: ['Grade 10', 'Grade 11', 'Grade 12'],
      specialConditions: 'Only for day scholars'
    },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Approved by school management committee',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateFeeStructureDto {
  @ApiPropertyOptional({
    description: 'Type of fee',
    example: TFeeType.TUITION,
    enum: TFeeType,
  })
  @IsOptional()
  @IsEnum(TFeeType, { message: 'Invalid fee type' })
  feeType?: TFeeType;

  @ApiPropertyOptional({
    description: 'Name of the fee',
    example: 'Annual Tuition Fee',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Fee name must be a string' })
  @MaxLength(200, { message: 'Fee name cannot exceed 200 characters' })
  feeName?: string;

  @ApiPropertyOptional({
    description: 'Description of the fee',
    example: 'Annual tuition fee for Grade 10 students',
  })
  @IsOptional()
  @IsString({ message: 'Fee description must be a string' })
  feeDescription?: string;

  @ApiPropertyOptional({
    description: 'Frequency of the fee',
    example: TFeeFrequency.ANNUAL,
    enum: TFeeFrequency,
  })
  @IsOptional()
  @IsEnum(TFeeFrequency, { message: 'Invalid fee frequency' })
  frequency?: TFeeFrequency;

  @ApiPropertyOptional({
    description: 'Status of the fee structure',
    example: TFeeStatus.PENDING,
    enum: TFeeStatus,
  })
  @IsOptional()
  @IsEnum(TFeeStatus, { message: 'Invalid fee status' })
  status?: TFeeStatus;

  @ApiPropertyOptional({
    description: 'Base amount of the fee',
    example: 1200.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Base amount must be a number' })
  @Min(0, { message: 'Base amount cannot be negative' })
  baseAmount?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency cannot exceed 3 characters' })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Tax percentage',
    example: 5.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax percentage must be a number' })
  @Min(0, { message: 'Tax percentage cannot be negative' })
  @Max(100, { message: 'Tax percentage cannot exceed 100' })
  taxPercentage?: number;

  @ApiPropertyOptional({
    description: 'Late fee percentage',
    example: 2.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Late fee percentage must be a number' })
  @Min(0, { message: 'Late fee percentage cannot be negative' })
  @Max(100, { message: 'Late fee percentage cannot exceed 100' })
  lateFeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Fixed late fee amount',
    example: 10.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Late fee fixed amount must be a number' })
  @Min(0, { message: 'Late fee fixed amount cannot be negative' })
  lateFeeFixedAmount?: number;

  @ApiPropertyOptional({
    description: 'Academic year',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Grade level',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel?: string;

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
    description: 'Effective from date',
    example: '2024-08-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Effective from date must be a valid date' })
  effectiveFrom?: string;

  @ApiPropertyOptional({
    description: 'Effective to date',
    example: '2025-07-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Effective to date must be a valid date' })
  effectiveTo?: string;

  @ApiPropertyOptional({
    description: 'Whether the fee is mandatory',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is mandatory must be a boolean' })
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Whether partial payment is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow partial payment must be a boolean' })
  allowPartialPayment?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum partial payment amount',
    example: 100.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum partial amount must be a number' })
  @Min(0, { message: 'Minimum partial amount cannot be negative' })
  minimumPartialAmount?: number;

  @ApiPropertyOptional({
    description: 'Payment deadline in days',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Payment deadline days must be a number' })
  @Min(1, { message: 'Payment deadline days must be at least 1' })
  paymentDeadlineDays?: number;

  @ApiPropertyOptional({
    description: 'Whether discounts are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow discounts must be a boolean' })
  allowDiscounts?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum discount percentage',
    example: 50.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum discount percentage must be a number' })
  @Min(0, { message: 'Maximum discount percentage cannot be negative' })
  @Max(100, { message: 'Maximum discount percentage cannot exceed 100' })
  maximumDiscountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Whether installments are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow installments must be a boolean' })
  allowInstallments?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of installments',
    example: 12,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum installments must be a number' })
  @Min(1, { message: 'Maximum installments must be at least 1' })
  maximumInstallments?: number;

  @ApiPropertyOptional({
    description: 'Installment interest rate',
    example: 1.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Installment interest rate must be a number' })
  @Min(0, { message: 'Installment interest rate cannot be negative' })
  installmentInterestRate?: number;

  @ApiPropertyOptional({
    description: 'Priority order',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Priority order must be a number' })
  @Min(0, { message: 'Priority order cannot be negative' })
  priorityOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the fee is refundable',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is refundable must be a boolean' })
  isRefundable?: boolean;

  @ApiPropertyOptional({
    description: 'Refund policy',
    example: 'Refunds allowed within 30 days with 10% processing fee',
  })
  @IsOptional()
  @IsString({ message: 'Refund policy must be a string' })
  refundPolicy?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['tuition', 'mandatory', 'annual'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      category: 'academic',
      applicableTo: ['Grade 10', 'Grade 11', 'Grade 12'],
      specialConditions: 'Only for day scholars'
    },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Approved by school management committee',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}