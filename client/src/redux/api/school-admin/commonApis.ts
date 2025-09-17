import { baseApi } from '../userBaseApi';

 // Import types from common package
import type { ISchoolAdminOverview } from '@academia-pro/types/school-admin';

export const commonApis = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getSchoolOverview: builder.query<ISchoolAdminOverview, void>({
      query: () => '/school-admin/dashboard',
      providesTags: ['SchoolOverview'],
    }),






        // Bulk Operations moved to studentApi to avoid duplicate endpoint names.
        // Use hooks from studentApi:
        // - useBulkImportStudentsMutation
        // - useBatchGraduateStudentsMutation
        // - useBatchTransferStudentsMutation
  }),
});

export const {
  useGetSchoolOverviewQuery,
} = commonApis;