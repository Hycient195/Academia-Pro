export declare enum TExamType {
    QUIZ = "quiz",
    MID_TERM = "mid_term",
    FINAL = "final",
    PRACTICAL = "practical",
    PROJECT = "project",
    ASSIGNMENT = "assignment",
    PRESENTATION = "presentation",
    LAB_WORK = "lab_work",
    COMPREHENSIVE = "comprehensive",
    ENTRANCE = "entrance",
    SCHOLARSHIP = "scholarship",
    OTHER = "other"
}
export declare enum TExamStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    PUBLISHED = "published",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    GRADED = "graded",
    CANCELLED = "cancelled",
    POSTPONED = "postponed"
}
export declare enum TGradingMethod {
    MANUAL = "manual",
    AUTOMATIC = "automatic",
    HYBRID = "hybrid",
    PEER_REVIEW = "peer_review",
    EXTERNAL = "external"
}
export declare enum TExaminationAssessmentType {
    FORMATIVE = "formative",
    SUMMATIVE = "summative",
    DIAGNOSTIC = "diagnostic",
    PLACEMENT = "placement"
}
export { TExaminationAssessmentType as TAssessmentType };
export declare enum TExamResultStatus {
    PENDING = "pending",
    SUBMITTED = "submitted",
    GRADED = "graded",
    LATE_SUBMISSION = "late_submission",
    MISSING = "missing",
    EXEMPTED = "exempted"
}
export declare enum TQuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TRUE_FALSE = "true_false",
    SHORT_ANSWER = "short_answer",
    ESSAY = "essay",
    FILL_IN_BLANK = "fill_in_blank",
    MATCHING = "matching",
    ORDERING = "ordering"
}
export interface IExam {
    id: string;
    examTitle: string;
    examDescription?: string;
    examType: TExamType;
    assessmentType: TExaminationAssessmentType;
    status: TExamStatus;
    subjectId: string;
    classId: string;
    sectionId?: string;
    teacherId: string;
    academicYear: string;
    gradeLevel: string;
    section?: string;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    bufferTimeMinutes: number;
    totalMarks: number;
    passingMarks: number;
    weightagePercentage: number;
    gradingMethod: TGradingMethod;
    totalQuestions?: number;
    questionPaperUrl?: string;
    answerKeyUrl?: string;
    instructions?: string;
    isMandatory: boolean;
    allowRetake: boolean;
    maxRetakes: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultsImmediately: boolean;
    allowReviewAfterSubmission: boolean;
    requiresProctoring: boolean;
    proctorId?: string;
    monitoringEnabled: boolean;
    screenshotIntervalMinutes?: number;
    tabSwitchAllowed: boolean;
    maxTabSwitches: number;
    eligibilityCriteria: {
        minimumAttendancePercentage?: number;
        prerequisiteExams?: string[];
        requiredAssignments?: string[];
        specialPermissions?: string[];
    };
    excludedStudents: string[];
    notifyStudents: boolean;
    notifyParents: boolean;
    reminderHoursBefore: number;
    resultsPublished: boolean;
    resultsPublishDate?: Date;
    gradeDistribution: {
        A?: number;
        B?: number;
        C?: number;
        D?: number;
        F?: number;
        customGrades?: Record<string, number>;
    };
    enrolledStudentsCount: number;
    submittedCount: number;
    gradedCount: number;
    averageScore?: number;
    highestScore?: number;
    lowestScore?: number;
    passPercentage?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
export interface IExamResult {
    id: string;
    examId: string;
    studentId: string;
    status: TExamResultStatus;
    marksObtained?: number;
    percentage?: number;
    grade?: string;
    remarks?: string;
    submittedAt?: Date;
    gradedAt?: Date;
    gradedBy?: string;
    timeTakenMinutes?: number;
    attemptsCount: number;
    isLateSubmission: boolean;
    lateSubmissionReason?: string;
    plagiarismScore?: number;
    reviewComments?: string;
    answerSheetUrl?: string;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IStudentAnswer {
    id: string;
    examResultId: string;
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    marksAwarded?: number;
    timeSpentSeconds?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateExamRequest {
    examTitle: string;
    examDescription?: string;
    examType: TExamType;
    assessmentType?: TExaminationAssessmentType;
    subjectId: string;
    classId: string;
    sectionId?: string;
    teacherId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    bufferTimeMinutes?: number;
    totalMarks: number;
    passingMarks: number;
    weightagePercentage?: number;
    gradingMethod?: TGradingMethod;
    totalQuestions?: number;
    instructions?: string;
    isMandatory?: boolean;
    allowRetake?: boolean;
    maxRetakes?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResultsImmediately?: boolean;
    allowReviewAfterSubmission?: boolean;
    requiresProctoring?: boolean;
    proctorId?: string;
    monitoringEnabled?: boolean;
    screenshotIntervalMinutes?: number;
    tabSwitchAllowed?: boolean;
    maxTabSwitches?: number;
    eligibilityCriteria?: {
        minimumAttendancePercentage?: number;
        prerequisiteExams?: string[];
        requiredAssignments?: string[];
        specialPermissions?: string[];
    };
    excludedStudents?: string[];
    notifyStudents?: boolean;
    notifyParents?: boolean;
    reminderHoursBefore?: number;
}
export interface IUpdateExamRequest {
    examTitle?: string;
    examDescription?: string;
    examType?: TExamType;
    assessmentType?: TExaminationAssessmentType;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    bufferTimeMinutes?: number;
    totalMarks?: number;
    passingMarks?: number;
    weightagePercentage?: number;
    gradingMethod?: TGradingMethod;
    instructions?: string;
    isMandatory?: boolean;
    allowRetake?: boolean;
    maxRetakes?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResultsImmediately?: boolean;
    allowReviewAfterSubmission?: boolean;
    requiresProctoring?: boolean;
    proctorId?: string;
    monitoringEnabled?: boolean;
    screenshotIntervalMinutes?: number;
    tabSwitchAllowed?: boolean;
    maxTabSwitches?: number;
    eligibilityCriteria?: {
        minimumAttendancePercentage?: number;
        prerequisiteExams?: string[];
        requiredAssignments?: string[];
        specialPermissions?: string[];
    };
    excludedStudents?: string[];
    notifyStudents?: boolean;
    notifyParents?: boolean;
    reminderHoursBefore?: number;
}
export interface ISubmitExamResultRequest {
    examId: string;
    studentId: string;
    questionScores?: Array<{
        questionId: string;
        obtainedMarks: number;
        totalMarks: number;
        timeSpentSeconds?: number;
        attempts?: number;
        isCorrect?: boolean;
    }>;
    notes?: string;
}
export interface IGradeExamResultRequest {
    examResultId: string;
    obtainedMarks: number;
    teacherComments?: string;
    improvementAreas?: string[];
    strengths?: string[];
}
export interface ICreateQuestionRequest {
    examId: string;
    questionNumber: number;
    questionText: string;
    questionType: TQuestionType;
    marks: number;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic?: string;
    subtopic?: string;
}
export interface IBulkGradeRequest {
    examId: string;
    results: Array<{
        studentId: string;
        marksObtained: number;
        grade?: string;
        remarks?: string;
    }>;
}
export interface IRequestReEvaluationRequest {
    examResultId: string;
    reason: string;
}
export interface IExamResponse extends Omit<IExam, 'createdBy' | 'updatedBy'> {
    subject?: {
        id: string;
        name: string;
        code: string;
    };
    class?: {
        id: string;
        name: string;
        gradeLevel: string;
        section: string;
    };
    teacher?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    proctor?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    statistics: {
        enrolledStudents: number;
        submittedCount: number;
        gradedCount: number;
        averageScore?: number;
        passPercentage?: number;
    };
}
export interface IExamResultResponse {
    id: string;
    examId: string;
    studentId: string;
    status: TExamResultStatus;
    marksObtained?: number;
    percentage?: number;
    grade?: string;
    remarks?: string;
    submittedAt?: Date;
    gradedAt?: Date;
    gradedBy?: string;
    timeTakenMinutes?: number;
    attemptsCount: number;
    isLateSubmission: boolean;
    lateSubmissionReason?: string;
    plagiarismScore?: number;
    reviewComments?: string;
    answerSheetUrl?: string;
    feedback?: string;
    exam?: {
        id: string;
        title: string;
        subject: string;
        totalMarks: number;
    };
    student?: {
        id: string;
        firstName: string;
        lastName: string;
        admissionNumber: string;
    };
    grader?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    timeAgo: string;
    isLate: boolean;
    gradeColor: string;
}
export interface IExamListResponse {
    exams: IExamResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
        totalExams: number;
        scheduledExams: number;
        completedExams: number;
        averagePassRate?: number;
    };
}
export interface IExamResultListResponse {
    results: IExamResultResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    exam: {
        id: string;
        title: string;
        totalMarks: number;
        averageScore?: number;
        passPercentage?: number;
    };
}
export interface IStudentExamDashboardResponse {
    studentId: string;
    upcomingExams: IExamResponse[];
    recentResults: IExamResultResponse[];
    statistics: {
        totalExams: number;
        completedExams: number;
        averageScore?: number;
        overallGrade?: string;
        subjectWisePerformance: Record<string, {
            averageScore: number;
            grade: string;
            examsCount: number;
        }>;
    };
}
export interface IExamFilters {
    examType?: TExamType;
    assessmentType?: TExaminationAssessmentType;
    status?: TExamStatus;
    subjectId?: string;
    classId?: string;
    teacherId?: string;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
    scheduledDateFrom?: string;
    scheduledDateTo?: string;
    isMandatory?: boolean;
    requiresProctoring?: boolean;
    schoolId: string;
}
export interface IExamResultFilters {
    examId?: string;
    studentId?: string;
    status?: TExamResultStatus;
    grade?: string;
    submittedDateFrom?: string;
    submittedDateTo?: string;
    gradedDateFrom?: string;
    gradedDateTo?: string;
    isLateSubmission?: boolean;
    schoolId: string;
}
export interface IQuestionFilters {
    examId?: string;
    questionType?: TQuestionType;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
    marks?: number;
}
export interface IExamStatistics {
    totalExams: number;
    examsByType: Record<TExamType, number>;
    examsByStatus: Record<TExamStatus, number>;
    examsByAssessmentType: Record<TExaminationAssessmentType, number>;
    averagePassRate?: number;
    averageScore?: number;
    gradeDistribution: Record<string, number>;
    subjectWisePerformance: Record<string, {
        totalExams: number;
        averageScore: number;
        passRate: number;
    }>;
    classWisePerformance: Record<string, {
        totalExams: number;
        averageScore: number;
        passRate: number;
    }>;
    trends: {
        monthly: Array<{
            month: string;
            examsCount: number;
            averageScore: number;
            passRate: number;
        }>;
        quarterly: Array<{
            quarter: string;
            examsCount: number;
            averageScore: number;
            passRate: number;
        }>;
    };
}
export interface IStudentPerformanceReport {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    gradeLevel: string;
    section: string;
    academicYear: string;
    overallPerformance: {
        totalExams: number;
        averageScore: number;
        overallGrade: string;
        passRate: number;
    };
    subjectWisePerformance: Array<{
        subjectId: string;
        subjectName: string;
        examsCount: number;
        averageScore: number;
        grade: string;
        trend: 'improving' | 'stable' | 'declining';
    }>;
    examTypePerformance: Record<TExamType, {
        count: number;
        averageScore: number;
        grade: string;
    }>;
    recommendations: string[];
}
export interface IExamSession {
    id: string;
    examId: string;
    studentId: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    screenshots: Array<{
        timestamp: Date;
        imageUrl: string;
        activity: string;
    }>;
    tabSwitches: Array<{
        timestamp: Date;
        fromTab: string;
        toTab: string;
    }>;
    violations: Array<{
        timestamp: Date;
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
    }>;
    finalScore?: number;
}
export interface IProctoringAlert {
    id: string;
    examSessionId: string;
    studentId: string;
    examId: string;
    alertType: 'tab_switch' | 'suspicious_activity' | 'face_not_visible' | 'multiple_faces' | 'device_change';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: Date;
    screenshotUrl?: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
