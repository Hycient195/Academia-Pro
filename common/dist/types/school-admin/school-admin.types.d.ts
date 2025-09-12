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
