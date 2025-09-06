import { IAddress, IDocument, IEmergencyContact, TBloodGroup } from '../shared';
export { TBloodGroup };
export type { IAddress, IEmergencyContact };
export declare enum TEmploymentType {
    FULL_TIME = "full_time",
    PART_TIME = "part_time",
    CONTRACT = "contract",
    TEMPORARY = "temporary",
    INTERN = "intern"
}
export declare enum TEmploymentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    TERMINATED = "terminated",
    ON_LEAVE = "on_leave",
    SUSPENDED = "suspended"
}
export declare enum TDepartment {
    ACADEMIC = "academic",
    ADMINISTRATIVE = "administrative",
    SUPPORT = "support",
    TECHNICAL = "technical",
    MEDICAL = "medical",
    SECURITY = "security",
    TRANSPORT = "transport",
    HOSTEL = "hostel",
    LIBRARY = "library",
    SPORTS = "sports"
}
export declare enum TPosition {
    PRINCIPAL = "principal",
    VICE_PRINCIPAL = "vice_principal",
    HEADMASTER = "headmaster",
    TEACHER = "teacher",
    LIBRARIAN = "librarian",
    ACCOUNTANT = "accountant",
    ADMINISTRATOR = "administrator",
    CLERK = "clerk",
    DRIVER = "driver",
    SECURITY_GUARD = "security_guard",
    NURSE = "nurse",
    TECHNICIAN = "technician",
    JANITOR = "janitor",
    COOK = "cook",
    SECRETARY = "secretary"
}
export declare enum TQualificationLevel {
    HIGH_SCHOOL = "high_school",
    DIPLOMA = "diploma",
    BACHELORS = "bachelors",
    MASTERS = "masters",
    PHD = "phd",
    PROFESSIONAL_CERTIFICATION = "professional_certification"
}
export declare enum TLeaveType {
    ANNUAL = "annual",
    SICK = "sick",
    MATERNITY = "maternity",
    PATERNITY = "paternity",
    EMERGENCY = "emergency",
    STUDY = "study",
    SABBATICAL = "sabbatical"
}
export declare enum TLeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export interface IStaff {
    id: string;
    employeeId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    address: IAddress;
    department: TDepartment;
    position: TPosition;
    employmentType: TEmploymentType;
    employmentStatus: TEmploymentStatus;
    hireDate: Date;
    contractEndDate?: Date;
    salary: ISalaryInfo;
    qualifications: IQualification[];
    emergencyContact: IEmergencyContact;
    workSchedule: IWorkSchedule;
    benefits: IBenefits;
    performance: IPerformanceRecord[];
    leaves: ILeaveRecord[];
    documents: IDocument[];
    schoolId: string;
    managerId?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface ISalaryInfo {
    basicSalary: number;
    allowances: IAllowance[];
    deductions: IDeduction[];
    netSalary: number;
    paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
    bankDetails: IBankDetails;
    taxInfo: ITaxInfo;
}
export interface IAllowance {
    type: string;
    amount: number;
    isTaxable: boolean;
    description?: string;
}
export interface IDeduction {
    type: string;
    amount: number;
    description?: string;
}
export interface IBankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchCode?: string;
    swiftCode?: string;
}
export interface ITaxInfo {
    taxId: string;
    taxBracket: string;
    annualIncome: number;
    taxDeducted: number;
}
export interface IQualification {
    id: string;
    level: TQualificationLevel;
    field: string;
    institution: string;
    yearOfCompletion: number;
    grade?: string;
    certificateNumber?: string;
    isVerified: boolean;
    documents: IDocument[];
}
export interface IWorkSchedule {
    workingDays: string[];
    workingHours: {
        startTime: string;
        endTime: string;
    };
    breakTime?: {
        startTime: string;
        endTime: string;
    };
    totalHoursPerWeek: number;
    overtimeAllowed: boolean;
}
export interface IBenefits {
    healthInsurance: boolean;
    lifeInsurance: boolean;
    retirementPlan: boolean;
    paidLeave: number;
    sickLeave: number;
    maternityLeave: number;
    otherBenefits: string[];
}
export interface IPerformanceRecord {
    id: string;
    reviewPeriod: string;
    reviewerId: string;
    rating: number;
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    reviewDate: Date;
    nextReviewDate?: Date;
}
export interface ILeaveRecord {
    id: string;
    leaveType: TLeaveType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: TLeaveStatus;
    approvedBy?: string;
    approvalDate?: Date;
    comments?: string;
    documents: IDocument[];
    createdAt: Date;
}
export interface ICreateStaffRequest {
    schoolId: string;
    employeeId?: string;
    userId?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    bloodGroup?: string;
    alternatePhone?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    currentAddress: IAddress;
    permanentAddress?: IAddress;
    staffType: TDepartment;
    department: string;
    designation: string;
    reportingTo?: string;
    employmentType?: TEmploymentType;
    joiningDate: Date;
    probationEndDate?: Date;
    contractEndDate?: Date;
    basicSalary: number;
    salaryCurrency?: string;
    houseAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    taxDeductible?: number;
    providentFund?: number;
    otherDeductions?: number;
    paymentMethod?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankBranch?: string;
    ifscCode?: string;
    qualifications?: Omit<IQualification, 'id' | 'documents'>[];
    certifications?: any[];
    previousExperience?: any[];
    medicalInfo?: any;
    communicationPreferences?: any;
    tags?: string[];
    internalNotes?: string;
    managerId?: string;
}
export interface IUpdateStaffRequest {
    employeeId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    address?: IAddress;
    department?: TDepartment;
    position?: TPosition;
    employmentType?: TEmploymentType;
    contractEndDate?: Date;
    salary?: Partial<Omit<ISalaryInfo, 'netSalary'>>;
    emergencyContact?: IEmergencyContact;
    workSchedule?: IWorkSchedule;
    benefits?: IBenefits;
    managerId?: string;
    employmentStatus?: TEmploymentStatus;
}
export interface ICreateLeaveRequest {
    leaveType: TLeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
    documents?: Omit<IDocument, 'id' | 'uploadedAt' | 'uploadedBy'>[];
}
export interface IUpdateLeaveRequest {
    leaveType?: TLeaveType;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
    status?: TLeaveStatus;
    comments?: string;
}
export interface ICreatePerformanceReviewRequest {
    reviewPeriod: string;
    reviewerId: string;
    rating: number;
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    nextReviewDate?: Date;
}
export interface IUpdatePerformanceReviewRequest {
    rating?: number;
    strengths?: string[];
    areasForImprovement?: string[];
    goals?: string[];
    comments?: string;
    nextReviewDate?: Date;
}
export interface IStaffResponse extends Omit<IStaff, 'userId' | 'salary' | 'performance' | 'leaves' | 'documents' | 'createdBy' | 'updatedBy'> {
    fullName: string;
    age: number;
    experience: number;
    currentSalary: number;
    leaveBalance: {
        annual: number;
        sick: number;
        maternity: number;
    };
    manager?: {
        id: string;
        firstName: string;
        lastName: string;
        position: TPosition;
    };
    subordinatesCount: number;
    lastPerformanceRating?: number;
    upcomingLeaves: ILeaveRecord[];
}
export interface IStaffListResponse {
    staff: IStaffResponse[];
    total: number;
    page: number;
    limit: number;
}
export interface IStaffStatisticsResponse {
    totalStaff: number;
    activeStaff: number;
    staffByDepartment: Record<TDepartment, number>;
    staffByPosition: Record<TPosition, number>;
    staffByEmploymentType: Record<TEmploymentType, number>;
    staffByEmploymentStatus: Record<TEmploymentStatus, number>;
    averageSalaryByDepartment: Record<TDepartment, number>;
    leaveUtilization: {
        annual: number;
        sick: number;
        maternity: number;
    };
}
export interface ILeaveResponse extends Omit<ILeaveRecord, 'approvedBy'> {
    staff: {
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        department: TDepartment;
        position: TPosition;
    };
    approvedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        position: TPosition;
    };
}
export interface ILeaveListResponse {
    leaves: ILeaveResponse[];
    total: number;
    page: number;
    limit: number;
}
export interface IPerformanceReviewResponse extends IPerformanceRecord {
    staff: {
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        department: TDepartment;
        position: TPosition;
    };
    reviewer: {
        id: string;
        firstName: string;
        lastName: string;
        position: TPosition;
    };
}
export interface IPerformanceReviewListResponse {
    reviews: IPerformanceReviewResponse[];
    total: number;
    page: number;
    limit: number;
}
export interface IStaffFilters {
    schoolId: string;
    department?: TDepartment;
    position?: TPosition;
    employmentType?: TEmploymentType;
    employmentStatus?: TEmploymentStatus;
    managerId?: string;
    hireDateFrom?: Date;
    hireDateTo?: Date;
    search?: string;
}
export interface ILeaveFilters {
    schoolId: string;
    staffId?: string;
    leaveType?: TLeaveType;
    status?: TLeaveStatus;
    startDateFrom?: Date;
    startDateTo?: Date;
    department?: TDepartment;
}
export interface IPerformanceReviewFilters {
    schoolId: string;
    staffId?: string;
    reviewerId?: string;
    reviewPeriod?: string;
    ratingFrom?: number;
    ratingTo?: number;
    department?: TDepartment;
}
export interface IHRStatistics {
    totalStaff: number;
    totalDepartments: number;
    totalPositions: number;
    averageSalary: number;
    totalLeavesThisMonth: number;
    totalPendingLeaves: number;
    staffTurnoverRate: number;
    averagePerformanceRating: number;
    departmentStats: Record<TDepartment, {
        staffCount: number;
        averageSalary: number;
        averageRating: number;
    }>;
}
export interface IStaffValidationRules {
    maxQualifications: number;
    maxDocuments: number;
    maxLeaveDaysPerYear: number;
    minSalary: number;
    maxSalary: number;
    requiredQualificationLevels: TQualificationLevel[];
    maxSubordinatesPerManager: number;
}
export interface IPayrollRun {
    id: string;
    period: string;
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'processing' | 'completed' | 'cancelled';
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    processedBy: string;
    processedAt: Date;
    schoolId: string;
}
export interface IPayrollEntry {
    staffId: string;
    staff: {
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        department: TDepartment;
        position: TPosition;
    };
    grossPay: number;
    deductions: IDeduction[];
    netPay: number;
    paymentDate: Date;
    paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
    bankDetails?: IBankDetails;
    status: 'pending' | 'paid' | 'failed';
}
