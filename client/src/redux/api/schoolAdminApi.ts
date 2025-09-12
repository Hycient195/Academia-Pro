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
        url: '/school-admin/students',
        params: filters,
      }),
      providesTags: ['Students'],
    }),

    getStudentById: builder.query<IStudent, string>({
      query: (studentId) => `/school-admin/students/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Students', id: studentId }],
    }),

    createStudent: builder.mutation<ISchoolAdminStudent, ISchoolAdminCreateStudentRequest>({
      query: (studentData) => ({
        url: '/school-admin/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    updateStudent: builder.mutation<ISchoolAdminStudent, { studentId: string; updates: ISchoolAdminUpdateStudentRequest }>({
      query: ({ studentId, updates }) => ({
        url: `/school-admin/students/${studentId}`,
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
        url: `/school-admin/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    // Staff Management
    getStaff: builder.query<{ staff: ISchoolAdminStaff[]; total: number }, ISchoolAdminStaffFilters>({
      query: (filters) => ({
        url: '/school-admin/staff',
        params: filters,
      }),
      providesTags: ['Staff'],
    }),

    getStaffById: builder.query<ISchoolAdminStaff, string>({
      query: (staffId) => `/school-admin/staff/${staffId}`,
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),

    updateStaff: builder.mutation<ISchoolAdminStaff, { staffId: string; updates: Partial<ISchoolAdminStaff> }>({
      query: ({ staffId, updates }) => ({
        url: `/school-admin/staff/${staffId}`,
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
      query: () => '/school-admin/academic/classes',
      providesTags: ['Academic'],
    }),

    getSubjects: builder.query<{ id: string; name: string; code: string; description?: string; grade: string; teacherId?: string; teacherName?: string }[], void>({
      query: () => '/school-admin/academic/subjects',
      providesTags: ['Academic'],
    }),

    // Financial Management
    getFeeStructure: builder.query<{ id: string; grade: string; tuitionFee: number; transportationFee?: number; otherFees: Array<{ name: string; amount: number }>; totalFee: number; dueDate: string }, void>({
      query: () => '/school-admin/financial/fees',
      providesTags: ['Financial'],
    }),

    getOutstandingFees: builder.query<{ studentId: string; studentName: string; amount: number; dueDate: string; daysOverdue: number }[], void>({
      query: () => '/school-admin/financial/outstanding',
      providesTags: ['Financial'],
    }),

    processPayment: builder.mutation<{ id: string; status: string; amount: number; transactionId: string }, { studentId: string; amount: number; paymentMethod: string; feeType: string }>({
      query: (paymentData) => ({
        url: '/school-admin/financial/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Financial', 'SchoolOverview'],
    }),

    // Communication
    createAnnouncement: builder.mutation<{ id: string; title: string; content: string; type: string; createdAt: string }, { title: string; content: string; type: 'general' | 'academic' | 'financial' | 'emergency'; targetAudience: 'all' | 'students' | 'parents' | 'staff'; priority: 'low' | 'medium' | 'high' }>({
      query: (announcementData) => ({
        url: '/school-admin/communication/announcements',
        method: 'POST',
        body: announcementData,
      }),
      invalidatesTags: ['Communication'],
    }),

    getAnnouncements: builder.query<{ id: string; title: string; content: string; type: string; priority: string; createdAt: string; createdBy: string }[], void>({
      query: () => '/school-admin/communication/announcements',
      providesTags: ['Communication'],
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
} = schoolAdminApi;