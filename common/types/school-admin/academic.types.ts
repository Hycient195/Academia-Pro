// Academia Pro - Academic Types for School Admin
// Consolidated type definitions for academic management

export interface ISubject {
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

export interface ICurriculum {
  id: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  schoolId: string;
  subjects: Array<{
    subjectId: string;
    subject: ISubject;
    hoursPerWeek: number;
    assessmentWeight: number;
    isCompulsory: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IClass {
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
    subject: ISubject;
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

export interface ILearningObjective {
  id: string;
  subjectId: string;
  gradeLevel: string;
  objective: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSubjectRequest {
  code: string;
  name: string;
  type: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  schoolId: string;
}

export interface IUpdateSubjectRequest {
  name?: string;
  type?: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel?: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  isActive?: boolean;
}

export interface ICreateCurriculumRequest {
  name: string;
  gradeLevel: string;
  academicYear: string;
  description?: string;
  schoolId: string;
}

export interface ICreateClassRequest {
  name: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  capacity: number;
  schoolId: string;
  classTeacherId?: string;
}

export interface ICreateLearningObjectiveRequest {
  subjectId: string;
  gradeLevel: string;
  objective: string;
  description?: string;
}

export interface IAcademicStatistics {
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

export interface ISubjectFilters {
  schoolId?: string;
  type?: 'core' | 'elective' | 'practical' | 'theory';
  gradeLevel?: string;
  isActive?: boolean;
}

export interface ICurriculumFilters {
  schoolId?: string;
  gradeLevel?: string;
  academicYear?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface IClassFilters {
  schoolId?: string;
  gradeLevel?: string;
  academicYear?: string;
  isActive?: boolean;
}

export interface ISubjectSearchParams extends ISubjectFilters {
  page?: number;
  limit?: number;
}

export interface ICurriculumSearchParams extends ICurriculumFilters {
  page?: number;
  limit?: number;
}

export interface IClassSearchParams extends IClassFilters {
  page?: number;
  limit?: number;
}

export interface ISubjectSearchResult {
  data: ISubject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ICurriculumSearchResult {
  data: ICurriculum[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IClassSearchResult {
  data: IClass[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Curriculum-Subject Management
export interface IAddSubjectToCurriculumRequest {
  subjectId: string;
  hoursPerWeek: number;
  assessmentWeight: number;
  isCompulsory?: boolean;
}

// Class-Subject-Teacher Assignment
export interface IAssignSubjectToClassRequest {
  subjectId: string;
  teacherId: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
  }>;
}

// Academic Performance and Analytics
export interface IAcademicPerformanceReport {
  period: string;
  summary: {
    totalStudents: number;
    averageGPA: number;
    passRate: number;
    topPerformers: number;
  };
  gradeDistribution: Record<string, number>;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    passRate: number;
  }>;
  studentPerformance: Array<{
    studentId: string;
    studentName: string;
    gpa: number;
    rank: number;
  }>;
}

export interface IAdvancedAcademicStatistics {
  period: string;
  trends: {
    enrollmentGrowth: number;
    performanceTrend: number;
    subjectDifficulty: Record<string, number>;
  };
  correlations: {
    attendanceVsPerformance: number;
    studyHoursVsPerformance: number;
  };
  predictions: {
    graduationRate: number;
    atRiskStudents: number;
  };
}

export interface IAcademicYearStatus {
  academicYear: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  totalSubjects: number;
  totalClasses: number;
  totalStudents: number;
  completionPercentage: number;
}

// Integration Data Types
export interface IStudentAcademicData {
  studentId: string;
  academicYear: string;
  currentGrade: string;
  currentSection: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    currentGrade?: string;
    attendanceRate: number;
  }>;
  performance: {
    gpa: number;
    rank: number;
    totalStudents: number;
  };
  attendance: {
    overallRate: number;
    bySubject: Record<string, number>;
  };
}

export interface IParentAcademicData {
  parentId: string;
  academicYear: string;
  children: Array<{
    studentId: string;
    studentName: string;
    grade: string;
    section: string;
    performance: {
      gpa: number;
      attendanceRate: number;
    };
    recentGrades: Array<{
      subject: string;
      grade: string;
      date: string;
    }>;
  }>;
}

export interface ITeacherAcademicData {
  teacherId: string;
  academicYear: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    classes: Array<{
      classId: string;
      className: string;
      studentCount: number;
      averagePerformance: number;
    }>;
  }>;
  workload: {
    totalHours: number;
    classesCount: number;
    studentsCount: number;
  };
  performance: {
    averageClassPerformance: number;
    studentSatisfaction: number;
  };
}