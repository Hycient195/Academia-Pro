import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for School Admin API
export interface SchoolOverview {
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
  recentActivities: Activity[];
  alerts: Alert[];
}

export interface Student {
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

export interface Staff {
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

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export interface StudentFilters {
  search?: string;
  grade?: string;
  section?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StaffFilters {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateStudentRequest {
  name: string;
  admissionNumber: string;
  grade: string;
  section: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}

export interface UpdateStudentRequest {
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

export const schoolAdminApi = createApi({
  reducerPath: 'schoolAdminApi',
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
    'SchoolOverview',
    'Students',
    'Staff',
    'Academic',
    'Financial',
    'Communication',
  ],
  endpoints: (builder) => ({
    // Dashboard
    getSchoolOverview: builder.query<SchoolOverview, void>({
      query: () => '/school-admin/dashboard',
      providesTags: ['SchoolOverview'],
    }),

    // Student Management
    getStudents: builder.query<{ students: Student[]; total: number }, StudentFilters>({
      query: (filters) => ({
        url: '/school-admin/students',
        params: filters,
      }),
      providesTags: ['Students'],
    }),

    getStudentById: builder.query<Student, string>({
      query: (studentId) => `/school-admin/students/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Students', id: studentId }],
    }),

    createStudent: builder.mutation<Student, CreateStudentRequest>({
      query: (studentData) => ({
        url: '/school-admin/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Students', 'SchoolOverview'],
    }),

    updateStudent: builder.mutation<Student, { studentId: string; updates: UpdateStudentRequest }>({
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
    getStaff: builder.query<{ staff: Staff[]; total: number }, StaffFilters>({
      query: (filters) => ({
        url: '/school-admin/staff',
        params: filters,
      }),
      providesTags: ['Staff'],
    }),

    getStaffById: builder.query<Staff, string>({
      query: (staffId) => `/school-admin/staff/${staffId}`,
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),

    updateStaff: builder.mutation<Staff, { staffId: string; updates: Partial<Staff> }>({
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
    getClasses: builder.query<any[], void>({
      query: () => '/school-admin/academic/classes',
      providesTags: ['Academic'],
    }),

    getSubjects: builder.query<any[], void>({
      query: () => '/school-admin/academic/subjects',
      providesTags: ['Academic'],
    }),

    // Financial Management
    getFeeStructure: builder.query<any, void>({
      query: () => '/school-admin/financial/fees',
      providesTags: ['Financial'],
    }),

    getOutstandingFees: builder.query<any, void>({
      query: () => '/school-admin/financial/outstanding',
      providesTags: ['Financial'],
    }),

    processPayment: builder.mutation<any, any>({
      query: (paymentData) => ({
        url: '/school-admin/financial/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Financial', 'SchoolOverview'],
    }),

    // Communication
    createAnnouncement: builder.mutation<any, any>({
      query: (announcementData) => ({
        url: '/school-admin/communication/announcements',
        method: 'POST',
        body: announcementData,
      }),
      invalidatesTags: ['Communication'],
    }),

    getAnnouncements: builder.query<any[], void>({
      query: () => '/school-admin/communication/announcements',
      providesTags: ['Communication'],
    }),
  }),
});

export const {
  // Dashboard
  useGetSchoolOverviewQuery,

  // Student Management
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,

  // Staff Management
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,

  // Academic Management
  useGetClassesQuery,
  useGetSubjectsQuery,

  // Financial Management
  useGetFeeStructureQuery,
  useGetOutstandingFeesQuery,
  useProcessPaymentMutation,

  // Communication
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
} = schoolAdminApi;