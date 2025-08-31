export declare enum TSubjectType {
    CORE = "core",
    ELECTIVE = "elective",
    PRACTICAL = "practical",
    LANGUAGE = "language",
    ARTS = "arts",
    SPORTS = "sports"
}
export declare enum TGradeLevel {
    NURSERY = "nursery",
    LKG = "lkg",
    UKG = "ukg",
    GRADE_1 = "grade_1",
    GRADE_2 = "grade_2",
    GRADE_3 = "grade_3",
    GRADE_4 = "grade_4",
    GRADE_5 = "grade_5",
    GRADE_6 = "grade_6",
    GRADE_7 = "grade_7",
    GRADE_8 = "grade_8",
    GRADE_9 = "grade_9",
    GRADE_10 = "grade_10",
    GRADE_11 = "grade_11",
    GRADE_12 = "grade_12"
}
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
export interface ISubject {
    id: string;
    code: string;
    name: string;
    type: TSubjectType;
    description?: string;
    credits?: number;
    prerequisites?: string[];
    gradeLevels: TGradeLevel[];
    isActive: boolean;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
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
export interface IClass {
    id: string;
    name: string;
    gradeLevel: TGradeLevel;
    section: string;
    capacity: number;
    currentEnrollment: number;
    classTeacherId?: string;
    academicYear: string;
    subjects: IClassSubject[];
    isActive: boolean;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IClassSubject {
    subjectId: string;
    subject: ISubject;
    teacherId: string;
    schedule: ISubjectSchedule[];
}
export interface ISubjectSchedule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
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