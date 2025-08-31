// Academia Pro - Curriculum Response DTO
// Safe response format for curriculum data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Curriculum } from '../curriculum.entity';
import { TGradeLevel, TAcademicYearStatus, ICurriculumResponse } from '../../../../common/src/types/academic/academic.types';

export class CurriculumResponseDto implements ICurriculumResponse {
  @ApiProperty({
    description: 'Unique curriculum identifier',
    example: 'curriculum-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Curriculum name',
    example: 'Mathematics Curriculum - Grade 10',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Curriculum description',
    example: 'Comprehensive mathematics curriculum for grade 10 students',
  })
  description?: string;

  @ApiProperty({
    description: 'Grade level this curriculum is for',
    example: 'grade_10',
  })
  gradeLevel: TGradeLevel;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Curriculum status',
    example: 'active',
    enum: ['planning', 'active', 'completed', 'archived'],
  })
  status: TAcademicYearStatus;

  @ApiProperty({
    description: 'School ID this curriculum belongs to',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;

  // Computed fields
  @ApiProperty({
    description: 'Number of subjects in this curriculum',
    example: 8,
  })
  subjectCount: number;

  @ApiProperty({
    description: 'Number of learning objectives in this curriculum',
    example: 24,
  })
  objectiveCount: number;

  constructor(partial: Partial<CurriculumResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(curriculum: Curriculum): CurriculumResponseDto {
    const dto = new CurriculumResponseDto({});
    dto.id = curriculum.id;
    dto.name = curriculum.name;
    dto.description = curriculum.description;
    dto.gradeLevel = curriculum.gradeLevel;
    dto.academicYear = curriculum.academicYear;
    dto.status = curriculum.status;
    dto.schoolId = curriculum.schoolId;
    dto.createdAt = curriculum.createdAt;
    dto.updatedAt = curriculum.updatedAt;
    // Computed fields would be calculated separately or set by service
    dto.subjectCount = curriculum.subjects?.length || 0;
    dto.objectiveCount = curriculum.learningObjectives?.length || 0;
    return dto;
  }
}