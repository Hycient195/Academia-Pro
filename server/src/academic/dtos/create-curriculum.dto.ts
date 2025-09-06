// Academia Pro - Create Curriculum DTO
// Data Transfer Object for creating new curricula

import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateCurriculumRequest, TGradeLevel } from '@academia-pro/types/academic';

export class CreateCurriculumDto implements ICreateCurriculumRequest {
  @ApiProperty({
    description: 'Curriculum name',
    example: 'Mathematics Curriculum - Grade 10',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Curriculum description',
    example: 'Comprehensive mathematics curriculum covering algebra, geometry, and statistics',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Grade level for this curriculum',
    example: 'grade_10',
    enum: TGradeLevel,
  })
  @IsEnum(TGradeLevel)
  gradeLevel: TGradeLevel;

  @ApiProperty({
    description: 'Academic year for this curriculum',
    example: '2024-2025',
    minLength: 9,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;

  @ApiProperty({
    description: 'School ID this curriculum belongs to',
    example: 'school-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}