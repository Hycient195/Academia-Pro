// Academia Pro - Subject Response DTO
// Safe response format for subject data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Subject } from '../subject.entity';
import { TSubjectType, TGradeLevel, ISubjectResponse } from '../../../../common/src/types/academic/academic.types';

export class SubjectResponseDto implements ISubjectResponse {
  @ApiProperty({
    description: 'Unique subject identifier',
    example: 'subject-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Subject code',
    example: 'MATH101',
  })
  code: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  name: string;

  @ApiProperty({
    description: 'Subject type',
    example: 'core',
    enum: ['core', 'elective', 'practical', 'language', 'arts', 'sports'],
  })
  type: TSubjectType;

  @ApiPropertyOptional({
    description: 'Subject description',
    example: 'Advanced mathematics covering algebra and geometry',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Credit hours',
    example: 3.0,
  })
  credits?: number;

  @ApiProperty({
    description: 'Grade levels this subject is offered in',
    type: [String],
    example: ['grade_10', 'grade_11', 'grade_12'],
  })
  gradeLevels: TGradeLevel[];

  @ApiProperty({
    description: 'Whether the subject is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'School ID this subject belongs to',
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
    description: 'Number of curricula using this subject',
    example: 3,
  })
  curriculumCount: number;

  @ApiProperty({
    description: 'Number of classes offering this subject',
    example: 12,
  })
  classCount: number;

  constructor(partial: Partial<SubjectResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(subject: Subject): SubjectResponseDto {
    const dto = new SubjectResponseDto({});
    dto.id = subject.id;
    dto.code = subject.code;
    dto.name = subject.name;
    dto.type = subject.type;
    dto.description = subject.description;
    dto.credits = subject.credits;
    dto.gradeLevels = subject.gradeLevels;
    dto.isActive = subject.isActive;
    dto.schoolId = subject.schoolId;
    dto.createdAt = subject.createdAt;
    dto.updatedAt = subject.updatedAt;
    // Computed fields would be calculated separately or set by service
    dto.curriculumCount = 0; // To be set by service if needed
    dto.classCount = 0; // To be set by service if needed
    return dto;
  }
}