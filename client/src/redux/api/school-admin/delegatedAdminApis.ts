import { baseApi } from '../userBaseApi';

export const delegatedAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all delegated school admins for current school
    getDelegatedSchoolAdmins: builder.query({
      query: () => '/school-admin/delegated-admins',
      providesTags: ['DelegatedSchoolAdmins'],
    }),

    // Get specific delegated school admin
    getDelegatedSchoolAdminById: builder.query({
      query: (id) => `/school-admin/delegated-admins/${id}`,
      providesTags: (result, error, id) => [{ type: 'DelegatedSchoolAdmins', id }],
    }),

    // Create delegated school admin
    createDelegatedSchoolAdmin: builder.mutation({
      query: (data) => ({
        url: '/school-admin/delegated-admins',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DelegatedSchoolAdmins'],
    }),

    // Update delegated school admin
    updateDelegatedSchoolAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/school-admin/delegated-admins/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DelegatedSchoolAdmins', id },
        'DelegatedSchoolAdmins'
      ],
    }),

    // Revoke delegated school admin
    revokeDelegatedSchoolAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/school-admin/delegated-admins/${id}/revoke`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DelegatedSchoolAdmins', id },
        'DelegatedSchoolAdmins'
      ],
    }),

    // Delete delegated school admin
    deleteDelegatedSchoolAdmin: builder.mutation({
      query: (id) => ({
        url: `/school-admin/delegated-admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DelegatedSchoolAdmins'],
    }),
  }),
});

export const {
  useGetDelegatedSchoolAdminsQuery,
  useGetDelegatedSchoolAdminByIdQuery,
  useCreateDelegatedSchoolAdminMutation,
  useUpdateDelegatedSchoolAdminMutation,
  useRevokeDelegatedSchoolAdminMutation,
  useDeleteDelegatedSchoolAdminMutation,
} = delegatedAdminApi;