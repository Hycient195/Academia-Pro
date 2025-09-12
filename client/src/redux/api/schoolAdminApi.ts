import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../globalURLs';
import type { RootState } from '../store';

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

export const schoolAdminApi = createApi({
  reducerPath: 'schoolAdminApi',
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

    // Student Management
    getStudents: builder.query<{ students: ISchoolAdminStudent[]; total: number; page: number; limit: number }, ISchoolAdminStudentFilters & { stage?: string; gradeCode?: string; streamSection?: string }>({
      query: (filters) => ({
        url: '/students',
        params: filters,
      }),
      providesTags: ['Students'],
    }),

    getStudentById: builder.query<IStudent, string>({
      query: (studentId) => `/students/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Students', id: studentId }],
    }),

    createStudent: builder.mutation<ISchoolAdminStudent, ISchoolAdminCreateStudentRequest>({
      query: (studentData) => ({
        url: '/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    updateStudent: builder.mutation<ISchoolAdminStudent, { studentId: string; updates: ISchoolAdminUpdateStudentRequest }>({
      query: ({ studentId, updates }) => ({
        url: `/students/${studentId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
        'SchoolOverview'
      ],
    }),

    deleteStudent: builder.mutation<void, string>({
      query: (studentId) => ({
        url: `/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    // Staff Management
    getStaff: builder.query<{ staff: ISchoolAdminStaff[]; total: number }, ISchoolAdminStaffFilters>({
      query: (filters) => ({
        url: '/staff',
        params: filters,
      }),
      providesTags: ['Staff'],
    }),

    getStaffById: builder.query<ISchoolAdminStaff, string>({
      query: (staffId) => `/staff/${staffId}`,
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),

    updateStaff: builder.mutation<ISchoolAdminStaff, { staffId: string; updates: Partial<ISchoolAdminStaff> }>({
      query: ({ staffId, updates }) => ({
        url: `/staff/${staffId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { staffId }) => [
        { type: 'Staff', id: staffId },
        'SchoolOverview'
      ],
    }),

    // Academic Management
    getClasses: builder.query<{ id: string; name: string; grade: string; section: string; teacherId: string; teacherName: string; totalStudents: number; academicYear: string }[], void>({
      query: () => '/academic/classes',
      providesTags: ['Academic'],
    }),

    getSubjects: builder.query<{ id: string; name: string; code: string; description?: string; grade: string; teacherId?: string; teacherName?: string }[], void>({
      query: () => '/academic/subjects',
      providesTags: ['Academic'],
    }),

    // Financial Management
    getFeeStructure: builder.query<{ id: string; grade: string; tuitionFee: number; transportationFee?: number; otherFees: Array<{ name: string; amount: number }>; totalFee: number; dueDate: string }, void>({
      query: () => '/fees/structures',
      providesTags: ['Financial'],
    }),

    getOutstandingFees: builder.query<{ studentId: string; studentName: string; amount: number; dueDate: string; daysOverdue: number }[], void>({
      query: () => '/fees/outstanding',
      providesTags: ['Financial'],
    }),

    processPayment: builder.mutation<{ id: string; status: string; amount: number; transactionId: string }, { studentId: string; amount: number; paymentMethod: string; feeType: string }>({
      query: (paymentData) => ({
        url: '/fees/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Financial', 'SchoolOverview'],
    }),

    // Communication
    createAnnouncement: builder.mutation<{ id: string; title: string; content: string; type: string; createdAt: string }, { title: string; content: string; type: 'general' | 'academic' | 'financial' | 'emergency'; targetAudience: 'all' | 'students' | 'parents' | 'staff'; priority: 'low' | 'medium' | 'high' }>({
      query: (announcementData) => ({
        url: '/communication/announcement',
        method: 'POST',
        body: announcementData,
      }),
      invalidatesTags: ['Communication'],
    }),

    getAnnouncements: builder.query<{ id: string; title: string; content: string; type: string; priority: string; createdAt: string; createdBy: string }[], void>({
      query: () => '/communication/notices',
      providesTags: ['Communication'],
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
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
  useGetFeeStructureQuery,
  useGetOutstandingFeesQuery,
  useProcessPaymentMutation,
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
  useBulkImportStudentsMutation,
  useBatchPromoteStudentsMutation,
  useBatchGraduateStudentsMutation,
  useBatchTransferStudentsMutation,
} = schoolAdminApi;