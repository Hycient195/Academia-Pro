// Academia Pro - Mobile Application Types
// Shared type definitions for mobile app endpoints

// Enums
export enum TMobilePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export enum TMobileDeviceType {
  PHONE = 'phone',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export enum TNotificationType {
  ASSIGNMENT = 'assignment',
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
}

export enum TEmergencyType {
  MEDICAL = 'medical',
  SAFETY = 'safety',
  TRANSPORT = 'transport',
  BULLYING = 'bullying',
  OTHER = 'other',
}

export enum TEmergencySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TAssignmentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  OVERDUE = 'overdue',
}

export enum TAssignmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TTransportStatus {
  ON_TIME = 'on_time',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  EMERGENCY = 'emergency',
}

// Interfaces
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

// Student Mobile Interfaces
export interface IStudentDashboardRequest {
  studentId: string;
  deviceId?: string;
}

export interface IStudentDashboardResponse {
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
  notifications: INotificationSummary[];
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

export interface INotificationSummary {
  id: string;
  type: TNotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actions?: INotificationAction[];
}

export interface INotificationAction {
  action: string;
  label: string;
}

export interface IQuickAction {
  action: string;
  label: string;
  icon: string;
}

// Timetable Interfaces
export interface ITimetableRequest {
  studentId: string;
  date?: string;
  week?: string;
}

export interface ITimetableResponse {
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

// Assignments Interfaces
export interface IAssignmentsRequest {
  studentId: string;
  status?: TAssignmentStatus;
  subject?: string;
}

export interface IAssignmentsResponse {
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
  attachments: IFileAttachment[];
  submissionStatus?: ISubmissionStatus;
  grade?: IGradeDetail;
}

export interface IFileAttachment {
  name: string;
  url: string;
  type: string;
}

export interface ISubmissionStatus {
  submittedAt: string;
  status: string;
  attachments: IFileAttachment[];
}

export interface IGradeDetail {
  score: number;
  maxScore: number;
  grade: string;
  feedback?: string;
  gradedAt: string;
}

export interface IAssignmentSubmissionRequest {
  studentId: string;
  assignmentId: string;
  notes?: string;
  attachments?: IFileAttachment[];
}

export interface IAssignmentSubmissionResponse {
  assignmentId: string;
  studentId: string;
  submissionId: string;
  status: string;
  submittedAt: Date;
  attachments: IFileAttachment[];
  message: string;
}

// Grades Interfaces
export interface IGradesRequest {
  studentId: string;
  term?: string;
  subject?: string;
}

export interface IGradesResponse {
  studentId: string;
  term: string;
  overallGPA: number;
  subjects: ISubjectGrade[];
  recentAssessments: IAssessmentDetail[];
}

export interface ISubjectGrade {
  subject: string;
  currentGrade: string;
  score: number;
  teacher: string;
  trend: 'improving' | 'stable' | 'declining';
  assessments: IAssessmentSummary[];
}

export interface IAssessmentSummary {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

export interface IAssessmentDetail {
  subject: string;
  assessment: string;
  date: string;
  score: number;
  maxScore: number;
  grade: string;
  feedback?: string;
}

// Attendance Interfaces
export interface IAttendanceRequest {
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

// Notifications Interfaces
export interface INotificationsRequest {
  studentId: string;
  unreadOnly?: boolean;
  limit?: number;
}

export interface INotificationsResponse {
  studentId: string;
  totalCount: number;
  unreadCount: number;
  notifications: INotificationDetail[];
}

export interface INotificationDetail {
  id: string;
  type: TNotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actions?: INotificationAction[];
}

export interface IMarkNotificationReadRequest {
  studentId: string;
  notificationId: string;
}

export interface IMarkNotificationReadResponse {
  notificationId: string;
  studentId: string;
  status: string;
  timestamp: Date;
}

// Library Interfaces
export interface ILibraryInfoRequest {
  studentId: string;
  status?: 'borrowed' | 'reserved' | 'overdue' | 'returned';
}

export interface ILibraryInfoResponse {
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

export interface IRenewBookRequest {
  studentId: string;
  bookId: string;
}

export interface IRenewBookResponse {
  bookId: string;
  studentId: string;
  renewalId: string;
  newDueDate: Date;
  status: string;
  message: string;
}

// Transport Interfaces
export interface ITransportInfoRequest {
  studentId: string;
}

export interface ITransportInfoResponse {
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
  emergencyContacts: IEmergencyContact[];
}

export interface IEmergencyContact {
  name: string;
  phone: string;
}

// Emergency Interfaces
export interface IEmergencyReportRequest {
  studentId: string;
  emergencyType: TEmergencyType;
  description: string;
  location: string;
  severity?: TEmergencySeverity;
  witnesses?: string[];
}

export interface IEmergencyReportResponse {
  emergencyId: string;
  studentId: string;
  status: string;
  timestamp: Date;
  responseTime: string;
  contactsNotified: string[];
}

// Profile Interfaces
export interface IStudentProfileRequest {
  studentId: string;
}

export interface IStudentProfileResponse {
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

export interface IUpdateProfileRequest {
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

export interface IUpdateProfileResponse {
  studentId: string;
  updatedFields: string[];
  timestamp: Date;
  message: string;
}

// Parent Mobile Interfaces
export interface IParentDashboardRequest {
  parentId: string;
  deviceId?: string;
}

export interface IParentDashboardResponse {
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
  notifications: INotificationSummary[];
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

// Staff Mobile Interfaces
export interface IStaffDashboardRequest {
  staffId: string;
  deviceId?: string;
}

export interface IStaffDashboardResponse {
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
  notifications: INotificationSummary[];
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

// Authentication Interfaces
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

// Push Notification Interfaces
export interface IRegisterPushTokenRequest {
  userId: string;
  deviceId: string;
  pushToken: string;
  platform: TMobilePlatform;
}

export interface IRegisterPushTokenResponse {
  deviceId: string;
  pushToken: string;
  registered: boolean;
  timestamp: Date;
}

export interface IPushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'normal' | 'high';
  ttl?: number;
}

// Offline Sync Interfaces
export interface ISyncRequest {
  userId: string;
  deviceId: string;
  lastSyncTimestamp: Date;
  dataTypes: string[];
}

export interface ISyncResponse {
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

// App Update Interfaces
export interface IAppUpdateCheckRequest {
  platform: TMobilePlatform;
  currentVersion: string;
  deviceId: string;
}

export interface IAppUpdateCheckResponse {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateRequired: boolean;
  downloadUrl?: string;
  releaseNotes?: string;
  forceUpdateAfter?: Date;
}

// Analytics Interfaces
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

export interface ITrackAnalyticsRequest {
  events: IMobileAnalyticsEvent[];
}

export interface ITrackAnalyticsResponse {
  tracked: number;
  failed: number;
  timestamp: Date;
}