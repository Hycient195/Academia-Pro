// Academia Pro - Transfer Student DTO
// Data Transfer Object for student grade/section transfers

import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ITransferStudentRequest } from "@academia-pro/types/school-admin"

export class TransferStudentDto implements ITransferStudentRequest {
  @ApiPropertyOptional({
    description: 'ID of the student to transfer',
    example: 'student-123',
  })
  @IsOptional()
  @IsString({ message: 'Student ID must be a string' })
  studentId?: string;

  @ApiPropertyOptional({
    description: 'New grade code for the student',
    example: 'Grade 11',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'New grade code must be a string' })
  @MaxLength(20, { message: 'New grade code cannot exceed 20 characters' })
  newGradeCode?: string;

  @ApiPropertyOptional({
    description: 'New stream section for the student',
    example: 'B',
    maxLength: 10,
  })
  @IsOptional()
  @IsString({ message: 'New stream section must be a string' })
  @MaxLength(10, { message: 'New stream section cannot exceed 10 characters' })
  newStreamSection?: string;

  @ApiPropertyOptional({
    description: 'Reason for the transfer',
    example: 'Academic performance improvement',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Effective date for the transfer',
    example: '2024-09-01',
    format: 'date',
  })
  @IsOptional()
  @IsString({ message: 'Effective date must be a string' })
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Type of transfer',
    example: 'internal',
    enum: ['internal', 'external'],
  })
  @IsOptional()
  @IsEnum(['internal', 'external'], { message: 'Type must be either internal or external' })
  type?: 'internal' | 'external';

  @ApiPropertyOptional({
    description: 'Target school ID for external transfer',
    example: 'school-456',
  })
  @IsOptional()
  @IsString({ message: 'Target school ID must be a string' })
  targetSchoolId?: string;
}