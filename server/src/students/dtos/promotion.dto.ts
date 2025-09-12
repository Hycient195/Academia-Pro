// Academia Pro - Promotion DTOs
// Data Transfer Objects for student promotion operations

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface IPromotionRequest {
  scope: 'all' | 'grade' | 'section' | 'students';
  gradeCode?: string;
  streamSection?: string;
  studentIds?: string[];
  targetGradeCode: string;
  academicYear: string;
  includeRepeaters?: boolean;
  reason?: string;
}

interface IPromotionResult {
  promotedStudents: number;
  studentIds: string[];
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}

export class PromotionRequestDto implements IPromotionRequest {
  @ApiProperty({
    description: 'Promotion scope',
    example: 'all',
    enum: ['all', 'grade', 'section', 'students'],
  })
  @IsEnum(['all', 'grade', 'section', 'students'], {
    message: 'Scope must be one of: all, grade, section, students'
  })
  @IsNotEmpty({ message: 'Scope is required' })
  scope: 'all' | 'grade' | 'section' | 'students';

  @ApiPropertyOptional({
    description: 'Target grade code for promotion',
    example: 'PRY2',
  })
  @IsOptional()
  @IsString({ message: 'Grade code must be a string' })
  gradeCode?: string;

  @ApiPropertyOptional({
    description: 'Target stream section',
    example: 'A',
  })
  @IsOptional()
  @IsString({ message: 'Stream section must be a string' })
  streamSection?: string;

  @ApiPropertyOptional({
    description: 'Specific student IDs for promotion',
    example: ['student-uuid-1', 'student-uuid-2'],
  })
  @IsOptional()
  @IsArray({ message: 'Student IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each student ID must be a valid UUID' })
  studentIds?: string[];

  @ApiProperty({
    description: 'Target grade code for promotion',
    example: 'PRY2',
  })
  @IsString({ message: 'Target grade code must be a string' })
  @IsNotEmpty({ message: 'Target grade code is required' })
  targetGradeCode: string;

  @ApiProperty({
    description: 'Academic year for the promotion',
    example: '2024-2025',
  })
  @IsString({ message: 'Academic year must be a string' })
  @IsNotEmpty({ message: 'Academic year is required' })
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Whether to include students on academic probation',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include repeaters must be a boolean' })
  includeRepeaters?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for the promotion',
    example: 'End of academic year promotion',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;
}

export class PromotionResultDto implements IPromotionResult {
  @ApiProperty({
    description: 'Number of students promoted',
    example: 85,
  })
  promotedStudents: number;

  @ApiProperty({
    description: 'List of student IDs that were promoted',
    example: ['student-uuid-1', 'student-uuid-2'],
  })
  studentIds: string[];

  @ApiPropertyOptional({
    description: 'Any errors that occurred during promotion',
    example: [{
      studentId: 'student-uuid-1',
      error: 'Student not found'
    }],
  })
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}