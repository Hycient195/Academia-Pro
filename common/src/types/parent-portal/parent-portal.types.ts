// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal and family communication module

// Enums
export enum TParentRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  GRANDPARENT = 'grandparent',
  OTHER = 'other',
}

export enum TCommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  CALL = 'call',
}

export enum TAppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum TAppointmentType {
  PARENT_TEACHER = 'parent_teacher',
  COUNSELING = 'counseling',
  ADMINISTRATIVE = 'administrative',
  MEDICAL = 'medical',
  OTHER = 'other',
}

export enum TMessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TNotificationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum TResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  GUIDE = 'guide',
  FORM = 'form',
}

export enum TAcademicAlertType {
  GRADE_DROP = 'grade_drop',
  ATTENDANCE_ISSUE = 'attendance_issue',
  BEHAVIOR_CONCERN = 'behavior_concern',
  ACADEMIC_IMPROVEMENT = 'academic_improvement',
  ACHIEVEMENT = 'achievement',
}

export enum TFeeStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  WAIVED = 'waived',
}

export enum TTransportationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Interfaces
export interface IParent {
  id: string;
  userId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: TParentRelationship;
  isPrimary: boolean;
  emergencyContact: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    language: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  occupation?: string;
  employer?: string;
  workPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  rollNumber: string;
  profileImage?: string;
  relationship: TParentRelationship;
}

export interface IParentDashboard {
  parentId: string;
  parentName: string;
  schoolId: string;
  schoolName: string;
  students: IStudent[];
  recentActivities: IActivity[];
  notifications: INotification[];
  upcomingEvents: IEvent[];
  alerts: IAlert[];
  quickStats: {
    totalStudents: number;
    averageAttendance: number;
    pendingFees: number;
    unreadMessages: number;
  };
}

export interface IActivity {
  id: string;
  type: 'grade' | 'attendance' | 'assignment' | 'event' | 'announcement';
  title: string;
  description: string;
  timestamp: Date;
  studentId: string;
  studentName: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  actionUrl?: string;
}

export interface INotification {
  id: string;
  type: TCommunicationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: TMessagePriority;
  studentId?: string;
  studentName?: string;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'academic' | 'sports' | 'cultural' | 'administrative' | 'holiday';
  location?: string;
  studentId?: string;
  studentName?: string;
  isMandatory: boolean;
  rsvpRequired: boolean;
  rsvpStatus?: 'pending' | 'accepted' | 'declined';
}

export interface IAlert {
  id: string;
  type: TAcademicAlertType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  studentId: string;
  studentName: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

// Academic Performance Interfaces
export interface IGradeEntry {
  assessmentName: string;
  assessmentType: string;
  grade: string;
  gradePoints: number;
  maxPoints: number;
  pointsReceived: number;
  assessmentDate: Date;
  comments?: string;
  weight: number;
}

export interface ISubjectGrade {
  subjectId: string;
  subjectName: string;
  currentGrade: string;
  gradePoints: number;
  teacherName: string;
  assessments: IGradeEntry[];
  gradeTrend: 'improving' | 'stable' | 'declining';
  trendPercentage?: number;
}

export interface IStudentGradesSummary {
  studentId: string;
  studentName: string;
  relationship?: string;
  currentGrade: string;
  academicYear: string;
  currentTerm: string;
  subjects: ISubjectGrade[];
  overallGPA: number;
  gpaTrend: 'improving' | 'stable' | 'declining';
  totalCredits: number;
  academicStanding: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  advisorComments?: string;
}

export interface IParentAcademicGradesResponse {
  parentId: string;
  schoolId: string;
  academicYear: string;
  students: IStudentGradesSummary[];
  summary: {
    totalStudents: number;
    averageGPA: number;
    totalSubjects: number;
    totalAssessments: number;
    gradeDistribution: Record<string, number>;
    insights: string[];
    lastUpdated: Date;
  };
  timestamp: Date;
}

// Attendance Interfaces
export interface IAttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  reason?: string;
  hoursPresent: number;
  subjectAttendance: Record<string, string>;
}

export interface IAttendanceSummary {
  totalDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  attendancePercentage: number;
  attendanceTrend: 'improving' | 'stable' | 'declining';
  consecutivePresent: number;
}

export interface IParentAttendanceResponse {
  parentId: string;
  studentId: string;
  studentName: string;
  period: {
    start: string;
    end: string;
  };
  records: IAttendanceRecord[];
  summary: IAttendanceSummary;
  timestamp: Date;
}

// Assignments Interfaces
export interface IAssignmentSubmission {
  submissionId: string;
  submittedAt: Date;
  status: 'submitted' | 'late' | 'graded' | 'pending';
  grade?: string;
  feedback?: string;
  fileUrl?: string;
}

export interface IAssignmentDetails {
  assignmentId: string;
  title: string;
  subject: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'overdue' | 'graded';
  type: string;
  maxPoints: number;
  submission?: IAssignmentSubmission;
  daysUntilDue: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface IParentAssignmentsResponse {
  parentId: string;
  studentId: string;
  studentName: string;
  assignments: IAssignmentDetails[];
  summary: {
    total: number;
    pending: number;
    submitted: number;
    overdue: number;
    graded: number;
  };
  timestamp: Date;
}

// Timetable Interfaces
export interface ITimetableEntry {
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  period: number;
  notes?: string;
}

export interface IParentTimetableResponse {
  parentId: string;
  studentId: string;
  studentName: string;
  weekStart: string;
  timetable: Record<string, ITimetableEntry[]>;
  summary: {
    totalSubjects: number;
    totalPeriods: number;
    averagePeriodsPerDay: number;
  };
  timestamp: Date;
}

// Communication Interfaces
export interface IMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'teacher' | 'admin' | 'parent';
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  priority: TMessagePriority;
  read: boolean;
  readAt?: Date;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  threadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParentMessagesResponse {
  parentId: string;
  messages: IMessage[];
  summary: {
    total: number;
    unread: number;
    today: number;
    thisWeek: number;
  };
  timestamp: Date;
}

// Fee Management Interfaces
export interface IFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  feeType: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: Date;
  status: TFeeStatus;
  paidAmount?: number;
  paidDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  lateFee?: number;
  discount?: number;
  notes?: string;
}

export interface IParentFeesResponse {
  parentId: string;
  studentId: string;
  studentName: string;
  fees: IFeeRecord[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    nextDueDate?: Date;
  };
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    transactionId: string;
    fees: string[];
  }>;
  timestamp: Date;
}

// Appointment Interfaces
export interface IAppointment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  type: TAppointmentType;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // in minutes
  location?: string;
  status: TAppointmentStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  notes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
}

export interface IParentAppointmentsResponse {
  parentId: string;
  appointments: IAppointment[];
  summary: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  timestamp: Date;
}

// Resource Interfaces
export interface IResource {
  id: string;
  title: string;
  description: string;
  type: TResourceType;
  category: string;
  tags: string[];
  url?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  gradeLevel?: string;
  subject?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  downloadCount: number;
  rating: number;
  totalRatings: number;
}

export interface IParentResourcesResponse {
  parentId: string;
  resources: IResource[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  summary: {
    total: number;
    byType: Record<TResourceType, number>;
    byCategory: Record<string, number>;
  };
  timestamp: Date;
}

// Transportation Interfaces
export interface ITransportationInfo {
  studentId: string;
  studentName: string;
  routeName?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  status: TTransportationStatus;
  lastUpdate: Date;
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  todaySchedule: {
    pickup: {
      time: string;
      location: string;
      status: 'on_time' | 'delayed' | 'cancelled';
    };
    dropoff: {
      time: string;
      location: string;
      status: 'on_time' | 'delayed' | 'cancelled';
    };
  };
  weeklySchedule: Record<string, {
    pickupTime: string;
    dropoffTime: string;
    route: string;
  }>;
}

export interface IParentTransportationResponse {
  parentId: string;
  transportation: ITransportationInfo[];
  summary: {
    activeRoutes: number;
    totalStudents: number;
    todayPickups: number;
    todayDropoffs: number;
  };
  timestamp: Date;
}

// Request Interfaces
export interface IGetParentDashboardRequest {
  parentId: string;
  includeActivities?: boolean;
  includeNotifications?: boolean;
  includeEvents?: boolean;
  includeAlerts?: boolean;
}

export interface IGetParentDashboardResponse extends IParentDashboard {
  timestamp: Date;
}

export interface IGetAcademicGradesRequest {
  parentId: string;
  studentId?: string;
  academicYear?: string;
  term?: string;
  includeAssessments?: boolean;
}

export interface IGetAttendanceRequest {
  parentId: string;
  studentId: string;
  period?: '7d' | '30d' | '90d' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface IGetAssignmentsRequest {
  parentId: string;
  studentId: string;
  status?: 'pending' | 'submitted' | 'overdue' | 'graded';
  subject?: string;
  limit?: number;
}

export interface IGetTimetableRequest {
  parentId: string;
  studentId: string;
  weekStart?: string;
}

export interface IGetMessagesRequest {
  parentId: string;
  studentId?: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface IGetFeesRequest {
  parentId: string;
  studentId: string;
  status?: TFeeStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IGetAppointmentsRequest {
  parentId: string;
  studentId?: string;
  status?: TAppointmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IGetResourcesRequest {
  parentId: string;
  type?: TResourceType;
  category?: string;
  gradeLevel?: string;
  subject?: string;
  search?: string;
}

export interface IGetTransportationRequest {
  parentId: string;
  studentId?: string;
}

export interface IScheduleAppointmentRequest {
  parentId: string;
  studentId: string;
  teacherId: string;
  type: TAppointmentType;
  title: string;
  description?: string;
  preferredDate: Date;
  duration: number;
  location?: string;
}

export interface IScheduleAppointmentResponse {
  appointmentId: string;
  status: TAppointmentStatus;
  scheduledDate: Date;
  confirmationRequired: boolean;
  message: string;
}

export interface ISendMessageRequest {
  parentId: string;
  studentId?: string;
  recipientId: string;
  recipientType: 'teacher' | 'admin' | 'counselor';
  subject: string;
  content: string;
  priority?: TMessagePriority;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface ISendMessageResponse {
  messageId: string;
  status: 'sent' | 'pending';
  timestamp: Date;
  message: string;
}

export interface IUpdateCommunicationPreferencesRequest {
  parentId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  language: string;
}

export interface IUpdateCommunicationPreferencesResponse {
  parentId: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    language: string;
  };
  updatedAt: Date;
  message: string;
}

// Bulk Operations
export interface IBulkMessageRequest {
  parentId: string;
  messages: ISendMessageRequest[];
}

export interface IBulkMessageResponse {
  total: number;
  sent: number;
  failed: number;
  results: Array<{
    recipientId: string;
    messageId?: string;
    error?: string;
  }>;
}

// Analytics and Reporting
export interface IParentAnalyticsRequest {
  parentId: string;
  studentId?: string;
  dateFrom: Date;
  dateTo: Date;
  metrics: string[];
}

export interface IParentAnalyticsResponse {
  parentId: string;
  studentId?: string;
  period: {
    from: Date;
    to: Date;
  };
  analytics: {
    attendance: {
      rate: number;
      trend: 'improving' | 'stable' | 'declining';
      absences: number;
      tardiness: number;
    };
    academic: {
      gpa: number;
      trend: 'improving' | 'stable' | 'declining';
      subjects: Array<{
        name: string;
        grade: string;
        trend: 'improving' | 'stable' | 'declining';
      }>;
    };
    communication: {
      messagesSent: number;
      messagesReceived: number;
      responseRate: number;
      averageResponseTime: number;
    };
    engagement: {
      portalLogins: number;
      featureUsage: Record<string, number>;
      lastActivity: Date;
    };
  };
  insights: string[];
  recommendations: string[];
  timestamp: Date;
}

// Settings and Preferences
export interface IParentSettings {
  parentId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: TParentRelationship;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    occupation?: string;
    employer?: string;
    workPhone?: string;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
      types: {
        grades: boolean;
        attendance: boolean;
        assignments: boolean;
        events: boolean;
        announcements: boolean;
        fees: boolean;
      };
    };
    privacy: {
      shareContactInfo: boolean;
      allowEmergencyContact: boolean;
      dataRetention: number; // months
    };
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>;
  linkedStudents: Array<{
    studentId: string;
    studentName: string;
    relationship: TParentRelationship;
    isPrimary: boolean;
    permissions: {
      viewGrades: boolean;
      viewAttendance: boolean;
      viewAssignments: boolean;
      contactTeachers: boolean;
      makePayments: boolean;
    };
  }>;
}