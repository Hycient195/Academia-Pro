import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, IsNumber, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TGradeLevel } from '../../../../common/src/types/academic/academic.types';

export enum EnrollmentType {
  REGULAR = 'regular',
  TRANSFER = 'transfer',
  PROMOTION = 'promotion',
  DEMOTION = 'demotion',
  REPEAT = 'repeat',
  LATE_ADMISSION = 'late_admission',
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  WITHDRAWN = 'withdrawn',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  EXPELLED = 'expelled',
}

export enum WithdrawalReason {
  PARENT_REQUEST = 'parent_request',
  TRANSFER_TO_ANOTHER_SCHOOL = 'transfer_to_another_school',
  ACADEMIC_PERFORMANCE = 'academic_performance',
  DISCIPLINARY_ACTION = 'disciplinary_action',
  FINANCIAL_REASONS = 'financial_reasons',
  MEDICAL_REASONS = 'medical_reasons',
  FAMILY_RELOCATION = 'family_relocation',
  OTHER = 'other',
}

export class EmergencyContactDto {
  @ApiProperty({
    description: 'Emergency contact name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Relationship to student',
    example: 'Father',
  })
  @IsString()
  relationship: string;

  @ApiProperty({
    description: 'Emergency contact phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Emergency contact email',
    example: 'john.doe@email.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact address',
    example: '123 Main St, City, State',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Whether this is the primary emergency contact',
    example: true,
  })
  @IsBoolean()
  isPrimary: boolean;
}

export class MedicalInfoDto {
  @ApiPropertyOptional({
    description: 'Blood group',
    example: 'O+',
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: ['Asthma', 'Allergies'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @ApiPropertyOptional({
    description: 'Allergies',
    example: ['Peanuts', 'Dust'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Medications',
    example: ['Inhaler as needed'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Doctor contact information',
    example: 'Dr. Smith - (555) 123-4567',
  })
  @IsOptional()
  @IsString()
  doctorContact?: string;

  @ApiPropertyOptional({
    description: 'Insurance information',
    example: 'ABC Insurance - Policy #12345',
  })
  @IsOptional()
  @IsString()
  insuranceInfo?: string;
}

export class TransportInfoDto {
  @ApiProperty({
    description: 'Whether student uses school transport',
    example: true,
  })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({
    description: 'Transport route ID',
    example: 'route-uuid-123',
  })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiPropertyOptional({
    description: 'Pickup point',
    example: 'Main Street Bus Stop',
  })
  @IsOptional()
  @IsString()
  pickupPoint?: string;

  @ApiPropertyOptional({
    description: 'Drop point',
    example: 'School Main Gate',
  })
  @IsOptional()
  @IsString()
  dropPoint?: string;

  @ApiPropertyOptional({
    description: 'Distance from school (in km)',
    example: 5.5,
  })
  @IsOptional()
  @IsNumber()
  distance?: number;
}

export class HostelInfoDto {
  @ApiProperty({
    description: 'Whether student requires hostel accommodation',
    example: false,
  })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @IsOptional()
  @IsString()
  hostelId?: string;

  @ApiPropertyOptional({
    description: 'Room number',
    example: 'A-101',
  })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({
    description: 'Bed number',
    example: 'B1',
  })
  @IsOptional()
  @IsString()
  bedNumber?: string;

  @ApiPropertyOptional({
    description: 'Room type',
    example: 'Standard',
  })
  @IsOptional()
  @IsString()
  roomType?: string;
}

export class CreateStudentEnrollmentDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-456',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  @IsString()
  academicYear: string;

  @ApiProperty({
    description: 'Person enrolling the student',
    example: 'parent-uuid-123',
  })
  @IsString()
  enrolledBy: string;

  @ApiPropertyOptional({
    description: 'Roll number in class',
    example: 15,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rollNumber?: number;

  @ApiPropertyOptional({
    description: 'Type of enrollment',
    enum: EnrollmentType,
    example: EnrollmentType.REGULAR,
  })
  @IsOptional()
  @IsEnum(EnrollmentType)
  enrollmentType?: EnrollmentType;

  @ApiPropertyOptional({
    description: 'Previous school (for transfer students)',
    example: 'Previous School Name',
  })
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiPropertyOptional({
    description: 'Previous grade (for transfer students)',
    enum: TGradeLevel,
    example: TGradeLevel.GRADE_2,
  })
  @IsOptional()
  @IsEnum(TGradeLevel)
  previousGrade?: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Admission date',
    example: '2024-08-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  admissionDate?: Date;

  @ApiPropertyOptional({
    description: 'Emergency contacts',
    type: [EmergencyContactDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @ApiPropertyOptional({
    description: 'Medical information',
    type: MedicalInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInfoDto)
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({
    description: 'Transport information',
    type: TransportInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransportInfoDto)
  transportInfo?: TransportInfoDto;

  @ApiPropertyOptional({
    description: 'Hostel information',
    type: HostelInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HostelInfoDto)
  hostelInfo?: HostelInfoDto;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student has excellent academic record',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Special accommodations required',
    example: ['Extra time for tests', 'Seating arrangement'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialAccommodations?: string[];
}

export class UpdateStudentEnrollmentDto {
  @ApiPropertyOptional({
    description: 'Roll number in class',
    example: 16,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rollNumber?: number;

  @ApiPropertyOptional({
    description: 'Emergency contacts',
    type: [EmergencyContactDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @ApiPropertyOptional({
    description: 'Medical information',
    type: MedicalInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInfoDto)
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({
    description: 'Transport information',
    type: TransportInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransportInfoDto)
  transportInfo?: TransportInfoDto;

  @ApiPropertyOptional({
    description: 'Hostel information',
    type: HostelInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HostelInfoDto)
  hostelInfo?: HostelInfoDto;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Updated notes about student',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Special accommodations required',
    example: ['Updated accommodation requirements'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialAccommodations?: string[];
}

export class WithdrawStudentDto {
  @ApiProperty({
    description: 'Person withdrawing the student',
    example: 'parent-uuid-123',
  })
  @IsString()
  withdrawnBy: string;

  @ApiProperty({
    description: 'Reason for withdrawal',
    enum: WithdrawalReason,
    example: WithdrawalReason.PARENT_REQUEST,
  })
  @IsEnum(WithdrawalReason)
  reason: WithdrawalReason;

  @ApiPropertyOptional({
    description: 'Detailed reason description',
    example: 'Family relocating to another city',
  })
  @IsOptional()
  @IsString()
  reasonDetails?: string;

  @ApiPropertyOptional({
    description: 'Effective withdrawal date',
    example: '2024-12-31T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  withdrawalDate?: Date;

  @ApiPropertyOptional({
    description: 'Transfer destination (if applicable)',
    example: 'Another School Name',
  })
  @IsOptional()
  @IsString()
  transferDestination?: string;

  @ApiPropertyOptional({
    description: 'Final grade/GPA',
    example: 'A-',
  })
  @IsOptional()
  @IsString()
  finalGrade?: string;

  @ApiPropertyOptional({
    description: 'Exit interview notes',
    example: 'Student performed well academically',
  })
  @IsOptional()
  @IsString()
  exitNotes?: string;
}

export class StudentEnrollmentFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 'student-uuid-123',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by class ID',
    example: 'class-uuid-456',
  })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2024-2025',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Filter by enrollment status',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ENROLLED,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  enrollmentStatus?: EnrollmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by enrollment type',
    enum: EnrollmentType,
    example: EnrollmentType.REGULAR,
  })
  @IsOptional()
  @IsEnum(EnrollmentType)
  enrollmentType?: EnrollmentType;

  @ApiPropertyOptional({
    description: 'Filter by grade level',
    enum: TGradeLevel,
    example: TGradeLevel.GRADE_3,
  })
  @IsOptional()
  @IsEnum(TGradeLevel)
  gradeLevel?: TGradeLevel;

  @ApiProperty({
    description: 'School ID (required)',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;
}

export class StudentEnrollmentResponseDto {
  @ApiProperty({
    description: 'Enrollment ID',
    example: 'enrollment-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-456',
  })
  studentId: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-789',
  })
  classId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-101',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Roll number in class',
    example: 15,
  })
  rollNumber: number;

  @ApiProperty({
    description: 'Enrollment type',
    enum: EnrollmentType,
    example: EnrollmentType.REGULAR,
  })
  enrollmentType: EnrollmentType;

  @ApiProperty({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ENROLLED,
  })
  enrollmentStatus: EnrollmentStatus;

  @ApiProperty({
    description: 'Enrollment date',
    example: '2024-08-01T00:00:00Z',
  })
  enrollmentDate: Date;

  @ApiPropertyOptional({
    description: 'Emergency contacts',
    type: [EmergencyContactDto],
  })
  emergencyContacts?: EmergencyContactDto[];

  @ApiPropertyOptional({
    description: 'Medical information',
    type: MedicalInfoDto,
  })
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({
    description: 'Transport information',
    type: TransportInfoDto,
  })
  transportInfo?: TransportInfoDto;

  @ApiPropertyOptional({
    description: 'Hostel information',
    type: HostelInfoDto,
  })
  hostelInfo?: HostelInfoDto;

  @ApiPropertyOptional({
    description: 'Special accommodations',
    example: ['Extra time for tests'],
  })
  specialAccommodations?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student has excellent academic record',
  })
  notes?: string;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;
}

export class StudentEnrollmentsListResponseDto {
  @ApiProperty({
    description: 'List of student enrollments',
    type: [StudentEnrollmentResponseDto],
  })
  enrollments: StudentEnrollmentResponseDto[];

  @ApiProperty({
    description: 'Total number of enrollments',
    example: 450,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Summary statistics',
    example: {
      totalActive: 440,
      byGrade: { grade_1: 50, grade_2: 45, grade_3: 40 },
      byStatus: { enrolled: 440, withdrawn: 10 },
      byType: { regular: 400, transfer: 40, promotion: 10 },
    },
  })
  summary?: {
    totalActive: number;
    byGrade: Record<TGradeLevel, number>;
    byStatus: Record<EnrollmentStatus, number>;
    byType: Record<EnrollmentType, number>;
  };
}

export class BulkEnrollmentDto {
  @ApiProperty({
    description: 'List of enrollments to create',
    type: [CreateStudentEnrollmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentEnrollmentDto)
  enrollments: CreateStudentEnrollmentDto[];

  @ApiProperty({
    description: 'Whether to skip validation errors',
    example: false,
  })
  @IsBoolean()
  skipValidationErrors: boolean = false;
}

export class BulkEnrollmentResponseDto {
  @ApiProperty({
    description: 'Successfully created enrollments',
    type: [StudentEnrollmentResponseDto],
  })
  successful: StudentEnrollmentResponseDto[];

  @ApiProperty({
    description: 'Failed enrollments with error details',
    example: [
      {
        enrollment: { studentId: 'student-123', classId: 'class-456' },
        error: 'Class is at full capacity'
      }
    ],
  })
  failed: Array<{
    enrollment: Partial<CreateStudentEnrollmentDto>;
    error: string;
  }>;

  @ApiProperty({
    description: 'Total number of enrollments processed',
    example: 50,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Number of successful enrollments',
    example: 45,
  })
  successfulCount: number;

  @ApiProperty({
    description: 'Number of failed enrollments',
    example: 5,
  })
  failedCount: number;
}