// Academia Pro - School Admin Types
// Shared type definitions for school admin module

import { IClass, ISubject } from '../shared';

// Dashboard and Overview
export interface ISchoolAdminOverview {
  schoolName: string;
  totalStudents: number;
  totalStaff: number;
  staffPresent: number;
  feesCollected: number;
  averagePerformance: number;
  studentGrowth: number;
  attendanceRate: number;
  feeCollectionRate: number;
  performanceTrend: number;
  studentAttendanceRate: number;
  staffAttendanceRate: number;
  recentActivities: ISchoolAdminActivity[];
  alerts: ISchoolAdminAlert[];
}

// Student Management
export interface ISchoolAdminStudent {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  grade: string;
  section: string;
  enrollmentDate?: string;
  photo?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  attendanceRate: number;
  parentContact: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
  };
  academicPerformance: {
    averageGrade: number;
    subjects: ISchoolAdminSubjectGrade[];
  };
}

export interface ISchoolAdminSubjectGrade {
  subject: string;
  grade: string;
  score: number;
}

export interface ISchoolAdminStudentFilters {
  search?: string;
  grade?: string;
  section?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ISchoolAdminCreateStudentRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  grade: string;
  section: string;
  parentFirstName: string;
  parentLastName: string;
  parentMiddleName?: string;
  parentEmail: string;
  parentPhone: string;
}

export interface ISchoolAdminUpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  grade?: string;
  section?: string;
  status?: string;
  parentContact?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
  };
}

// Bulk Import Types
export interface IBulkImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: Record<string, any>;
  }>;
  preview: Array<{
    row: number;
    data: Record<string, any>;
    valid: boolean;
    errors: string[];
  }>;
}

export interface IBulkImportRequest {
  file: File;
  schoolId: string;
}

// Promotion Types
export interface IPromotionRequest {
  scope: 'all' | 'grade' | 'section' | 'students';
  gradeCode?: string;
  streamSection?: string;
  studentIds?: string[];
  targetGradeCode: string;
  academicYear: string;
  includeRepeaters?: boolean;
  reason?: string;
}

export interface IPromotionResult {
  promotedStudents: number;
  studentIds: string[];
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}

// Graduation Types
export interface IGraduationRequest {
  studentIds?: string[];
  graduationYear: number;
  clearanceStatus: 'cleared' | 'pending';
}

export interface IGraduationResult {
  graduatedStudents: number;
  studentIds: string[];
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}

// Transfer Types
export interface ITransferStudentRequest {
  studentId: string;
  newGradeCode?: string;
  newStreamSection?: string;
  reason?: string;
  effectiveDate?: string;
  type?: 'internal' | 'external';
  targetSchoolId?: string;
}

export interface ITransferResult {
  success: boolean;
  studentId: string;
  message: string;
  transferId?: string;
}

// Clearance Types
export interface IClearanceStatus {
  fees: boolean;
  library: boolean;
  hostel: boolean;
  discipline: boolean;
  documents: boolean;
}

export interface IClearanceUpdateRequest {
  studentId: string;
  item: keyof IClearanceStatus;
  status: boolean;
}

// Staff Management
export interface ISchoolAdminStaff {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  role: string;
  department: string;
  photo?: string;
  status: 'active' | 'inactive';
  attendanceRate: number;
  performanceRating: number;
  subjects?: string[];
}

export interface ISchoolAdminStaffFilters {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ISchoolAdminCreateStaffRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  role: string;
  department: string;
  subjects?: string[];
}

export interface ISchoolAdminUpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
  subjects?: string[];
}

// Academic Management
// IClass moved to shared

// ISubject moved to shared

export interface IFeePayment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'overdue';
  feeType: string;
}

// Communication
export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'financial' | 'emergency';
  targetAudience: 'all' | 'students' | 'parents' | 'staff';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface ICreateAnnouncementRequest {
  title: string;
  content: string;
  type: 'general' | 'academic' | 'financial' | 'emergency';
  targetAudience: 'all' | 'students' | 'parents' | 'staff';
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

// Reports and Analytics
export interface IAttendanceReport {
  period: string;
  summary: {
    totalStudents: number;
    averageAttendance: number;
    totalPresent: number;
    totalAbsent: number;
  };
  dailyBreakdown: Array<{
    date: string;
    present: number;
    absent: number;
  }>;
  gradeWise: Array<{
    grade: string;
    attendanceRate: number;
  }>;
}

export interface IFinancialReport {
  period: string;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    outstandingFees: number;
  };
  feeCollection: {
    collected: number;
    pending: number;
    overdue: number;
  };
  expenses: {
    staffSalaries: number;
    utilities: number;
    maintenance: number;
    supplies: number;
  };
}

export interface IAcademicReport {
  period: string;
  summary: {
    totalStudents: number;
    averageGPA: number;
    passRate: number;
    topPerformers: number;
  };
  gradeDistribution: Record<string, number>;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    passRate: number;
  }>;
}

// Common Types
export interface ISchoolAdminActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
}

export interface ISchoolAdminAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface IPaginatedResponse<T> {
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