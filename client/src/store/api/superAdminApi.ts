import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Enums (aligned with common package)
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff'
}

export enum SchoolType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  MIXED = 'mixed'
}

export enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

// Types aligned with common package structure
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface SystemOverview {
  totalSchools: number;
  totalUsers: number;
  totalStudents: number;
  activeSubscriptions: number;
  systemHealthScore: number;
  schoolsGrowth?: number;
  usersGrowth?: number;
  studentsGrowth?: number;
  healthTrend?: number;
  recentActivities: Activity[];
  alerts: Alert[];
}

export interface School {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type?: SchoolType;
  status: SchoolStatus;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  totalStudents?: number;
  totalTeachers?: number;
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
  // Additional properties for backward compatibility
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'school_created' | 'user_registered' | 'subscription_updated' | 'system_alert';
  description: string;
  timestamp: string;
  schoolId?: string;
  userId?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  acknowledged: boolean;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  storageUsage: number;
}

export interface AnalyticsData {
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

export interface SystemHealth {
  overallStatus: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  version: string;
  database?: ServiceHealth;
  api?: ServiceHealth;
  network?: ServiceHealth;
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

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: number;
  latency?: number;
  errorMessage?: string;
}

export interface SubscriptionAnalytics {
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

export interface SchoolComparison {
  schools: any[];
  summary: {
    totalSchools: number;
    averagePerformanceScore: number;
    topPerformer: any;
    needsAttention: any[];
  };
  generatedAt: string;
}

export interface GeographicReport {
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

// Audit Types
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  roles: string[],
  actionType: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  resource: string;
  resourceType: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details?: Record<string, any>;
  schoolId?: string;
  sessionId?: string;
}

export interface AuditMetrics {
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

export interface AuditFilters {
  period?: string;
  user?: string;
  action?: string;
  status?: string;
  resourceType?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export interface SchoolFilters {
  search?: string;
  type?: string;
  status?: string;
  subscriptionPlan?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export interface CreateSchoolRequest {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  subscriptionPlan: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  type?: string;
  status?: string;
  subscriptionPlan?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface BulkUserUpdateRequest {
  userIds: string[];
  updates: {
    role?: UserRole;
    status?: string;
    schoolId?: string;
  };
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface SuperAdminLoginRequest {
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

export interface SuperAdminLoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
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

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    prepareHeaders: (headers) => {
      // Cookies are automatically sent with credentials: 'include'
      // No need to manually set authorization headers
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'Schools',
    'Users',
    'Analytics',
    'SystemHealth',
    'SystemOverview',
    'SystemMetrics',
    'SubscriptionAnalytics',
    'SchoolComparison',
    'GeographicReport',
    'AuditLogs',
    'AuditMetrics',
  ],
  endpoints: (builder) => ({
    // Super Admin Authentication
    superAdminLogin: builder.mutation<SuperAdminLoginResponse, SuperAdminLoginRequest>({
      query: (credentials) => ({
        url: '/super-admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // System Overview
    getSystemOverview: builder.query<SystemOverview, void>({
      query: () => '/super-admin/reports/overview',
      providesTags: ['SystemOverview'],
    }),

    // School Management
    getAllSchools: builder.query<{ schools: School[]; total: number }, SchoolFilters>({
      query: (filters) => ({
        url: '/super-admin/schools',
        params: filters,
      }),
      providesTags: ['Schools'],
    }),

    getSchoolById: builder.query<School, string>({
      query: (schoolId) => `/super-admin/schools/${schoolId}`,
      providesTags: (result, error, schoolId) => [{ type: 'Schools', id: schoolId }],
    }),

    createSchool: builder.mutation<School, CreateSchoolRequest>({
      query: (schoolData) => ({
        url: '/super-admin/schools',
        method: 'POST',
        body: schoolData,
      }),
      invalidatesTags: ['Schools', 'SystemOverview'],
    }),

    updateSchool: builder.mutation<School, { schoolId: string; updates: UpdateSchoolRequest }>({
      query: ({ schoolId, updates }) => ({
        url: `/super-admin/schools/${schoolId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { schoolId }) => [
        { type: 'Schools', id: schoolId },
        'SystemOverview'
      ],
    }),

    deleteSchool: builder.mutation<void, string>({
      query: (schoolId) => ({
        url: `/super-admin/schools/${schoolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schools', 'SystemOverview'],
    }),

    // User Management
    getCrossSchoolUsers: builder.query<{ users: User[]; total: number }, UserFilters>({
      query: (filters) => ({
        url: '/super-admin/users',
        params: filters,
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<User, string>({
      query: (userId) => `/super-admin/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Users', id: userId }],
    }),

    updateUser: builder.mutation<User, { userId: string; updates: Partial<User> }>({
      query: ({ userId, updates }) => ({
        url: `/super-admin/users/${userId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Users', id: userId },
        'SystemOverview'
      ],
    }),

    bulkUpdateUsers: builder.mutation<BulkOperationResult, BulkUserUpdateRequest>({
      query: (bulkData) => ({
        url: '/super-admin/users/bulk',
        method: 'PATCH',
        body: bulkData,
      }),
      invalidatesTags: ['Users', 'SystemOverview'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/super-admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'SystemOverview'],
    }),

    // Analytics
    getSystemAnalytics: builder.query<AnalyticsData, { period: string }>({
      query: ({ period }) => ({
        url: '/super-admin/analytics',
        params: { period },
      }),
      providesTags: ['Analytics'],
    }),

    getSystemMetrics: builder.query<SystemMetrics, void>({
      query: () => '/super-admin/metrics',
      providesTags: ['SystemMetrics'],
    }),

    // System Health
    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => '/super-admin/health',
      providesTags: ['SystemHealth'],
    }),

    // Subscription Analytics
    getSubscriptionAnalytics: builder.query<SubscriptionAnalytics, void>({
      query: () => '/super-admin/reports/subscription',
      providesTags: ['SubscriptionAnalytics'],
    }),

    // School Comparison
    getSchoolComparison: builder.query<SchoolComparison, { schoolIds?: string }>({
      query: ({ schoolIds }) => ({
        url: '/super-admin/comparison',
        params: { schoolIds },
      }),
      providesTags: ['SchoolComparison'],
    }),

    // Geographic Report
    getGeographicReport: builder.query<GeographicReport, void>({
      query: () => '/super-admin/geographic',
      providesTags: ['GeographicReport'],
    }),

    // Audit Logs
    getAuditLogs: builder.query<{ logs: AuditLog[]; total: number }, AuditFilters>({
      query: (filters) => ({
        url: '/super-admin/audit/logs',
        params: filters,
      }),
      providesTags: ['AuditLogs'],
    }),

    getAuditMetrics: builder.query<AuditMetrics, { period: string }>({
      query: ({ period }) => ({
        url: '/super-admin/audit/metrics',
        params: { period },
      }),
      providesTags: ['AuditMetrics'],
    }),
  }),
});

export const {
  // Super Admin Authentication
  useSuperAdminLoginMutation,

  // System Overview
  useGetSystemOverviewQuery,

  // School Management
  useGetAllSchoolsQuery,
  useGetSchoolByIdQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,

  // User Management
  useGetCrossSchoolUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useBulkUpdateUsersMutation,
  useDeleteUserMutation,

  // Analytics
  useGetSystemAnalyticsQuery,
  useGetSystemMetricsQuery,

  // System Health
  useGetSystemHealthQuery,

  // Additional Reports
  useGetSubscriptionAnalyticsQuery,
  useGetSchoolComparisonQuery,
  useGetGeographicReportQuery,

  // Audit
  useGetAuditLogsQuery,
  useGetAuditMetricsQuery,
} = superAdminApi;