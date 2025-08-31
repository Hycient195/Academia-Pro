// Academia Pro - Common Types Index
// Export all type definitions from common package

// Shared types
export * from './shared';

// Module-specific types with explicit exports to resolve conflicts
export * from './academic';

// Inventory types - explicit exports to resolve conflicts
export type {
  IAsset,
  IAssetLocation,
  IProcurementInfo,
  IAssetSpecifications,
  IMaintenanceRecord,
  IAssetResponse,
  IAssetListResponse,
  IMaintenanceResponse,
  IAssetFilters,
  IMaintenanceFilters,
  IAssetStatisticsResponse,
  ICreateProcurementRequest,
  IAssetReport
} from './inventory';
export {
  TAssetCategory,
  TDepreciationMethod,
  TAssetStatus,
  TProcurementStatus,
  TMaintenanceType,
  TMaintenanceStatus
} from './inventory';

export * from './parent';
export * from './reports';
export * from './schools';
export * from './timetable';

// Staff types - explicit exports to resolve conflicts
export type {
  IStaff,
  IStaffResponse,
  IStaffListResponse,
  IStaffStatisticsResponse,
  ICreateStaffRequest,
  IUpdateStaffRequest,
  IWorkSchedule,
  IPerformanceRecord,
  ILeaveRecord,
  IDocument,
  IQualification,
  IEmergencyContact
} from './staff';
export {
  TEmploymentType,
  TEmploymentStatus,
  TDepartment,
  TPosition,
  TQualificationLevel,
  TLeaveType,
  TLeaveStatus
} from './staff';

export * from './student';

// Hostel types - explicit exports to resolve conflicts
export type {
  IHostel,
  IRoom,
  IHostelAllocation,
  IHostelResponse,
  IRoomResponse,
  IHostelAllocationResponse,
  IHostelListResponse,
  IRoomListResponse,
  IHostelAllocationListResponse,
  IHostelFilters,
  IRoomFilters,
  IHostelAllocationFilters,
  IHostelStatistics,
  IStudentHostelDashboardResponse,
  IBulkRoomAllocationRequest,
  IBulkMaintenanceUpdateRequest,
  IHostelNotificationTemplate,
  ICreateHostelRequest,
  IUpdateHostelRequest,
  ICreateRoomRequest,
  IAllocateRoomRequest,
  ICreateMaintenanceRequest,
  IAddress,
  IFacility,
  IHostelRules,
  IHostelPricing,
  IContactInfo,
  IOperatingHours
} from './hostel';
export {
  THostelType,
  THostelStatus,
  TRoomType,
  TRoomStatus,
  TBedStatus,
  TFacilityType,
  TAllocationStatus
} from './hostel';

// New module types - explicit exports to avoid conflicts
export * from './users';
export * from './auth';

// Attendance types - explicit exports to resolve conflicts
export type {
  IAttendance,
  IMarkAttendanceRequest,
  IBulkMarkAttendanceRequest,
  IAttendanceResponse,
  IAttendanceListResponse,
  IAttendanceFilters,
  IAttendanceStatistics,
  IAttendanceReportRequest,
  IAttendanceReportResponse,
  IStudentAttendanceReport,
  IClassAttendanceReport,
  ISubjectAttendanceReport,
  IAttendanceAlertRequest,
  IAttendanceAlertResponse
} from './attendance';
export {
  TAttendanceStatus,
  TAttendanceType,
  TAttendanceMethod
} from './attendance';

export * from './communication';
export type {
  TMessageType,
  TRecipientType
} from './communication';
export * from './examination';
export * from './fee';
export * from './hostel';
// Library types - explicit exports to resolve conflicts
export type {
  IBook,
  IBookResponse,
  IBookListResponse,
  ICreateBookRequest,
  IUpdateBookRequest,
  ICheckoutRequest,
  IReturnRequest,
  IRenewalRequest,
  IReservationRequest,
  ILibraryStatistics,
  IBookCheckout,
  IBookReservation,
  IDigitalBook,
  ILibrarySettings,
  ILibraryDashboard,
  IBulkBookImportRequest,
  IBulkBookUpdateRequest,
  IBulkCheckoutRequest,
  IBulkReturnRequest
} from './library';
export {
  TBookStatus,
  TBookCondition,
  TBookCategory,
  TBookFormat,
  TLanguage,
  TAcquisitionMethod,
  TCheckoutStatus,
  TReservationStatus
} from './library';

// Mobile types - explicit exports to resolve conflicts
export type {
  IMobileDevice,
  IMobileUser,
  IMobilePreferences,
  IStudentDashboardRequest,
  IStudentDashboardResponse,
  ITimetableRequest,
  ITimetableResponse,
  IAssignmentsRequest,
  IAssignmentsResponse,
  IAssignmentDetail,
  IAssignmentSubmissionRequest,
  IAssignmentSubmissionResponse,
  IGradesRequest,
  IGradesResponse,
  IAttendanceRequest,
  IMobileAttendanceResponse,
  INotificationsRequest,
  INotificationsResponse,
  ILibraryInfoRequest,
  ILibraryInfoResponse,
  IRenewBookRequest,
  IRenewBookResponse,
  ITransportInfoRequest,
  ITransportInfoResponse,
  IEmergencyReportRequest,
  IEmergencyReportResponse,
  IStudentProfileRequest,
  IStudentProfileResponse,
  IUpdateProfileRequest,
  IUpdateProfileResponse,
  IParentDashboardRequest,
  IParentDashboardResponse,
  IStaffDashboardRequest,
  IStaffDashboardResponse,
  IMobileLoginRequest,
  IMobileLoginResponse,
  IMobileRefreshTokenRequest,
  IMobileRefreshTokenResponse,
  IRegisterPushTokenRequest,
  IRegisterPushTokenResponse,
  IPushNotificationPayload,
  ISyncRequest,
  ISyncResponse,
  IAppUpdateCheckRequest,
  IAppUpdateCheckResponse,
  ITrackAnalyticsRequest,
  ITrackAnalyticsResponse
} from './mobile';
export {
  TMobilePlatform,
  TMobileDeviceType,
  TEmergencyType,
  TEmergencySeverity,
  TAssignmentStatus,
  TAssignmentPriority,
  TTransportStatus
} from './mobile';

// Online Learning types - explicit exports to resolve conflicts
export type {
  IContent,
  ICourse,
  ICourseModule,
  IAssessment,
  IQuestion,
  ILearningPath,
  IEnrollment,
  IProgress,
  IDiscussion,
  IDiscussionReply,
  ICollaboration,
  IVirtualClassroom,
  IGetContentLibraryRequest,
  IGetContentLibraryResponse,
  IGetContentDetailsRequest,
  IGetContentDetailsResponse,
  IUploadContentRequest,
  IUploadContentResponse,
  IUpdateContentRequest,
  IUpdateContentResponse,
  IRateContentRequest,
  IRateContentResponse,
  IGetCategoriesResponse,
  IGetTrendingContentRequest,
  IGetTrendingContentResponse,
  ICreateCourseRequest,
  IUpdateCourseRequest,
  IEnrollInCourseRequest,
  IEnrollInCourseResponse,
  ISubmitAssessmentRequest,
  ISubmitAssessmentResponse,
  ICreateDiscussionRequest,
  ICreateDiscussionResponse,
  IReplyToDiscussionRequest,
  IReplyToDiscussionResponse,
  IScheduleVirtualClassRequest,
  IScheduleVirtualClassResponse,
  IJoinVirtualClassRequest,
  IJoinVirtualClassResponse,
  IGetLearningAnalyticsRequest,
  IGetLearningAnalyticsResponse,
  IUpdateProgressRequest,
  IUpdateProgressResponse,
  ICreateLearningPathRequest,
  ICreateLearningPathResponse,
  IGenerateCertificateRequest,
  IGenerateCertificateResponse,
  ISendNotificationRequest,
  ISendNotificationResponse,
  IBulkEnrollRequest,
  IBulkEnrollResponse,
  IBulkContentUploadRequest,
  IBulkContentUploadResponse,
  IOnlineLearningSettings
} from './online-learning';
export {
  TContentType,
  TContentStatus,
  TDifficultyLevel,
  TLearningPathType,
  TAssessmentType,
  TProgressStatus,
  TEnrollmentStatus,
  TDiscussionType,
  TCollaborationType
} from './online-learning';

// Parent Portal types - explicit exports to resolve conflicts
export type {
  IParent,
  IStudent,
  IParentDashboard,
  IActivity,
  INotification,
  IEvent,
  IAlert,
  IGradeEntry,
  ISubjectGrade,
  IStudentGradesSummary,
  IParentAcademicGradesResponse,
  IAttendanceRecord,
  IAttendanceSummary,
  IParentAttendanceResponse,
  IAssignmentSubmission,
  IAssignmentDetails,
  IParentAssignmentsResponse,
  ITimetableEntry,
  IParentTimetableResponse,
  IMessage,
  IParentMessagesResponse,
  IFeeRecord,
  IParentFeesResponse,
  IAppointment,
  IParentAppointmentsResponse,
  IResource,
  IParentResourcesResponse,
  ITransportationInfo,
  IParentTransportationResponse,
  IGetParentDashboardRequest,
  IGetParentDashboardResponse,
  IGetAcademicGradesRequest,
  IGetAttendanceRequest,
  IGetAssignmentsRequest,
  IGetTimetableRequest,
  IGetMessagesRequest,
  IGetFeesRequest,
  IGetAppointmentsRequest,
  IGetResourcesRequest,
  IGetTransportationRequest,
  IScheduleAppointmentRequest,
  IScheduleAppointmentResponse,
  ISendMessageRequest,
  ISendMessageResponse,
  IUpdateCommunicationPreferencesRequest,
  IUpdateCommunicationPreferencesResponse,
  IBulkMessageRequest,
  IBulkMessageResponse,
  IParentAnalyticsRequest,
  IParentAnalyticsResponse,
  IParentSettings
} from './parent-portal';
export {
  TParentRelationship,
  TCommunicationType,
  TAppointmentStatus,
  TAppointmentType,
  TMessagePriority,
  TNotificationStatus,
  TResourceType,
  TAcademicAlertType,
  TFeeStatus,
  TTransportationStatus
} from './parent-portal';