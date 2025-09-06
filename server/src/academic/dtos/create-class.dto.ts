// Academia Pro - Create Class DTO
// Data Transfer Object for creating new classes

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateClassRequest, TGradeLevel } from '@academia-pro/types/academic';

export class CreateClassDto implements ICreateClassRequest {
  @ApiProperty({
    description: 'Class name',
    example: 'Grade 10 - Section A',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Grade level for this class',
    example: 'grade_10',
    enum: TGradeLevel,
  })
  @IsEnum(TGradeLevel)
  gradeLevel: TGradeLevel;

  @ApiProperty({
    description: 'Class section',
    example: 'A',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  section: string;

  @ApiProperty({
    description: 'Maximum capacity of the class',
    example: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    description: 'Class teacher ID',
    example: 'teacher-uuid-456',
  })
  @IsOptional()
  @IsString()
  classTeacherId?: string;

  @ApiProperty({
    description: 'Academic year for this class',
    example: '2024-2025',
    minLength: 9,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;

  @ApiProperty({
    description: 'School ID this class belongs to',
    example: 'school-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}