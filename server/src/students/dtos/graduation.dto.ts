// Academia Pro - Graduation DTOs
// Data Transfer Objects for student graduation operations

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface IGraduationRequest {
  schoolId: string;
  gradeCode?: string;
  studentIds?: string[];
  graduationYear: number;
  clearanceStatus?: 'cleared' | 'pending';
}

interface IGraduationResult {
  graduatedStudents: number;
  studentIds: string[];
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}

export class GraduationRequestDto implements IGraduationRequest {
  @ApiProperty({
    description: 'School ID for the graduation operation',
    example: 'school-uuid-123',
  })
  @IsString({ message: 'School ID must be a string' })
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Grade code to graduate from (defaults to SSS3)',
    example: 'SSS3',
  })
  @IsOptional()
  @IsString({ message: 'Grade code must be a string' })
  gradeCode?: string;

  @ApiPropertyOptional({
    description: 'Specific student IDs to graduate (if not provided, graduates eligible students)',
    example: ['student-uuid-1', 'student-uuid-2'],
  })
  @IsOptional()
  @IsArray({ message: 'Student IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each student ID must be a valid UUID' })
  studentIds?: string[];

  @ApiProperty({
    description: 'Graduation year',
    example: 2024,
  })
  @IsNumber({}, { message: 'Graduation year must be a number' })
  @IsNotEmpty({ message: 'Graduation year is required' })
  graduationYear: number;

  @ApiPropertyOptional({
    description: 'Clearance status requirement',
    example: 'cleared',
    enum: ['cleared', 'pending'],
  })
  @IsOptional()
  @IsEnum(['cleared', 'pending'], {
    message: 'Clearance status must be either cleared or pending'
  })
  clearanceStatus?: 'cleared' | 'pending';
}

export class GraduationResultDto implements IGraduationResult {
  @ApiProperty({
    description: 'Number of students graduated',
    example: 45,
  })
  graduatedStudents: number;

  @ApiProperty({
    description: 'List of student IDs that were graduated',
    example: ['student-uuid-1', 'student-uuid-2'],
  })
  studentIds: string[];

  @ApiPropertyOptional({
    description: 'Any errors that occurred during graduation',
    example: [{
      studentId: 'student-uuid-1',
      error: 'Clearance not complete'
    }],
  })
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}