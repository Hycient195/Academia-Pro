import { baseApi } from './userBaseApi';
import {
  ISuperAdminSchool,
  ICreateSchoolRequest,
  IUpdateSchoolRequest,
} from '@academia-pro/types/super-admin';
import { ISchoolFilters, TSchoolType } from '@academia-pro/types/shared';
import { PaginatedResponse } from '@academia-pro/types/shared';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    // Get all active schools
    getActiveSchools: builder.query<ISuperAdminSchool[], void>({
      query: () => '/schools/active',
      providesTags: ['Schools'],
    }),



    // Get school by code
    getSchoolByCode: builder.query<ISuperAdminSchool, string>({
      query: (code) => `/schools/code/${code}`,
      providesTags: ['Schools'],
    }),

  }),
});

export const {
  useGetActiveSchoolsQuery,
  useGetSchoolByCodeQuery,
} = schoolsApi;