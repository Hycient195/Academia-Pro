import { baseApi } from '../baseApi';

// Define types locally for now
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: 'general' | 'academic' | 'financial' | 'emergency';
  targetAudience: 'all' | 'students' | 'parents' | 'staff';
  priority: 'low' | 'medium' | 'high';
}

export const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Announcement
    createAnnouncement: builder.mutation<Announcement, CreateAnnouncementRequest>({
      query: (announcementData) => ({
        url: '/communication/announcement',
        method: 'POST',
        body: announcementData,
      }),
      invalidatesTags: ['Communication'],
    }),

    // Get Announcements
    getAnnouncements: builder.query<Announcement[], void>({
      query: () => '/communication/notices',
      providesTags: ['Communication'],
    }),

    // Additional communication endpoints can be added here
    getAnnouncementById: builder.query<Announcement, string>({
      query: (id) => `/communication/announcement/${id}`,
      providesTags: (result, error, id) => [{ type: 'Communication', id }],
    }),

    updateAnnouncement: builder.mutation<Announcement, { id: string; data: Partial<CreateAnnouncementRequest> }>({
      query: ({ id, data }) => ({
        url: `/communication/announcement/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Communication', id },
        'Communication',
      ],
    }),

    deleteAnnouncement: builder.mutation<void, string>({
      query: (id) => ({
        url: `/communication/announcement/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Communication'],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = communicationApi;