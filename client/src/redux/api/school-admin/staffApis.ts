import { baseApi } from '../baseApi';
import { PaginatedResponse } from '@academia-pro/types/shared';

// Types for staff management
export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  department: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  hireDate: string;
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  department: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  hireDate: string;
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Partial<{
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }>;
  department?: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact?: Partial<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

export interface StaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  byEmploymentType: Record<string, number>;
  byEmploymentStatus: Record<string, number>;
  averageSalary: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  tenureDistribution: {
    '0-1_years': number;
    '1-3_years': number;
    '3-5_years': number;
    '5-10_years': number;
    '10+_years': number;
  };
}

export interface HRStatistics {
  totalStaff: number;
  activeStaff: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  turnoverRate: number;
  averageTenure: number;
  departmentDistribution: Record<string, number>;
  performanceMetrics: {
    averagePerformanceScore: number;
    highPerformers: number;
    needsImprovement: number;
  };
  attendanceMetrics: {
    averageAttendanceRate: number;
    absentToday: number;
    onLeave: number;
  };
  trainingMetrics: {
    totalTrainingHours: number;
    completedCertifications: number;
    pendingCertifications: number;
  };
}

export interface StaffFilters {
  schoolId?: string;
  department?: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  managerId?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  search?: string;
}

export interface StaffSearchParams extends StaffFilters {
  page?: number;
  limit?: number;
}

// Using shared PaginatedResponse instead of local StaffSearchResult

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff members with pagination and filtering
    getStaff: builder.query<PaginatedResponse<Staff>, StaffSearchParams>({
      query: (params) => ({
        url: 'staff',
        method: 'GET',
        params,
      }),
      providesTags: ['Staff' as const],
    }),

    // Get staff member by ID
    getStaffMember: builder.query<Staff, string>({
      query: (id) => ({
        url: `staff/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Staff' as const, id }],
    }),

    // Get staff statistics
    getStaffStatistics: builder.query<StaffStatistics, string>({
      query: (schoolId) => ({
        url: 'staff/statistics',
        method: 'GET',
        params: { schoolId },
      }),
      providesTags: ['Staff' as const],
    }),

    // Get HR statistics
    getHRStatistics: builder.query<HRStatistics, string>({
      query: (schoolId) => ({
        url: 'staff/hr-statistics',
        method: 'GET',
        params: { schoolId },
      }),
      providesTags: ['Staff' as const],
    }),

    // Create staff member
    createStaff: builder.mutation<Staff, CreateStaffDto>({
      query: (staffData) => ({
        url: 'staff',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Staff' as const],
    }),

    // Update staff member
    updateStaff: builder.mutation<Staff, { id: string; data: UpdateStaffDto }>({
      query: ({ id, data }) => ({
        url: `staff/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Delete staff member
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: `staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff' as const],
    }),

    // Get staff by department
    getStaffByDepartment: builder.query<Staff[], { schoolId: string; department: string }>({
      query: ({ schoolId, department }) => ({
        url: 'staff',
        method: 'GET',
        params: { schoolId, department },
      }),
      providesTags: ['Staff' as const],
    }),

    // Get staff by manager
    getStaffByManager: builder.query<Staff[], { managerId: string; schoolId?: string }>({
      query: ({ managerId, schoolId }) => ({
        url: 'staff',
        method: 'GET',
        params: { managerId, schoolId },
      }),
      providesTags: ['Staff' as const],
    }),

    // Get staff hierarchy (reporting structure)
    getStaffHierarchy: builder.query<Staff[], string>({
      query: (schoolId) => ({
        url: 'staff',
        method: 'GET',
        params: { schoolId, includeHierarchy: true },
      }),
      providesTags: ['Staff' as const],
    }),

    // Update staff employment status
    updateStaffStatus: builder.mutation<Staff, { id: string; status: string; reason?: string }>({
      query: ({ id, status, reason }) => ({
        url: `staff/${id}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Transfer staff to different department/position
    transferStaff: builder.mutation<Staff, { id: string; department: string; position: string; effectiveDate: string }>({
      query: ({ id, ...data }) => ({
        url: `staff/${id}/transfer`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Update staff salary
    updateStaffSalary: builder.mutation<Staff, { id: string; salary: number; effectiveDate: string; reason?: string }>({
      query: ({ id, ...data }) => ({
        url: `staff/${id}/salary`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Add staff qualification/certification
    addStaffQualification: builder.mutation<Staff, { id: string; type: 'qualification' | 'certification'; name: string; issuer: string; dateObtained: string; expiryDate?: string }>({
      query: ({ id, ...data }) => ({
        url: `staff/${id}/qualifications`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Add staff document
    addStaffDocument: builder.mutation<Staff, { id: string; type: string; name: string; file: File }>({
      query: ({ id, ...data }) => ({
        url: `staff/${id}/documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff' as const, id },
        'Staff' as const,
      ],
    }),

    // Get staff performance metrics
    getStaffPerformance: builder.query<{
      staffId: string;
      overallScore: number;
      metrics: Record<string, number>;
      reviews: Array<{
        id: string;
        reviewerId: string;
        reviewerName: string;
        score: number;
        comments: string;
        reviewDate: string;
      }>;
    }, string>({
      query: (staffId) => ({
        url: `staff/${staffId}/performance`,
        method: 'GET',
      }),
      providesTags: (result, error, staffId) => [{ type: 'Staff' as const, id: staffId }],
    }),

    // Get staff attendance records
    getStaffAttendance: builder.query<{
      staffId: string;
      attendanceRate: number;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      leaveDays: number;
      records: Array<{
        date: string;
        status: 'present' | 'absent' | 'late' | 'leave' | 'half_day';
        checkInTime?: string;
        checkOutTime?: string;
        hoursWorked?: number;
      }>;
    }, { staffId: string; startDate?: string; endDate?: string }>({
      query: ({ staffId, startDate, endDate }) => ({
        url: `staff/${staffId}/attendance`,
        method: 'GET',
        params: { startDate, endDate },
      }),
      providesTags: (result, error, { staffId }) => [{ type: 'Staff' as const, id: staffId }],
    }),

    // Bulk operations
    bulkCreateStaff: builder.mutation<{ success: boolean; message: string; created: number; errors: string[] }, CreateStaffDto[]>({
      query: (staffData) => ({
        url: 'staff/bulk',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Staff' as const],
    }),

    bulkUpdateStaff: builder.mutation<{ success: boolean; message: string; updated: number; errors: string[] }, Array<{ id: string; data: UpdateStaffDto }>>({
      query: (updates) => ({
        url: 'staff/bulk-update',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Staff' as const],
    }),

    bulkDeleteStaff: builder.mutation<{ success: boolean; message: string; deleted: number; errors: string[] }, string[]>({
      query: (ids) => ({
        url: 'staff/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Staff' as const],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffMemberQuery,
  useGetStaffStatisticsQuery,
  useGetHRStatisticsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useGetStaffByDepartmentQuery,
  useGetStaffByManagerQuery,
  useGetStaffHierarchyQuery,
  useUpdateStaffStatusMutation,
  useTransferStaffMutation,
  useUpdateStaffSalaryMutation,
  useAddStaffQualificationMutation,
  useAddStaffDocumentMutation,
  useGetStaffPerformanceQuery,
  useGetStaffAttendanceQuery,
  useBulkCreateStaffMutation,
  useBulkUpdateStaffMutation,
  useBulkDeleteStaffMutation,
} = staffApi;