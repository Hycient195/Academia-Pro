// Academia Pro - Create Alumni DTO
// DTO for creating new student alumni records

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsNumber, IsEmail, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlumniStatus, GraduationType } from '../entities/student-alumni.entity';

export class AcademicHonorDto {
  @ApiProperty({
    description: 'Type of academic honor',
    example: 'scholarship',
  })
  @IsNotEmpty({ message: 'Honor type is required' })
  @IsString({ message: 'Honor type must be a string' })
  honorType: string;

  @ApiProperty({
    description: 'Name of the honor',
    example: 'Academic Excellence Award',
  })
  @IsNotEmpty({ message: 'Honor name is required' })
  @IsString({ message: 'Honor name must be a string' })
  honorName: string;

  @ApiProperty({
    description: 'Date when honor was awarded',
    example: '2024-05-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Award date is required' })
  @IsDateString({}, { message: 'Award date must be a valid date' })
  awardDate: string;

  @ApiPropertyOptional({
    description: 'Description of the honor',
    example: 'Awarded for maintaining GPA above 3.8',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class HigherEducationDto {
  @ApiProperty({
    description: 'Name of the educational institution',
    example: 'State University',
  })
  @IsNotEmpty({ message: 'Institution name is required' })
  @IsString({ message: 'Institution name must be a string' })
  institutionName: string;

  @ApiProperty({
    description: 'Program of study',
    example: 'Computer Science',
  })
  @IsNotEmpty({ message: 'Program is required' })
  @IsString({ message: 'Program must be a string' })
  program: string;

  @ApiProperty({
    description: 'Degree earned or pursuing',
    example: 'Bachelor of Science',
  })
  @IsNotEmpty({ message: 'Degree is required' })
  @IsString({ message: 'Degree must be a string' })
  degree: string;

  @ApiProperty({
    description: 'Start date of the program',
    example: '2024-08-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date of the program',
    example: '2028-05-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'GPA achieved',
    example: 3.7,
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber({}, { message: 'GPA must be a number' })
  @Min(0, { message: 'GPA cannot be less than 0' })
  @Max(4, { message: 'GPA cannot be more than 4' })
  gpa?: number;

  @ApiProperty({
    description: 'Current status in the program',
    example: 'enrolled',
    enum: ['enrolled', 'graduated', 'withdrawn', 'transferred'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['enrolled', 'graduated', 'withdrawn', 'transferred'], { message: 'Invalid status' })
  status: 'enrolled' | 'graduated' | 'withdrawn' | 'transferred';
}

export class CreateAlumniDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiProperty({
    description: 'Graduation date',
    example: '2024-05-20T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Graduation date is required' })
  @IsDateString({}, { message: 'Graduation date must be a valid date' })
  graduationDate: string;

  @ApiProperty({
    description: 'Graduation year',
    example: 2024,
    minimum: 1900,
    maximum: 2100,
  })
  @IsNotEmpty({ message: 'Graduation year is required' })
  @IsNumber({}, { message: 'Graduation year must be a number' })
  @Min(1900, { message: 'Graduation year must be at least 1900' })
  @Max(2100, { message: 'Graduation year cannot exceed 2100' })
  graduationYear: number;

  @ApiPropertyOptional({
    description: 'Type of graduation',
    example: GraduationType.REGULAR,
    enum: GraduationType,
  })
  @IsOptional()
  @IsEnum(GraduationType, { message: 'Invalid graduation type' })
  graduationType?: GraduationType;

  @ApiPropertyOptional({
    description: 'Final GPA at graduation',
    example: 3.8,
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber({}, { message: 'GPA must be a number' })
  @Min(0, { message: 'GPA cannot be less than 0' })
  @Max(4, { message: 'GPA cannot be more than 4' })
  graduationGPA?: number;

  @ApiPropertyOptional({
    description: 'Graduation rank in class',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Graduation rank must be a number' })
  @Min(1, { message: 'Graduation rank must be at least 1' })
  graduationRank?: number;

  @ApiPropertyOptional({
    description: 'Total class size',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Class size must be a number' })
  @Min(1, { message: 'Class size must be at least 1' })
  classSize?: number;

  @ApiPropertyOptional({
    description: 'Academic honors received',
    type: [AcademicHonorDto],
  })
  @IsOptional()
  @IsArray({ message: 'Academic honors must be an array' })
  academicHonors?: AcademicHonorDto[];

  @ApiPropertyOptional({
    description: 'Higher education information',
    type: [HigherEducationDto],
  })
  @IsOptional()
  @IsArray({ message: 'Higher education must be an array' })
  higherEducation?: HigherEducationDto[];

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe.alumni@university.edu',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Contact number must be a string' })
  contactNumber?: string;

  @ApiPropertyOptional({
    description: 'Current occupation',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString({ message: 'Occupation must be a string' })
  currentOccupation?: string;

  @ApiPropertyOptional({
    description: 'Current company name',
    example: 'Tech Solutions Inc.',
  })
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Whether the alumni is notable',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notable alumni must be a boolean' })
  notableAlumni?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to feature in newsletter',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Featured in newsletter must be a boolean' })
  featuredInNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Outstanding alumnus who donates regularly',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateAlumniDto {
  @ApiPropertyOptional({
    description: 'Alumni status',
    example: AlumniStatus.ACTIVE,
    enum: AlumniStatus,
  })
  @IsOptional()
  @IsEnum(AlumniStatus, { message: 'Invalid alumni status' })
  status?: AlumniStatus;

  @ApiPropertyOptional({
    description: 'Graduation date',
    example: '2024-05-20T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Graduation date must be a valid date' })
  graduationDate?: string;

  @ApiPropertyOptional({
    description: 'Graduation year',
    example: 2024,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Graduation year must be a number' })
  @Min(1900, { message: 'Graduation year must be at least 1900' })
  @Max(2100, { message: 'Graduation year cannot exceed 2100' })
  graduationYear?: number;

  @ApiPropertyOptional({
    description: 'Type of graduation',
    example: GraduationType.REGULAR,
    enum: GraduationType,
  })
  @IsOptional()
  @IsEnum(GraduationType, { message: 'Invalid graduation type' })
  graduationType?: GraduationType;

  @ApiPropertyOptional({
    description: 'Final GPA at graduation',
    example: 3.8,
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber({}, { message: 'GPA must be a number' })
  @Min(0, { message: 'GPA cannot be less than 0' })
  @Max(4, { message: 'GPA cannot be more than 4' })
  graduationGPA?: number;

  @ApiPropertyOptional({
    description: 'Graduation rank in class',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Graduation rank must be a number' })
  @Min(1, { message: 'Graduation rank must be at least 1' })
  graduationRank?: number;

  @ApiPropertyOptional({
    description: 'Total class size',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Class size must be a number' })
  @Min(1, { message: 'Class size must be at least 1' })
  classSize?: number;

  @ApiPropertyOptional({
    description: 'Academic honors received',
    type: [AcademicHonorDto],
  })
  @IsOptional()
  @IsArray({ message: 'Academic honors must be an array' })
  academicHonors?: AcademicHonorDto[];

  @ApiPropertyOptional({
    description: 'Higher education information',
    type: [HigherEducationDto],
  })
  @IsOptional()
  @IsArray({ message: 'Higher education must be an array' })
  higherEducation?: HigherEducationDto[];

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe.alumni@university.edu',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Contact number must be a string' })
  contactNumber?: string;

  @ApiPropertyOptional({
    description: 'Current occupation',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString({ message: 'Occupation must be a string' })
  currentOccupation?: string;

  @ApiPropertyOptional({
    description: 'Current company name',
    example: 'Tech Solutions Inc.',
  })
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Whether the alumni is notable',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notable alumni must be a boolean' })
  notableAlumni?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to feature in newsletter',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Featured in newsletter must be a boolean' })
  featuredInNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Outstanding alumnus who donates regularly',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}