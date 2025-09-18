import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkloadStatus {
  UNDER_LOADED = 'under_loaded',
  OPTIMAL = 'optimal',
  OVER_LOADED = 'over_loaded',
  CRITICAL = 'critical',
}

export class SubjectAssignmentDto {
  @ApiProperty({
    description: 'Subject ID',
    example: 'subject-uuid-123',
  })
  @IsString()
  subjectId: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  @IsString()
  subjectName: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-456',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'Class name',
    example: 'Grade 10 - Section A',
  })
  @IsString()
  className: string;

  @ApiProperty({
    description: 'Weekly hours for this subject',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weeklyHours: number;

  @ApiPropertyOptional({
    description: 'Number of students in the class',
    example: 30,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studentCount?: number;

  @ApiPropertyOptional({
    description: 'Subject difficulty level (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;
}

export class CreateTeacherWorkloadDto {
  @ApiProperty({
    description: 'Teacher ID',
    example: 'teacher-uuid-123',
  })
  @IsString()
  teacherId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-456',
  })
  @IsString()
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  @IsString()
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Contracted hours per week',
    example: 40,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contractedHours?: number;

  @ApiPropertyOptional({
    description: 'Subject assignments',
    type: [SubjectAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectAssignmentDto)
  subjectAssignments?: SubjectAssignmentDto[];

  @ApiPropertyOptional({
    description: 'Administrative duties hours',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  administrativeHours?: number;

  @ApiPropertyOptional({
    description: 'Extracurricular activities hours',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extracurricularHours?: number;

  @ApiPropertyOptional({
    description: 'Professional development hours',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalDevelopmentHours?: number;
}

export class UpdateTeacherWorkloadDto {
  @ApiPropertyOptional({
    description: 'Contracted hours per week',
    example: 35,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contractedHours?: number;

  @ApiPropertyOptional({
    description: 'Teaching hours per week',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  teachingHours?: number;

  @ApiPropertyOptional({
    description: 'Preparation hours per week',
    example: 8,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationHours?: number;

  @ApiPropertyOptional({
    description: 'Assessment hours per week',
    example: 4,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  assessmentHours?: number;

  @ApiPropertyOptional({
    description: 'Administrative duties hours',
    example: 6,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  administrativeHours?: number;

  @ApiPropertyOptional({
    description: 'Extracurricular activities hours',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extracurricularHours?: number;

  @ApiPropertyOptional({
    description: 'Professional development hours',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalDevelopmentHours?: number;

  @ApiPropertyOptional({
    description: 'Leave hours taken',
    example: 8,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leaveHours?: number;

  @ApiPropertyOptional({
    description: 'Subject assignments',
    type: [SubjectAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectAssignmentDto)
  subjectAssignments?: SubjectAssignmentDto[];
}

export class TeacherWorkloadFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by teacher ID',
    example: 'teacher-uuid-123',
  })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2024-2025',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Filter by workload status',
    enum: WorkloadStatus,
    example: WorkloadStatus.OVER_LOADED,
  })
  @IsOptional()
  @IsEnum(WorkloadStatus)
  workloadStatus?: WorkloadStatus;

  @ApiPropertyOptional({
    description: 'Filter by utilization rate range (min)',
    example: 70,
    minimum: 0,
    maximum: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  minUtilizationRate?: number;

  @ApiPropertyOptional({
    description: 'Filter by utilization rate range (max)',
    example: 120,
    minimum: 0,
    maximum: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  maxUtilizationRate?: number;

  @ApiProperty({
    description: 'School ID (required)',
    example: 'school-uuid-456',
  })
  @IsString()
  schoolId: string;
}

export class TeacherWorkloadResponseDto {
  @ApiProperty({
    description: 'Workload ID',
    example: 'workload-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Teacher ID',
    example: 'teacher-uuid-456',
  })
  teacherId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-789',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Contracted hours per week',
    example: 40,
  })
  contractedHours: number;

  @ApiProperty({
    description: 'Total teaching hours per week',
    example: 25,
  })
  totalTeachingHours: number;

  @ApiProperty({
    description: 'Total preparation hours per week',
    example: 8,
  })
  totalPreparationHours: number;

  @ApiProperty({
    description: 'Total assessment hours per week',
    example: 4,
  })
  totalAssessmentHours: number;

  @ApiProperty({
    description: 'Total administrative hours per week',
    example: 5,
  })
  totalAdministrativeHours: number;

  @ApiProperty({
    description: 'Total extracurricular hours per week',
    example: 3,
  })
  totalExtracurricularHours: number;

  @ApiProperty({
    description: 'Total professional development hours per week',
    example: 2,
  })
  totalProfessionalDevelopmentHours: number;

  @ApiProperty({
    description: 'Total leave hours taken',
    example: 8,
  })
  totalLeaveHours: number;

  @ApiProperty({
    description: 'Total workload hours',
    example: 47,
  })
  totalWorkloadHours: number;

  @ApiProperty({
    description: 'Utilization rate (percentage)',
    example: 117.5,
  })
  utilizationRate: number;

  @ApiProperty({
    description: 'Workload status',
    enum: WorkloadStatus,
    example: WorkloadStatus.OVER_LOADED,
  })
  workloadStatus: WorkloadStatus;

  @ApiProperty({
    description: 'Whether teacher is over loaded',
    example: true,
  })
  isOverloaded: boolean;

  @ApiProperty({
    description: 'Whether teacher is under loaded',
    example: false,
  })
  isUnderloaded: boolean;

  @ApiPropertyOptional({
    description: 'Subject assignments',
    type: [SubjectAssignmentDto],
  })
  subjectAssignments?: SubjectAssignmentDto[];

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-09-01T00:00:00Z',
  })
  updatedAt: Date;
}

export class TeacherWorkloadsListResponseDto {
  @ApiProperty({
    description: 'List of teacher workloads',
    type: [TeacherWorkloadResponseDto],
  })
  workloads: TeacherWorkloadResponseDto[];

  @ApiProperty({
    description: 'Total number of workloads',
    example: 25,
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
      totalStaff: 25,
      optimalWorkload: 15,
      overLoaded: 5,
      underLoaded: 3,
      criticalLoad: 2,
      averageUtilization: 95.5,
      byStatus: { optimal: 15, over_loaded: 5, under_loaded: 3, critical: 2 },
    },
  })
  summary?: {
    totalStaff: number;
    optimalWorkload: number;
    overLoaded: number;
    underLoaded: number;
    criticalLoad: number;
    averageUtilization: number;
    byStatus: Record<WorkloadStatus, number>;
  };
}

export class WorkloadAnalyticsResponseDto {
  @ApiProperty({
    description: 'Total number of teachers',
    example: 25,
  })
  totalStaff: number;

  @ApiProperty({
    description: 'Teachers with optimal workload',
    example: 15,
  })
  optimalWorkload: number;

  @ApiProperty({
    description: 'Teachers who are over loaded',
    example: 5,
  })
  overLoaded: number;

  @ApiProperty({
    description: 'Teachers who are under loaded',
    example: 3,
  })
  underLoaded: number;

  @ApiProperty({
    description: 'Teachers with critical workload',
    example: 2,
  })
  criticalLoad: number;

  @ApiProperty({
    description: 'Average utilization rate',
    example: 95.5,
  })
  averageUtilization: number;

  @ApiProperty({
    description: 'Workload distribution by status',
    example: { optimal: 15, over_loaded: 5, under_loaded: 3, critical: 2 },
  })
  distributionByStatus: Record<WorkloadStatus, number>;

  @ApiProperty({
    description: 'Utilization rate ranges',
    example: {
      under60: 3,
      between60And80: 8,
      between80And100: 10,
      between100And120: 3,
      over120: 1,
    },
  })
  utilizationRanges: {
    under60: number;
    between60And80: number;
    between80And100: number;
    between100And120: number;
    over120: number;
  };

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-456',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Generated timestamp',
    example: '2024-09-01T10:00:00Z',
  })
  generatedAt: Date;
}

export class TeacherAssignmentOptimizationDto {
  @ApiProperty({
    description: 'List of optimized assignments',
    example: [
      {
        classSubjectId: 'class-subject-uuid-123',
        className: 'Grade 10 - Section A',
        subjectName: 'Mathematics',
        currentTeacher: 'teacher-uuid-456',
        recommendedTeacher: 'teacher-uuid-789',
        teacherName: 'John Smith',
        currentWorkload: 85,
        recommendedWorkload: 95,
        reason: 'Teacher has moderate capacity for additional subjects',
      },
    ],
  })
  assignments: Array<{
    classSubjectId: string;
    className: string;
    subjectName: string;
    currentTeacher: string;
    recommendedTeacher: string;
    teacherName: string;
    currentWorkload: number;
    recommendedWorkload: number;
    reason: string;
  }>;

  @ApiProperty({
    description: 'Workload analysis',
    type: WorkloadAnalyticsResponseDto,
  })
  workloadAnalysis: WorkloadAnalyticsResponseDto;

  @ApiProperty({
    description: 'Optimization suggestions',
    example: [
      '5 teachers are overloaded. Consider redistributing subjects.',
      '3 teachers have capacity for additional subjects.',
      'Overall teacher utilization is optimal.',
    ],
  })
  optimizationSuggestions: string[];

  @ApiProperty({
    description: 'Expected improvement in utilization',
    example: 5.2,
  })
  expectedImprovement: number;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Generated timestamp',
    example: '2024-09-01T10:00:00Z',
  })
  generatedAt: Date;
}