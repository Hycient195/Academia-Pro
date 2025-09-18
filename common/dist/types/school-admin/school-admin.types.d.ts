import { IStaff } from './staff.types';
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
export interface IDepartment {
    id: string;
    type: 'administration' | 'teaching' | 'medical' | 'counseling' | 'boarding' | 'transportation' | 'catering' | 'facilities' | 'security' | 'finance' | 'hr' | 'it' | 'library' | 'sports' | 'arts' | 'examinations';
    name: string;
    description?: string;
    staff?: IStaff[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string;
}
export interface ICreateDepartmentRequest {
    type: IDepartment['type'];
    name: string;
    description?: string;
}
export interface IUpdateDepartmentRequest {
    type?: IDepartment['type'];
    name?: string;
    description?: string;
}
export interface IDepartmentFilters {
    type?: IDepartment['type'];
    search?: string;
    limit?: number;
    offset?: number;
}
export interface IDepartmentStatistics {
    totalDepartments: number;
    departmentsByType: Record<string, number>;
    averageStaffPerDepartment: number;
    departmentsWithMostStaff: Array<{
        departmentId: string;
        departmentName: string;
        staffCount: number;
    }>;
}
export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}
