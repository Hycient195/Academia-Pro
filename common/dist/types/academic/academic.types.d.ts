import { TGradeLevel, ISubjectSchedule, IClass, TSubjectType, ISubject } from '../shared';
export declare enum TAcademicYearStatus {
    PLANNING = "planning",
    ACTIVE = "active",
    COMPLETED = "completed",
    ARCHIVED = "archived"
}
export declare enum TLearningObjectiveType {
    KNOWLEDGE = "knowledge",
    SKILLS = "skills",
    ATTITUDES = "attitudes",
    VALUES = "values"
}
export interface ICurriculum {
    id: string;
    name: string;
    description?: string;
    gradeLevel: TGradeLevel;
    academicYear: string;
    subjects: ICurriculumSubject[];
    learningObjectives: ILearningObjective[];
    status: TAcademicYearStatus;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICurriculumSubject {
    subjectId: string;
    subject: ISubject;
    hoursPerWeek: number;
    totalHours: number;
    assessmentWeight: number;
    isCompulsory: boolean;
}
export interface ILearningObjective {
    id: string;
    code: string;
    description: string;
    type: TLearningObjectiveType;
    gradeLevel: TGradeLevel;
    subjectId?: string;
    bloomLevel: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAcademicCalendar {
    id: string;
    academicYear: string;
    startDate: Date;
    endDate: Date;
    terms: IAcademicTerm[];
    holidays: IHoliday[];
    events: IAcademicEvent[];
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAcademicTerm {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
}
export interface IHoliday {
    id: string;
    name: string;
    date: Date;
    type: 'national' | 'regional' | 'school' | 'religious';
    description?: string;
}
export interface IAcademicEvent {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    type: 'exam' | 'holiday' | 'event' | 'activity' | 'meeting';
    isAllDay: boolean;
    targetAudience?: string[];
}
export interface ICreateSubjectRequest {
    code: string;
    name: string;
    type: TSubjectType;
    description?: string;
    credits?: number;
    prerequisites?: string[];
    gradeLevels: TGradeLevel[];
    schoolId: string;
}
export interface IUpdateSubjectRequest {
    code?: string;
    name?: string;
    type?: TSubjectType;
    description?: string;
    credits?: number;
    prerequisites?: string[];
    gradeLevels?: TGradeLevel[];
    isActive?: boolean;
}
export interface ICreateCurriculumRequest {
    name: string;
    description?: string;
    gradeLevel: TGradeLevel;
    academicYear: string;
    schoolId: string;
}
export interface IUpdateCurriculumRequest {
    name?: string;
    description?: string;
    status?: TAcademicYearStatus;
}
export interface ICreateClassRequest {
    name: string;
    gradeLevel: TGradeLevel;
    section: string;
    capacity: number;
    classTeacherId?: string;
    academicYear: string;
    schoolId: string;
}
export interface IUpdateClassRequest {
    name?: string;
    capacity?: number;
    classTeacherId?: string;
    isActive?: boolean;
}
export interface ICreateLearningObjectiveRequest {
    code: string;
    description: string;
    type: TLearningObjectiveType;
    gradeLevel: TGradeLevel;
    subjectId?: string;
    bloomLevel: number;
}
export interface IUpdateLearningObjectiveRequest {
    code?: string;
    description?: string;
    type?: TLearningObjectiveType;
    bloomLevel?: number;
    isActive?: boolean;
}
export interface IAssignSubjectToClassRequest {
    subjectId: string;
    teacherId: string;
    schedule: ISubjectSchedule[];
}
export interface ICreateAcademicCalendarRequest {
    academicYear: string;
    startDate: Date;
    endDate: Date;
    schoolId: string;
}
export interface IUpdateAcademicCalendarRequest {
    startDate?: Date;
    endDate?: Date;
}
export interface ISubjectResponse extends ISubject {
    curriculumCount: number;
    classCount: number;
}
export interface ICurriculumResponse extends Omit<ICurriculum, 'subjects' | 'learningObjectives'> {
    subjectCount: number;
    objectiveCount: number;
}
export interface IClassResponse extends Omit<IClass, 'subjects'> {
    classTeacher?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    subjectCount: number;
    studentCount: number;
    utilizationPercentage: number;
}
export interface ILearningObjectiveResponse extends ILearningObjective {
    subject?: {
        id: string;
        name: string;
        code: string;
    };
    bloomLevelName: string;
}
export interface IAcademicCalendarResponse extends IAcademicCalendar {
    termCount: number;
    holidayCount: number;
    eventCount: number;
}
export interface ISubjectFilters {
    type?: TSubjectType;
    gradeLevel?: TGradeLevel;
    isActive?: boolean;
    schoolId: string;
}
export interface ICurriculumFilters {
    gradeLevel?: TGradeLevel;
    academicYear?: string;
    status?: TAcademicYearStatus;
    schoolId: string;
}
export interface IClassFilters {
    gradeLevel?: TGradeLevel;
    academicYear?: string;
    isActive?: boolean;
    schoolId: string;
}
export interface ILearningObjectiveFilters {
    type?: TLearningObjectiveType;
    gradeLevel?: TGradeLevel;
    subjectId?: string;
    isActive?: boolean;
}
export interface IAcademicStatistics {
    totalSubjects: number;
    totalCurricula: number;
    totalClasses: number;
    totalObjectives: number;
    subjectsByType: Record<TSubjectType, number>;
    classesByGrade: Record<TGradeLevel, number>;
    curriculaByStatus: Record<TAcademicYearStatus, number>;
    objectivesByType: Record<TLearningObjectiveType, number>;
}
export interface IAcademicValidationRules {
    maxSubjectsPerCurriculum: number;
    maxClassesPerGrade: number;
    maxStudentsPerClass: number;
    minCreditsPerSubject: number;
    maxCreditsPerSubject: number;
    academicYearFormat: string;
    subjectCodeFormat: string;
}
//# sourceMappingURL=academic.types.d.ts.map