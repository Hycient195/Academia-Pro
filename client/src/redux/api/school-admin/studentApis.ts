import { baseApi } from '../userBaseApi';

// Import consolidated types from common package
import type {
  ICreateStudentRequest,
} from '@academia-pro/types/student';
import type {
  IStudent,
  IUpdateStudentRequest,
  ITransferStudentRequest,
  IAssignClassRequest,
  IPromotionRequestDto,
  IBulkImportRequestDto,
  IGraduationRequestDto,
  ITransferStudentRequestDto,
  IStudentStatistics,
  IStudentSearchParams,
  IStudentSearchResult,
} from '@academia-pro/types/school-admin';
import { PaginatedResponse } from '@academia-pro/types/shared';

// Re-export types for backward compatibility
export type {
  IStudent as Student,
  ICreateStudentRequest as CreateStudentRequest,
  IUpdateStudentRequest as UpdateStudentRequest,
  ITransferStudentRequest as TransferStudentRequest,
  IAssignClassRequest as AssignClassRequest,
  IPromotionRequestDto as PromotionRequestDto,
  IBulkImportRequestDto as BulkImportRequestDto,
  IGraduationRequestDto as GraduationRequestDto,
  ITransferStudentRequestDto as TransferStudentRequestDto,
  IStudentStatistics as StudentStatistics,
  IStudentSearchParams as StudentSearchParams,
  IStudentSearchResult as StudentSearchResult,
};

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all students with pagination and filtering
    getStudents: builder.query<PaginatedResponse<IStudent>, IStudentSearchParams>({
      query: (params) => {
        // Ensure arrays are properly serialized for RTK Query cache key
        const apiParams: Record<string, unknown> = { ...params };
        if (params.stages) apiParams.stages = params.stages.join(',');
        if (params.gradeCodes) apiParams.gradeCodes = params.gradeCodes.join(',');
        if (params.streamSections) apiParams.streamSections = params.streamSections.join(',');
        if (params.statuses) apiParams.statuses = params.statuses.join(',');

        // Ensure parameter names match backend expectations
        if (apiParams.stages) apiParams.stages = apiParams.stages;
        if (apiParams.gradeCodes) apiParams.gradeCodes = apiParams.gradeCodes;
        if (apiParams.streamSections) apiParams.streamSections = apiParams.streamSections;
        if (apiParams.statuses) apiParams.statuses = apiParams.statuses;

        console.log('API Debug - Serialized params:', apiParams);

        return {
          url: 'students',
          method: 'GET',
          params: apiParams,
        };
      },
      providesTags: ['Students' as const],
    }),

    // Search students
    searchStudents: builder.query<IStudent[], {
      query: string;
      schoolId?: string;
      grade?: string;
      section?: string;
      limit?: number;
    }>({
      query: ({ query, schoolId, grade, section, limit }) => ({
        url: 'students/search',
        method: 'GET',
        params: { query, schoolId, grade, section, limit },
      }),
      providesTags: ['Students' as const],
    }),

    // Get student by ID
    getStudent: builder.query<IStudent, string>({
      query: (id) => ({
        url: `students/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Students', id }],
    }),

    // Get student by admission number
    getStudentByAdmissionNumber: builder.query<IStudent, string>({
      query: (admissionNumber) => ({
        url: `students/admission/${admissionNumber}`,
        method: 'GET',
      }),
      providesTags: ['Students' as const],
    }),

    // Get students by grade
    getStudentsByGrade: builder.query<IStudent[], { schoolId: string; gradeCode: string }>({
      query: ({ schoolId, gradeCode }) => ({
        url: `students/by-grade/${schoolId}/${gradeCode}`,
        method: 'GET',
      }),
      providesTags: ['Students' as const],
    }),

    // Get students by section
    getStudentsBySection: builder.query<IStudent[], {
      schoolId: string;
      gradeCode: string;
      streamSection: string;
    }>({
      query: ({ schoolId, gradeCode, streamSection }) => ({
        url: `students/by-section/${schoolId}/${gradeCode}/${streamSection}`,
        method: 'GET',
      }),
      providesTags: ['Students' as const],
    }),

    // Get student statistics
    getStudentStatistics: builder.query<IStudentStatistics, string | undefined>({
      query: (schoolId) => ({
        url: 'students/statistics',
        method: 'GET',
        params: schoolId ? { schoolId } : undefined,
      }),
      providesTags: ['Students' as const],
    }),

    // Create student
    createStudent: builder.mutation<IStudent, ICreateStudentRequest>({
      query: (studentData) => ({
        url: 'students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Students' as const],
    }),

    // Update student
    updateStudent: builder.mutation<IStudent, { id: string; data: Partial<IUpdateStudentRequest>; reason?: string }>({
      query: ({ id, data, reason }) => ({
        url: `students/${id}`,
        method: 'PATCH',
        body: data,
        params: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // Update student status
    updateStudentStatus: builder.mutation<IStudent, {
      id: string;
      status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn' | 'suspended';
      reason?: string;
    }>({
      query: ({ id, status, reason }) => ({
        url: `students/${id}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // Transfer student internally
    transferStudent: builder.mutation<IStudent, { id: string; data: ITransferStudentRequest }>({
      query: ({ id, data }) => ({
        url: `students/${id}/transfer`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // External transfer
    externalTransferStudent: builder.mutation<IStudent, { id: string; data: ITransferStudentRequest }>({
      query: ({ id, data }) => ({
        url: `students/${id}/transfer/external`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // Graduate student
    graduateStudent: builder.mutation<IStudent, { id: string; graduationYear: number; clearanceStatus?: string }>({
      query: ({ id, graduationYear, clearanceStatus }) => ({
        url: `students/${id}/graduate`,
        method: 'POST',
        body: { graduationYear, clearanceStatus },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // Assign class
    assignStudentClass: builder.mutation<IStudent, { id: string; data: IAssignClassRequest }>({
      query: ({ id, data }) => ({
        url: `students/${id}/assign-class`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students', id },
        'Students',
      ],
    }),

    // Update medical info
    updateStudentMedicalInfo: builder.mutation<IStudent, { id: string; data: Partial<IStudent['medicalInfo']> }>({
      query: ({ id, data }) => ({
        url: `students/${id}/medical-info`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students' as const, id },
        'Students' as const,
      ],
    }),

    // Update financial info
    updateStudentFinancialInfo: builder.mutation<IStudent, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({
        url: `students/${id}/financial-info`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students' as const, id },
        'Students' as const,
      ],
    }),

    // Add document
    addStudentDocument: builder.mutation<IStudent, { id: string; data: { type: string; name: string; file: File } }>({
      query: ({ id, data }) => ({
        url: `students/${id}/documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Students' as const, id },
        'Students' as const,
      ],
    }),

    // Delete student
    deleteStudent: builder.mutation<void, string>({
      query: (id) => ({
        url: `students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Students' as const],
    }),

    // Batch operations
    executePromotion: builder.mutation<{ promotedStudents: number; studentIds: string[] }, {
      scope: 'all' | 'grade' | 'section' | 'students';
      gradeCode?: string;
      streamSection?: string;
      studentIds?: string[];
      targetGradeCode: string;
      academicYear: string;
      includeRepeaters?: boolean;
      reason?: string;
    }>({
      query: (data) => ({
        url: 'students/promotion',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Students' as const],
    }),

    bulkImportStudents: builder.mutation<{ success: boolean; message: string; imported: number; errors: string[] }, IBulkImportRequestDto>({
      query: (data) => ({
        url: 'students/bulk-import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Students' as const],
    }),

    batchGraduateStudents: builder.mutation<{ success: boolean; message: string; graduated: number }, IGraduationRequestDto>({
      query: (data) => ({
        url: 'students/batch-graduate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Students' as const],
    }),

    batchTransferStudents: builder.mutation<{ success: boolean; message: string; transferred: number }, ITransferStudentRequestDto>({
      query: (data) => ({
        url: 'students/batch-transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Students' as const],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useSearchStudentsQuery,
  useGetStudentQuery,
  useGetStudentByAdmissionNumberQuery,
  useGetStudentsByGradeQuery,
  useGetStudentsBySectionQuery,
  useGetStudentStatisticsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useUpdateStudentStatusMutation,
  useTransferStudentMutation,
  useExternalTransferStudentMutation,
  useGraduateStudentMutation,
  useAssignStudentClassMutation,
  useUpdateStudentMedicalInfoMutation,
  useUpdateStudentFinancialInfoMutation,
  useAddStudentDocumentMutation,
  useDeleteStudentMutation,
  useExecutePromotionMutation,
  useBulkImportStudentsMutation,
  useBatchGraduateStudentsMutation,
  useBatchTransferStudentsMutation,
} = studentApi;