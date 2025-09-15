import { baseApi } from '../userBaseApi';

// Types for attendance management
export interface AttendanceRecord {
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

export interface MarkAttendanceDto {
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

export interface BulkMarkAttendanceDto {
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

export interface BulkUpdateAttendanceDto {
  attendanceIds: string[];
  updates: Partial<{
    status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
    checkInTime: string;
    checkOutTime: string;
    remarks: string;
  }>;
}

export interface AttendanceStatistics {
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

export interface StudentAttendanceSummary {
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

export interface ClassAttendanceReport {
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

export interface AttendanceFilters {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  attendanceType?: 'class' | 'school' | 'event' | 'exam';
  status?: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  startDate?: string;
  endDate?: string;
  periodNumber?: number;
}

export interface AttendanceSearchParams extends AttendanceFilters {
  page?: number;
  limit?: number;
}

export interface AttendanceSearchResult {
  data: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mark individual attendance
    markAttendance: builder.mutation<AttendanceRecord, MarkAttendanceDto>({
      query: (attendanceData) => ({
        url: 'attendance/mark',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance' as const],
    }),

    // Bulk mark attendance
    bulkMarkAttendance: builder.mutation<AttendanceRecord[], BulkMarkAttendanceDto>({
      query: (bulkData) => ({
        url: 'attendance/bulk-mark',
        method: 'POST',
        body: bulkData,
      }),
      invalidatesTags: ['Attendance' as const],
    }),

    // Bulk update attendance
    bulkUpdateAttendance: builder.mutation<AttendanceRecord[], BulkUpdateAttendanceDto>({
      query: (updateData) => ({
        url: 'attendance/bulk-update',
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['Attendance' as const],
    }),

    // Get attendance by ID
    getAttendance: builder.query<AttendanceRecord, string>({
      query: (id) => ({
        url: `attendance/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Attendance' as const, id }],
    }),

    // Update attendance record
    updateAttendance: builder.mutation<AttendanceRecord, { id: string; data: Partial<MarkAttendanceDto> }>({
      query: ({ id, data }) => ({
        url: `attendance/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Attendance' as const, id },
        'Attendance' as const,
      ],
    }),

    // Delete attendance record
    deleteAttendance: builder.mutation<void, string>({
      query: (id) => ({
        url: `attendance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance' as const],
    }),

    // Get student attendance records
    getStudentAttendance: builder.query<AttendanceRecord[], {
      studentId: string;
      startDate?: string;
      endDate?: string;
      attendanceType?: 'class' | 'school' | 'event' | 'exam';
      limit?: number;
      offset?: number;
    }>({
      query: ({ studentId, ...params }) => ({
        url: `attendance/student/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { studentId }) => [
        { type: 'Attendance' as const, id: studentId },
        'Attendance' as const,
      ],
    }),

    // Get class attendance for a specific date
    getClassAttendance: builder.query<AttendanceRecord[], {
      classId: string;
      date: string;
      sectionId?: string;
      periodNumber?: number;
    }>({
      query: ({ classId, date, ...params }) => ({
        url: `attendance/class/${classId}/date/${date}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get attendance statistics
    getAttendanceStatistics: builder.query<AttendanceStatistics, {
      classId?: string;
      sectionId?: string;
      startDate: string;
      endDate: string;
      attendanceType?: 'class' | 'school' | 'event' | 'exam';
    }>({
      query: (params) => ({
        url: 'attendance/statistics/overview',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get student attendance summary
    getStudentAttendanceSummary: builder.query<StudentAttendanceSummary, {
      studentId: string;
      startDate: string;
      endDate: string;
      attendanceType?: 'class' | 'school' | 'event' | 'exam';
    }>({
      query: ({ studentId, ...params }) => ({
        url: `attendance/student/${studentId}/summary`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { studentId }) => [
        { type: 'Attendance' as const, id: studentId },
        'Attendance' as const,
      ],
    }),

    // Get class attendance report
    getClassAttendanceReport: builder.query<ClassAttendanceReport, {
      classId: string;
      date: string;
      sectionId?: string;
    }>({
      query: ({ classId, ...params }) => ({
        url: `attendance/reports/class/${classId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get attendance records with filters
    getAttendanceRecords: builder.query<AttendanceSearchResult, AttendanceSearchParams>({
      query: (params) => ({
        url: 'attendance',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get attendance by date range
    getAttendanceByDateRange: builder.query<AttendanceRecord[], {
      startDate: string;
      endDate: string;
      classId?: string;
      sectionId?: string;
      attendanceType?: 'class' | 'school' | 'event' | 'exam';
    }>({
      query: (params) => ({
        url: 'attendance/date-range',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get attendance trends
    getAttendanceTrends: builder.query<{
      period: string;
      attendanceRate: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      totalStudents: number;
    }[], {
      classId?: string;
      sectionId?: string;
      startDate: string;
      endDate: string;
      groupBy: 'day' | 'week' | 'month';
    }>({
      query: (params) => ({
        url: 'attendance/trends',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Get attendance alerts
    getAttendanceAlerts: builder.query<{
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
    }[], {
      classId?: string;
      sectionId?: string;
      startDate?: string;
      endDate?: string;
      resolved?: boolean;
    }>({
      query: (params) => ({
        url: 'attendance/alerts',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance' as const],
    }),

    // Mark student as excused
    excuseStudent: builder.mutation<AttendanceRecord, {
      attendanceId: string;
      reason: string;
      excusedBy: string;
    }>({
      query: ({ attendanceId, ...data }) => ({
        url: `attendance/${attendanceId}/excuse`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { attendanceId }) => [
        { type: 'Attendance' as const, id: attendanceId },
        'Attendance' as const,
      ],
    }),

    // Generate attendance report
    generateAttendanceReport: builder.mutation<{
      reportId: string;
      fileUrl: string;
      generatedAt: string;
      reportType: string;
      parameters: Record<string, unknown>;
    }, {
      reportType: 'class' | 'student' | 'summary' | 'trends';
      classId?: string;
      studentId?: string;
      startDate: string;
      endDate: string;
      format: 'pdf' | 'excel' | 'csv';
      includeCharts?: boolean;
    }>({
      query: (reportData) => ({
        url: 'attendance/reports/generate',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: ['Attendance' as const],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useBulkMarkAttendanceMutation,
  useBulkUpdateAttendanceMutation,
  useGetAttendanceQuery,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetStudentAttendanceQuery,
  useGetClassAttendanceQuery,
  useGetAttendanceStatisticsQuery,
  useGetStudentAttendanceSummaryQuery,
  useGetClassAttendanceReportQuery,
  useGetAttendanceRecordsQuery,
  useGetAttendanceByDateRangeQuery,
  useGetAttendanceTrendsQuery,
  useGetAttendanceAlertsQuery,
  useExcuseStudentMutation,
  useGenerateAttendanceReportMutation,
} = attendanceApi;