// Academia Pro - Common Types Package
// Main entry point for shared types and interfaces

// Export shared types
export * from './types/shared/types';

// Export module-specific types
export * from './types/shared/util.types';
export * from './types/student/student.types';
export * from './types/academic/academic.types';
// export * from './types/staff/staff.types'; // TODO: Resolve duplicate interface conflicts
// TODO: Add other module types as they are created
// export * from './modules/attendance-management/types';
// export * from './modules/examination-assessment/types';
// export * from './modules/fee-management/types';
// export * from './modules/timetable-scheduling/types';
// export * from './modules/communication-notification/types';
// export * from './modules/library-management/types';
// export * from './modules/transportation-management/types';
// export * from './modules/hostel-management/types';
// export * from './modules/inventory-asset-management/types';
// export * from './modules/reports-analytics/types';
// export * from './modules/parent-portal/types';
// export * from './modules/student-portal/types';
// export * from './modules/online-learning/types';
// export * from './modules/security-compliance/types';
// export * from './modules/integration-capabilities/types';
// export * from './modules/mobile-applications/types';

// Export API types
export * from './api/types';

// Export validation schemas
export * from './validation/schemas';

// Export utility types
export * from './utils/types';

// Re-export commonly used types for convenience
export type {
  User,
  School,
  Student,
  Teacher,
  Parent,
  Grade,
  Section,
  Subject,
  ApiResponse,
  PaginatedResponse,
  BaseEntity,
  SoftDeleteEntity,
} from './types/shared/types';