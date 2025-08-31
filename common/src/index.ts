// Academia Pro - Common Types Package
// Main entry point for shared types and interfaces

// Export shared types
export * from './types/shared/types';

// Export module-specific types
export * from './types/shared/util.types';
export * from './types/student/student.types';
export * from './types/academic/academic.types';
// Explicit exports from parent-portal to avoid conflicts with student types
export type {
  IParent,
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
} from './types/parent-portal/parent-portal.types';
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
} from './types/parent-portal/parent-portal.types';
// export * from './types/staff/staff.types'; // TODO: Resolve duplicate interface conflicts
// TODO: Add other module types as they are created
// export * from './modules/attendance-management/types';
// export * from './modules/examination-assessment/types';
// export * from './modules/fee-management/types';
export * from './types/timetable/timetable.types';
// export * from './modules/communication-notification/types';
// export * from './modules/library-management/types';
// export * from './modules/transportation-management/types';
// export * from './modules/hostel-management/types';
// export * from './modules/inventory-asset-management/types';
// export * from './modules/reports-analytics/types';
// export * from './modules/student-portal/types';
// export * from './modules/online-learning/types';
// export * from './modules/security-compliance/types';
// export * from './modules/integration-capabilities/types';
// export * from './modules/mobile-applications/types';

// Export API types
// export * from './api/types'; // TODO: Create API types

// Export validation schemas
// export * from './validation/schemas'; // TODO: Create validation schemas

// Export utility types
// export * from './utils/types'; // TODO: Create utility types

// Re-export commonly used types for convenience
export type {
  User,
  School,
  Grade,
  Section,
  Subject,
  ApiResponse,
  PaginatedResponse,
  BaseEntity,
  SoftDeleteEntity,
} from './types/shared/types';