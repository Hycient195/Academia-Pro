// Academia Pro - Report Response DTO
// Safe response format for report data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Report } from '../report.entity';
import { TReportType, TReportFormat, TReportFrequency, IReportResponse, IReportParameters, IReportListResponse, IReportGenerationResponse, IReportsStatisticsResponse } from '@academia-pro/common/reports';

export class ReportResponseDto implements IReportResponse {
  @ApiProperty({
    description: 'Unique report identifier',
    example: 'report-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Report title',
    example: 'Monthly Student Performance Report',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Report description',
    example: 'Comprehensive analysis of student performance across all subjects',
  })
  description?: string;

  @ApiProperty({
    description: 'Report type',
    example: 'student_performance',
    enum: TReportType,
  })
  type: TReportType;

  @ApiProperty({
    description: 'Report format',
    example: 'pdf',
    enum: TReportFormat,
  })
  format: TReportFormat;

  @ApiProperty({
    description: 'Report frequency',
    example: 'monthly',
    enum: TReportFrequency,
  })
  frequency: TReportFrequency;

  @ApiProperty({
    description: 'Report parameters',
    type: Object,
  })
  parameters: IReportParameters;

  @ApiProperty({
    description: 'Whether report is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether report is public',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T00:00:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last generation timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  lastGeneratedAt?: Date;

  @ApiPropertyOptional({
    description: 'File URL for generated report',
    example: 'https://storage.example.com/reports/report-123.pdf',
  })
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 2048576,
  })
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'Expiration timestamp',
    example: '2024-09-01T00:00:00Z',
  })
  expiresAt?: Date;

  // Computed fields
  @ApiProperty({
    description: 'Schedule summary',
    type: Object,
  })
  scheduleSummary?: {
    nextRun?: Date;
    lastRun?: Date;
    isOverdue: boolean;
  };

  @ApiProperty({
    description: 'Generation statistics',
    type: Object,
  })
  generationStats?: {
    totalGenerations: number;
    averageGenerationTime: number;
    lastGenerationTime?: Date;
  };

  @ApiProperty({
    description: 'Report status',
    example: 'active',
    enum: ['active', 'inactive', 'expired', 'scheduled', 'overdue'],
  })
  status: 'active' | 'inactive' | 'expired' | 'scheduled' | 'overdue';

  @ApiProperty({
    description: 'Report priority',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Days since last generation',
    example: 5,
  })
  daysSinceLastGeneration: number;

  @ApiProperty({
    description: 'File size formatted',
    example: '2.0 MB',
  })
  fileSizeFormatted: string;

  @ApiProperty({
    description: 'Recipient count',
    example: 3,
  })
  recipientCount: number;

  @ApiProperty({
    description: 'Metrics count',
    example: 5,
  })
  metricsCount: number;

  @ApiProperty({
    description: 'Filters count',
    example: 2,
  })
  filtersCount: number;

  @ApiProperty({
    description: 'Created by user information',
    type: Object,
  })
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  constructor(partial: Partial<ReportResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(report: Report): ReportResponseDto {
    const dto = new ReportResponseDto({});
    dto.id = report.id;
    dto.title = report.title;
    dto.description = report.description;
    dto.type = report.type;
    dto.format = report.format;
    dto.frequency = report.frequency;
    dto.parameters = report.parameters;
    dto.isActive = report.isActive;
    dto.isPublic = report.isPublic;
    dto.schoolId = report.schoolId;
    dto.createdAt = report.createdAt;
    dto.lastGeneratedAt = report.lastGeneratedAt;
    dto.fileUrl = report.fileUrl;
    dto.fileSize = report.fileSize;
    dto.expiresAt = report.expiresAt;

    // Computed fields
    dto.scheduleSummary = report.getScheduleSummary();
    dto.generationStats = report.getGenerationStats();
    dto.status = report.status;
    dto.priority = report.priority;
    dto.daysSinceLastGeneration = report.daysSinceLastGeneration;
    dto.fileSizeFormatted = report.fileSizeFormatted;
    dto.recipientCount = report.recipientCount;
    dto.metricsCount = report.metricsCount;
    dto.filtersCount = report.filtersCount;

    // Created by user (would be populated by service)
    dto.createdByUser = {
      id: report.createdBy,
      firstName: 'User', // Would be populated from user service
      lastName: 'Name',
      email: 'user@example.com',
    };

    return dto;
  }
}

export class ReportListResponseDto implements IReportListResponse {
  @ApiProperty({
    description: 'List of reports',
    type: [ReportResponseDto],
  })
  reports: IReportResponse[];

  @ApiProperty({
    description: 'Total number of reports',
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

  @ApiProperty({
    description: 'Summary statistics',
    type: Object,
  })
  summary: {
    activeReports: number;
    scheduledReports: number;
    publicReports: number;
    totalGenerations: number;
  };

  constructor(partial: Partial<ReportListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ReportGenerationResponseDto implements IReportGenerationResponse {
  @ApiProperty({
    description: 'Report ID',
    example: 'report-uuid-123',
  })
  reportId: string;

  @ApiProperty({
    description: 'Generated file URL',
    example: 'https://storage.example.com/reports/report-123.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Report format',
    example: 'pdf',
    enum: TReportFormat,
  })
  format: TReportFormat;

  @ApiProperty({
    description: 'Generation timestamp',
    example: '2024-08-01T10:30:00Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: '2024-09-01T10:30:00Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Download URL',
    example: 'https://api.example.com/reports/download/report-123',
  })
  downloadUrl: string;

  @ApiPropertyOptional({
    description: 'Preview URL',
    example: 'https://api.example.com/reports/preview/report-123',
  })
  previewUrl?: string;

  constructor(partial: Partial<ReportGenerationResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ReportsStatisticsResponseDto implements IReportsStatisticsResponse {
  @ApiProperty({
    description: 'Total number of reports',
    example: 150,
  })
  totalReports: number;

  @ApiProperty({
    description: 'Number of active reports',
    example: 120,
  })
  activeReports: number;

  @ApiProperty({
    description: 'Reports grouped by type',
    example: { student_performance: 45, attendance_analytics: 30, financial_reports: 25 },
  })
  reportsByType: Record<TReportType, number>;

  @ApiProperty({
    description: 'Reports grouped by format',
    example: { pdf: 100, excel: 35, csv: 15 },
  })
  reportsByFormat: Record<TReportFormat, number>;

  @ApiProperty({
    description: 'Reports grouped by frequency',
    example: { daily: 10, weekly: 25, monthly: 80, ad_hoc: 35 },
  })
  reportsByFrequency: Record<TReportFrequency, number>;

  @ApiProperty({
    description: 'Total report generations',
    example: 1250,
  })
  totalGenerations: number;

  @ApiProperty({
    description: 'Average generation time in seconds',
    example: 45.5,
  })
  averageGenerationTime: number;

  @ApiProperty({
    description: 'Storage used in bytes',
    example: 1073741824,
  })
  storageUsed: number;

  @ApiProperty({
    description: 'Top report creators',
    type: [Object],
  })
  topReportCreators: Array<{
    userId: string;
    userName: string;
    reportsCount: number;
  }>;

  @ApiProperty({
    description: 'Generation trends over time',
    type: [Object],
  })
  generationTrends: Array<{
    date: Date;
    generations: number;
  }>;

  constructor(partial: Partial<ReportsStatisticsResponseDto>) {
    Object.assign(this, partial);
  }
}