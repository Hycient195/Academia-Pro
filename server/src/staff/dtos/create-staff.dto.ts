// Academia Pro - Create Staff DTO
// Data Transfer Object for creating new staff members

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsDateString, IsObject, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import {
  TEmploymentType,
  TDepartment,
  TPosition,
  TQualificationLevel,
  ICreateStaffRequest,
  IAddress,
  ISalaryInfo,
  IQualification,
  IEmergencyContact,
  IWorkSchedule,
  IBenefits
} from '../../../../common/src/types/staff/staff.types';

export class CreateStaffDto implements ICreateStaffRequest {
  @ApiProperty({
    description: 'Unique employee ID',
    example: 'EMP001',
  })
  @IsString()
  employeeId: string;

  @ApiPropertyOptional({
    description: 'Associated user ID',
    example: 'user-uuid-123',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Staff first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Staff last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Staff middle name',
    example: 'Michael',
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: 'Staff email address',
    example: 'john.doe@school.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Staff phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1985-03-15',
  })
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'Staff address',
    type: Object,
  })
  @IsObject()
  address: IAddress;

  @ApiProperty({
    description: 'Department',
    example: 'academic',
    enum: TDepartment,
  })
  @IsEnum(TDepartment)
  department: TDepartment;

  @ApiProperty({
    description: 'Position',
    example: 'teacher',
    enum: TPosition,
  })
  @IsEnum(TPosition)
  position: TPosition;

  @ApiProperty({
    description: 'Employment type',
    example: 'full_time',
    enum: TEmploymentType,
  })
  @IsEnum(TEmploymentType)
  employmentType: TEmploymentType;

  @ApiProperty({
    description: 'Hire date',
    example: '2024-01-15',
  })
  @IsDateString()
  hireDate: Date;

  @ApiPropertyOptional({
    description: 'Contract end date',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  contractEndDate?: Date;

  @ApiProperty({
    description: 'Salary information',
    type: Object,
  })
  @IsObject()
  salary: Omit<ISalaryInfo, 'netSalary'>;

  @ApiProperty({
    description: 'Qualifications',
    type: [Object],
  })
  @IsArray()
  qualifications: Omit<IQualification, 'id' | 'documents'>[];

  @ApiProperty({
    description: 'Emergency contact information',
    type: Object,
  })
  @IsObject()
  emergencyContact: IEmergencyContact;

  @ApiProperty({
    description: 'Work schedule',
    type: Object,
  })
  @IsObject()
  workSchedule: IWorkSchedule;

  @ApiProperty({
    description: 'Benefits information',
    type: Object,
  })
  @IsObject()
  benefits: IBenefits;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Manager ID',
    example: 'staff-uuid-456',
  })
  @IsOptional()
  @IsString()
  managerId?: string;
}

// Nested DTOs for complex objects
export class AddressDto implements IAddress {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class SalaryDto implements Omit<ISalaryInfo, 'netSalary'> {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({
    type: [Object],
  })
  @IsArray()
  allowances: Array<{
    type: string;
    amount: number;
    isTaxable: boolean;
    description?: string;
  }>;

  @ApiProperty({
    type: [Object],
  })
  @IsArray()
  deductions: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;

  @ApiProperty({
    example: 'monthly',
    enum: ['monthly', 'bi-weekly', 'weekly'],
  })
  @IsEnum(['monthly', 'bi-weekly', 'weekly'])
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchCode?: string;
    swiftCode?: string;
  };

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  taxInfo: {
    taxId: string;
    taxBracket: string;
    annualIncome: number;
    taxDeducted: number;
  };
}

export class AllowanceDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsBoolean()
  isTaxable: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class DeductionDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class QualificationDto implements Omit<IQualification, 'id' | 'documents'> {
  @ApiProperty({
    enum: TQualificationLevel,
  })
  @IsEnum(TQualificationLevel)
  level: TQualificationLevel;

  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty()
  @IsString()
  institution: string;

  @ApiProperty()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  yearOfCompletion: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;
}

export class EmergencyContactDto implements IEmergencyContact {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  relationship: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class WorkScheduleDto implements IWorkSchedule {
  @ApiProperty({
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  workingDays: string[];

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  workingHours: {
    startTime: string;
    endTime: string;
  };

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  breakTime?: {
    startTime: string;
    endTime: string;
  };

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(168)
  totalHoursPerWeek: number;

  @ApiProperty()
  @IsBoolean()
  overtimeAllowed: boolean;
}

export class BenefitsDto implements IBenefits {
  @ApiProperty()
  @IsBoolean()
  healthInsurance: boolean;

  @ApiProperty()
  @IsBoolean()
  lifeInsurance: boolean;

  @ApiProperty()
  @IsBoolean()
  retirementPlan: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  paidLeave: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  sickLeave: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maternityLeave: number;

  @ApiProperty({
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  otherBenefits: string[];
}