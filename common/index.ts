// Academia Pro - Common Types Index
// Only export types from their primary owning modules to avoid conflicts

// Core shared types (base types used by other modules)
export * from './types/shared';

// Domain-specific types - only export from their owning modules
export * from './types/users'; // User management types
export * from './types/auth'; // Authentication types
export * from './types/schools'; // School management types

// Student types - primary ownership in student module
export * from './types/student';

// Staff types - primary ownership in staff module
export * from './types/staff';

// Academic types - primary ownership in academic module
export * from './types/academic';

// Attendance types - primary ownership in attendance module
export * from './types/attendance';

// Communication types - primary ownership in communication module
export * from './types/communication';

// Inventory types - primary ownership in inventory module
export * from './types/inventory';

// Library types - primary ownership in library module
export * from './types/library';

// Hostel types - primary ownership in hostel module
export * from './types/hostel';

// Timetable types - primary ownership in timetable module
export * from './types/timetable';

// Reports types - primary ownership in reports module
export * from './types/reports';

// Fee types - primary ownership in fee module
export * from './types/fee';

// Examination types - primary ownership in examination module
export * from './types/examination';

// Mobile types - primary ownership in mobile module
export * from './types/mobile';

// Online learning types - primary ownership in online-learning module
export * from './types/online-learning';

// Parent portal types - primary ownership in parent-portal module
export * from './types/parent-portal';

// Parent types - primary ownership in parent module
export * from './types/parent';

// Super admin types - primary ownership in super-admin module
export * from './types/super-admin';

// NOTE: school-admin types are NOT exported here to avoid conflicts
// Import school-admin types directly from './types/school-admin' when needed