import { TSchoolType, TSchoolStatus, IAlert, PaginatedResponse } from '../shared';
import { IActivity } from '../parent-portal';
import { EUserRole, EUserStatus } from '../users';
export declare enum TAuditActionType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    VIEW = "VIEW",
    EXPORT = "EXPORT"
}
export declare enum TAuditStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    WARNING = "WARNING"
}
export interface ISystemOverview {
    totalSchools: number;
    totalUsers: number;
    totalStudents: number;
    activeSubscriptions: number;
    systemHealthScore: number;
    schoolsGrowth?: number;
    usersGrowth?: number;
    studentsGrowth?: number;
    healthTrend?: number;
    recentActivities: IActivity[];
    alerts: IAlert[];
}
export interface ISuperAdminSchool {
    id: string;
    name: string;
    code?: string;
    description?: string;
    type?: TSchoolType[];
    status: TSchoolStatus;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
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
    createdAt: string;
    updatedAt: string;
    contact?: {
        email?: string;
        phone?: string;
    };
    location?: {
        city: string;
        state: string;
        country: string;
    };
    currentStudents?: number;
    totalCapacity?: number;
    subscriptionPlan?: string;
}
export interface ISuperAdminUser {
    id: string;
    name?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    roles: EUserRole[];
    schoolId?: string;
    schoolName?: string;
    status: EUserStatus;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    lastLogin?: string;
    isEmailVerified?: boolean;
    emailVerifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ISystemMetrics {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    databaseConnections: number;
    storageUsage: number;
}
export interface ISuperAdminAnalyticsData {
    period: string;
    schools: {
        total: number;
        growth: number;
        active: number;
    };
    users: {
        total: number;
        growth: number;
        active: number;
    };
    revenue: {
        total: number;
        growth: number;
        subscriptions: number;
    };
    performance: {
        avgResponseTime: number;
        uptime: number;
        errorRate: number;
    };
}
export interface ISystemHealth {
    overallStatus: 'healthy' | 'warning' | 'critical';
    timestamp: string;
    version: string;
    database?: IServiceHealth;
    api?: IServiceHealth;
    network?: IServiceHealth;
    cpu?: {
        usage: number;
        cores?: number;
    };
    memory?: {
        usage: number;
        total?: number;
    };
    disk?: {
        usage: number;
        total?: number;
    };
    performance?: {
        avgResponseTime: number;
        requestsPerMinute: number;
        errorRate: number;
        activeConnections: number;
    };
    resources?: {
        cpuCores: number;
        cpuUsage: number;
        memoryUsage: number;
        totalMemory: number;
        storageUsage: number;
        totalStorage: number;
    };
    uptime: number;
    responseTime: number;
}
export interface IServiceHealth {
    status: 'healthy' | 'warning' | 'critical';
    responseTime?: number;
    latency?: number;
    errorMessage?: string;
}
export interface ISubscriptionAnalytics {
    subscriptionStatus: {
        active: number;
        expired: number;
        expiringSoon: number;
        total: number;
    };
    planDistribution: Record<string, number>;
    revenue: {
        monthly: number;
        annual: number;
    };
    atRiskSchools: any[];
    expiredSchools: any[];
    generatedAt: string;
}
export interface ISchoolComparison {
    schools: any[];
    summary: {
        totalSchools: number;
        averagePerformanceScore: number;
        topPerformer: any;
        needsAttention: any[];
    };
    generatedAt: string;
}
export interface IGeographicReport {
    distributions: {
        countries: Record<string, number>;
        cities: Record<string, number>;
    };
    topLocations: {
        countries: any[];
        cities: any[];
    };
    regionalBreakdown: Record<string, any[]>;
    generatedAt: string;
}
export interface IAuditLog {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    roles: string[];
    actionType: TAuditActionType;
    resource: string;
    resourceType: string;
    ipAddress: string;
    userAgent?: string;
    status: TAuditStatus;
    details?: Record<string, any>;
    schoolId?: string;
    sessionId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resourceId?: string;
    user?: string | {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        roles: string[];
        fullName?: string;
    };
}
export interface IAuditMetrics {
    totalActivities: number;
    activitiesGrowth: number;
    activeUsers: number;
    usersGrowth: number;
    apiRequests: number;
    apiGrowth: number;
    securityEvents: number;
    securityGrowth: number;
    period: string;
}
export interface IAuditFilters {
    userId?: string;
    schoolId?: string;
    resource?: string;
    resourceId?: string;
    action?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
    searchTerm?: string;
    tags?: string[];
    isArchived?: boolean;
    isConfidential?: boolean;
    studentId?: string;
    studentAction?: string;
    entityType?: string;
    studentSeverity?: string;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
    userRole?: string;
    userDepartment?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    changedFields?: string[];
    businessRulesViolated?: string[];
    complianceIssues?: string[];
    riskLevel?: string;
    gdprCompliant?: boolean;
    requiresParentConsent?: boolean;
    parentConsentObtained?: boolean;
}
export interface IUserFilters {
    search?: string;
    roles?: EUserRole[];
    status?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
}
export interface ISuperAdminCreateSchoolRequest {
    name: string;
    type: TSchoolType[];
    address: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone: string;
    subscriptionPlan: string;
}
export interface ISuperAdminUpdateSchoolRequest {
    name?: string;
    type?: TSchoolType[];
    status?: string;
    subscriptionPlan?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    email?: string;
    phone?: string;
    contact?: {
        email?: string;
        phone?: string;
    };
}
export type ICreateSchoolRequest = ISuperAdminCreateSchoolRequest;
export type IUpdateSchoolRequest = ISuperAdminUpdateSchoolRequest;
export interface IBulkUserUpdateRequest {
    userIds: string[];
    updates: {
        roles?: EUserRole[];
        status?: string;
        schoolId?: string;
    };
}
export interface IBulkOperationResult {
    success: number;
    failed: number;
    errors: string[];
}
export interface IPermission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
}
export interface IRole {
    id: string;
    name: string;
    description: string;
    permissions: IPermission[];
}
export interface IDelegatedAccount {
    id: string;
    userId: string;
    email: string;
    permissions: string[];
    expiryDate: string;
    createdBy: string;
    status: 'active' | 'expired' | 'revoked';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    revokedBy?: string;
    revokedAt?: string;
}
export interface ICreateDelegatedAccountRequest {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    userId?: string;
    permissions: string[];
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    expiryDate?: string;
    notes?: string;
}
export interface IUpdateDelegatedAccountRequest {
    permissions?: string[];
    expiryDate?: string;
    status?: 'active' | 'expired' | 'revoked';
    notes?: string;
}
export interface ISuperAdminLoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceInfo?: {
        type: 'desktop' | 'mobile' | 'tablet';
        os: string;
        browser: string;
        version: string;
    };
}
export interface ISuperAdminLoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: EUserRole[];
        isEmailVerified: boolean;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
    };
    session: {
        id: string;
        expiresAt: string;
    };
    requiresMFA?: boolean;
}
export interface ISuperAdminSchoolResponse extends Omit<ISuperAdminSchool, 'createdBy' | 'updatedBy'> {
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
export interface ISuperAdminSchoolListResponse extends PaginatedResponse<ISuperAdminSchoolResponse> {
    totalPages: number;
    summary: {
        totalSchools: number;
        activeSchools: number;
        totalStudents: number;
        totalStaff: number;
        byType: Record<string, number>;
        byStatus: Record<TSchoolStatus, number>;
    };
}
export interface ISuperAdminUserResponse extends Omit<ISuperAdminUser, 'createdAt' | 'updatedAt'> {
    createdAt: Date;
    updatedAt: Date;
}
export interface ISuperAdminUsersListResponse extends PaginatedResponse<ISuperAdminUserResponse> {
    summary?: {
        activeUsers: number;
        totalStudents: number;
        totalStaff: number;
    };
}
export interface IAuditLogsResponse extends PaginatedResponse<IAuditLog> {
    totalPages: number;
}
export interface IAuditMetricsResponse extends IAuditMetrics {
    generatedAt: string;
}
export interface ISystemOverviewResponse extends ISystemOverview {
    generatedAt: string;
}
export interface IAnalyticsDataResponse extends ISuperAdminAnalyticsData {
    generatedAt: string;
}
export interface ISystemHealthResponse extends ISystemHealth {
    generatedAt: string;
}
export interface ISubscriptionAnalyticsResponse extends ISubscriptionAnalytics {
    generatedAt: string;
}
export interface ISchoolComparisonResponse extends ISchoolComparison {
    generatedAt: string;
}
export interface IGeographicReportResponse extends IGeographicReport {
    generatedAt: string;
}
export interface IDelegatedAccountsResponse extends PaginatedResponse<IDelegatedAccount> {
}
export interface IPermissionsResponse extends PaginatedResponse<IPermission> {
}
export interface IRolesResponse extends PaginatedResponse<IRole> {
}
export interface IAnalyticsDashboard {
    summary: ISuperAdminAnalyticsSummary;
    charts: {
        userGrowth: IAnalyticsChartData;
        revenue: IAnalyticsChartData;
        schoolPerformance: IAnalyticsChartData;
    };
    metrics: IAnalyticsMetrics;
    recentActivity: IActivity[];
    alerts: IAlert[];
}
export interface IAnalyticsMetrics {
    totalUsers: number;
    activeUsers: number;
    totalSchools: number;
    activeSchools: number;
    totalRevenue: number;
    monthlyRevenue: number;
    systemUptime: number;
    averageResponseTime: number;
    errorRate: number;
    apiRequests: number;
    storageUsage: number;
}
export interface IAnalyticsReport {
    id: string;
    name: string;
    type: 'user-activity' | 'revenue' | 'school-performance' | 'system-health' | 'custom';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    format: 'pdf' | 'excel' | 'csv';
    filters: IAnalyticsFilters;
    createdAt: string;
    completedAt?: string;
    downloadUrl?: string;
    fileSize?: number;
    generatedBy: string;
    schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        nextRun?: string;
        recipients: string[];
    };
}
export interface IAnalyticsFilters {
    dateRange?: {
        start: string;
        end: string;
    };
    schoolIds?: string[];
    userRoles?: string[];
    regions?: string[];
    status?: string[];
    categories?: string[];
}
export interface IAnalyticsChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
    }>;
}
export interface ISuperAdminAnalyticsSummary {
    period: string;
    totalSchools: number;
    totalUsers: number;
    totalRevenue: number;
    activeSubscriptions: number;
    systemHealthScore: number;
    growthMetrics: {
        schools: number;
        users: number;
        revenue: number;
    };
    topPerformingSchools: Array<{
        id: string;
        name: string;
        performanceScore: number;
    }>;
}
export type { ISchoolFilters } from '../shared';
