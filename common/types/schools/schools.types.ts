// Academia Pro - Schools Management Types
// Shared type definitions for schools management module

import { IAddress, TSchoolType, TSchoolStatus, ISchoolFilters } from '../shared';

// Re-export for convenience
export { TSchoolType, TSchoolStatus };
export type { ISchoolFilters };

// Enums - moved to shared types

// Interfaces
// IAddress interface moved to shared types

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
export interface ISchoolCreateSchoolRequest {
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

export interface ISchoolUpdateSchoolRequest {
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
    totalStaff: number;
    byType: Record<TSchoolType, number>;
    byStatus: Record<TSchoolStatus, number>;
  };
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
  updates: Partial<ISchoolUpdateSchoolRequest>;
}

export interface IBulkSchoolCreateRequest {
  schools: ISchoolCreateSchoolRequest[];
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

// All types are exported above with their declarations