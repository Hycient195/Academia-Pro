import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../../globalURLs';
import type { RootState } from '../../store';

// Import types from common package
import type {
  ISchoolAdminOverview,
  ISchoolAdminStudent,
  ISchoolAdminStudentFilters,
  ISchoolAdminStaffFilters,
  ISchoolAdminCreateStudentRequest,
  ISchoolAdminUpdateStudentRequest,
  ISchoolAdminStaff,
  IBulkImportResult,
  IBulkImportRequest,
  IPromotionResult,
  IPromotionRequest,
  IGraduationResult,
  IGraduationRequest,
  ITransferResult,
  ITransferStudentRequest,
} from '@academia-pro/types/school-admin';
import type { IStudent } from '@academia-pro/types/student';

export const commonApis = createApi({
  reducerPath: 'schoolAdminCommonApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      const state = getState() as RootState;
      const token = state?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'SchoolOverview',
    'Students',
    'Staff',
    'Academic',
    'Financial',
    'Communication',
  ],
  endpoints: (builder) => ({
    // Dashboard
    getSchoolOverview: builder.query<ISchoolAdminOverview, void>({
      query: () => '/school-admin/dashboard',
      providesTags: ['SchoolOverview'],
    }),






    // Bulk Operations
    bulkImportStudents: builder.mutation<IBulkImportResult, IBulkImportRequest>({
      query: (importData) => ({
        url: '/students/bulk-import',
        method: 'POST',
        body: importData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    batchPromoteStudents: builder.mutation<IPromotionResult, IPromotionRequest>({
      query: (promotionData) => ({
        url: '/students/promotion',
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    batchGraduateStudents: builder.mutation<IGraduationResult, IGraduationRequest>({
      query: (graduationData) => ({
        url: '/students/batch-graduate',
        method: 'POST',
        body: graduationData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    batchTransferStudents: builder.mutation<ITransferResult, ITransferStudentRequest>({
      query: (transferData) => ({
        url: '/students/batch-transfer',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),
  }),
});

export const {
  useGetSchoolOverviewQuery,
  useBulkImportStudentsMutation,
  useBatchPromoteStudentsMutation,
  useBatchGraduateStudentsMutation,
  useBatchTransferStudentsMutation,
} = commonApis;