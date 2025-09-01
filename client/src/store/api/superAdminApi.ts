import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for Super Admin API
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
  type: 'primary' | 'secondary' | 'mixed';
  status: 'active' | 'inactive' | 'suspended';
  currentStudents: number;
  totalCapacity: number;
  subscriptionPlan: string;
  subscriptionExpiry: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
    role?: string;
    status?: string;
    schoolId?: string;
  };
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as any)?.auth?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

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
    'Activities',
    'Alerts',
  ],
  endpoints: (builder) => ({
    // System Overview
    getSystemOverview: builder.query<SystemOverview, void>({
      query: () => '/super-admin/dashboard/overview',
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
    getSystemHealth: builder.query<any, void>({
      query: () => '/super-admin/health',
      providesTags: ['SystemHealth'],
    }),

    // Activities and Alerts
    getRecentActivities: builder.query<Activity[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/super-admin/activities',
        params: { limit },
      }),
      providesTags: ['Activities'],
    }),

    getSystemAlerts: builder.query<Alert[], { acknowledged?: boolean }>({
      query: ({ acknowledged = false }) => ({
        url: '/super-admin/alerts',
        params: { acknowledged },
      }),
      providesTags: ['Alerts'],
    }),

    acknowledgeAlert: builder.mutation<void, string>({
      query: (alertId) => ({
        url: `/super-admin/alerts/${alertId}/acknowledge`,
        method: 'POST',
      }),
      invalidatesTags: ['Alerts'],
    }),
  }),
});

export const {
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

  // Activities and Alerts
  useGetRecentActivitiesQuery,
  useGetSystemAlertsQuery,
  useAcknowledgeAlertMutation,
} = superAdminApi;