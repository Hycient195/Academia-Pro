// Academia Pro - Create Subject DTO
// Data Transfer Object for creating new subjects

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateSubjectRequest, TSubjectType, TGradeLevel } from '@academia-pro/types/academic';

export class CreateSubjectDto implements ICreateSubjectRequest {
  @ApiProperty({
    description: 'Subject code (unique identifier)',
    example: 'MATH101',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Subject type',
    example: 'core',
    enum: ['core', 'elective', 'practical', 'language', 'arts', 'sports'],
  })
  @IsEnum(TSubjectType)
  type: TSubjectType;

  @ApiPropertyOptional({
    description: 'Subject description',
    example: 'Basic mathematics covering algebra, geometry, and statistics',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Credit hours for the subject',
    example: 3.0,
    minimum: 0.5,
    maximum: 10.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.5)
  @Max(10.0)
  credits?: number;

  @ApiPropertyOptional({
    description: 'Prerequisite subject codes',
    example: ['MATH001', 'ALG001'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({
    description: 'Grade levels this subject is applicable to',
    example: ['grade_9', 'grade_10', 'grade_11', 'grade_12'],
    type: [String],
    enum: TGradeLevel,
  })
  @IsArray()
  @IsEnum(TGradeLevel, { each: true })
  gradeLevels: TGradeLevel[];

  @ApiProperty({
    description: 'School ID this subject belongs to',
    example: 'school-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}