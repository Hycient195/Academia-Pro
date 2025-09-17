// Academia Pro - School Admin Types Index
// Export all school-admin related types

// Export original types
export * from './school-admin.types';

// Export new consolidated types with explicit exports to avoid conflicts
export type {
  IStudent,
  ICreateStudentRequest,
  IUpdateStudentRequest,
  ITransferStudentRequest,
  IAssignClassRequest,
  IPromotionRequestDto,
  IBulkImportRequestDto,
  IGraduationRequestDto,
  ITransferStudentRequestDto,
  IStudentStatistics,
  IStudentFilters,
  IStudentSearchParams,
  IStudentSearchResult,
  IBulkOperationResult,
  IPromotionResult,
  IBulkImportResult,
  IGraduationResult,
  ITransferResult,
} from './student.types';

export type {
  IStaff,
  ICreateStaffRequest,
  IUpdateStaffRequest,
  IStaffStatistics,
  IHRStatistics,
  IStaffFilters,
  IStaffSearchParams,
  IStaffSearchResult,
  IStaffPerformance,
  IStaffAttendance,
  IBulkCreateStaffRequest,
  IBulkUpdateStaffRequest,
  IBulkStaffOperationResult,
  IBulkCreateStaffResult,
  IBulkUpdateStaffResult,
  IBulkDeleteStaffResult,
} from './staff.types';

export type {
  ISubject,
  ICurriculum,
  IClass,
  ILearningObjective,
  ICreateSubjectRequest,
  IUpdateSubjectRequest,
  ICreateCurriculumRequest,
  ICreateClassRequest,
  ICreateLearningObjectiveRequest,
  IAcademicStatistics,
  ISubjectFilters,
  ICurriculumFilters,
  IClassFilters,
  ISubjectSearchParams,
  ICurriculumSearchParams,
  IClassSearchParams,
  ISubjectSearchResult,
  ICurriculumSearchResult,
  IClassSearchResult,
  IAddSubjectToCurriculumRequest,
  IAssignSubjectToClassRequest,
  IAcademicPerformanceReport,
  IAdvancedAcademicStatistics,
  IAcademicYearStatus,
  IStudentAcademicData,
  IParentAcademicData,
  ITeacherAcademicData,
} from './academic.types';

export type {
  IAttendanceRecord,
  IMarkAttendanceRequest,
  IBulkMarkAttendanceRequest,
  IBulkUpdateAttendanceRequest,
  IAttendanceStatistics,
  IStudentAttendanceSummary,
  IClassAttendanceReport,
  IAttendanceFilters,
  IAttendanceSearchParams,
  IAttendanceSearchResult,
  IAttendanceTrend,
  IAttendanceTrendsParams,
  IAttendanceAlert,
  IAttendanceAlertsParams,
  IExcuseStudentRequest,
  IAttendanceReportGenerationRequest,
  IAttendanceReportResult,
  IAttendanceByDateRangeParams,
  IBulkAttendanceOperationResult,
  IBulkMarkAttendanceResult,
  IBulkUpdateAttendanceResult,
} from './attendance.types';

export type {
  IDepartment,
  ICreateDepartmentRequest,
  IUpdateDepartmentRequest,
  IDepartmentFilters,
  IDepartmentStatistics,
} from './school-admin.types';