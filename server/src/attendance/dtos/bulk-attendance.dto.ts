// Academia Pro - Bulk Attendance DTO
// DTO for marking attendance for multiple students at once

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus, AttendanceType, AttendanceMethod } from '../entities/attendance.entity';

export class BulkAttendanceItemDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: string;

  @ApiProperty({
    description: 'Attendance status',
    example: AttendanceStatus.PRESENT,
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus, { message: 'Invalid attendance status' })
  @IsNotEmpty({ message: 'Attendance status is required' })
  status: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Late minutes (only for late status)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  lateMinutes?: number;

  @ApiPropertyOptional({
    description: 'Absence reason',
    example: 'Medical appointment',
  })
  @IsOptional()
  @IsString({ message: 'Absence reason must be a string' })
  absenceReason?: string;

  @ApiPropertyOptional({
    description: 'Excuse type',
    example: 'medical',
    enum: ['medical', 'family_emergency', 'transportation', 'religious', 'other'],
  })
  @IsOptional()
  @IsEnum(['medical', 'family_emergency', 'transportation', 'religious', 'other'], { message: 'Invalid excuse type' })
  excuseType?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student informed teacher in advance',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export class BulkMarkAttendanceDto {
  @ApiProperty({
    description: 'List of attendance records to mark',
    type: [BulkAttendanceItemDto],
  })
  @IsArray({ message: 'Attendance data must be an array' })
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'Attendance data is required' })
  attendanceData: BulkAttendanceItemDto[];

  @ApiPropertyOptional({
    description: 'Type of attendance',
    example: AttendanceType.CLASS,
    enum: AttendanceType,
  })
  @IsOptional()
  @IsEnum(AttendanceType, { message: 'Invalid attendance type' })
  attendanceType?: AttendanceType;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-03-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'Attendance date must be a valid date' })
  @IsNotEmpty({ message: 'Attendance date is required' })
  attendanceDate: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '2024-03-15T08:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Check-in time must be a valid date' })
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Check-out time',
    example: '2024-03-15T15:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Check-out time must be a valid date' })
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Class ID',
    example: 'class-uuid-456',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Class ID must be a valid UUID' })
  classId?: string;

  @ApiPropertyOptional({
    description: 'Section ID',
    example: 'section-uuid-789',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Section ID must be a valid UUID' })
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Subject ID',
    example: 'subject-uuid-101',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Subject ID must be a valid UUID' })
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Teacher ID',
    example: 'teacher-uuid-202',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Period number',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  periodNumber?: number;

  @ApiPropertyOptional({
    description: 'Event ID (for non-class attendance)',
    example: 'event-uuid-303',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId?: string;

  @ApiPropertyOptional({
    description: 'Event name',
    example: 'Annual Sports Day',
  })
  @IsOptional()
  @IsString({ message: 'Event name must be a string' })
  eventName?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'School Auditorium',
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Attendance method',
    example: AttendanceMethod.MANUAL,
    enum: AttendanceMethod,
  })
  @IsOptional()
  @IsEnum(AttendanceMethod, { message: 'Invalid attendance method' })
  attendanceMethod?: AttendanceMethod;

  @ApiPropertyOptional({
    description: 'Whether to notify parents',
    example: true,
  })
  @IsOptional()
  notifyParents?: boolean;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Bulk update for class cancellation',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class BulkUpdateAttendanceDto {
  @ApiProperty({
    description: 'List of student IDs to update',
    example: ['student-uuid-1', 'student-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Student IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each student ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Student IDs are required' })
  studentIds: string[];

  @ApiProperty({
    description: 'New attendance status',
    example: AttendanceStatus.EXCUSED,
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus, { message: 'Invalid attendance status' })
  @IsNotEmpty({ message: 'Attendance status is required' })
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-03-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'Attendance date must be a valid date' })
  @IsNotEmpty({ message: 'Attendance date is required' })
  attendanceDate: string;

  @ApiPropertyOptional({
    description: 'Reason for update',
    example: 'School holiday - all students marked excused',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Bulk update approved by principal',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}