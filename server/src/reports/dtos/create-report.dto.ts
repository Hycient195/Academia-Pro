// Academia Pro - Create Report DTO
// Data Transfer Object for creating new reports

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, IsArray, IsDateString, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import {
  TReportType,
  TReportFormat,
  TReportFrequency,
  TChartType,
  TMetricType,
  TTimeRange,
  ICreateReportRequest,
  IReportParameters,
  IReportSchedule
} from '@academia-pro/common/reports';

export class CreateReportDto implements ICreateReportRequest {
  @ApiProperty({
    description: 'Report title',
    example: 'Monthly Student Performance Report',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Report description',
    example: 'Comprehensive analysis of student performance across all subjects',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Report type',
    example: 'student_performance',
    enum: TReportType,
  })
  @IsEnum(TReportType)
  type: TReportType;

  @ApiProperty({
    description: 'Report format',
    example: 'pdf',
    enum: TReportFormat,
  })
  @IsEnum(TReportFormat)
  format: TReportFormat;

  @ApiProperty({
    description: 'Report parameters',
    type: Object,
  })
  @IsObject()
  parameters: IReportParameters;

  @ApiPropertyOptional({
    description: 'Report schedule',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  schedule?: IReportSchedule;

  @ApiPropertyOptional({
    description: 'Whether report is public',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;
}

// Nested DTOs for complex objects
export class ReportParametersDto implements IReportParameters {
  @ApiProperty({
    description: 'Time range for the report',
    example: 'this_month',
    enum: TTimeRange,
  })
  @IsEnum(TTimeRange)
  timeRange: TTimeRange;

  @ApiPropertyOptional({
    description: 'Custom start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Custom end date',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'Report filters',
    type: Object,
  })
  @IsObject()
  filters: {
    schoolId: string;
    gradeIds?: string[];
    classIds?: string[];
    subjectIds?: string[];
    studentIds?: string[];
    staffIds?: string[];
    departmentIds?: string[];
    category?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
    search?: string;
  };

  @ApiPropertyOptional({
    description: 'Group by fields',
    example: ['grade', 'subject'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiProperty({
    description: 'Report metrics',
    type: [Object],
  })
  @IsArray()
  metrics: Array<{
    name: string;
    type: TMetricType;
    field: string;
    label: string;
    format?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }>;

  @ApiPropertyOptional({
    description: 'Chart type for visualizations',
    example: 'bar_chart',
    enum: TChartType,
  })
  @IsOptional()
  @IsEnum(TChartType)
  chartType?: TChartType;

  @ApiProperty({
    description: 'Include charts in report',
    example: true,
  })
  @IsBoolean()
  includeCharts: boolean;

  @ApiProperty({
    description: 'Include tables in report',
    example: true,
  })
  @IsBoolean()
  includeTables: boolean;
}

export class ReportScheduleDto implements IReportSchedule {
  @ApiProperty({
    description: 'Schedule frequency',
    example: 'monthly',
    enum: TReportFrequency,
  })
  @IsEnum(TReportFrequency)
  frequency: TReportFrequency;

  @ApiPropertyOptional({
    description: 'Day of week (0-6) for weekly reports',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({
    description: 'Day of month (1-31) for monthly reports',
    example: 1,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({
    description: 'Time for report generation (HH:mm format)',
    example: '09:00',
  })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Email recipients for scheduled reports',
    example: ['admin@school.com', 'principal@school.com'],
  })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({
    description: 'Whether schedule is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class ReportFiltersDto {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Grade IDs to filter by',
    example: ['grade-1', 'grade-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeIds?: string[];

  @ApiPropertyOptional({
    description: 'Class IDs to filter by',
    example: ['class-1', 'class-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classIds?: string[];

  @ApiPropertyOptional({
    description: 'Subject IDs to filter by',
    example: ['math', 'science'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjectIds?: string[];

  @ApiPropertyOptional({
    description: 'Student IDs to filter by',
    example: ['student-1', 'student-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  @ApiPropertyOptional({
    description: 'Staff IDs to filter by',
    example: ['staff-1', 'staff-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  staffIds?: string[];

  @ApiPropertyOptional({
    description: 'Department IDs to filter by',
    example: ['academic', 'administrative'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @ApiPropertyOptional({
    description: 'Category filter',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Status filter',
    example: 'completed',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Minimum value filter',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum value filter',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'mathematics',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ReportMetricDto {
  @ApiProperty({
    description: 'Metric name',
    example: 'average_score',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Metric type',
    example: 'average',
    enum: TMetricType,
  })
  @IsEnum(TMetricType)
  type: TMetricType;

  @ApiProperty({
    description: 'Field name',
    example: 'score',
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Display label',
    example: 'Average Score',
  })
  @IsString()
  label: string;

  @ApiPropertyOptional({
    description: 'Display format',
    example: 'percentage',
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({
    description: 'Aggregation method',
    example: 'avg',
    enum: ['sum', 'avg', 'count', 'min', 'max'],
  })
  @IsOptional()
  @IsEnum(['sum', 'avg', 'count', 'min', 'max'])
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}