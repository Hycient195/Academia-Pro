// Academia Pro - Attendance DTOs
// Export all attendance-related Data Transfer Objects

export { MarkAttendanceDto } from './mark-attendance.dto';
export { BulkMarkAttendanceDto, BulkUpdateAttendanceDto } from './bulk-attendance.dto';
export {
  AttendanceResponseDto,
  AttendanceStatisticsDto,
  StudentAttendanceSummaryDto,
  ClassAttendanceReportDto,
  AttendanceListResponseDto,
} from './attendance-response.dto';

// Re-export types for convenience
export type {
  AttendanceStatus,
  AttendanceType,
  AttendanceMethod,
} from '../entities/attendance.entity';