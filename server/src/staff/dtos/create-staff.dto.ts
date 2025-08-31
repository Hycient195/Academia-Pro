// Academia Pro - Create Staff DTO
// DTO for creating new staff members

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail, IsDateString, IsBoolean, IsNumber, Min, Max, MaxLength, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TEmploymentType,
  TDepartment,
  TPosition,
  TQualificationLevel,
  TBloodGroup,
  ICreateStaffRequest,
  IAddress,
  ISalaryInfo,
  IQualification,
  IEmergencyContact,
  IWorkSchedule,
  IBenefits
} from '@academia-pro/common/staff';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsNotEmpty({ message: 'Street is required' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'Springfield',
  })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'IL',
  })
  @IsNotEmpty({ message: 'State is required' })
  @IsString({ message: 'State must be a string' })
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '62701',
  })
  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString({ message: 'Postal code must be a string' })
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiPropertyOptional({
    description: 'Geographic coordinates',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Coordinates must be an object' })
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class QualificationDto {
  @ApiProperty({
    description: 'Qualification level',
    example: TQualificationLevel.BACHELORS,
    enum: TQualificationLevel,
  })
  @IsNotEmpty({ message: 'Qualification level is required' })
  @IsEnum(TQualificationLevel, { message: 'Invalid qualification level' })
  level: TQualificationLevel;

  @ApiProperty({
    description: 'Field of study',
    example: 'Computer Science',
  })
  @IsNotEmpty({ message: 'Field is required' })
  @IsString({ message: 'Field must be a string' })
  field: string;

  @ApiProperty({
    description: 'Educational institution',
    example: 'University of Springfield',
  })
  @IsNotEmpty({ message: 'Institution is required' })
  @IsString({ message: 'Institution must be a string' })
  institution: string;

  @ApiProperty({
    description: 'Year of completion',
    example: 2020,
  })
  @IsNotEmpty({ message: 'Year of completion is required' })
  @IsNumber({}, { message: 'Year must be a number' })
  @Min(1950, { message: 'Year must be 1950 or later' })
  @Max(new Date().getFullYear(), { message: 'Year cannot be in the future' })
  yearOfCompletion: number;

  @ApiPropertyOptional({
    description: 'Grade/GPA',
    example: '3.8 GPA',
  })
  @IsOptional()
  @IsString({ message: 'Grade must be a string' })
  grade?: string;

  @ApiPropertyOptional({
    description: 'Certificate number',
    example: 'CERT-2020-001',
  })
  @IsOptional()
  @IsString({ message: 'Certificate number must be a string' })
  certificateNumber?: string;

  @ApiProperty({
    description: 'Whether qualification is verified',
    example: true,
  })
  @IsNotEmpty({ message: 'Is verified is required' })
  @IsBoolean({ message: 'Is verified must be a boolean' })
  isVerified: boolean;
}

export class CertificationDto {
  @ApiProperty({
    description: 'Certification name',
    example: 'Teaching License',
  })
  @IsNotEmpty({ message: 'Certification name is required' })
  @IsString({ message: 'Certification name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Issuing authority',
    example: 'State Department of Education',
  })
  @IsNotEmpty({ message: 'Issuing authority is required' })
  @IsString({ message: 'Issuing authority must be a string' })
  issuingAuthority: string;

  @ApiProperty({
    description: 'Issue date',
    example: '2020-06-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Issue date is required' })
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  @Type(() => Date)
  issueDate: Date;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2025-06-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  @Type(() => Date)
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'Certificate number',
    example: 'TL-2020-0456',
  })
  @IsOptional()
  @IsString({ message: 'Certificate number must be a string' })
  certificateNumber?: string;

  @ApiPropertyOptional({
    description: 'Whether certification is verified',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is verified must be a boolean' })
  isVerified?: boolean;
}

export class PreviousExperienceDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'Previous School District',
  })
  @IsNotEmpty({ message: 'Organization is required' })
  @IsString({ message: 'Organization must be a string' })
  organization: string;

  @ApiProperty({
    description: 'Job designation',
    example: 'Senior Teacher',
  })
  @IsNotEmpty({ message: 'Designation is required' })
  @IsString({ message: 'Designation must be a string' })
  designation: string;

  @ApiProperty({
    description: 'Start date',
    example: '2018-08-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2023-07-31T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Job responsibilities',
    example: 'Taught mathematics to grades 9-12, developed curriculum, mentored junior teachers',
  })
  @IsNotEmpty({ message: 'Responsibilities are required' })
  @IsString({ message: 'Responsibilities must be a string' })
  responsibilities: string;

  @ApiPropertyOptional({
    description: 'Reason for leaving',
    example: 'Career advancement opportunity',
  })
  @IsOptional()
  @IsString({ message: 'Reason for leaving must be a string' })
  reasonForLeaving?: string;
}

export class MedicalInfoDto {
  @ApiPropertyOptional({
    description: 'Known allergies',
    example: ['peanuts', 'penicillin'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allergies must be an array' })
  @IsString({ each: true, message: 'Each allergy must be a string' })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: ['blood pressure medication'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Medications must be an array' })
  @IsString({ each: true, message: 'Each medication must be a string' })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: ['hypertension'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Conditions must be an array' })
  @IsString({ each: true, message: 'Each condition must be a string' })
  conditions?: string[];

  @ApiPropertyOptional({
    description: 'Family doctor name',
    example: 'Dr. Smith',
  })
  @IsOptional()
  @IsString({ message: 'Doctor name must be a string' })
  doctorName?: string;

  @ApiPropertyOptional({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Doctor phone must be a string' })
  doctorPhone?: string;

  @ApiPropertyOptional({
    description: 'Insurance provider',
    example: 'Health Insurance Corp',
  })
  @IsOptional()
  @IsString({ message: 'Insurance provider must be a string' })
  insuranceProvider?: string;

  @ApiPropertyOptional({
    description: 'Insurance policy number',
    example: 'POL123456789',
  })
  @IsOptional()
  @IsString({ message: 'Insurance number must be a string' })
  insuranceNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance expiry date',
    example: '2025-12-31T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Insurance expiry date must be a valid date' })
  @Type(() => Date)
  insuranceExpiryDate?: Date;
}

export class CommunicationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Email notifications enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Email preference must be a boolean' })
  email?: boolean;

  @ApiPropertyOptional({
    description: 'SMS notifications enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'SMS preference must be a boolean' })
  sms?: boolean;

  @ApiPropertyOptional({
    description: 'Push notifications enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Push preference must be a boolean' })
  push?: boolean;

  @ApiPropertyOptional({
    description: 'Newsletter subscription',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Newsletter preference must be a boolean' })
  newsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Emergency alerts enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Emergency alerts preference must be a boolean' })
  emergencyAlerts?: boolean;
}

export class CreateStaffDto implements ICreateStaffRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Employee ID (auto-generated if not provided)',
    example: 'EMP2024001',
  })
  @IsOptional()
  @IsString({ message: 'Employee ID must be a string' })
  employeeId?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @Min(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @Min(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Michael',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middleName?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(['male', 'female', 'other'], { message: 'Invalid gender' })
  gender: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'Date of birth',
    example: '1985-03-15T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'Marital status',
    example: 'married',
    enum: ['single', 'married', 'divorced', 'widowed'],
  })
  @IsOptional()
  @IsEnum(['single', 'married', 'divorced', 'widowed'], { message: 'Invalid marital status' })
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';

  @ApiPropertyOptional({
    description: 'Blood group',
    example: 'O_POSITIVE',
  })
  @IsOptional()
  @IsString({ message: 'Blood group must be a string' })
  bloodGroup?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@school.edu',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Alternate phone number',
    example: '+1234567891',
  })
  @IsOptional()
  @IsString({ message: 'Alternate phone must be a string' })
  alternatePhone?: string;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsNotEmpty({ message: 'Emergency contact name is required' })
  @IsString({ message: 'Emergency contact name must be a string' })
  emergencyContactName: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1234567892',
  })
  @IsNotEmpty({ message: 'Emergency contact phone is required' })
  @IsString({ message: 'Emergency contact phone must be a string' })
  emergencyContactPhone: string;

  @ApiProperty({
    description: 'Emergency contact relation',
    example: 'Wife',
  })
  @IsNotEmpty({ message: 'Emergency contact relation is required' })
  @IsString({ message: 'Emergency contact relation must be a string' })
  emergencyContactRelation: string;

  @ApiProperty({
    description: 'Current address',
    type: AddressDto,
  })
  @IsNotEmpty({ message: 'Current address is required' })
  @ValidateNested()
  currentAddress: AddressDto;

  @ApiPropertyOptional({
    description: 'Permanent address',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  permanentAddress?: AddressDto;

  @ApiProperty({
    description: 'Staff type',
    example: TDepartment.ACADEMIC,
    enum: TDepartment,
  })
  @IsNotEmpty({ message: 'Staff type is required' })
  @IsEnum(TDepartment, { message: 'Invalid staff type' })
  staffType: TDepartment;

  @ApiProperty({
    description: 'Department',
    example: TDepartment.ACADEMIC,
    enum: TDepartment,
  })
  @IsNotEmpty({ message: 'Department is required' })
  @IsEnum(TDepartment, { message: 'Invalid department' })
  department: TDepartment;

  @ApiProperty({
    description: 'Job designation',
    example: 'Senior Mathematics Teacher',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Designation is required' })
  @IsString({ message: 'Designation must be a string' })
  @MaxLength(100, { message: 'Designation cannot exceed 100 characters' })
  designation: string;

  @ApiPropertyOptional({
    description: 'Reporting manager ID',
    example: 'manager-uuid-456',
  })
  @IsOptional()
  @IsString({ message: 'Reporting to must be a string' })
  reportingTo?: string;

  @ApiPropertyOptional({
    description: 'Employment type',
    example: TEmploymentType.FULL_TIME,
    enum: TEmploymentType,
  })
  @IsOptional()
  @IsEnum(TEmploymentType, { message: 'Invalid employment type' })
  employmentType?: TEmploymentType;

  @ApiProperty({
    description: 'Joining date',
    example: '2024-08-01',
  })
  @IsNotEmpty({ message: 'Joining date is required' })
  @IsDateString({}, { message: 'Joining date must be a valid date' })
  @Type(() => Date)
  joiningDate: Date;

  @ApiPropertyOptional({
    description: 'Probation end date',
    example: '2024-11-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Probation end date must be a valid date' })
  @Type(() => Date)
  probationEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Contract end date',
    example: '2025-07-31T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Contract end date must be a valid date' })
  @Type(() => Date)
  contractEndDate?: Date;

  @ApiProperty({
    description: 'Basic salary',
    example: 50000.00,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Basic salary is required' })
  @IsNumber({}, { message: 'Basic salary must be a number' })
  @Min(0, { message: 'Basic salary cannot be negative' })
  basicSalary: number;

  @ApiPropertyOptional({
    description: 'Salary currency',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Salary currency must be a string' })
  @MaxLength(3, { message: 'Salary currency cannot exceed 3 characters' })
  salaryCurrency?: string;

  @ApiPropertyOptional({
    description: 'House allowance',
    example: 10000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'House allowance must be a number' })
  @Min(0, { message: 'House allowance cannot be negative' })
  houseAllowance?: number;

  @ApiPropertyOptional({
    description: 'Transport allowance',
    example: 5000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Transport allowance must be a number' })
  @Min(0, { message: 'Transport allowance cannot be negative' })
  transportAllowance?: number;

  @ApiPropertyOptional({
    description: 'Medical allowance',
    example: 3000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Medical allowance must be a number' })
  @Min(0, { message: 'Medical allowance cannot be negative' })
  medicalAllowance?: number;

  @ApiPropertyOptional({
    description: 'Other allowances',
    example: 2000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Other allowances must be a number' })
  @Min(0, { message: 'Other allowances cannot be negative' })
  otherAllowances?: number;

  @ApiPropertyOptional({
    description: 'Tax deductible amount',
    example: 5000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax deductible must be a number' })
  @Min(0, { message: 'Tax deductible cannot be negative' })
  taxDeductible?: number;

  @ApiPropertyOptional({
    description: 'Provident fund contribution',
    example: 2500.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Provident fund must be a number' })
  @Min(0, { message: 'Provident fund cannot be negative' })
  providentFund?: number;

  @ApiPropertyOptional({
    description: 'Other deductions',
    example: 1000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Other deductions must be a number' })
  @Min(0, { message: 'Other deductions cannot be negative' })
  otherDeductions?: number;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: 'bank_transfer',
  })
  @IsOptional()
  @IsString({ message: 'Payment method must be a string' })
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'First National Bank',
  })
  @IsOptional()
  @IsString({ message: 'Bank name must be a string' })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Bank account number must be a string' })
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank branch',
    example: 'Main Branch',
  })
  @IsOptional()
  @IsString({ message: 'Bank branch must be a string' })
  bankBranch?: string;

  @ApiPropertyOptional({
    description: 'IFSC code',
    example: 'FNB0001234',
  })
  @IsOptional()
  @IsString({ message: 'IFSC code must be a string' })
  ifscCode?: string;

  @ApiPropertyOptional({
    description: 'Educational qualifications',
    type: [QualificationDto],
  })
  @IsOptional()
  @IsArray({ message: 'Qualifications must be an array' })
  @ValidateNested({ each: true })
  qualifications?: QualificationDto[];

  @ApiPropertyOptional({
    description: 'Professional certifications',
    type: [CertificationDto],
  })
  @IsOptional()
  @IsArray({ message: 'Certifications must be an array' })
  @ValidateNested({ each: true })
  certifications?: CertificationDto[];

  @ApiPropertyOptional({
    description: 'Previous work experience',
    type: [PreviousExperienceDto],
  })
  @IsOptional()
  @IsArray({ message: 'Previous experience must be an array' })
  @ValidateNested({ each: true })
  previousExperience?: PreviousExperienceDto[];

  @ApiPropertyOptional({
    description: 'Medical information',
    type: MedicalInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({
    description: 'Communication preferences',
    type: CommunicationPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  communicationPreferences?: CommunicationPreferencesDto;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['experienced', 'certified', 'leadership'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Internal notes for HR',
    example: 'Excellent performance in previous role',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Min(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Min(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Michael',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middleName?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@school.edu',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Alternate phone number',
    example: '+1234567891',
  })
  @IsOptional()
  @IsString({ message: 'Alternate phone must be a string' })
  alternatePhone?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString({ message: 'Emergency contact name must be a string' })
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+1234567892',
  })
  @IsOptional()
  @IsString({ message: 'Emergency contact phone must be a string' })
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact relation',
    example: 'Wife',
  })
  @IsOptional()
  @IsString({ message: 'Emergency contact relation must be a string' })
  emergencyContactRelation?: string;

  @ApiPropertyOptional({
    description: 'Current address',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  currentAddress?: AddressDto;

  @ApiPropertyOptional({
    description: 'Permanent address',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  permanentAddress?: AddressDto;

  @ApiPropertyOptional({
    description: 'Department',
    example: 'Mathematics',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department cannot exceed 100 characters' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Job designation',
    example: 'Senior Mathematics Teacher',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Designation must be a string' })
  @MaxLength(100, { message: 'Designation cannot exceed 100 characters' })
  designation?: string;

  @ApiPropertyOptional({
    description: 'Reporting manager ID',
    example: 'manager-uuid-456',
  })
  @IsOptional()
  @IsString({ message: 'Reporting to must be a string' })
  reportingTo?: string;

  @ApiPropertyOptional({
    description: 'Basic salary',
    example: 55000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Basic salary must be a number' })
  @Min(0, { message: 'Basic salary cannot be negative' })
  basicSalary?: number;

  @ApiPropertyOptional({
    description: 'House allowance',
    example: 12000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'House allowance must be a number' })
  @Min(0, { message: 'House allowance cannot be negative' })
  houseAllowance?: number;

  @ApiPropertyOptional({
    description: 'Transport allowance',
    example: 6000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Transport allowance must be a number' })
  @Min(0, { message: 'Transport allowance cannot be negative' })
  transportAllowance?: number;

  @ApiPropertyOptional({
    description: 'Medical allowance',
    example: 4000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Medical allowance must be a number' })
  @Min(0, { message: 'Medical allowance cannot be negative' })
  medicalAllowance?: number;

  @ApiPropertyOptional({
    description: 'Other allowances',
    example: 3000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Other allowances must be a number' })
  @Min(0, { message: 'Other allowances cannot be negative' })
  otherAllowances?: number;

  @ApiPropertyOptional({
    description: 'Tax deductible amount',
    example: 6000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax deductible must be a number' })
  @Min(0, { message: 'Tax deductible cannot be negative' })
  taxDeductible?: number;

  @ApiPropertyOptional({
    description: 'Provident fund contribution',
    example: 3000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Provident fund must be a number' })
  @Min(0, { message: 'Provident fund cannot be negative' })
  providentFund?: number;

  @ApiPropertyOptional({
    description: 'Other deductions',
    example: 1500.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Other deductions must be a number' })
  @Min(0, { message: 'Other deductions cannot be negative' })
  otherDeductions?: number;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'First National Bank',
  })
  @IsOptional()
  @IsString({ message: 'Bank name must be a string' })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Bank account number must be a string' })
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank branch',
    example: 'Main Branch',
  })
  @IsOptional()
  @IsString({ message: 'Bank branch must be a string' })
  bankBranch?: string;

  @ApiPropertyOptional({
    description: 'IFSC code',
    example: 'FNB0001234',
  })
  @IsOptional()
  @IsString({ message: 'IFSC code must be a string' })
  ifscCode?: string;

  @ApiPropertyOptional({
    description: 'Medical information',
    type: MedicalInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({
    description: 'Communication preferences',
    type: CommunicationPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  communicationPreferences?: CommunicationPreferencesDto;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['experienced', 'certified', 'leadership'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Internal notes for HR',
    example: 'Promoted to senior position',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}