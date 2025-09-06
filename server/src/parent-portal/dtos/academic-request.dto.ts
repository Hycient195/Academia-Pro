import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString, IsArray, IsEnum } from 'class-validator';
import {
  IGetAcademicGradesRequest,
  IGetAttendanceRequest,
  IGetAssignmentsRequest,
  IGetTimetableRequest
} from '@academia-pro/types/parent-portal';

export class ParentAcademicRequestDto implements Partial<IGetAcademicGradesRequest & IGetAttendanceRequest & IGetAssignmentsRequest & IGetTimetableRequest> {
  @IsUUID()
  parentId: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Start date for data filtering',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for data filtering',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Academic year filter',
    example: '2024-2025',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Academic term filter',
    example: 'Term 1',
  })
  @IsOptional()
  @IsString()
  term?: string;
}

export class AcademicFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by specific subjects',
    example: ['math', 'science', 'english'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Filter by grade levels',
    example: ['Grade 1', 'Grade 2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeLevels?: string[];

  @ApiPropertyOptional({
    description: 'Data period filter',
    enum: ['current', 'all'],
    example: 'current',
  })
  @IsOptional()
  @IsEnum(['current', 'all'])
  period?: 'current' | 'all';
}

export class GradesRequestDto extends ParentAcademicRequestDto {
  @ApiPropertyOptional({
    description: 'Include detailed assessment breakdown',
    example: true,
  })
  @IsOptional()
  includeAssessments?: boolean;

  @ApiPropertyOptional({
    description: 'Include grade trends and analytics',
    example: true,
  })
  @IsOptional()
  includeTrends?: boolean;
}

export class AttendanceRequestDto extends ParentAcademicRequestDto {
  @ApiPropertyOptional({
    description: 'Include attendance patterns analysis',
    example: true,
  })
  @IsOptional()
  includePatterns?: boolean;

  @ApiPropertyOptional({
    description: 'Include attendance percentage calculations',
    example: true,
  })
  @IsOptional()
  includePercentage?: boolean;
}

export class AssignmentsRequestDto extends ParentAcademicRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by assignment status',
    enum: ['pending', 'submitted', 'graded', 'overdue'],
    example: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'submitted', 'graded', 'overdue'])
  status?: 'pending' | 'submitted' | 'graded' | 'overdue';

  @ApiPropertyOptional({
    description: 'Include assignment submissions',
    example: true,
  })
  @IsOptional()
  includeSubmissions?: boolean;
}

export class TimetableRequestDto extends ParentAcademicRequestDto {
  @ApiPropertyOptional({
    description: 'Week start date for timetable',
    example: '2024-08-26',
  })
  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @ApiPropertyOptional({
    description: 'Include room and teacher information',
    example: true,
  })
  @IsOptional()
  includeDetails?: boolean;
}