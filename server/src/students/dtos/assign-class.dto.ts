import { IsOptional, IsString, IsDateString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TGradeCode } from '@academia-pro/types/student';

export class AssignClassDto {
  @ApiProperty({
    description: 'Canonical grade code for assignment',
    example: 'PRY3',
    enum: ['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
  })
  @IsEnum(['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], { message: 'Invalid grade code' })
  gradeCode: TGradeCode;

  @ApiProperty({
    description: 'Stream or section for assignment',
    example: 'A',
    minLength: 1,
    maxLength: 20,
  })
  @IsString({ message: 'Stream section must be a string' })
  @MinLength(1, { message: 'Stream section cannot be empty' })
  @MaxLength(20, { message: 'Stream section cannot exceed 20 characters' })
  streamSection: string;

  @ApiPropertyOptional({
    description: 'Effective date for the assignment',
    example: '2024-09-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Effective date must be a valid date' })
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Reason for the assignment',
    example: 'Class promotion',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;
}