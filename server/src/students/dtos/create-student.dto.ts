// Academia Pro - Create Student DTO
// Data Transfer Object for creating new students

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsDateString, IsUUID, IsObject, IsArray, IsBoolean, MinLength, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TBloodGroup, TEnrollmentType } from '@academia-pro/types/student';
import type { TStudentStage, TGradeCode } from '@academia-pro/types/student/student.types';

// Local interface for create transportation
interface ICreateTransportationInfo {
  routeName?: string;
  pickupTime?: string;
  dropTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
}

export class CreateStudentDto { // implements ICreateStudentRequest
  @ApiProperty({
    description: 'Student first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Student middle name',
    example: 'Michael',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middleName?: string;

  @ApiProperty({
    description: 'Student date of birth',
    example: '2005-03-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Student gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be one of: male, female, other'
  })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'Student blood group',
    example: 'O+',
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  })
  @IsOptional()
  @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    message: 'Blood group must be a valid blood type'
  })
  bloodGroup?: TBloodGroup;

  @ApiPropertyOptional({
    description: 'Student email address',
    example: 'john.doe@student.school.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Student phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Student address information',
    example: {
      street: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Address must be an object' })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @ApiPropertyOptional({
    description: 'Unique admission number (auto-generated if not provided)',
    example: 'SCH20240001',
  })
  @IsOptional()
  @IsString({ message: 'Admission number must be a string' })
  admissionNumber?: string;

  @ApiProperty({
    description: 'Academic stage',
    example: 'PRY',
    enum: ['EY', 'PRY', 'JSS', 'SSS'],
  })
  @IsEnum(['EY', 'PRY', 'JSS', 'SSS'], { message: 'Stage must be one of EY, PRY, JSS, SSS' })
  @IsNotEmpty({ message: 'Stage is required' })
  stage: TStudentStage;

  @ApiProperty({
    description: 'Canonical grade code',
    example: 'PRY3',
    enum: ['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
  })
  @IsEnum(['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], { message: 'Invalid grade code' })
  @IsNotEmpty({ message: 'Grade code is required' })
  gradeCode: TGradeCode;

  @ApiProperty({
    description: 'Stream or section',
    example: 'A',
    minLength: 1,
    maxLength: 20,
  })
  @IsString({ message: 'Stream section must be a string' })
  @IsNotEmpty({ message: 'Stream section is required' })
  @MinLength(1, { message: 'Stream section cannot be empty' })
  @MaxLength(20, { message: 'Stream section cannot exceed 20 characters' })
  streamSection: string;

  @ApiPropertyOptional({
    description: 'Boarding status',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is boarding must be a boolean' })
  isBoarding?: boolean;

  @ApiProperty({
    description: 'Admission date',
    example: '2024-08-01',
    format: 'date',
  })
  @IsDateString({}, { message: 'Admission date must be a valid date' })
  @IsNotEmpty({ message: 'Admission date is required' })
  admissionDate: string;

  @ApiPropertyOptional({
    description: 'Enrollment type',
    example: 'regular',
    enum: ['regular', 'special_needs', 'gifted', 'international', 'transfer'],
  })
  @IsOptional()
  @IsEnum(['regular', 'special_needs', 'gifted', 'international', 'transfer'], {
    message: 'Enrollment type must be one of: regular, special_needs, gifted, international, transfer'
  })
  enrollmentType?: TEnrollmentType;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsUUID('4', { message: 'School ID must be a valid UUID' })
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'User ID (link to user account)',
    example: 'user-uuid-456',
  })
  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Parent/guardian information',
    example: {
      father: {
        name: 'John Doe Sr.',
        phone: '+1234567890',
        email: 'father@example.com',
        occupation: 'Engineer',
      },
      mother: {
        name: 'Jane Doe',
        phone: '+1234567891',
        email: 'mother@example.com',
        occupation: 'Teacher',
      },
    },
  })
  @IsOptional()
  @IsObject({ message: 'Parents information must be an object' })
  parents?: {
    father?: {
      name: string;
      phone: string;
      email?: string;
      occupation?: string;
      address?: string;
    };
    mother?: {
      name: string;
      phone: string;
      email?: string;
      occupation?: string;
      address?: string;
    };
    guardian?: {
      name: string;
      phone: string;
      email?: string;
      relation: string;
      address?: string;
    };
  };

  @ApiPropertyOptional({
    description: 'Medical information',
    example: {
      allergies: ['peanuts', 'dust'],
      medications: ['asthma inhaler'],
      conditions: ['asthma'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relation: 'Mother',
      },
    },
  })
  @IsOptional()
  @IsObject({ message: 'Medical information must be an object' })
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      priority: number;
      address: string;
    };
    doctorInfo?: {
      name: string;
      phone: string;
      clinic: string;
    };
    insuranceInfo?: {
      provider: string;
      policyNumber: string;
      coverageAmount: number;
      premium: number;
      startDate: Date;
      endDate: Date;
      deductible: number;
    };
  };

  @ApiPropertyOptional({
    description: 'Transportation requirements',
    example: {
      required: true,
      routeId: 'route-uuid-123',
      stopId: 'stop-uuid-456',
      pickupTime: '07:30',
      dropTime: '15:30',
      distance: 5.5,
      fee: 150.00,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Transportation information must be an object' })
  transportation?: Partial<ICreateTransportationInfo>;

  @ApiPropertyOptional({
    description: 'Hostel accommodation requirements',
    example: {
      required: true,
      hostelId: 'hostel-uuid-123',
      roomId: 'room-uuid-456',
      roomNumber: '201',
      bedNumber: 'A',
      fee: 200.00,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Hostel information must be an object' })
  hostel?: {
    required: boolean;
    hostelId?: string;
    roomId?: string;
    roomNumber?: string;
    bedNumber?: string;
    fee?: number;
  };
}