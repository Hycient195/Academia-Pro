// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal module

// Enums
export enum TParentRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  GRANDPARENT = 'grandparent',
  OTHER = 'other',
}

export enum TNotificationPreference {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  NONE = 'none',
}

export enum TCommunicationType {
  ANNOUNCEMENT = 'announcement',
  ASSIGNMENT = 'assignment',
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  EVENT = 'event',
  EMERGENCY = 'emergency',
  GENERAL = 'general',
}

export enum TPortalAccessLevel {
  FULL_ACCESS = 'full_access',
  LIMITED_ACCESS = 'limited_access',
  VIEW_ONLY = 'view_only',
  EMERGENCY_ONLY = 'emergency_only',
}

export enum TAppointmentStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Interfaces
export interface IParent {
  id: string;
  userId: string;
  relationship: TParentRelationship;
  isPrimaryContact: boolean;
  emergencyContact: boolean;
  portalAccessLevel: TPortalAccessLevel;
  notificationPreferences: INotificationPreferences;
  children: IParentChild[];
  contactInformation: IParentContact;
  profile: IParentProfile;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface IParentChild {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  class: string;
  relationship: TParentRelationship;
  isPrimaryGuardian: boolean;
  emergencyContact: boolean;
  accessPermissions: IChildAccessPermissions;
  addedAt: Date;
}

export interface IChildAccessPermissions {
  viewGrades: boolean;
  viewAttendance: boolean;
  viewAssignments: boolean;
  viewTimetable: boolean;
  viewFees: boolean;
  viewReports: boolean;
  receiveNotifications: boolean;
  contactTeachers: boolean;
  scheduleMeetings: boolean;
}

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  grades: boolean;
  attendance: boolean;
  assignments: boolean;
  events: boolean;
  emergencies: boolean;
  general: boolean;
}

export interface IParentContact {
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  workContact?: {
    company?: string;
    position?: string;
    workPhone?: string;
    workEmail?: string;
  };
}

export interface IParentProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  occupation?: string;
  educationLevel?: string;
  languages: string[];
  profilePicture?: string;
  bio?: string;
  interests: string[];
  emergencyContacts: IEmergencyContact[];
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
}

export interface IParentCommunication {
  id: string;
  parentId: string;
  type: TCommunicationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: {
    id: string;
    name: string;
    role: string;
    department?: string;
  };
  recipient: {
    id: string;
    name: string;
  };
  relatedTo?: {
    type: 'student' | 'class' | 'school';
    id: string;
    name: string;
  };
  attachments: IAttachment[];
  isRead: boolean;
  readAt?: Date;
  requiresResponse: boolean;
  response?: string;
  responseAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface IAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IParentAppointment {
  id: string;
  parentId: string;
  studentId: string;
  teacherId: string;
  subject: string;
  purpose: string;
  requestedDate: Date;
  requestedTime: string;
  duration: number; // minutes
  status: TAppointmentStatus;
  location: string;
  notes?: string;
  teacherNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface IParentDashboard {
  parentId: string;
  children: IChildDashboard[];
  recentCommunications: IParentCommunication[];
  upcomingAppointments: IParentAppointment[];
  notifications: INotification[];
  alerts: IAlert[];
  quickActions: IQuickAction[];
  lastUpdated: Date;
}

export interface IChildDashboard {
  studentId: string;
  studentName: string;
  grade: string;
  class: string;
  profilePicture?: string;
  todaySchedule: IScheduleItem[];
  recentGrades: IGradeItem[];
  attendance: {
    today: boolean;
    thisWeek: number;
    thisMonth: number;
  };
  pendingAssignments: number;
  upcomingEvents: IEventItem[];
  unreadMessages: number;
}

export interface IScheduleItem {
  subject: string;
  teacher: string;
  time: string;
  room: string;
  type: 'class' | 'activity' | 'exam';
}

export interface IGradeItem {
  subject: string;
  grade: string;
  date: Date;
  teacher: string;
  comments?: string;
}

export interface IEventItem {
  title: string;
  date: Date;
  type: string;
  description?: string;
}

export interface INotification {
  id: string;
  type: TCommunicationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface IAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  acknowledgedAt?: Date;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface IQuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  url: string;
  isEnabled: boolean;
  order: number;
}

export interface IParentFeedback {
  id: string;
  parentId: string;
  studentId: string;
  category: string;
  rating: number;
  comments?: string;
  isAnonymous: boolean;
  createdAt: Date;
  respondedAt?: Date;
  response?: string;
}

// Request Interfaces
export interface ICreateParentRequest {
  userId: string;
  relationship: TParentRelationship;
  isPrimaryContact: boolean;
  emergencyContact: boolean;
  portalAccessLevel: TPortalAccessLevel;
  notificationPreferences: INotificationPreferences;
  children: IParentChildRequest[];
  contactInformation: IParentContact;
  profile: IParentProfile;
  schoolId: string;
}

export interface IParentChildRequest {
  studentId: string;
  relationship: TParentRelationship;
  isPrimaryGuardian: boolean;
  emergencyContact: boolean;
  accessPermissions: IChildAccessPermissions;
}

export interface IUpdateParentRequest {
  relationship?: TParentRelationship;
  isPrimaryContact?: boolean;
  emergencyContact?: boolean;
  portalAccessLevel?: TPortalAccessLevel;
  notificationPreferences?: Partial<INotificationPreferences>;
  contactInformation?: Partial<IParentContact>;
  profile?: Partial<IParentProfile>;
}

export interface ICreateCommunicationRequest {
  parentId: string;
  type: TCommunicationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedTo?: {
    type: 'student' | 'class' | 'school';
    id: string;
  };
  attachments?: IAttachment[];
  requiresResponse?: boolean;
  expiresAt?: Date;
}

export interface ICreateAppointmentRequest {
  parentId: string;
  studentId: string;
  teacherId: string;
  subject: string;
  purpose: string;
  requestedDate: Date;
  requestedTime: string;
  duration: number;
  notes?: string;
}

export interface IParentFeedbackRequest {
  studentId: string;
  category: string;
  rating: number;
  comments?: string;
  isAnonymous?: boolean;
}

// Response Interfaces
export interface IParentResponse extends Omit<IParent, 'userId' | 'children' | 'contactInformation' | 'profile'> {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  childrenSummary: {
    count: number;
    primaryChildren: string[];
    grades: string[];
  };
  contactSummary: {
    primaryEmail: string;
    primaryPhone: string;
    city: string;
    state: string;
  };
  profileSummary: {
    fullName: string;
    occupation?: string;
    languages: string[];
  };
  portalStats: {
    lastLoginAt?: Date;
    totalLogins: number;
    unreadMessages: number;
    upcomingAppointments: number;
  };
}

export interface IParentListResponse {
  parents: IParentResponse[];
  total: number;
  page: number;
  limit: number;
  summary: {
    activeParents: number;
    primaryContacts: number;
    totalChildren: number;
    averageChildrenPerParent: number;
  };
}

export interface IParentCommunicationResponse extends Omit<IParentCommunication, 'parentId'> {
  parent: {
    id: string;
    name: string;
    email: string;
  };
  timeAgo: string;
  isExpired: boolean;
  daysUntilExpiry?: number;
}

export interface IParentAppointmentResponse extends Omit<IParentAppointment, 'parentId' | 'teacherId'> {
  parent: {
    id: string;
    name: string;
    email: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  student: {
    id: string;
    name: string;
    grade: string;
    class: string;
  };
  timeAgo: string;
  isUpcoming: boolean;
  daysUntilAppointment?: number;
}

export interface IParentDashboardResponse extends IParentDashboard {
  parent: {
    id: string;
    name: string;
    email: string;
  };
  systemStatus: {
    lastUpdated: Date;
    dataFreshness: 'fresh' | 'stale' | 'outdated';
    nextUpdate: Date;
  };
}

export interface IParentStatisticsResponse {
  totalParents: number;
  activeParents: number;
  parentsByRelationship: Record<TParentRelationship, number>;
  parentsByAccessLevel: Record<TPortalAccessLevel, number>;
  communicationStats: {
    totalCommunications: number;
    unreadCommunications: number;
    averageResponseTime: number;
    communicationsByType: Record<TCommunicationType, number>;
  };
  appointmentStats: {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    averageWaitTime: number;
  };
  engagementStats: {
    averageLoginsPerWeek: number;
    mostActiveTime: string;
    topFeaturesUsed: string[];
    parentSatisfactionScore: number;
  };
  childrenStats: {
    totalChildren: number;
    averageChildrenPerParent: number;
    childrenByGrade: Record<string, number>;
    childrenByClass: Record<string, number>;
  };
}

// Filter and Query Interfaces
export interface IParentFilters {
  schoolId: string;
  relationship?: TParentRelationship;
  accessLevel?: TPortalAccessLevel;
  isActive?: boolean;
  isPrimaryContact?: boolean;
  hasChildren?: boolean;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  search?: string;
}

export interface ICommunicationFilters {
  parentId?: string;
  type?: TCommunicationType;
  priority?: string;
  isRead?: boolean;
  requiresResponse?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

export interface IAppointmentFilters {
  parentId?: string;
  studentId?: string;
  teacherId?: string;
  status?: TAppointmentStatus;
  requestedDateFrom?: Date;
  requestedDateTo?: Date;
  search?: string;
}

// Dashboard Interfaces
export interface IParentPortalConfig {
  features: {
    dashboard: boolean;
    communications: boolean;
    appointments: boolean;
    grades: boolean;
    attendance: boolean;
    fees: boolean;
    assignments: boolean;
    timetable: boolean;
    reports: boolean;
    emergencyContacts: boolean;
  };
  customization: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  notifications: INotificationPreferences;
  security: {
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
  };
}

// All types are exported above with their declarations