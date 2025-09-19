import { baseApi } from '../userBaseApi';
import { PaginatedResponse } from '@academia-pro/types/shared';
import {
  IDepartment,
  IStaff,
  ICreateDepartmentRequest,
  IUpdateDepartmentRequest,
  IDepartmentFilters,
  IDepartmentStatistics,
} from '@academia-pro/types/school-admin';

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all departments with optional filtering
    getDepartments: builder.query<PaginatedResponse<IDepartment>, IDepartmentFilters>({
      query: (params) => ({
        url: 'departments',
        method: 'GET',
        params,
      }),
      providesTags: ['Department'],
    }),

    // Get departments by type
    getDepartmentsByType: builder.query<IDepartment[], IDepartment['type']>({
      query: (type) => ({
        url: `departments/type/${type}`,
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),

    // Get department by ID
    getDepartment: builder.query<IDepartment, string>({
      query: (id) => ({
        url: `departments/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),

    // Create department
    createDepartment: builder.mutation<IDepartment, ICreateDepartmentRequest>({
      query: (departmentData) => ({
        url: 'departments',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update department
    updateDepartment: builder.mutation<IDepartment, { id: string; data: IUpdateDepartmentRequest }>({
      query: ({ id, data }) => ({
        url: `departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Department', id },
        'Department',
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),

    // Assign staff to department
    assignStaffToDepartment: builder.mutation<IDepartment, { departmentId: string; staffId: string }>({
      query: ({ departmentId, staffId }) => ({
        url: `departments/${departmentId}/staff/${staffId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { departmentId }) => [
        { type: 'Department', id: departmentId },
        'Department',
      ],
    }),

    // Remove staff from department
    removeStaffFromDepartment: builder.mutation<IDepartment, { departmentId: string; staffId: string }>({
      query: ({ departmentId, staffId }) => ({
        url: `departments/${departmentId}/staff/${staffId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { departmentId }) => [
        { type: 'Department', id: departmentId },
        'Department',
      ],
    }),

    // Get department statistics
    getDepartmentStatistics: builder.query<IDepartmentStatistics, void>({
      query: () => ({
        url: 'departments/stats/overview',
        method: 'GET',
      }),
      providesTags: ['Department'],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentsByTypeQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useAssignStaffToDepartmentMutation,
  useRemoveStaffFromDepartmentMutation,
  useGetDepartmentStatisticsQuery,
} = departmentApi;
