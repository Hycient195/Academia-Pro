import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  ISuperAdminSchool,
  ICreateSchoolRequest,
  IUpdateSchoolRequest,
} from '@academia-pro/types/super-admin';
import { ISchoolFilters, TSchoolType } from '@academia-pro/types/shared';
import { PaginatedResponse } from '@academia-pro/types/shared';
import { GLOBAL_API_URL } from '../globalURLs';

export const schoolsApi = createApi({
  reducerPath: 'schoolsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Schools'],
  endpoints: (builder) => ({
    // Create a new school
    createSchool: builder.mutation<ISuperAdminSchool, ICreateSchoolRequest>({
      query: (schoolData) => ({
        url: '/schools',
        method: 'POST',
        body: schoolData,
      }),
      invalidatesTags: ['Schools'],
    }),

    // Get all schools with pagination and filtering
    getAllSchools: builder.query<PaginatedResponse<ISuperAdminSchool>, ISchoolFilters & { page?: number; limit?: number }>({
      query: (filters) => ({
        url: '/schools',
        params: filters,
      }),
      providesTags: ['Schools'],
    }),

    // Get all active schools
    getActiveSchools: builder.query<ISuperAdminSchool[], void>({
      query: () => '/schools/active',
      providesTags: ['Schools'],
    }),

    // Search schools
    searchSchools: builder.query<ISuperAdminSchool[], { query: string; type?: TSchoolType; limit?: number }>({
      query: ({ query, type, limit }) => ({
        url: '/schools/search',
        params: { query, type, limit },
      }),
      providesTags: ['Schools'],
    }),

    // Get school by ID
    getSchoolById: builder.query<ISuperAdminSchool, string>({
      query: (schoolId) => `/schools/${schoolId}`,
      providesTags: (result, error, schoolId) => [{ type: 'Schools', id: schoolId }],
    }),

    // Get school by code
    getSchoolByCode: builder.query<ISuperAdminSchool, string>({
      query: (code) => `/schools/code/${code}`,
      providesTags: ['Schools'],
    }),

    // Update school
    updateSchool: builder.mutation<ISuperAdminSchool, { schoolId: string; updates: IUpdateSchoolRequest }>({
      query: ({ schoolId, updates }) => ({
        url: `/schools/${schoolId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { schoolId }) => [
        { type: 'Schools', id: schoolId },
        'Schools'
      ],
    }),

    // Activate school
    activateSchool: builder.mutation<ISuperAdminSchool, string>({
      query: (schoolId) => ({
        url: `/schools/${schoolId}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, schoolId) => [
        { type: 'Schools', id: schoolId },
        'Schools'
      ],
    }),

    // Deactivate school
    deactivateSchool: builder.mutation<ISuperAdminSchool, string>({
      query: (schoolId) => ({
        url: `/schools/${schoolId}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, schoolId) => [
        { type: 'Schools', id: schoolId },
        'Schools'
      ],
    }),

    // Update school settings
    updateSchoolSettings: builder.mutation<ISuperAdminSchool, { schoolId: string; settings: Record<string, unknown> }>({
      query: ({ schoolId, settings }) => ({
        url: `/schools/${schoolId}/settings`,
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: (result, error, { schoolId }) => [
        { type: 'Schools', id: schoolId },
        'Schools'
      ],
    }),

    // Get school statistics
    getSchoolStatistics: builder.query<Record<string, unknown>, string>({
      query: (schoolId) => `/schools/${schoolId}/statistics`,
      providesTags: (result, error, schoolId) => [{ type: 'Schools', id: schoolId }],
    }),

    // Delete school
    deleteSchool: builder.mutation<void, string>({
      query: (schoolId) => ({
        url: `/schools/${schoolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schools'],
    }),
  }),
});

export const {
  useCreateSchoolMutation,
  useGetAllSchoolsQuery,
  useGetActiveSchoolsQuery,
  useSearchSchoolsQuery,
  useGetSchoolByIdQuery,
  useGetSchoolByCodeQuery,
  useUpdateSchoolMutation,
  useActivateSchoolMutation,
  useDeactivateSchoolMutation,
  useUpdateSchoolSettingsMutation,
  useGetSchoolStatisticsQuery,
  useDeleteSchoolMutation,
} = schoolsApi;