// Academia Pro - Mark Attendance DTO
// DTO for marking individual student attendance

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus, AttendanceType, AttendanceMethod } from '../entities/attendance.entity';

export class MarkAttendanceDto {
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
  @IsNumber({}, { message: 'Period number must be a number' })
  @Min(1, { message: 'Period number must be at least 1' })
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
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event name must be a string' })
  @MaxLength(200, { message: 'Event name cannot exceed 200 characters' })
  eventName?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'School Auditorium',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(200, { message: 'Location cannot exceed 200 characters' })
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
    description: 'Late minutes',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Late minutes must be a number' })
  @Min(0, { message: 'Late minutes cannot be negative' })
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
    description: 'Excuse document URL',
    example: 'https://storage.example.com/documents/medical_note.pdf',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Excuse document URL must be a string' })
  @MaxLength(500, { message: 'Excuse document URL cannot exceed 500 characters' })
  excuseDocumentUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student arrived late due to traffic',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Follow up with parent regarding frequent tardiness',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;

  @ApiPropertyOptional({
    description: 'Whether to notify parent',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Parent notified must be a boolean' })
  parentNotified?: boolean;

  @ApiPropertyOptional({
    description: 'Latitude for geolocation',
    example: 40.7128,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for geolocation',
    example: -74.0060,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;
}