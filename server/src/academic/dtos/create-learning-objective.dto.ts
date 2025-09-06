// Academia Pro - Create Learning Objective DTO
// Data Transfer Object for creating new learning objectives

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateLearningObjectiveRequest, TLearningObjectiveType, TGradeLevel } from '@academia-pro/types/academic';

export class CreateLearningObjectiveDto implements ICreateLearningObjectiveRequest {
  @ApiProperty({
    description: 'Learning objective code',
    example: 'MATH-ALG-001',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Learning objective description',
    example: 'Solve linear equations with one variable',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Type of learning objective',
    example: 'skills',
    enum: ['knowledge', 'skills', 'attitudes', 'values'],
  })
  @IsEnum(TLearningObjectiveType)
  type: TLearningObjectiveType;

  @ApiProperty({
    description: 'Grade level for this objective',
    example: 'grade_10',
    enum: TGradeLevel,
  })
  @IsEnum(TGradeLevel)
  gradeLevel: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Subject ID this objective belongs to',
    example: 'subject-uuid-789',
  })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiProperty({
    description: 'Bloom taxonomy level (1-6)',
    example: 3,
    minimum: 1,
    maximum: 6,
  })
  @IsInt()
  @Min(1)
  @Max(6)
  bloomLevel: number;
}