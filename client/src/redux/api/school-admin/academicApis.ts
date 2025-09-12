import { baseApi } from '../baseApi';

// Types for academic management
export interface Subject {
  id: string;
  code: string;
  name: string;
  type: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  isActive: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Curriculum {
  id: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  schoolId: string;
  subjects: Array<{
    subjectId: string;
    subject: Subject;
    hoursPerWeek: number;
    assessmentWeight: number;
    isCompulsory: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  capacity: number;
  isActive: boolean;
  schoolId: string;
  classTeacherId?: string;
  subjects: Array<{
    subjectId: string;
    subject: Subject;
    teacherId: string;
    schedule: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LearningObjective {
  id: string;
  subjectId: string;
  gradeLevel: string;
  objective: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  code: string;
  name: string;
  type: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  schoolId: string;
}

export interface UpdateSubjectDto {
  name?: string;
  type?: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel?: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  isActive?: boolean;
}

export interface CreateCurriculumDto {
  name: string;
  gradeLevel: string;
  academicYear: string;
  description?: string;
  schoolId: string;
}

export interface CreateClassDto {
  name: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  capacity: number;
  schoolId: string;
  classTeacherId?: string;
}

export interface CreateLearningObjectiveDto {
  subjectId: string;
  gradeLevel: string;
  objective: string;
  description?: string;
}

export interface AcademicStatistics {
  totalSubjects: number;
  totalCurricula: number;
  totalClasses: number;
  totalLearningObjectives: number;
  subjectsByType: Record<string, number>;
  subjectsByGrade: Record<string, number>;
  classesByGrade: Record<string, number>;
  curriculaByYear: Record<string, number>;
  activeSubjects: number;
  activeClasses: number;
  activeCurricula: number;
}

export interface SubjectFilters {
  schoolId?: string;
  type?: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel?: string;
  isActive?: boolean;
}

export interface CurriculumFilters {
  schoolId?: string;
  gradeLevel?: string;
  academicYear?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface ClassFilters {
  schoolId?: string;
  gradeLevel?: string;
  academicYear?: string;
  isActive?: boolean;
}

export interface SubjectSearchParams extends SubjectFilters {
  page?: number;
  limit?: number;
}

export interface CurriculumSearchParams extends CurriculumFilters {
  page?: number;
  limit?: number;
}

export interface ClassSearchParams extends ClassFilters {
  page?: number;
  limit?: number;
}

export interface SubjectSearchResult {
  data: Subject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CurriculumSearchResult {
  data: Curriculum[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClassSearchResult {
  data: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Subject Management
    getSubjects: builder.query<SubjectSearchResult, SubjectSearchParams>({
      query: (params) => ({
        url: 'academic/subjects',
        method: 'GET',
        params,
      }),
      providesTags: ['Academic' as const],
    }),

    searchSubjects: builder.query<Subject[], { query: string; schoolId: string }>({
      query: ({ query, schoolId }) => ({
        url: 'academic/subjects/search',
        method: 'GET',
        params: { q: query, schoolId },
      }),
      providesTags: ['Academic' as const],
    }),

    getSubject: builder.query<Subject, string>({
      query: (id) => ({
        url: `academic/subjects/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Academic' as const, id }],
    }),

    getSubjectsByGrade: builder.query<Subject[], { schoolId: string; grade: string }>({
      query: ({ schoolId, grade }) => ({
        url: `academic/subjects/by-grade/${schoolId}/${grade}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    createSubject: builder.mutation<Subject, CreateSubjectDto>({
      query: (subjectData) => ({
        url: 'academic/subjects',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    updateSubject: builder.mutation<Subject, { id: string; data: UpdateSubjectDto }>({
      query: ({ id, data }) => ({
        url: `academic/subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Academic' as const, id },
        'Academic' as const,
      ],
    }),

    deleteSubject: builder.mutation<void, string>({
      query: (id) => ({
        url: `academic/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Curriculum Management
    getCurricula: builder.query<CurriculumSearchResult, CurriculumSearchParams>({
      query: (params) => ({
        url: 'academic/curricula',
        method: 'GET',
        params,
      }),
      providesTags: ['Academic' as const],
    }),

    getCurriculum: builder.query<Curriculum, string>({
      query: (id) => ({
        url: `academic/curricula/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Academic' as const, id }],
    }),

    getCurriculaByYear: builder.query<Curriculum[], { schoolId: string; year: string }>({
      query: ({ schoolId, year }) => ({
        url: `academic/curricula/by-year/${schoolId}/${year}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    createCurriculum: builder.mutation<Curriculum, CreateCurriculumDto>({
      query: (curriculumData) => ({
        url: 'academic/curricula',
        method: 'POST',
        body: curriculumData,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Class Management
    getClasses: builder.query<ClassSearchResult, ClassSearchParams>({
      query: (params) => ({
        url: 'academic/classes',
        method: 'GET',
        params,
      }),
      providesTags: ['Academic' as const],
    }),

    getClass: builder.query<Class, string>({
      query: (id) => ({
        url: `academic/classes/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Academic' as const, id }],
    }),

    getClassesByGrade: builder.query<Class[], { schoolId: string; grade: string }>({
      query: ({ schoolId, grade }) => ({
        url: `academic/classes/by-grade/${schoolId}/${grade}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    createClass: builder.mutation<Class, CreateClassDto>({
      query: (classData) => ({
        url: 'academic/classes',
        method: 'POST',
        body: classData,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Learning Objectives
    getLearningObjectives: builder.query<{
      data: LearningObjective[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }, {
      page?: number;
      limit?: number;
      gradeLevel?: string;
      subjectId?: string;
      isActive?: boolean;
    }>({
      query: (params) => ({
        url: 'academic/learning-objectives',
        method: 'GET',
        params,
      }),
      providesTags: ['Academic' as const],
    }),

    createLearningObjective: builder.mutation<LearningObjective, CreateLearningObjectiveDto>({
      query: (objectiveData) => ({
        url: 'academic/learning-objectives',
        method: 'POST',
        body: objectiveData,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Curriculum-Subject Management
    addSubjectToCurriculum: builder.mutation<void, {
      curriculumId: string;
      subjectId: string;
      hoursPerWeek: number;
      assessmentWeight: number;
      isCompulsory?: boolean;
    }>({
      query: ({ curriculumId, ...data }) => ({
        url: `academic/curricula/${curriculumId}/subjects`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Class-Subject-Teacher Assignment
    assignSubjectToClass: builder.mutation<void, {
      classId: string;
      subjectId: string;
      teacherId: string;
      schedule: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        room?: string;
      }>;
    }>({
      query: ({ classId, ...data }) => ({
        url: `academic/classes/${classId}/subjects`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Academic' as const],
    }),

    // Statistics and Analytics
    getAcademicStatistics: builder.query<AcademicStatistics, string>({
      query: (schoolId) => ({
        url: 'academic/statistics',
        method: 'GET',
        params: { schoolId },
      }),
      providesTags: ['Academic' as const],
    }),

    getAcademicPerformanceReport: builder.query<Record<string, unknown>, { schoolId: string; academicYear: string }>({
      query: ({ schoolId, academicYear }) => ({
        url: `academic/analytics/performance/${schoolId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    getAdvancedAcademicStatistics: builder.query<Record<string, unknown>, { schoolId: string; academicYear: string }>({
      query: ({ schoolId, academicYear }) => ({
        url: `academic/analytics/advanced/${schoolId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    getAcademicYearStatus: builder.query<Record<string, unknown>, { schoolId: string; year: string }>({
      query: ({ schoolId, year }) => ({
        url: `academic/analytics/academic-year/${schoolId}/${year}`,
        method: 'GET',
      }),
      providesTags: ['Academic' as const],
    }),

    // Integration endpoints
    getStudentAcademicData: builder.query<Record<string, unknown>, { studentId: string; academicYear: string }>({
      query: ({ studentId, academicYear }) => ({
        url: `academic/integration/student/${studentId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: (result, error, { studentId }) => [{ type: 'Academic' as const, id: studentId }],
    }),

    getParentAcademicData: builder.query<Record<string, unknown>, { parentId: string; academicYear: string }>({
      query: ({ parentId, academicYear }) => ({
        url: `academic/integration/parent/${parentId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: (result, error, { parentId }) => [{ type: 'Academic' as const, id: parentId }],
    }),

    getTeacherAcademicData: builder.query<Record<string, unknown>, { teacherId: string; academicYear: string }>({
      query: ({ teacherId, academicYear }) => ({
        url: `academic/integration/teacher/${teacherId}/${academicYear}`,
        method: 'GET',
      }),
      providesTags: (result, error, { teacherId }) => [{ type: 'Academic' as const, id: teacherId }],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useSearchSubjectsQuery,
  useGetSubjectQuery,
  useGetSubjectsByGradeQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetCurriculaQuery,
  useGetCurriculumQuery,
  useGetCurriculaByYearQuery,
  useCreateCurriculumMutation,
  useGetClassesQuery,
  useGetClassQuery,
  useGetClassesByGradeQuery,
  useCreateClassMutation,
  useGetLearningObjectivesQuery,
  useCreateLearningObjectiveMutation,
  useAddSubjectToCurriculumMutation,
  useAssignSubjectToClassMutation,
  useGetAcademicStatisticsQuery,
  useGetAcademicPerformanceReportQuery,
  useGetAdvancedAcademicStatisticsQuery,
  useGetAcademicYearStatusQuery,
  useGetStudentAcademicDataQuery,
  useGetParentAcademicDataQuery,
  useGetTeacherAcademicDataQuery,
} = academicApi;