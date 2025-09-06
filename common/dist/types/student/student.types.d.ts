import { IAddress, IDocument, IEmergencyContact, IInsuranceInfo, TBloodGroup } from '../shared';
export type { TBloodGroup };
export declare enum TStudentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    GRADUATED = "graduated",
    TRANSFERRED = "transferred",
    WITHDRAWN = "withdrawn",
    SUSPENDED = "suspended"
}
export declare enum TEnrollmentType {
    REGULAR = "regular",
    SPECIAL_NEEDS = "special_needs",
    GIFTED = "gifted",
    INTERNATIONAL = "international",
    TRANSFER = "transfer"
}
export interface IStudent {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: TBloodGroup;
    email?: string;
    phone?: string;
    address?: IAddress;
    admissionNumber: string;
    currentGrade: string;
    currentSection: string;
    admissionDate: Date;
    enrollmentType: TEnrollmentType;
    schoolId: string;
    userId?: string;
    status: TStudentStatus;
    parents?: IParentsInfo;
    medicalInfo?: IMedicalInfo;
    transportation?: ITransportationInfo;
    hostel?: IHostelInfo;
    financialInfo: IStucentFinancialInfo;
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
export declare enum TTransportationStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
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
export interface IStucentFinancialInfo {
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
    admissionNumber?: string;
    currentGrade: string;
    currentSection: string;
    admissionDate: string;
    enrollmentType?: TEnrollmentType;
    schoolId: string;
    userId?: string;
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
    currentGrade?: string;
    currentSection?: string;
    admissionDate?: string;
    enrollmentType?: TEnrollmentType;
    schoolId?: string;
    userId?: string;
    status?: TStudentStatus;
    parents?: IParentsInfo;
    medicalInfo?: IMedicalInfo;
    transportation?: ITransportationInfo;
    hostel?: IHostelInfo;
    financialInfo?: Partial<IStucentFinancialInfo>;
    documents?: IDocument[];
    preferences?: Partial<IStudentPreferences>;
    gpa?: number;
    totalCredits?: number;
    academicStanding?: Partial<IAcademicStanding>;
}
export interface IStudentFilters {
    schoolId?: string;
    grade?: string;
    section?: string;
    status?: TStudentStatus;
    enrollmentType?: TEnrollmentType;
    search?: string;
    page?: number;
    limit?: number;
}
export interface ITransferStudentRequest {
    newGrade: string;
    newSection: string;
    reason?: string;
    effectiveDate?: string;
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
    studentsByStatus: Record<TStudentStatus, number>;
    studentsByEnrollmentType: Record<TEnrollmentType, number>;
}
export interface IStudentSearchResponse {
    students: IStudentResponse[];
    total: number;
}
export interface IStudentQuery {
    schoolId?: string;
    grade?: string;
    section?: string;
    status?: TStudentStatus;
    enrollmentType?: TEnrollmentType;
    search?: string;
    page?: number;
    limit?: number;
}
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
