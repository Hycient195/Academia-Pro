// Academia Pro - Timetable Filters DTO
// Data Transfer Object for timetable filtering and querying

import { IsOptional, IsString, IsEnum, IsInt, Min, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TDayOfWeek, TPeriodType, TTimetableStatus, ITimetableFilters } from '../../../../common/src/types/timetable';
import { Type } from 'class-transformer';

export class TimetableFiltersDto implements ITimetableFilters {
  @ApiProperty({
    description: 'School ID filter',
    example: 'school-uuid-123',
  })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Academic year filter',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Grade level filter',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel?: string;

  @ApiPropertyOptional({
    description: 'Section filter',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Class ID filter',
    example: 'class-uuid-456',
  })
  @IsOptional()
  @IsString({ message: 'Class ID must be a string' })
  classId?: string;

  @ApiPropertyOptional({
    description: 'Subject ID filter',
    example: 'subject-uuid-789',
  })
  @IsOptional()
  @IsString({ message: 'Subject ID must be a string' })
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Teacher ID filter',
    example: 'teacher-uuid-101',
  })
  @IsOptional()
  @IsString({ message: 'Teacher ID must be a string' })
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Day of week filter',
    enum: TDayOfWeek,
    example: TDayOfWeek.MONDAY,
  })
  @IsOptional()
  @IsEnum(TDayOfWeek, { message: 'Invalid day of week' })
  dayOfWeek?: TDayOfWeek;

  @ApiPropertyOptional({
    description: 'Period type filter',
    enum: TPeriodType,
    example: TPeriodType.REGULAR_CLASS,
  })
  @IsOptional()
  @IsEnum(TPeriodType, { message: 'Invalid period type' })
  periodType?: TPeriodType;

  @ApiPropertyOptional({
    description: 'Room ID filter',
    example: 'room-uuid-202',
  })
  @IsOptional()
  @IsString({ message: 'Room ID must be a string' })
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Timetable status filter',
    enum: TTimetableStatus,
    example: TTimetableStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(TTimetableStatus, { message: 'Invalid timetable status' })
  status?: TTimetableStatus;

  @ApiPropertyOptional({
    description: 'Special event filter',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  isSpecialEvent?: boolean;

  @ApiPropertyOptional({
    description: 'Online class filter',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  isOnlineClass?: boolean;

  @ApiPropertyOptional({
    description: 'Date from filter (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString({ message: 'Date from must be a date string' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Date to filter (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString({ message: 'Date to must be a date string' })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Tags filter',
    example: ['core_subject', 'mathematics'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}