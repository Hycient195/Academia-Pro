import { baseApi } from '../baseApi';

import type {
  IAnalyticsDashboard,
  IAnalyticsMetrics,
  IAnalyticsReport,
  IAnalyticsFilters,
  IAnalyticsChartData,
  ISuperAdminAnalyticsSummary
} from '@academia-pro/types/super-admin';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Analytics
    getDashboardAnalytics: builder.query<IAnalyticsDashboard, { timeRange?: string; schoolId?: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/dashboard',
        params,
      }),
      providesTags: ['Dashboard'],
    }),

    getAnalyticsMetrics: builder.query<IAnalyticsMetrics, IAnalyticsFilters>({
      query: (filters) => ({
        url: '/super-admin/analytics/metrics',
        params: filters,
      }),
      providesTags: ['Analytics'],
    }),

    getAnalyticsSummary: builder.query<ISuperAdminAnalyticsSummary, { period?: string; schoolId?: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/summary',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Charts and Visualizations
    getUserGrowthChart: builder.query<IAnalyticsChartData, { timeRange: string; schoolId?: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/charts/user-growth',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getRevenueChart: builder.query<IAnalyticsChartData, { timeRange: string; schoolId?: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/charts/revenue',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getSchoolPerformanceChart: builder.query<IAnalyticsChartData, { timeRange: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/charts/school-performance',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Reports
    getAnalyticsReports: builder.query<IAnalyticsReport[], { type?: string; status?: string }>({
      query: (params) => ({
        url: '/super-admin/analytics/reports',
        params,
      }),
      providesTags: ['Reports'],
    }),

    generateAnalyticsReport: builder.mutation<IAnalyticsReport, {
      type: string;
      filters: IAnalyticsFilters;
      format: 'pdf' | 'excel' | 'csv';
    }>({
      query: (data) => ({
        url: '/super-admin/analytics/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reports'],
    }),

    downloadAnalyticsReport: builder.query<Blob, string>({
      query: (reportId) => ({
        url: `/super-admin/analytics/reports/${reportId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Real-time Analytics
    getRealtimeMetrics: builder.query<IAnalyticsMetrics, void>({
      query: () => '/super-admin/analytics/realtime',
      providesTags: ['Analytics'],
    }),

    // Custom Analytics
    createCustomReport: builder.mutation<IAnalyticsReport, {
      name: string;
      description: string;
      filters: IAnalyticsFilters;
      schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string[];
      };
    }>({
      query: (data) => ({
        url: '/super-admin/analytics/custom-reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reports'],
    }),

    getCustomReports: builder.query<IAnalyticsReport[], void>({
      query: () => '/super-admin/analytics/custom-reports',
      providesTags: ['Reports'],
    }),

    updateCustomReport: builder.mutation<IAnalyticsReport, {
      id: string;
      updates: Partial<IAnalyticsReport>;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/analytics/custom-reports/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Reports'],
    }),

    deleteCustomReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/analytics/custom-reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetAnalyticsMetricsQuery,
  useGetAnalyticsSummaryQuery,
  useGetUserGrowthChartQuery,
  useGetRevenueChartQuery,
  useGetSchoolPerformanceChartQuery,
  useGetAnalyticsReportsQuery,
  useGenerateAnalyticsReportMutation,
  useDownloadAnalyticsReportQuery,
  useGetRealtimeMetricsQuery,
  useCreateCustomReportMutation,
  useGetCustomReportsQuery,
  useUpdateCustomReportMutation,
  useDeleteCustomReportMutation,
} = analyticsApi;