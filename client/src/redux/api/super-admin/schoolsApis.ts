import { baseApi } from '../baseApi';

import type {
  ISuperAdminSchool,
  ISuperAdminSchoolResponse,
  ISuperAdminSchoolListResponse,
  ISuperAdminCreateSchoolRequest,
  ISuperAdminUpdateSchoolRequest,
  ISchoolFilters,
  ISubscriptionAnalytics,
  ISchoolComparison,
  IGeographicReport
} from '@academia-pro/types/super-admin';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // School Management
    getSchools: builder.query<ISuperAdminSchoolListResponse, ISchoolFilters>({
      query: (filters) => ({
        url: '/super-admin/schools',
        params: filters,
      }),
      providesTags: ['Schools'],
    }),

    getSchoolById: builder.query<ISuperAdminSchoolResponse, string>({
      query: (id) => `/super-admin/schools/${id}`,
      providesTags: (result, error, id) => [{ type: 'Schools', id }],
    }),

    createSchool: builder.mutation<ISuperAdminSchoolResponse, ISuperAdminCreateSchoolRequest>({
      query: (schoolData) => ({
        url: '/super-admin/schools',
        method: 'POST',
        body: schoolData,
      }),
      invalidatesTags: ['Schools'],
    }),

    updateSchool: builder.mutation<ISuperAdminSchoolResponse, {
      id: string;
      updates: ISuperAdminUpdateSchoolRequest;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/schools/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Schools', id },
        'Schools'
      ],
    }),

    deleteSchool: builder.mutation<void, {
      id: string;
      reason?: string;
    }>({
      query: ({ id, reason }) => ({
        url: `/super-admin/schools/${id}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Schools'],
    }),

    // School Status Management
    activateSchool: builder.mutation<ISuperAdminSchoolResponse, string>({
      query: (id) => ({
        url: `/super-admin/schools/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Schools', id },
        'Schools'
      ],
    }),

    deactivateSchool: builder.mutation<ISuperAdminSchoolResponse, {
      id: string;
      reason?: string;
    }>({
      query: ({ id, reason }) => ({
        url: `/super-admin/schools/${id}/deactivate`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Schools', id },
        'Schools'
      ],
    }),

    suspendSchool: builder.mutation<ISuperAdminSchoolResponse, {
      id: string;
      reason: string;
      suspensionPeriod?: {
        startDate: string;
        endDate: string;
      };
    }>({
      query: ({ id, ...data }) => ({
        url: `/super-admin/schools/${id}/suspend`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Schools', id },
        'Schools'
      ],
    }),

    // School Statistics
    getSchoolStatistics: builder.query<{
      totalSchools: number;
      activeSchools: number;
      inactiveSchools: number;
      suspendedSchools: number;
      schoolsByType: Record<string, number>;
      schoolsByRegion: Record<string, number>;
      averageStudentsPerSchool: number;
      averageTeachersPerSchool: number;
      totalStudents: number;
      totalTeachers: number;
      totalStaff: number;
    }, void>({
      query: () => '/super-admin/schools/statistics',
      providesTags: ['Schools'],
    }),

    // Bulk Operations
    bulkUpdateSchools: builder.mutation<{
      success: number;
      failed: number;
      errors: string[];
    }, {
      schoolIds: string[];
      updates: Partial<ISuperAdminUpdateSchoolRequest>;
    }>({
      query: (data) => ({
        url: '/super-admin/schools/bulk-update',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Schools'],
    }),

    bulkDeleteSchools: builder.mutation<{
      success: number;
      failed: number;
      errors: string[];
    }, {
      schoolIds: string[];
      reason?: string;
    }>({
      query: (data) => ({
        url: '/super-admin/schools/bulk-delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Schools'],
    }),

    // School Search and Filtering
    searchSchools: builder.query<ISuperAdminSchoolListResponse, {
      query: string;
      filters?: ISchoolFilters;
    }>({
      query: ({ query, filters }) => ({
        url: '/super-admin/schools/search',
        params: { query, ...filters },
      }),
      providesTags: ['Schools'],
    }),

    // School Performance Analytics
    getSchoolPerformance: builder.query<{
      schoolId: string;
      schoolName: string;
      performanceMetrics: {
        studentAttendance: number;
        teacherAttendance: number;
        academicPerformance: number;
        resourceUtilization: number;
        overallScore: number;
      };
      trends: {
        attendance: number;
        performance: number;
        utilization: number;
      };
      alerts: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        timestamp: string;
      }>;
    }, string>({
      query: (schoolId) => `/super-admin/schools/${schoolId}/performance`,
      providesTags: ['Analytics'],
    }),

    // Subscription Management
    getSchoolSubscriptions: builder.query<Array<{
      id: string;
      schoolId: string;
      planName: string;
      status: 'active' | 'expired' | 'cancelled' | 'suspended';
      startDate: string;
      endDate: string;
      price: number;
      features: string[];
      autoRenew: boolean;
      nextBillingDate?: string;
    }>, string>({
      query: (schoolId) => `/super-admin/schools/${schoolId}/subscriptions`,
      providesTags: ['Subscriptions'],
    }),

    updateSchoolSubscription: builder.mutation<{
      id: string;
      status: string;
      updatedAt: string;
    }, {
      schoolId: string;
      subscriptionId: string;
      updates: {
        planName?: string;
        status?: string;
        endDate?: string;
        autoRenew?: boolean;
      };
    }>({
      query: ({ schoolId, subscriptionId, updates }) => ({
        url: `/super-admin/schools/${schoolId}/subscriptions/${subscriptionId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // Geographic and Regional Analytics
    getSchoolsByRegion: builder.query<{
      regions: Array<{
        name: string;
        country: string;
        schoolCount: number;
        studentCount: number;
        averagePerformance: number;
      }>;
      summary: {
        totalRegions: number;
        averageSchoolsPerRegion: number;
        topPerformingRegion: string;
      };
    }, void>({
      query: () => '/super-admin/schools/regions',
      providesTags: ['Analytics'],
    }),

    // School Comparison
    compareSchools: builder.query<ISchoolComparison, {
      schoolIds: string[];
      metrics?: string[];
      period?: string;
    }>({
      query: (params) => ({
        url: '/super-admin/schools/compare',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Export Schools Data
    exportSchools: builder.mutation<Blob, {
      format: 'csv' | 'excel' | 'pdf';
      filters?: ISchoolFilters;
      includeDetails?: boolean;
    }>({
      query: (params) => ({
        url: '/super-admin/schools/export',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // School Health Check
    getSchoolHealthStatus: builder.query<{
      schoolId: string;
      overallHealth: 'healthy' | 'warning' | 'critical';
      checks: Array<{
        component: string;
        status: 'healthy' | 'warning' | 'critical';
        message: string;
        lastChecked: string;
      }>;
      recommendations: string[];
    }, string>({
      query: (schoolId) => `/super-admin/schools/${schoolId}/health`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useActivateSchoolMutation,
  useDeactivateSchoolMutation,
  useSuspendSchoolMutation,
  useGetSchoolStatisticsQuery,
  useBulkUpdateSchoolsMutation,
  useBulkDeleteSchoolsMutation,
  useSearchSchoolsQuery,
  useGetSchoolPerformanceQuery,
  useGetSchoolSubscriptionsQuery,
  useUpdateSchoolSubscriptionMutation,
  useGetSchoolsByRegionQuery,
  useCompareSchoolsQuery,
  useExportSchoolsMutation,
  useGetSchoolHealthStatusQuery,
} = schoolsApi;