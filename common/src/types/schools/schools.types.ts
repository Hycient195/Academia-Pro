// Academia Pro - Schools Management Types
// Shared type definitions for schools management module

// Enums
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

// Interfaces
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

export interface ISchool {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type?: TSchoolType;
  status: TSchoolStatus;
  address?: IAddress;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  totalStudents?: number;
  totalTeachers?: number;
  totalStaff?: number;
  establishedDate?: Date;
  accreditationStatus?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  workingDays?: string[];
  academicYearStart?: string;
  academicYearEnd?: string;
  gradingSystem?: string;
  logoUrl?: string;
  bannerUrl?: string;
  socialMediaLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  facilities?: string[];
  amenities?: string[];
  policies?: {
    attendance?: string;
    discipline?: string;
    uniform?: string;
    technology?: string;
  };
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Request Interfaces
export interface ICreateSchoolRequest {
  name: string;
  code?: string;
  description?: string;
  type?: TSchoolType;
  address?: IAddress;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  totalStudents?: number;
  totalTeachers?: number;
  totalStaff?: number;
  establishedDate?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  workingDays?: string[];
  academicYearStart?: string;
  academicYearEnd?: string;
  gradingSystem?: string;
  facilities?: string[];
  amenities?: string[];
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  }>;
  metadata?: Record<string, any>;
}

export interface IUpdateSchoolRequest {
  name?: string;
  code?: string;
  description?: string;
  type?: TSchoolType;
  status?: TSchoolStatus;
  address?: IAddress;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  totalStudents?: number;
  totalTeachers?: number;
  totalStaff?: number;
  establishedDate?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  workingDays?: string[];
  academicYearStart?: string;
  academicYearEnd?: string;
  gradingSystem?: string;
  facilities?: string[];
  amenities?: string[];
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  }>;
  metadata?: Record<string, any>;
}

// Response Interfaces
export interface ISchoolResponse extends Omit<ISchool, 'createdBy' | 'updatedBy'> {
  fullAddress: string;
  isActive: boolean;
  studentTeacherRatio?: number;
  contactInfo: {
    primaryPhone: string;
    primaryEmail: string;
    website?: string;
  };
  statistics: {
    totalClasses: number;
    totalSubjects: number;
    activeStudents: number;
    activeTeachers: number;
  };
}

export interface ISchoolListResponse {
  schools: ISchoolResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalSchools: number;
    activeSchools: number;
    totalStudents: number;
    totalTeachers: number;
    byType: Record<TSchoolType, number>;
    byStatus: Record<TSchoolStatus, number>;
  };
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

export interface ISchoolQuery {
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
  page?: number;
  limit?: number;
}

// Statistics and Analytics
export interface ISchoolStatistics {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  averageStudentsPerSchool: number;
  averageTeachersPerSchool: number;
  averageStudentTeacherRatio: number;
  schoolsByType: Record<TSchoolType, number>;
  schoolsByStatus: Record<TSchoolStatus, number>;
  schoolsByRegion: Record<string, number>;
  enrollmentTrends: Array<{
    year: string;
    totalStudents: number;
    growthRate: number;
  }>;
  performanceMetrics: {
    averageAttendanceRate: number;
    averageGraduationRate: number;
    averageTestScores: number;
  };
}

// Bulk Operations
export interface IBulkSchoolUpdateRequest {
  schoolIds: string[];
  updates: Partial<IUpdateSchoolRequest>;
}

export interface IBulkSchoolCreateRequest {
  schools: ICreateSchoolRequest[];
}

// Validation Rules
export interface ISchoolValidationRules {
  name: {
    minLength: number;
    maxLength: number;
    pattern: string;
  };
  code: {
    minLength: number;
    maxLength: number;
    pattern: string;
  };
  phone: {
    pattern: string;
    maxLength: number;
  };
  email: {
    pattern: string;
    maxLength: number;
  };
  website: {
    pattern: string;
    maxLength: number;
  };
  address: {
    street: {
      minLength: number;
      maxLength: number;
    };
    city: {
      minLength: number;
      maxLength: number;
    };
    postalCode: {
      pattern: string;
      maxLength: number;
    };
  };
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

// All types are exported above with their declarations