// Academia Pro - Student Shared Types
// Shared types and interfaces for student management across frontend and backend

import { IAddress, IDocument, IEmergencyContact, IInsuranceInfo, TBloodGroup, Student } from '../shared';
import { IUser, EUserStatus } from '../users';

// Re-export for convenience
export type { TBloodGroup };

// Enums
export enum TStudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

export enum TEnrollmentType {
  REGULAR = 'regular',
  SPECIAL_NEEDS = 'special_needs',
  GIFTED = 'gifted',
  INTERNATIONAL = 'international',
  TRANSFER = 'transfer',
}

export enum TStudentStage {
  EY = 'EY', // Early Years: Creche, Nursery, KG
  PRY = 'PRY', // Primary 1-6
  JSS = 'JSS', // Junior Secondary 1-3
  SSS = 'SSS', // Senior Secondary 1-3
}

export type TGradeCode =
  | 'CRECHE' | 'N1' | 'N2' | 'KG1' | 'KG2' // EY
  | 'PRY1' | 'PRY2' | 'PRY3' | 'PRY4' | 'PRY5' | 'PRY6' // PRY
  | 'JSS1' | 'JSS2' | 'JSS3' // JSS
  | 'SSS1' | 'SSS2' | 'SSS3'; // SSS

// Interfaces
export interface IStudent extends IUser {
  admissionNumber: string;
  stage: TStudentStage;
  gradeCode: TGradeCode;
  streamSection: string;
  admissionDate: string;
  enrollmentType: TEnrollmentType;
  userId?: string;
  status: EUserStatus;
  isBoarding: boolean;
  promotionHistory: IPromotionHistory[];
  transferHistory: ITransferHistory[];
  graduationYear?: number;
  parents?: IParentsInfo;
  medicalInfo?: IMedicalInfo;
  transportation?: ITransportationInfo;
  hostel?: IHostelInfo;
  financialInfo: IStudentFinancialInfo;
  documents: IDocument[];
  preferences: IStudentPreferences;
  gpa?: number;
  totalCredits?: number;
  academicStanding: IAcademicStanding;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface IParentsInfo {
  father?: IParentInfo;
  mother?: IParentInfo;
  guardian?: IGuardianInfo;
}

export interface IParentInfo {
  name: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
}

export interface IGuardianInfo {
  name: string;
  phone: string;
  email?: string;
  relation: string;
  address?: string;
}

export interface IMedicalInfo {
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact: IEmergencyContact;
  doctorInfo?: IDoctorInfo;
  insuranceInfo?: IInsuranceInfo;
}

export interface IDoctorInfo {
  name: string;
  phone: string;
  clinic: string;
}

export enum TTransportationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
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

export interface IHostelInfo {
  required: boolean;
  hostelId?: string;
  roomId?: string;
  roomNumber?: string;
  bedNumber?: string;
  fee?: number;
}

export interface IStudentFinancialInfo {
  feeCategory: string;
  scholarship?: IScholarshipInfo;
  outstandingBalance: number;
  paymentPlan?: string;
  lastPaymentDate?: Date;
}

export interface IScholarshipInfo {
  type: string;
  amount: number;
  percentage: number;
  validUntil: Date;
}

export interface IStudentPreferences {
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    parentCommunication: boolean;
  };
  extracurricular: string[];
  careerInterests?: string[];
}

export interface IAcademicStanding {
  honors?: boolean;
  probation?: boolean;
  academicWarning?: boolean;
  disciplinaryStatus?: string;
}

export interface IPromotionHistory {
  fromGrade: TGradeCode;
  toGrade: TGradeCode;
  academicYear: string;
  performedBy: string; // userId
  timestamp: Date;
  reason?: string;
}

export interface ITransferHistory {
  fromSchool?: string;
  toSchool?: string;
  fromSection?: string;
  toSection?: string;
  reason: string;
  academicYear?: string;
  timestamp: Date;
  type: 'internal' | 'external';
}

// Request Types
export interface ICreateStudentRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: TBloodGroup;
  email?: string;
  phone?: string;
  address?: IAddress;
  admissionNumber: string;
  stage: TStudentStage;
  gradeCode: TGradeCode;
  streamSection: string;
  admissionDate: string;
  enrollmentType: TEnrollmentType;
  schoolId: string;
  userId?: string;
  isBoarding?: boolean;
  parents?: IParentsInfo;
  medicalInfo?: IMedicalInfo;
  transportation?: ITransportationInfo;
  hostel?: IHostelInfo;
}

export interface IUpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: TBloodGroup;
  email?: string;
  phone?: string;
  address?: IAddress;
  admissionNumber?: string;
  stage?: TStudentStage;
  gradeCode?: TGradeCode;
  streamSection?: string;
  admissionDate?: string;
  enrollmentType?: TEnrollmentType;
  schoolId?: string;
  userId?: string;
  status?: EUserStatus;
  isBoarding?: boolean;
  promotionHistory?: IPromotionHistory[];
  transferHistory?: ITransferHistory[];
  graduationYear?: number;
  parents?: IParentsInfo;
  medicalInfo?: IMedicalInfo;
  transportation?: ITransportationInfo;
  hostel?: IHostelInfo;
  financialInfo?: Partial<IStudentFinancialInfo>;
  documents?: IDocument[];
  preferences?: Partial<IStudentPreferences>;
  gpa?: number;
  totalCredits?: number;
  academicStanding?: Partial<IAcademicStanding>;
  reason?: string; // Reason for the student details update (for audit purposes)
}

export interface IStudentFilters {
  schoolId?: string;
  stage?: TStudentStage;
  gradeCode?: TGradeCode;
  streamSection?: string;
  status?: EUserStatus;
  enrollmentType?: TEnrollmentType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUpdateMedicalInfoRequest {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: IEmergencyContact;
  doctorInfo?: IDoctorInfo;
  insuranceInfo?: IInsuranceInfo;
}

export interface IAddDocumentRequest {
  type: string;
  fileName: string;
  fileUrl: string;
  verified?: boolean;
}

// Response Types
export interface IStudentResponse extends IStudent {
  fullName: string;
  age: number;
  isActive: boolean;
  hasTransportation: boolean;
  hasHostel: boolean;
  hasScholarship: boolean;
}

export interface IStudentsListResponse {
  students: IStudentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface IStudentStatisticsResponse {
  totalStudents: number;
  activeStudents: number;
  studentsByGrade: Record<string, number>;
  studentsByStatus: Record<EUserStatus, number>;
  studentsByEnrollmentType: Record<TEnrollmentType, number>;
}

export interface IStudentSearchResponse {
  students: IStudentResponse[];
  total: number;
}

// Query Types
export interface IStudentQuery {
  schoolId?: string;
  grade?: string;
  section?: string;
  status?: EUserStatus;
  enrollmentType?: TEnrollmentType;
  search?: string;
  page?: number;
  limit?: number;
}

// Validation Types
export interface IStudentValidationRules {
  firstName: {
    minLength: number;
    maxLength: number;
  };
  lastName: {
    minLength: number;
    maxLength: number;
  };
  middleName?: {
    minLength: number;
    maxLength: number;
  };
  admissionNumber: {
    pattern: string;
    maxLength: number;
  };
  currentGrade: {
    maxLength: number;
  };
  currentSection: {
    maxLength: number;
  };
}

// Bulk Import Types
export interface IStudentImportData {
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  DateOfBirth: string;
  Gender: 'male' | 'female' | 'other';
  BloodGroup?: string;
  Email?: string;
  Phone?: string;
  AdmissionNumber: string;
  Stage: string;
  GradeCode: string;
  StreamSection: string;
  AdmissionDate: string;
  EnrollmentType: string;
  FatherName?: string;
  FatherPhone?: string;
  FatherEmail?: string;
  MotherName?: string;
  MotherPhone?: string;
  MotherEmail?: string;
  AddressStreet?: string;
  AddressCity?: string;
  AddressState?: string;
  AddressPostalCode?: string;
  AddressCountry?: string;
}

// All types are exported above with their declarations

// Grade mapping for school settings (to be used in school.types.ts as well)
export interface IGradeMapping {
  gradeCode: TGradeCode;
  displayName: string;
  order: number;
  stage: TStudentStage;
  minAge?: number;
  maxAge?: number;
}