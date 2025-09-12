// Academia Pro - Attendance Types for School Admin
// Consolidated type definitions for attendance management

export interface IAttendanceRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  classId: string;
  sectionId?: string;
  subjectId?: string;
  attendanceDate: string;
  attendanceType: 'class' | 'school' | 'event' | 'exam';
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  checkInTime?: string;
  checkOutTime?: string;
  periodNumber?: number;
  remarks?: string;
  markedBy: string;
  markedByName: string;
  markedByRole: string;
  isPresent: boolean;
  isAbsent: boolean;
  isLate: boolean;
  isExcused: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMarkAttendanceDto {
  studentId: string;
  classId: string;
  sectionId?: string;
  subjectId?: string;
  attendanceDate: string;
  attendanceType: 'class' | 'school' | 'event' | 'exam';
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  checkInTime?: string;
  checkOutTime?: string;
  periodNumber?: number;
  remarks?: string;
}

export interface IBulkMarkAttendanceDto {
  classId: string;
  sectionId?: string;
  subjectId?: string;
  attendanceDate: string;
  attendanceType: 'class' | 'school' | 'event' | 'exam';
  periodNumber?: number;
  records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }>;
}

export interface IBulkUpdateAttendanceDto {
  attendanceIds: string[];
  updates: Partial<{
    status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
    checkInTime: string;
    checkOutTime: string;
    remarks: string;
  }>;
}

export interface IAttendanceStatistics {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  halfDayCount: number;
  attendanceRate: number;
  classId?: string;
  sectionId?: string;
  startDate: string;
  endDate: string;
  attendanceType?: string;
  dailyBreakdown: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  }>;
}

export interface IStudentAttendanceSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  halfDayCount: number;
  attendanceRate: number;
  startDate: string;
  endDate: string;
  attendanceType?: string;
  monthlyBreakdown: Array<{
    month: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  }>;
}

export interface IClassAttendanceReport {
  classId: string;
  className: string;
  sectionName: string;
  reportDate: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  absentStudents: string[];
  lateStudents: string[];
  periodWiseBreakdown?: Array<{
    periodNumber: number;
    subjectName: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

export interface IAttendanceFilters {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  attendanceType?: 'class' | 'school' | 'event' | 'exam';
  status?: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  startDate?: string;
  endDate?: string;
  periodNumber?: number;
}

export interface IAttendanceSearchParams extends IAttendanceFilters {
  page?: number;
  limit?: number;
}

export interface IAttendanceSearchResult {
  data: IAttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Attendance Trends and Analytics
export interface IAttendanceTrend {
  period: string;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
}

export interface IAttendanceTrendsParams {
  classId?: string;
  sectionId?: string;
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
}

// Attendance Alerts
export interface IAttendanceAlert {
  id: string;
  type: 'low_attendance' | 'consecutive_absent' | 'late_arrival' | 'early_departure';
  severity: 'low' | 'medium' | 'high';
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  message: string;
  date: string;
  resolved: boolean;
}

export interface IAttendanceAlertsParams {
  classId?: string;
  sectionId?: string;
  startDate?: string;
  endDate?: string;
  resolved?: boolean;
}

// Excuse Student
export interface IExcuseStudentDto {
  attendanceId: string;
  reason: string;
  excusedBy: string;
}

// Attendance Report Generation
export interface IAttendanceReportGenerationDto {
  reportType: 'class' | 'student' | 'summary' | 'trends';
  classId?: string;
  studentId?: string;
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
}

export interface IAttendanceReportResult {
  reportId: string;
  fileUrl: string;
  generatedAt: string;
  reportType: string;
  parameters: Record<string, unknown>;
}

// Date Range Queries
export interface IAttendanceByDateRangeParams {
  startDate: string;
  endDate: string;
  classId?: string;
  sectionId?: string;
  attendanceType?: 'class' | 'school' | 'event' | 'exam';
}

// Bulk Operations Results
export interface IBulkAttendanceOperationResult {
  success: boolean;
  message: string;
  processed: number;
  errors: string[];
}

export interface IBulkMarkAttendanceResult extends IBulkAttendanceOperationResult {
  marked: number;
}

export interface IBulkUpdateAttendanceResult extends IBulkAttendanceOperationResult {
  updated: number;
}