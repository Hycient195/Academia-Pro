// Academia Pro - Transfer Student DTO
// Data Transfer Object for student grade/section transfers

import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ITransferStudentRequest } from '../../../../common/src/types/student/student.types';

export class TransferStudentDto implements ITransferStudentRequest {
  @ApiProperty({
    description: 'New grade for the student',
    example: 'Grade 11',
    minLength: 1,
    maxLength: 20,
  })
  @IsString({ message: 'New grade must be a string' })
  @IsNotEmpty({ message: 'New grade is required' })
  @MaxLength(20, { message: 'New grade cannot exceed 20 characters' })
  newGrade: string;

  @ApiProperty({
    description: 'New section for the student',
    example: 'B',
    minLength: 1,
    maxLength: 10,
  })
  @IsString({ message: 'New section must be a string' })
  @IsNotEmpty({ message: 'New section is required' })
  @MaxLength(10, { message: 'New section cannot exceed 10 characters' })
  newSection: string;

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
}