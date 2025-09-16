// Academia Pro - Student Types for School Admin
// Consolidated type definitions for student management

import { TStudentStage, TGradeCode, IParentsInfo, IMedicalInfo, ITransportationInfo, IHostelInfo, IStudentFinancialInfo, IStudentPreferences, IAcademicStanding, IPromotionHistory, ITransferHistory, IDoctorInfo } from '../student';
import { IInsuranceInfo } from '../shared';
import { IDocument } from '../shared';

export interface IStudent {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  stage: TStudentStage;
  gradeCode: TGradeCode;
  streamSection: string;
  admissionDate: string;
  enrollmentType: 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer';
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn' | 'suspended';
  enrollmentDate: string;
  isBoarding: boolean;
  avatar?: string;
  parentInfo: {
    fatherFirstName: string;
    fatherLastName: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherFirstName: string;
    motherLastName: string;
    motherPhone?: string;
    motherEmail?: string;
    motherOccupation?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianOccupation?: string;
    guardianRelation?: string;
  };
  parents?: IParentsInfo;
  medicalInfo?: IMedicalInfo;
  transportation?: ITransportationInfo;
  hostel?: IHostelInfo;
  financialInfo?: IStudentFinancialInfo;
  documents?: IDocument[];
  preferences?: IStudentPreferences;
  gpa?: number;
  totalCredits?: number;
  academicStanding?: IAcademicStanding;
  promotionHistory?: IPromotionHistory[];
  transferHistory?: ITransferHistory[];
  graduationYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStudentRequest {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  gradeCode: string;
  streamSection: string;
  enrollmentType: 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer';
  parentInfo: {
    fatherFirstName: string;
    fatherLastName: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherFirstName: string;
    motherLastName: string;
    motherPhone?: string;
    motherEmail?: string;
    motherOccupation?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianOccupation?: string;
    guardianRelation?: string;
  };
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      relation: string;
    };
    doctorInfo?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      clinic?: string;
      occupation?: string;
    };
    insuranceInfo?: IInsuranceInfo;
  };
}

export interface IUpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address?: Partial<{
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }>;
  gradeCode?: string;
  streamSection?: string;
  enrollmentType?: 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer';
  status?: 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn' | 'suspended';
  parentInfo?: Partial<{
    fatherFirstName: string;
    fatherLastName: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherFirstName: string;
    motherLastName: string;
    motherPhone?: string;
    motherEmail?: string;
    motherOccupation?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianOccupation?: string;
    guardianRelation?: string;
    guardianCustomRelation?: string;
  }>;
  medicalInfo?: Partial<{
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      relation: string;
      occupation?: string;
      customRelation?: string;
    };
    doctorInfo?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      clinic?: string;
      occupation?: string;
    };
    insuranceInfo?: IInsuranceInfo;
  }>;
}

export interface ITransferStudentRequest {
  type?: 'internal' | 'external';
  schoolId?: string;
  gradeCode?: string;
  streamSection?: string;
  transferReason?: string;
  transferDate?: string;
  targetSchoolId?: string;
  newGradeCode?: string;
  newStreamSection?: string;
}

export interface IAssignClassRequest {
  gradeCode: string;
  streamSection: string;
  effectiveDate: string;
}

export interface IPromotionRequestDto {
  scope: 'all' | 'grade' | 'section' | 'students';
  gradeCode?: string;
  streamSection?: string;
  studentIds?: string[];
  targetGradeCode: string;
  academicYear: string;
  includeRepeaters?: boolean;
  reason?: string;
}

export interface IBulkImportRequestDto {
  schoolId: string;
  data: Array<{
    admissionNumber: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    gradeCode: string;
    streamSection: string;
    fatherName: string;
    motherName: string;
    phone?: string;
    email?: string;
  }>;
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  };
}

export interface IGraduationRequestDto {
  schoolId: string;
  gradeCode: string;
  graduationYear: number;
  studentIds?: string[];
}

export interface ITransferStudentRequestDto {
  fromSchoolId: string;
  toSchoolId: string;
  studentIds: string[];
  transferReason: string;
  transferDate: string;
}

export interface IStudentStatistics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  graduatedStudents: number;
  transferredStudents: number;
  withdrawnStudents: number;
  suspendedStudents: number;
  byGrade: Record<string, number>;
  bySection: Record<string, number>;
  byEnrollmentType: Record<string, number>;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  attendanceRate: number;
  averageAge: number;
}

export interface IStudentFilters {
  schoolId?: string;
  stages?: string[];
  gradeCodes?: string[];
  streamSections?: string[];
  statuses?: string[];
  enrollmentType?: 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer';
  search?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: 'male' | 'female' | 'other';
  admissionNumber?: string;
  dateOfBirthFrom?: string;
  dateOfBirthTo?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  isBoarding?: boolean;
  email?: string;
  phone?: string;
}

export interface IStudentSearchParams extends IStudentFilters {
  page?: number;
  limit?: number;
}

export interface IStudentSearchResult {
  data: IStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Bulk operation response types
export interface IBulkOperationResult {
  success: boolean;
  message: string;
  processed: number;
  errors: string[];
}

export interface IPromotionResult extends IBulkOperationResult {
  promoted: number;
}

export interface IBulkImportResult extends IBulkOperationResult {
  imported: number;
  skipped: number;
  failed: number;
}

export interface IGraduationResult extends IBulkOperationResult {
  graduated: number;
}

export interface ITransferResult extends IBulkOperationResult {
  transferred: number;
}