import { baseApi } from '../userBaseApi';
import { PaginatedResponse } from '@academia-pro/types/shared';
import {
  ICreateStaffRequest,
  IUpdateStaffRequest,
  IStaffResponse,
  IStaffListResponse,
  IStaffStatisticsResponse,
  IStaffFilters,
  IHRStatistics,
  TEmploymentStatus,
  TDepartment,
  TPosition,
  TEmploymentType,
} from '@academia-pro/types/staff';

// Re-export types for convenience
export type Staff = IStaffResponse;
export type CreateStaffDto = ICreateStaffRequest;
export type UpdateStaffDto = IUpdateStaffRequest;
export interface StaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  terminatedStaff: number;
  byStaffType: Record<string, number>;
  byDepartment: Record<string, number>;
  byEmploymentType: Record<string, number>;
  averageSalary: number;
  averageExperience: number;
  leaveUtilization: {
    annual: { used: number; total: number };
    sick: { used: number; total: number };
    casual: { used: number; total: number };
  };
}
export type HRStatistics = IHRStatistics;
export type StaffFilters = IStaffFilters;
export type StaffSearchParams = IStaffFilters & {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

// Additional types for API responses
export interface StaffDashboardResponse {
  summary: StaffStatistics;
  alerts: {
    upcomingBirthdays: number;
    expiringContracts: number;
    staffOnProbation: number;
  };
  recentData: {
    upcomingBirthdays: Staff[];
    expiringContracts: Staff[];
    staffOnProbation: Staff[];
  };
  period: {
    generatedAt: string;
  };
}

export interface SalaryReportResponse {
  totalStaff: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  averageGrossSalary: number;
  averageNetSalary: number;
  salaryByDepartment: Record<string, number>;
  staffDetails: Array<{
    employeeId: string;
    name: string;
    department: string;
    designation: string;
    grossSalary: number;
    netSalary: number;
    joiningDate: string;
  }>;
  generatedAt: string;
}

export interface StaffAttendanceResponse {
  staffId: string;
  workingHoursPerWeek: number;
  workingDaysPerWeek: number;
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceRate: number;
}

export interface StaffPayrollResponse {
  staffId: string;
  compensation: {
    basicSalary: number;
    houseAllowance: number;
    transportAllowance: number;
    medicalAllowance: number;
    otherAllowances: number;
    grossSalary: number;
    taxDeductible: number;
    providentFund: number;
    otherDeductions: number;
    netSalary: number;
    paymentMethod: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      branch: string;
      ifscCode: string;
    };
  };
}

export interface LeaveProcessResponse {
  success: boolean;
  staff: Staff;
  message: string;
}

export interface BulkSalaryUpdateRequest {
  schoolId: string;
  updates: Array<{
    staffId: string;
    basicSalary?: number;
    houseAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    taxDeductible?: number;
    providentFund?: number;
    otherDeductions?: number;
  }>;
}

export interface BulkSalaryUpdateResponse {
  updated: number;
  failed: number;
  errors: string[];
}

export interface DepartmentResponse {
  id: string;
  type: string;
  name: string;
  description?: string;
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create staff member
    createStaff: builder.mutation<Staff, CreateStaffDto>({
      query: (staffData) => ({
        url: 'staff',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Staff'],
    }),

    // Get staff member by ID
    getStaffById: builder.query<Staff, string>({
      query: (id) => ({
        url: `staff/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),

    // Get staff member by employee ID
    getStaffByEmployeeId: builder.query<Staff, string>({
      query: (employeeId) => ({
        url: `staff/employee/${employeeId}`,
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),

    // Update staff member
    updateStaff: builder.mutation<Staff, { id: string; data: UpdateStaffDto }>({
      query: ({ id, data }) => ({
        url: `staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Delete staff member
    deleteStaff: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),

    // Terminate staff member
    terminateStaff: builder.mutation<Staff, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `staff/${id}/terminate`,
        method: 'PUT',
        params: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Suspend staff member
    suspendStaff: builder.mutation<Staff, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `staff/${id}/suspend`,
        method: 'PUT',
        params: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Reactivate staff member
    reactivateStaff: builder.mutation<Staff, string>({
      query: (id) => ({
        url: `staff/${id}/reactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Update staff performance
    updatePerformance: builder.mutation<Staff, { id: string; rating: number; notes?: string }>({
      query: ({ id, rating, notes }) => ({
        url: `staff/${id}/performance`,
        method: 'PUT',
        params: { rating, notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Process leave request
    processLeave: builder.mutation<LeaveProcessResponse, { id: string; leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual'; days: number }>({
      query: ({ id, leaveType, days }) => ({
        url: `staff/${id}/leave`,
        method: 'POST',
        params: { leaveType, days },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Add leave balance
    addLeaveBalance: builder.mutation<Staff, { id: string; leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual'; days: number }>({
      query: ({ id, leaveType, days }) => ({
        url: `staff/${id}/leave/add`,
        method: 'POST',
        params: { leaveType, days },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        'Staff',
      ],
    }),

    // Get all staff members
    getAllStaff: builder.query<Staff[], StaffSearchParams>({
      query: (params) => ({
        url: 'staff',
        method: 'GET',
        params,
      }),
      providesTags: ['Staff'],
    }),

    // Search staff members
    searchStaff: builder.query<Staff[], { q: string; limit?: number; offset?: number }>({
      query: ({ q, limit, offset }) => ({
        url: 'staff/search',
        method: 'GET',
        params: { q, limit, offset },
      }),
      providesTags: ['Staff'],
    }),

    // Filter staff members
    filterStaff: builder.query<Staff[], { filters: Partial<StaffFilters>; options?: { limit?: number; offset?: number } }>({
      query: ({ filters, options }) => ({
        url: 'staff/filter',
        method: 'GET',
        params: { ...filters, ...options },
      }),
      providesTags: ['Staff'],
    }),

    // Get staff by school
    getStaffBySchool: builder.query<Staff[], { schoolId: string } & StaffSearchParams>({
      query: ({ schoolId, ...params }) => ({
        url: `staff/school/${schoolId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Staff'],
    }),

    // Get staff by department
    getStaffByDepartment: builder.query<Staff[], { schoolId: string; department: string; status?: TEmploymentStatus; limit?: number; offset?: number }>({
      query: ({ schoolId, department, status, limit, offset }) => ({
        url: `staff/department/${schoolId}/${department}`,
        method: 'GET',
        params: { status, limit, offset },
      }),
      providesTags: ['Staff'],
    }),

    // Get staff statistics
    getStaffStatistics: builder.query<StaffStatistics, string>({
      query: (schoolId) => ({
        url: `staff/statistics/${schoolId}`,
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),

    // Get upcoming birthdays
    getUpcomingBirthdays: builder.query<Staff[], { schoolId: string; days?: number }>({
      query: ({ schoolId, days = 30 }) => ({
        url: `staff/birthdays/${schoolId}`,
        method: 'GET',
        params: { days },
      }),
      providesTags: ['Staff'],
    }),

    // Get expiring contracts
    getExpiringContracts: builder.query<Staff[], { schoolId: string; days?: number }>({
      query: ({ schoolId, days = 90 }) => ({
        url: `staff/contracts/expiring/${schoolId}`,
        method: 'GET',
        params: { days },
      }),
      providesTags: ['Staff'],
    }),

    // Get staff on probation
    getStaffOnProbation: builder.query<Staff[], string>({
      query: (schoolId) => ({
        url: `staff/probation/${schoolId}`,
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),

    // Bulk update staff salaries
    bulkUpdateSalaries: builder.mutation<Staff[], BulkSalaryUpdateRequest>({
      query: (body) => ({
        url: 'staff/bulk/salary-update',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    // Get staff dashboard
    getStaffDashboard: builder.query<StaffDashboardResponse, string>({
      query: (schoolId) => ({
        url: `staff/dashboard/${schoolId}`,
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),

    // Get salary report
    getSalaryReport: builder.query<SalaryReportResponse, { schoolId: string; department?: string; staffType?: TDepartment }>({
      query: ({ schoolId, department, staffType }) => ({
        url: `staff/reports/salary/${schoolId}`,
        method: 'GET',
        params: { department, staffType },
      }),
      providesTags: ['Staff'],
    }),

    // Department operations
    getStaffDepartments: builder.query<DepartmentResponse[], string>({
      query: (staffId) => ({
        url: `staff/${staffId}/departments`,
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),

    getStaffWithDepartments: builder.query<Staff, string>({
      query: (staffId) => ({
        url: `staff/${staffId}/with-departments`,
        method: 'GET',
      }),
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),


    updateStaffDepartments: builder.mutation<Staff, { staffId: string; departmentIds: string[] }>({
      query: ({ staffId, departmentIds }) => ({
        url: `staff/${staffId}/departments`,
        method: 'PUT',
        body: { departmentIds },
      }),
      invalidatesTags: (result, error, { staffId }) => [
        { type: 'Staff', id: staffId },
        'Staff',
      ],
    }),

    getStaffByDepartmentId: builder.query<Staff[], { departmentId: string; status?: TEmploymentStatus; limit?: number; offset?: number }>({
      query: ({ departmentId, status, limit, offset }) => ({
        url: `staff/department-id/${departmentId}/staff`,
        method: 'GET',
        params: { status, limit, offset },
      }),
      providesTags: ['Staff'],
    }),

    // Attendance operations
    getStaffAttendance: builder.query<StaffAttendanceResponse, string>({
      query: (staffId) => ({
        url: `staff/${staffId}/attendance`,
        method: 'GET',
      }),
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),

    updateStaffAttendance: builder.mutation<StaffAttendanceResponse, { staffId: string; attendanceData: { workingHoursPerWeek?: number; workingDaysPerWeek?: number; shiftStartTime?: string; shiftEndTime?: string } }>({
      query: ({ staffId, attendanceData }) => ({
        url: `staff/${staffId}/attendance`,
        method: 'PUT',
        body: attendanceData,
      }),
      invalidatesTags: (result, error, { staffId }) => [
        { type: 'Staff', id: staffId },
        'Staff',
      ],
    }),

    // Payroll operations
    getStaffPayroll: builder.query<StaffPayrollResponse, string>({
      query: (staffId) => ({
        url: `staff/${staffId}/payroll`,
        method: 'GET',
      }),
      providesTags: (result, error, staffId) => [{ type: 'Staff', id: staffId }],
    }),

    updateStaffPayroll: builder.mutation<StaffPayrollResponse, { staffId: string; payrollData: { basicSalary?: number; houseAllowance?: number; transportAllowance?: number; medicalAllowance?: number; otherAllowances?: number; taxDeductible?: number; providentFund?: number; otherDeductions?: number; paymentMethod?: string; bankDetails?: { bankName: string; accountNumber: string; branch: string; ifscCode: string } } }>({
      query: ({ staffId, payrollData }) => ({
        url: `staff/${staffId}/payroll`,
        method: 'PUT',
        body: payrollData,
      }),
      invalidatesTags: (result, error, { staffId }) => [
        { type: 'Staff', id: staffId },
        'Staff',
      ],
    }),

    // Get staff stats overview
    getStaffStatsOverview: builder.query<HRStatistics, void>({
      query: () => ({
        url: 'staff/stats/overview',
        method: 'GET',
      }),
      providesTags: ['Staff'],
    }),
  }),
});

export const {
  useCreateStaffMutation,
  useGetStaffByIdQuery,
  useGetStaffByEmployeeIdQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useTerminateStaffMutation,
  useSuspendStaffMutation,
  useReactivateStaffMutation,
  useUpdatePerformanceMutation,
  useProcessLeaveMutation,
  useAddLeaveBalanceMutation,
  useGetAllStaffQuery,
  useSearchStaffQuery,
  useFilterStaffQuery,
  useGetStaffBySchoolQuery,
  useGetStaffByDepartmentQuery,
  useGetStaffStatisticsQuery,
  useGetUpcomingBirthdaysQuery,
  useGetExpiringContractsQuery,
  useGetStaffOnProbationQuery,
  useBulkUpdateSalariesMutation,
  useGetStaffDashboardQuery,
  useGetSalaryReportQuery,
  useGetStaffDepartmentsQuery,
  useGetStaffWithDepartmentsQuery,
  useUpdateStaffDepartmentsMutation,
  useGetStaffByDepartmentIdQuery,
  useGetStaffAttendanceQuery,
  useUpdateStaffAttendanceMutation,
  useGetStaffPayrollQuery,
  useUpdateStaffPayrollMutation,
  useGetStaffStatsOverviewQuery,
} = staffApi;