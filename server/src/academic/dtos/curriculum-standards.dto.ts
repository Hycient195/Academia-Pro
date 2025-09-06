import { TGradeLevel } from '@academia-pro/types/academic';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, IsNumber, ValidateNested, Min, Max } from 'class-validator';

export enum StandardType {
  NATIONAL = 'national',
  STATE = 'state',
  DISTRICT = 'district',
  SCHOOL = 'school',
  INTERNATIONAL = 'international',
}

export enum StandardLevel {
  DOMAIN = 'domain',
  CLUSTER = 'cluster',
  STANDARD = 'standard',
  SUB_STANDARD = 'sub_standard',
}

export class CreateCurriculumStandardDto {
  @ApiProperty({
    description: 'Curriculum ID this standard belongs to',
    example: 'curriculum-uuid-123',
  })
  @IsString()
  curriculumId: string;

  @ApiProperty({
    description: 'Subject ID this standard relates to',
    example: 'subject-uuid-456',
  })
  @IsString()
  subjectId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;

  @ApiProperty({
    description: 'Standard code (unique identifier)',
    example: 'MATH.G.1.1',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Standard title',
    example: 'Understand place value',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the standard',
    example: 'Students will understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of standard',
    enum: StandardType,
    example: StandardType.NATIONAL,
  })
  @IsEnum(StandardType)
  standardType: StandardType;

  @ApiProperty({
    description: 'Level in the standards hierarchy',
    enum: StandardLevel,
    example: StandardLevel.STANDARD,
  })
  @IsEnum(StandardLevel)
  level: StandardLevel;

  @ApiProperty({
    description: 'Grade level this standard applies to',
    enum: TGradeLevel,
    example: TGradeLevel.GRADE_3,
  })
  @IsEnum(TGradeLevel)
  gradeLevel: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Parent standard ID (for hierarchical standards)',
    example: 'parent-standard-uuid',
  })
  @IsOptional()
  @IsString()
  parentStandardId?: string;

  @ApiPropertyOptional({
    description: 'Sequence order within parent standard',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sequenceOrder?: number;

  @ApiPropertyOptional({
    description: 'Bloom\'s taxonomy level (1-6)',
    example: 2,
    minimum: 1,
    maximum: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  bloomLevel?: number;

  @ApiPropertyOptional({
    description: 'Learning objectives for this standard',
    example: ['Identify place values', 'Compare numbers'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Assessment criteria',
    example: ['Can identify hundreds place', 'Can identify tens place'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assessmentCriteria?: string[];

  @ApiPropertyOptional({
    description: 'Prerequisites (other standards or skills required)',
    example: ['MATH.G.1.1', 'Basic counting skills'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiPropertyOptional({
    description: 'Related standards',
    example: ['MATH.G.1.2', 'MATH.G.1.3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedStandards?: string[];

  @ApiPropertyOptional({
    description: 'Estimated hours to teach this standard',
    example: 8,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Resources required for teaching this standard',
    example: ['Textbook pages 45-50', 'Manipulative blocks'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @ApiPropertyOptional({
    description: 'Keywords for searching and categorization',
    example: ['place value', 'hundreds', 'tens', 'ones'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'Effective start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveStartDate?: Date;

  @ApiPropertyOptional({
    description: 'Effective end date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether this is a core standard',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCoreStandard?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { difficulty: 'medium', priority: 'high' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCurriculumStandardDto {
  @ApiPropertyOptional({
    description: 'Standard title',
    example: 'Understand place value (Updated)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'Updated description of the standard',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Learning objectives',
    example: ['Updated learning objective'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Assessment criteria',
    example: ['Updated assessment criterion'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assessmentCriteria?: string[];

  @ApiPropertyOptional({
    description: 'Prerequisites',
    example: ['Updated prerequisite'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiPropertyOptional({
    description: 'Estimated hours',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Resources required',
    example: ['Updated resource'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @ApiPropertyOptional({
    description: 'Keywords',
    example: ['updated keyword'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'Effective end date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether this is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { difficulty: 'hard', priority: 'critical' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CurriculumStandardFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by curriculum ID',
    example: 'curriculum-uuid-123',
  })
  @IsOptional()
  @IsString()
  curriculumId?: string;

  @ApiPropertyOptional({
    description: 'Filter by subject ID',
    example: 'subject-uuid-456',
  })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by grade level',
    enum: TGradeLevel,
    example: TGradeLevel.GRADE_3,
  })
  @IsOptional()
  @IsEnum(TGradeLevel)
  gradeLevel?: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Filter by standard type',
    enum: StandardType,
    example: StandardType.NATIONAL,
  })
  @IsOptional()
  @IsEnum(StandardType)
  standardType?: StandardType;

  @ApiPropertyOptional({
    description: 'Filter by standard level',
    enum: StandardLevel,
    example: StandardLevel.STANDARD,
  })
  @IsOptional()
  @IsEnum(StandardLevel)
  level?: StandardLevel;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search by code or title',
    example: 'MATH.G.1',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'School ID (required)',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;
}

export class CurriculumStandardResponseDto {
  @ApiProperty({
    description: 'Standard ID',
    example: 'standard-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Standard code',
    example: 'MATH.G.1.1',
  })
  code: string;

  @ApiProperty({
    description: 'Standard title',
    example: 'Understand place value',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Standard description',
    example: 'Students will understand place value concepts',
  })
  description?: string;

  @ApiProperty({
    description: 'Standard type',
    enum: StandardType,
    example: StandardType.NATIONAL,
  })
  standardType: StandardType;

  @ApiProperty({
    description: 'Standard level',
    enum: StandardLevel,
    example: StandardLevel.STANDARD,
  })
  level: StandardLevel;

  @ApiProperty({
    description: 'Grade level',
    enum: TGradeLevel,
    example: TGradeLevel.GRADE_3,
  })
  gradeLevel: TGradeLevel;

  @ApiPropertyOptional({
    description: 'Learning objectives',
    example: ['Identify place values'],
  })
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Assessment criteria',
    example: ['Can identify hundreds place'],
  })
  assessmentCriteria?: string[];

  @ApiPropertyOptional({
    description: 'Prerequisites',
    example: ['Basic counting skills'],
  })
  prerequisites?: string[];

  @ApiPropertyOptional({
    description: 'Estimated hours',
    example: 8,
  })
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Resources required',
    example: ['Textbook pages 45-50'],
  })
  resources?: string[];

  @ApiProperty({
    description: 'Whether this is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;
}

export class CurriculumStandardsListResponseDto {
  @ApiProperty({
    description: 'List of curriculum standards',
    type: [CurriculumStandardResponseDto],
  })
  standards: CurriculumStandardResponseDto[];

  @ApiProperty({
    description: 'Total number of standards',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Summary statistics',
    example: {
      totalActive: 145,
      byType: { national: 100, state: 30, school: 15 },
      byGrade: { grade_1: 20, grade_2: 25, grade_3: 30 },
    },
  })
  summary?: {
    totalActive: number;
    byType: Record<StandardType, number>;
    byGrade: Record<TGradeLevel, number>;
  };
}