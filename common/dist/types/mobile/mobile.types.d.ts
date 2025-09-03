export declare enum TMobilePlatform {
    IOS = "ios",
    ANDROID = "android",
    WEB = "web"
}
export declare enum TMobileDeviceType {
    PHONE = "phone",
    TABLET = "tablet",
    DESKTOP = "desktop"
}
export declare enum TMobileNotificationType {
    ASSIGNMENT = "assignment",
    GRADE = "grade",
    ATTENDANCE = "attendance",
    EVENT = "event",
    ANNOUNCEMENT = "announcement",
    EMERGENCY = "emergency",
    SYSTEM = "system"
}
export declare enum TEmergencyType {
    MEDICAL = "medical",
    SAFETY = "safety",
    TRANSPORT = "transport",
    BULLYING = "bullying",
    OTHER = "other"
}
export declare enum TEmergencySeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum TAssignmentStatus {
    PENDING = "pending",
    SUBMITTED = "submitted",
    GRADED = "graded",
    OVERDUE = "overdue"
}
export declare enum TAssignmentPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TTransportStatus {
    ON_TIME = "on_time",
    DELAYED = "delayed",
    CANCELLED = "cancelled",
    EMERGENCY = "emergency"
}
export interface IMobileDevice {
    deviceId: string;
    platform: TMobilePlatform;
    deviceType: TMobileDeviceType;
    osVersion: string;
    appVersion: string;
    pushToken?: string;
    lastLogin: Date;
    isActive: boolean;
}
export interface IMobileUser {
    userId: string;
    userType: 'student' | 'parent' | 'staff';
    schoolId: string;
    devices: IMobileDevice[];
    preferences: IMobilePreferences;
    lastActivity: Date;
}
export interface IMobilePreferences {
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
}
export interface IMobileStudentDashboardRequest {
    studentId: string;
    deviceId?: string;
}
export interface IMobileStudentDashboardResponse {
    studentId: string;
    deviceId?: string;
    timestamp: Date;
    studentInfo: {
        name: string;
        grade: string;
        rollNumber: string;
        profileImage?: string;
    };
    todaySchedule: IScheduleItem[];
    pendingAssignments: IAssignmentSummary[];
    recentGrades: IGradeSummary[];
    notifications: IMobileNotificationSummary[];
    quickActions: IQuickAction[];
}
export interface IScheduleItem {
    period: number;
    subject: string;
    teacher: string;
    time: string;
    room: string;
    status: 'completed' | 'in_progress' | 'upcoming';
    attendance?: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
}
export interface IAssignmentSummary {
    id: string;
    title: string;
    subject: string;
    teacher: string;
    dueDate: string;
    status: TAssignmentStatus;
    priority: TAssignmentPriority;
}
export interface IGradeSummary {
    subject: string;
    currentGrade: string;
    score: number;
    teacher: string;
    trend: 'improving' | 'stable' | 'declining';
}
export interface IMobileNotificationSummary {
    id: string;
    type: TMobileNotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    actions?: IMobileNotificationAction[];
}
export interface IMobileNotificationAction {
    action: string;
    label: string;
}
export interface IQuickAction {
    action: string;
    label: string;
    icon: string;
}
export interface IMobileTimetableRequest {
    studentId: string;
    date?: string;
    week?: string;
}
export interface IMobileTimetableResponse {
    studentId: string;
    date: string;
    week: string;
    schedule: IScheduleItem[];
    summary: {
        totalPeriods: number;
        completedPeriods: number;
        remainingPeriods: number;
        attendanceRate: number;
    };
}
export interface IMobileAssignmentsRequest {
    studentId: string;
    status?: TAssignmentStatus;
    subject?: string;
}
export interface IMobileAssignmentsResponse {
    studentId: string;
    totalCount: number;
    pendingCount: number;
    overdueCount: number;
    assignments: IAssignmentDetail[];
}
export interface IAssignmentDetail {
    id: string;
    title: string;
    subject: string;
    teacher: string;
    description: string;
    dueDate: string;
    status: TAssignmentStatus;
    priority: TAssignmentPriority;
    attachments: IMobileFileAttachment[];
    submissionStatus?: IMobileSubmissionStatus;
    grade?: IMobileGradeDetail;
}
export interface IMobileFileAttachment {
    name: string;
    url: string;
    type: string;
}
export interface IMobileSubmissionStatus {
    submittedAt: string;
    status: string;
    attachments: IMobileFileAttachment[];
}
export interface IMobileGradeDetail {
    score: number;
    maxScore: number;
    grade: string;
    feedback?: string;
    gradedAt: string;
}
export interface IMobileAssignmentSubmissionRequest {
    studentId: string;
    assignmentId: string;
    notes?: string;
    attachments?: IMobileFileAttachment[];
}
export interface IMobileAssignmentSubmissionResponse {
    assignmentId: string;
    studentId: string;
    submissionId: string;
    status: string;
    submittedAt: Date;
    attachments: IMobileFileAttachment[];
    message: string;
}
export interface IMobileGradesRequest {
    studentId: string;
    term?: string;
    subject?: string;
}
export interface IMobileGradesResponse {
    studentId: string;
    term: string;
    overallGPA: number;
    subjects: IMobileSubjectGrade[];
    recentAssessments: IMobileAssessmentDetail[];
}
export interface IMobileSubjectGrade {
    subject: string;
    currentGrade: string;
    score: number;
    teacher: string;
    trend: 'improving' | 'stable' | 'declining';
    assessments: IMobileAssessmentSummary[];
}
export interface IMobileAssessmentSummary {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
}
export interface IMobileAssessmentDetail {
    subject: string;
    assessment: string;
    date: string;
    score: number;
    maxScore: number;
    grade: string;
    feedback?: string;
}
export interface IMobileAttendanceRequest {
    studentId: string;
    period?: string;
}
export interface IMobileAttendanceResponse {
    studentId: string;
    period: string;
    summary: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        total: number;
        percentage: number;
    };
    recentAttendance: IAttendanceRecord[];
    monthlyTrend: IMonthlyAttendance[];
    subjects: ISubjectAttendance[];
}
export interface IAttendanceRecord {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkIn?: string;
    checkOut?: string;
    subject: string;
    reason?: string;
}
export interface IMonthlyAttendance {
    month: string;
    percentage: number;
    present: number;
    total: number;
}
export interface ISubjectAttendance {
    subject: string;
    percentage: number;
    present: number;
    total: number;
}
export interface IMobileNotificationsRequest {
    studentId: string;
    unreadOnly?: boolean;
    limit?: number;
}
export interface IMobileNotificationsResponse {
    studentId: string;
    totalCount: number;
    unreadCount: number;
    notifications: IMobileNotificationDetail[];
}
export interface IMobileNotificationDetail {
    id: string;
    type: TMobileNotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    actions?: IMobileNotificationAction[];
}
export interface IMobileMarkNotificationReadRequest {
    studentId: string;
    notificationId: string;
}
export interface IMobileMarkNotificationReadResponse {
    notificationId: string;
    studentId: string;
    status: string;
    timestamp: Date;
}
export interface IMobileLibraryInfoRequest {
    studentId: string;
    status?: 'borrowed' | 'reserved' | 'overdue' | 'returned';
}
export interface IMobileLibraryInfoResponse {
    studentId: string;
    borrowingLimit: number;
    currentBorrowed: number;
    overdueCount: number;
    books: ILibraryBook[];
    recommendations: IBookRecommendation[];
}
export interface ILibraryBook {
    id: string;
    title: string;
    author: string;
    isbn: string;
    borrowedDate?: string;
    dueDate?: string;
    reservedDate?: string;
    status: 'borrowed' | 'reserved' | 'overdue' | 'returned';
    fine?: number;
    renewalsLeft?: number;
    queuePosition?: number;
}
export interface IBookRecommendation {
    id: string;
    title: string;
    author: string;
    reason: string;
}
export interface IMobileRenewBookRequest {
    studentId: string;
    bookId: string;
}
export interface IMobileRenewBookResponse {
    bookId: string;
    studentId: string;
    renewalId: string;
    newDueDate: Date;
    status: string;
    message: string;
}
export interface IMobileTransportInfoRequest {
    studentId: string;
}
export interface IMobileTransportInfoResponse {
    studentId: string;
    transportStatus: 'active' | 'inactive' | 'suspended';
    routeName?: string;
    pickupTime?: string;
    dropoffTime?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    todayStatus: TTransportStatus;
    lastUpdate: Date;
    emergencyContacts: IMobileEmergencyContact[];
}
export interface IMobileEmergencyContact {
    name: string;
    phone: string;
}
export interface IMobileEmergencyReportRequest {
    studentId: string;
    emergencyType: TEmergencyType;
    description: string;
    location: string;
    severity?: TEmergencySeverity;
    witnesses?: string[];
}
export interface IMobileEmergencyReportResponse {
    emergencyId: string;
    studentId: string;
    status: string;
    timestamp: Date;
    responseTime: string;
    contactsNotified: string[];
}
export interface IMobileStudentProfileRequest {
    studentId: string;
}
export interface IMobileStudentProfileResponse {
    studentId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        nationality: string;
        profileImage?: string;
    };
    academicInfo: {
        grade: string;
        section: string;
        rollNumber: string;
        admissionNumber: string;
        admissionDate: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        address: string;
        emergencyContact?: {
            name: string;
            relationship: string;
            phone: string;
        };
    };
    medicalInfo: {
        bloodGroup?: string;
        allergies?: string[];
        medicalConditions?: string[];
        doctorName?: string;
        doctorPhone?: string;
    };
    preferences: {
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
    };
}
export interface IMobileUpdateProfileRequest {
    studentId: string;
    phone?: string;
    address?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    preferences?: {
        language?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
    };
}
export interface IMobileUpdateProfileResponse {
    studentId: string;
    updatedFields: string[];
    timestamp: Date;
    message: string;
}
export interface IMobileParentDashboardRequest {
    parentId: string;
    deviceId?: string;
}
export interface IMobileParentDashboardResponse {
    parentId: string;
    deviceId?: string;
    timestamp: Date;
    parentInfo: {
        name: string;
        email: string;
        phone: string;
        profileImage?: string;
    };
    children: IChildSummary[];
    notifications: IMobileNotificationSummary[];
    quickActions: IQuickAction[];
}
export interface IChildSummary {
    studentId: string;
    name: string;
    grade: string;
    attendanceRate: number;
    recentGrade: string;
    pendingTasks: number;
}
export interface IMobileStaffDashboardRequest {
    staffId: string;
    deviceId?: string;
}
export interface IMobileStaffDashboardResponse {
    staffId: string;
    deviceId?: string;
    timestamp: Date;
    staffInfo: {
        name: string;
        position: string;
        department: string;
        profileImage?: string;
    };
    todaySchedule: IStaffScheduleItem[];
    pendingTasks: ITaskSummary[];
    notifications: IMobileNotificationSummary[];
    quickActions: IQuickAction[];
}
export interface IStaffScheduleItem {
    time: string;
    activity: string;
    location: string;
    type: 'class' | 'meeting' | 'duty' | 'other';
}
export interface ITaskSummary {
    id: string;
    title: string;
    type: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
}
export interface IMobileLoginRequest {
    username: string;
    password: string;
    deviceId: string;
    platform: TMobilePlatform;
    deviceType: TMobileDeviceType;
    appVersion: string;
}
export interface IMobileLoginResponse {
    accessToken: string;
    refreshToken: string;
    user: IMobileUser;
    expiresIn: number;
    deviceId: string;
}
export interface IMobileRefreshTokenRequest {
    refreshToken: string;
    deviceId: string;
}
export interface IMobileRefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface IMobileRegisterPushTokenRequest {
    userId: string;
    deviceId: string;
    pushToken: string;
    platform: TMobilePlatform;
}
export interface IMobileRegisterPushTokenResponse {
    deviceId: string;
    pushToken: string;
    registered: boolean;
    timestamp: Date;
}
export interface IMobilePushNotificationPayload {
    to: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    priority?: 'normal' | 'high';
    ttl?: number;
}
export interface IMobileSyncRequest {
    userId: string;
    deviceId: string;
    lastSyncTimestamp: Date;
    dataTypes: string[];
}
export interface IMobileSyncResponse {
    userId: string;
    deviceId: string;
    syncTimestamp: Date;
    changes: {
        [dataType: string]: {
            created: any[];
            updated: any[];
            deleted: string[];
        };
    };
    conflicts: ISyncConflict[];
}
export interface ISyncConflict {
    dataType: string;
    localId: string;
    serverId: string;
    localData: any;
    serverData: any;
    resolution: 'local' | 'server' | 'merge' | 'manual';
}
export interface IMobileAppUpdateCheckRequest {
    platform: TMobilePlatform;
    currentVersion: string;
    deviceId: string;
}
export interface IMobileAppUpdateCheckResponse {
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion?: string;
    updateRequired: boolean;
    downloadUrl?: string;
    releaseNotes?: string;
    forceUpdateAfter?: Date;
}
export interface IMobileAnalyticsEvent {
    userId: string;
    deviceId: string;
    eventType: string;
    eventData: Record<string, any>;
    timestamp: Date;
    sessionId: string;
    appVersion: string;
    platform: TMobilePlatform;
}
export interface IMobileTrackAnalyticsRequest {
    events: IMobileAnalyticsEvent[];
}
export interface IMobileTrackAnalyticsResponse {
    tracked: number;
    failed: number;
    timestamp: Date;
}
//# sourceMappingURL=mobile.types.d.ts.map