// Academia Pro - Reports DTOs Index
// Export all reports and analytics DTOs

export { CreateReportDto } from './create-report.dto';
export { UpdateReportDto } from './update-report.dto';
export { ReportResponseDto, ReportListResponseDto, ReportGenerationResponseDto, ReportsStatisticsResponseDto } from './report-response.dto';

// Re-export for convenience
export type {
  ICreateReportRequest,
  IUpdateReportRequest,
  IReportResponse,
  IReportListResponse,
  IReportGenerationResponse,
  IReportsStatisticsResponse,
  IReportFiltersQuery,
  IGenerateReportRequest,
  IAnalyticsQueryRequest,
  IAnalyticsResponse,
  IReportTemplate,
} from '@academia-pro/types/reports/reports.types';