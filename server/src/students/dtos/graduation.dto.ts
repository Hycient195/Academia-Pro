// Academia Pro - Graduation DTOs
// Data Transfer Objects for student graduation operations

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface IGraduationRequest {
  studentIds?: string[];
  graduationYear: number;
  clearanceStatus: 'cleared' | 'pending';
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
  @ApiPropertyOptional({
    description: 'Specific student IDs to graduate (if not provided, graduates eligible SSS3 students)',
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

  @ApiProperty({
    description: 'Clearance status requirement',
    example: 'cleared',
    enum: ['cleared', 'pending'],
  })
  @IsEnum(['cleared', 'pending'], {
    message: 'Clearance status must be either cleared or pending'
  })
  @IsNotEmpty({ message: 'Clearance status is required' })
  clearanceStatus: 'cleared' | 'pending';
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