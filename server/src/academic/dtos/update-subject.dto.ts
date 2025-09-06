// Academia Pro - Update Subject DTO
// Data Transfer Object for updating subject information

import { IsString, IsOptional, IsEnum, IsArray, IsNumber, MinLength, MaxLength, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IUpdateSubjectRequest, TSubjectType, TGradeLevel } from '@academia-pro/types/academic';

export class UpdateSubjectDto implements IUpdateSubjectRequest {
  @ApiPropertyOptional({
    description: 'Subject code (unique identifier)',
    example: 'MATH101',
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({
    description: 'Subject name',
    example: 'Mathematics',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Subject type',
    example: 'core',
    enum: ['core', 'elective', 'practical', 'language', 'arts', 'sports'],
  })
  @IsOptional()
  @IsEnum(TSubjectType)
  type?: TSubjectType;

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

  @ApiPropertyOptional({
    description: 'Grade levels this subject is applicable to',
    example: ['grade_9', 'grade_10', 'grade_11', 'grade_12'],
    type: [String],
    enum: TGradeLevel,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TGradeLevel, { each: true })
  gradeLevels?: TGradeLevel[];

  @ApiPropertyOptional({
    description: 'Whether the subject is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}