// Academia Pro - Learning Objective Response DTO
// Safe response format for learning objective data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LearningObjective } from '../learning-objective.entity';
import { TLearningObjectiveType, TGradeLevel } from '../../../../common/src/types/academic/academic.types';

export class LearningObjectiveResponseDto {
  @ApiProperty({
    description: 'Unique learning objective identifier',
    example: 'objective-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Objective code',
    example: 'MATH-G10-ALG-001',
  })
  code: string;

  @ApiProperty({
    description: 'Objective description',
    example: 'Solve linear equations with one variable',
  })
  description: string;

  @ApiProperty({
    description: 'Objective type',
    example: 'skills',
    enum: ['knowledge', 'skills', 'attitudes', 'values'],
  })
  type: TLearningObjectiveType;

  @ApiProperty({
    description: 'Grade level this objective is for',
    example: 'grade_10',
  })
  gradeLevel: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Subject ID this objective belongs to',
    example: 'subject-uuid-456',
  })
  subjectId?: string;

  @ApiProperty({
    description: 'Bloom taxonomy level (1-6)',
    example: 3,
    minimum: 1,
    maximum: 6,
  })
  bloomLevel: number;

  @ApiProperty({
    description: 'Whether the objective is currently active',
    example: true,
  })
  isActive: boolean;

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
  @ApiPropertyOptional({
    description: 'Subject information',
    type: Object,
  })
  subject?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiProperty({
    description: 'Bloom taxonomy level name',
    example: 'Application',
  })
  bloomLevelName: string;

  constructor(partial: Partial<LearningObjectiveResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(objective: LearningObjective): LearningObjectiveResponseDto {
    const dto = new LearningObjectiveResponseDto({});
    dto.id = objective.id;
    dto.code = objective.code;
    dto.description = objective.description;
    dto.type = objective.type;
    dto.gradeLevel = objective.gradeLevel;
    dto.subjectId = objective.subjectId;
    dto.bloomLevel = objective.bloomLevel;
    dto.isActive = objective.isActive;
    dto.createdAt = objective.createdAt;
    dto.updatedAt = objective.updatedAt;

    // Computed fields
    dto.bloomLevelName = LearningObjectiveResponseDto.getBloomLevelName(objective.bloomLevel);
    // Subject info would be populated by service if needed
    dto.subject = undefined; // To be set by service

    return dto;
  }

  private static getBloomLevelName(level: number): string {
    const bloomLevels = {
      1: 'Remembering',
      2: 'Understanding',
      3: 'Applying',
      4: 'Analyzing',
      5: 'Evaluating',
      6: 'Creating',
    };
    return bloomLevels[level as keyof typeof bloomLevels] || 'Unknown';
  }
}