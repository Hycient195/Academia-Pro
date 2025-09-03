export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        schoolId?: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
    };
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role: string;
    schoolId?: string;
}
export interface SchoolAdminOverview {
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
    recentActivities: SchoolAdminActivity[];
    alerts: SchoolAdminAlert[];
}
export interface SchoolAdminStudent {
    id: string;
    name: string;
    admissionNumber: string;
    grade: string;
    section: string;
    photo?: string;
    status: 'active' | 'inactive' | 'transferred' | 'graduated';
    attendanceRate: number;
    parentContact: {
        name: string;
        email: string;
        phone: string;
    };
    academicPerformance: {
        averageGrade: number;
        subjects: SubjectGrade[];
    };
}
export interface SubjectGrade {
    subject: string;
    grade: string;
    score: number;
}
export interface SchoolAdminActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
}
export interface SchoolAdminAlert {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    timestamp: string;
}
export interface SchoolAdminStudentFilters {
    search?: string;
    grade?: string;
    section?: string;
    status?: string;
    page?: number;
    limit?: number;
}
export interface SchoolAdminStaffFilters {
    search?: string;
    role?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
}
export interface CreateSchoolAdminStudentRequest {
    name: string;
    admissionNumber: string;
    grade: string;
    section: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
}
export interface UpdateSchoolAdminStudentRequest {
    name?: string;
    grade?: string;
    section?: string;
    status?: string;
    parentContact?: {
        name?: string;
        email?: string;
        phone?: string;
    };
}
export interface SchoolAdminStaff {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    photo?: string;
    status: 'active' | 'inactive';
    attendanceRate: number;
    performanceRating: number;
    subjects?: string[];
}
export interface CreateSchoolAdminStaffRequest {
    name: string;
    email: string;
    role: string;
    department: string;
    subjects?: string[];
}
export interface UpdateSchoolAdminStaffRequest {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    status?: string;
    subjects?: string[];
}
export interface Class {
    id: string;
    name: string;
    grade: string;
    section: string;
    teacherId: string;
    teacherName: string;
    totalStudents: number;
    academicYear: string;
}
export interface FeeStructure {
    id: string;
    grade: string;
    tuitionFee: number;
    transportationFee?: number;
    otherFees: Array<{
        name: string;
        amount: number;
    }>;
    totalFee: number;
    dueDate: string;
}
export interface FeePayment {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: 'paid' | 'pending' | 'overdue';
    feeType: string;
}
export interface Announcement {
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
export interface CreateAnnouncementRequest {
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
export interface AttendanceReport {
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
export interface FinancialReport {
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
export interface AcademicReport {
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
//# sourceMappingURL=client-api.types.d.ts.map