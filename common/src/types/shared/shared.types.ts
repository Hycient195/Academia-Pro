// Academia Pro - Shared Types
// Common types used across multiple modules

import { z } from 'zod';
import { TMessagePriority } from '../communication';


export interface IDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  isVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
  address: string
}

export interface IDepreciationEntry {
  period: string; // '2024-Q1', '2024-01'
  depreciationAmount: number;
  accumulatedDepreciation: number;
  currentValue: number;
  calculationDate: Date;
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

export enum TCommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  CALL = 'call',
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

export interface INotification {
  id: string;
  type: TCommunicationType;
  communicationChannel: TCommunicationChannel,
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

export enum TDepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

export interface IInsuranceInfo {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  deductible: number;
}

export interface IFinancialInfo {
  purchasePrice: number;
  salvageValue: number;
  usefulLife: number; // years
  depreciationMethod: TDepreciationMethod;
  accumulatedDepreciation: number;
  currentValue: number;
  depreciationSchedule: IDepreciationEntry[];
  insurance?: IInsuranceInfo;
}

// Filter and Query Interfaces
export interface ISchoolFilters {
  type?: TSchoolType;
  status?: TSchoolStatus;
  city?: string;
  state?: string;
  country?: string;
  establishedAfter?: string;
  establishedBefore?: string;
  minStudents?: number;
  maxStudents?: number;
  hasFacilities?: string[];
  search?: string;
}

export enum TBloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Base Entity Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}

// User and Authentication Types
export type UserRole = 'super-admin' | 'school-admin' | 'teacher' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';

// Base User interface (moved from util.types.ts for consistency)
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: IAddress;
  schoolId?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  passwordHash?: string; // Only used in backend
}

// Entity-specific User Types
export interface Teacher extends User {
  role: 'teacher';
  employeeId: string;
  department?: string;
  subjects: string[];
  qualifications: Qualification[];
  experience: number; // years
  specializations: string[];
  classTeacherOf?: string[]; // Section IDs
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  gradeId: string;
  sectionId: string;
  enrollmentDate: Date;
  parentIds: string[];
  emergencyContacts: EmergencyContact[];
  medicalInfo?: MedicalInfo;
  academicInfo: AcademicInfo;
}

export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  occupation?: string;
  workplace?: string;
  emergencyContact: boolean;
}

// Supporting Types for User Entities
export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  grade?: string;
  specialization?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: IAddress;
  isPrimary: boolean;
}

export interface MedicalInfo {
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface AcademicInfo {
  previousSchool?: string;
  transferCertificate?: string;
  achievements?: string[];
  specialNeeds?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  languageProficiency?: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  system: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'school-only';
  contactVisibility: 'public' | 'private' | 'school-only';
  dataSharing: boolean;
}

// IAddress Types

// School Types
export type SchoolStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export enum TSchoolType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  MIXED = 'mixed',
}

export enum TSchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export interface School {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: IAddress;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  status: SchoolStatus;
  type: 'primary' | 'secondary' | 'mixed';
  establishedYear?: number;
  accreditation?: string;
  timezone: string;
  currency: string;
  language: string;
  settings: SchoolSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolSettings {
  academicYear: {
    startMonth: number;
    endMonth: number;
  };
  workingDays: number[];
  attendance: {
    requiredPercentage: number;
    gracePeriodMinutes: number;
  };
  grading: {
    scale: 'percentage' | 'gpa' | 'letter';
    passingGrade: number;
  };
  communication: {
    primaryLanguage: string;
    supportedLanguages: string[];
  };
}

// Academic Types
export interface Grade {
  id: string;
  name: string;
  level: number;
  schoolId: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  gradeId: string;
  capacity: number;
  currentEnrollment: number;
  classTeacherId?: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Settings and Configuration
export interface ISchoolSettings {
  schoolId: string;
  generalSettings: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  academicSettings: {
    academicYearFormat: string;
    gradingScale: Array<{
      grade: string;
      minScore: number;
      maxScore: number;
      description: string;
    }>;
    attendanceThreshold: number;
    promotionCriteria: {
      minimumAttendance: number;
      minimumGrade: string;
      requiredSubjects: string[];
    };
  };
  communicationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    parentPortalEnabled: boolean;
    studentPortalEnabled: boolean;
    emergencyAlertsEnabled: boolean;
  };
  securitySettings: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorEnabled: boolean;
  };
}

export enum TGradeLevel {
  NURSERY = 'nursery',
  LKG = 'lkg',
  UKG = 'ukg',
  GRADE_1 = 'grade_1',
  GRADE_2 = 'grade_2',
  GRADE_3 = 'grade_3',
  GRADE_4 = 'grade_4',
  GRADE_5 = 'grade_5',
  GRADE_6 = 'grade_6',
  GRADE_7 = 'grade_7',
  GRADE_8 = 'grade_8',
  GRADE_9 = 'grade_9',
  GRADE_10 = 'grade_10',
  GRADE_11 = 'grade_11',
  GRADE_12 = 'grade_12',
}

export enum TSubjectType {
  CORE = 'core',
  ELECTIVE = 'elective',
  PRACTICAL = 'practical',
  LANGUAGE = 'language',
  ARTS = 'arts',
  SPORTS = 'sports',
}

export interface IClassSubject {
  subjectId: string;
  subject: ISubject;
  teacherId: string;
  schedule: ISubjectSchedule[];
}

export interface ISubjectSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface ISubject {
  id: string;
  code: string;
  name: string;
  type: TSubjectType;
  description?: string;
  grade: string;
  teacherId?: string;
  credits?: number;
  prerequisites?: string[];
  gradeLevels: TGradeLevel[];
  isActive: boolean;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass {
  id: string;
  name: string;
  gradeLevel: TGradeLevel;
  section: string;
  capacity: number;
  currentEnrollment: number;
  classTeacherId?: string;
  academicYear: string;
  subjects: IClassSubject[];
  isActive: boolean;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common Status Types
export type Status = 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and Filter Types
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startswith';
  value: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    timestamp: Date;
    version: string;
    requestId: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  folder?: string;
}

// Audit Trail Types
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  userRole: UserRole;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Notification Types
export type TNotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface Notification {
  id: string;
  type: TNotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  recipients: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Common Validation Schemas
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
});

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Export commonly used type unions
export type AnyEntity = User | School | Grade | Section | ISubject;
export type AnyStatus = Status | UserStatus | SchoolStatus | ApprovalStatus;
export type AnyRole = UserRole;