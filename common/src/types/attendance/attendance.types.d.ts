export declare enum TAttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    EXCUSED = "excused",
    HALF_DAY = "half_day",
    MEDICAL_LEAVE = "medical_leave",
    EMERGENCY = "emergency"
}
export declare enum TAttendanceType {
    CLASS = "class",
    EXAM = "exam",
    EVENT = "event",
    ACTIVITY = "activity",
    ASSEMBLY = "assembly",
    FIELD_TRIP = "field_trip",
    SPORTS = "sports",
    CLUB = "club",
    OTHER = "other"
}
export declare enum TAttendanceMethod {
    MANUAL = "manual",
    BIOMETRIC = "biometric",
    RFID = "rfid",
    MOBILE_APP = "mobile_app",
    WEB_PORTAL = "web_portal",
    AUTOMATED = "automated"
}
export interface IAttendance {
    id: string;
    studentId: string;
    status: TAttendanceStatus;
    attendanceType: TAttendanceType;
    attendanceDate: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherId?: string;
    periodNumber?: number;
    academicYear: string;
    gradeLevel: string;
    section?: string;
    eventId?: string;
    eventName?: string;
    eventType?: string;
    location?: string;
    attendanceMethod: TAttendanceMethod;
    markedBy: string;
    markedByName: string;
    markedByRole: string;
    verificationMethod?: string;
    deviceId?: string;
    ipAddress?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    actualDurationMinutes?: number;
    lateMinutes: number;
    absenceReason?: string;
    excuseType?: string;
    excuseDocumentUrl?: string;
    notes?: string;
    internalNotes?: string;
    parentNotified: boolean;
    parentNotificationDate?: Date;
    parentNotificationMethod?: string;
    followUpRequired: boolean;
    followUpDate?: Date;
    followUpNotes?: string;
    isFirstAbsence: boolean;
    consecutiveAbsences: number;
    totalAbsencesThisMonth: number;
    totalAbsencesThisYear: number;
    latitude?: number;
    longitude?: number;
    geofenceCompliance?: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
export interface IMarkAttendanceRequest {
    studentId: string;
    status: TAttendanceStatus;
    attendanceType?: TAttendanceType;
    attendanceDate: string;
    checkInTime?: string;
    checkOutTime?: string;
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherId?: string;
    periodNumber?: number;
    eventId?: string;
    eventName?: string;
    location?: string;
    attendanceMethod?: TAttendanceMethod;
    lateMinutes?: number;
    absenceReason?: string;
    excuseType?: string;
    excuseDocumentUrl?: string;
    notes?: string;
    internalNotes?: string;
    parentNotified?: boolean;
    latitude?: number;
    longitude?: number;
}
export interface IBulkMarkAttendanceRequestOld {
    attendances: IMarkAttendanceRequest[];
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    attendanceDate: string;
    attendanceType?: TAttendanceType;
}
export interface IAttendanceResponse {
    id: string;
    studentId: string;
    studentName?: string;
    status: TAttendanceStatus;
    attendanceType: TAttendanceType;
    attendanceDate: string;
    checkInTime?: string;
    checkOutTime?: string;
    className?: string;
    sectionName?: string;
    subjectName?: string;
    teacherName?: string;
    periodNumber?: number;
    eventName?: string;
    location?: string;
    attendanceMethod: TAttendanceMethod;
    lateMinutes?: number;
    absenceReason?: string;
    excuseType?: string;
    notes?: string;
    markedByName: string;
    markedByRole: string;
    createdAt: string;
    updatedAt: string;
}
export interface IAttendanceListResponse {
    data: IAttendanceResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
        totalPresent: number;
        totalAbsent: number;
        totalLate: number;
        totalExcused: number;
        attendancePercentage: number;
    };
}
export interface IAttendanceStatisticsResponse {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
    averageLateMinutes: number;
    commonAbsenceReason?: string;
}
export interface IStudentAttendanceReport {
    studentId: string;
    studentName: string;
    gradeLevel: string;
    section: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
    totalLateMinutes: number;
    consecutiveAbsences: number;
    absencesThisMonth: number;
    absencesThisYear: number;
}
export interface IClassAttendanceReportResponse {
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
}
export interface IBulkMarkAttendanceRequest {
    attendances: {
        studentId: string;
        status: TAttendanceStatus;
        lateMinutes?: number;
        absenceReason?: string;
        excuseType?: string;
        notes?: string;
    }[];
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    attendanceDate: string;
    attendanceType?: TAttendanceType;
}
export interface IBulkUpdateAttendanceRequest {
    studentIds: string[];
    status: TAttendanceStatus;
    attendanceDate: string;
    reason?: string;
    internalNotes?: string;
}
export interface IAttendanceFilters {
    studentId?: string;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    attendanceDate?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: TAttendanceStatus;
    attendanceType?: TAttendanceType;
    gradeLevel?: string;
    section?: string;
    academicYear?: string;
    schoolId: string;
}
export interface IAttendanceStatistics {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
    byStatus: Record<TAttendanceStatus, number>;
    byType: Record<TAttendanceType, number>;
    byGrade: Record<string, number>;
    bySubject: Record<string, number>;
    trends: {
        daily: Array<{
            date: string;
            present: number;
            absent: number;
            rate: number;
        }>;
        weekly: Array<{
            week: string;
            present: number;
            absent: number;
            rate: number;
        }>;
        monthly: Array<{
            month: string;
            present: number;
            absent: number;
            rate: number;
        }>;
    };
}
export interface IAttendanceReportRequest {
    schoolId: string;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
    classId?: string;
    studentId?: string;
    dateFrom: string;
    dateTo: string;
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
    includeTrends?: boolean;
    includePatterns?: boolean;
}
export interface IAttendanceReportResponse {
    reportId: string;
    generatedAt: Date;
    parameters: IAttendanceReportRequest;
    summary: IAttendanceStatistics;
    studentReports?: IStudentAttendanceReport[];
    classReports?: IClassAttendanceReport[];
    subjectReports?: ISubjectAttendanceReport[];
}
export interface IStudentAttendanceReport {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    gradeLevel: string;
    section: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number;
    consecutiveAbsences: number;
    pattern: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
}
export interface IClassAttendanceReport {
    classId: string;
    className: string;
    gradeLevel: string;
    section: string;
    totalStudents: number;
    averageAttendance: number;
    lowestAttendance: number;
    highestAttendance: number;
    absentStudents: number;
    atRiskStudents: number;
}
export interface ISubjectAttendanceReport {
    subjectId: string;
    subjectName: string;
    teacherName: string;
    totalClasses: number;
    averageAttendance: number;
    absentStudents: number;
    frequentAbsentees: number;
}
export interface IAttendanceAlertRequest {
    studentId: string;
    alertType: 'consecutive_absences' | 'low_attendance' | 'pattern_detected' | 'first_absence';
    threshold?: number;
    message: string;
    recipients: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface IAttendanceAlertResponse {
    alertId: string;
    sent: boolean;
    sentAt?: Date;
    recipients: string[];
    deliveryStatus: Record<string, 'sent' | 'failed' | 'pending'>;
}
