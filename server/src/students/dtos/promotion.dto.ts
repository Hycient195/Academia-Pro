import { IsOptional, IsString, IsArray, IsEnum, IsDateString, IsNumber, MinLength, MaxLength, IsUUID, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TGradeCode } from '@academia-pro/types/student';

export class PromotionDto {
  @ApiProperty({
    description: 'Scope of promotion',
    example: 'grade',
    enum: ['all', 'grade', 'section', 'students'],
  })
  @IsEnum(['all', 'grade', 'section', 'students'], { message: 'Invalid scope' })
  scope: 'all' | 'grade' | 'section' | 'students';

  @ApiPropertyOptional({
    description: 'Grade code for scope',
    example: 'PRY3',
    enum: ['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
  })
  @IsOptional()
  @IsEnum(['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], { message: 'Invalid grade code' })
  gradeCode?: TGradeCode;

  @ApiPropertyOptional({
    description: 'Stream section for scope',
    example: 'A',
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Stream section must be a string' })
  @MinLength(1, { message: 'Stream section cannot be empty' })
  @MaxLength(20, { message: 'Stream section cannot exceed 20 characters' })
  streamSection?: string;

  @ApiPropertyOptional({
    description: 'Specific student IDs for scope',
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray({ message: 'Student IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each student ID must be a valid UUID' })
  studentIds?: string[];

  @ApiProperty({
    description: 'Target grade code for promotion',
    example: 'PRY4',
    enum: ['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'],
  })
  @IsNotEmpty({ message: 'Target grade code is required' })
  @IsEnum(['CRECHE', 'N1', 'N2', 'KG1', 'KG2', 'PRY1', 'PRY2', 'PRY3', 'PRY4', 'PRY5', 'PRY6', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'], { message: 'Invalid target grade code' })
  targetGradeCode: TGradeCode;

  @ApiProperty({
    description: 'Academic year for promotion',
    example: '2024/2025',
  })
  @IsString({ message: 'Academic year must be a string' })
  @IsNotEmpty({ message: 'Academic year is required' })
  @MinLength(4, { message: 'Academic year must be at least 4 characters' })
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Include repeaters in promotion',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include repeaters must be a boolean' })
  includeRepeaters?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for promotion',
    example: 'End of year promotion',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;
}