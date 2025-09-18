// Academia Pro - Timetable Management Types
// Shared type definitions for timetable and scheduling module

// Enums
export enum TDayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum TPeriodType {
  REGULAR_CLASS = 'regular_class',
  BREAK = 'break',
  LUNCH = 'lunch',
  ASSEMBLY = 'assembly',
  SPORTS = 'sports',
  CLUB = 'club',
  EXAM = 'exam',
  SPECIAL_EVENT = 'special_event',
  OFFICE_HOURS = 'office_hours',
  COUNSELING = 'counseling',
  OTHER = 'other',
}

export enum TRecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum TTimetableStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum TPriorityLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Interfaces
export interface IEquipmentRequirement {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
}

export interface ITimetableMetadata {
  syllabusTopic?: string;
  learningObjectives?: string[];
  requiredMaterials?: string[];
  assessmentType?: string;
  specialInstructions?: string;
  accessibilityNotes?: string;
}

export interface ITimetableEntry {
  id: string;
  schoolId: string;
  academicYear: string;
  gradeLevel: string;
  section?: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: TDayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  periodNumber?: number;
  periodType?: TPeriodType;
  roomId?: string;
  roomName?: string;
  roomCapacity?: number;
  roomType?: string;
  equipmentRequired?: IEquipmentRequirement[];
  recurrenceType?: TRecurrenceType;
  recurrenceEndDate?: Date;
  isRecurring?: boolean;
  eventTitle?: string;
  eventDescription?: string;
  isSpecialEvent?: boolean;
  requiresApproval?: boolean;
  expectedStudents?: number;
  priorityLevel?: TPriorityLevel;
  isFixed?: boolean;
  notifyStudents?: boolean;
  notifyTeachers?: boolean;
  notifyParents?: boolean;
  reminderMinutesBefore?: number;
  isOnlineClass?: boolean;
  onlineMeetingLink?: string;
  onlineMeetingId?: string;
  onlineMeetingPassword?: string;
  qrCodeEnabled?: boolean;
  mobileCheckinEnabled?: boolean;
  tags?: string[];
  metadata?: ITimetableMetadata;
  internalNotes?: string;
  status: TTimetableStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Request Interfaces
export interface ICreateTimetableEntryRequest {
  schoolId: string;
  academicYear: string;
  gradeLevel: string;
  section?: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: TDayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  periodNumber?: number;
  periodType?: TPeriodType;
  roomId?: string;
  roomName?: string;
  roomCapacity?: number;
  roomType?: string;
  equipmentRequired?: IEquipmentRequirement[];
  recurrenceType?: TRecurrenceType;
  recurrenceEndDate?: string;
  isRecurring?: boolean;
  eventTitle?: string;
  eventDescription?: string;
  isSpecialEvent?: boolean;
  requiresApproval?: boolean;
  expectedStudents?: number;
  priorityLevel?: TPriorityLevel;
  isFixed?: boolean;
  notifyStudents?: boolean;
  notifyTeachers?: boolean;
  notifyParents?: boolean;
  reminderMinutesBefore?: number;
  isOnlineClass?: boolean;
  onlineMeetingLink?: string;
  onlineMeetingId?: string;
  onlineMeetingPassword?: string;
  qrCodeEnabled?: boolean;
  mobileCheckinEnabled?: boolean;
  tags?: string[];
  metadata?: ITimetableMetadata;
  internalNotes?: string;
}

export interface IUpdateTimetableEntryRequest {
  dayOfWeek?: TDayOfWeek;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  roomName?: string;
  equipmentRequired?: IEquipmentRequirement[];
  eventTitle?: string;
  eventDescription?: string;
  isSpecialEvent?: boolean;
  onlineMeetingLink?: string;
  onlineMeetingPassword?: string;
  metadata?: ITimetableMetadata;
  internalNotes?: string;
  status?: TTimetableStatus;
}

export interface IBulkCreateTimetableRequest {
  schoolId: string;
  academicYear: string;
  entries: ICreateTimetableEntryRequest[];
}

export interface IGenerateTimetableRequest {
  schoolId: string;
  academicYear: string;
  gradeLevel: string;
  section?: string;
  preferences?: {
    maxPeriodsPerDay?: number;
    maxConsecutivePeriods?: number;
    breakAfterPeriods?: number;
    preferredStartTime?: string;
    preferredEndTime?: string;
    avoidConsecutiveSubjects?: boolean;
    balanceWorkload?: boolean;
  };
}

// Response Interfaces
export interface ITimetableEntryResponse extends Omit<ITimetableEntry, 'createdBy' | 'updatedBy'> {
  class?: {
    id: string;
    name: string;
    gradeLevel: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  room?: {
    id: string;
    name: string;
    capacity: number;
    type: string;
  };
  conflicts?: Array<{
    type: 'room' | 'staff' | 'student';
    message: string;
    severity: 'warning' | 'error';
  }>;
  attendance?: {
    expectedStudents: number;
    presentCount: number;
    absentCount: number;
  };
}

export interface ITimetableListResponse {
  entries: ITimetableEntryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalEntries: number;
    byDayOfWeek: Record<TDayOfWeek, number>;
    byPeriodType: Record<TPeriodType, number>;
    totalDuration: number;
    averagePeriodDuration: number;
  };
}

export interface IWeeklyTimetableResponse {
  weekStart: Date;
  weekEnd: Date;
  entries: ITimetableEntryResponse[];
  summary: {
    totalPeriods: number;
    totalDuration: number;
    uniqueSubjects: number;
    uniqueTeachers: number;
    uniqueRooms: number;
  };
}

export interface IClassTimetableResponse {
  classId: string;
  className: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  weeklySchedule: Record<TDayOfWeek, ITimetableEntryResponse[]>;
  summary: {
    totalPeriodsPerWeek: number;
    subjectsPerWeek: string[];
    teachers: string[];
    rooms: string[];
  };
}

export interface ITeacherTimetableResponse {
  teacherId: string;
  teacherName: string;
  academicYear: string;
  weeklySchedule: Record<TDayOfWeek, ITimetableEntryResponse[]>;
  workload: {
    totalPeriodsPerWeek: number;
    totalHoursPerWeek: number;
    subjects: string[];
    classes: string[];
  };
}

// Filter and Query Interfaces
export interface ITimetableFilters {
  schoolId: string;
  academicYear?: string;
  gradeLevel?: string;
  section?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek?: TDayOfWeek;
  periodType?: TPeriodType;
  roomId?: string;
  status?: TTimetableStatus;
  isSpecialEvent?: boolean;
  isOnlineClass?: boolean;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface ITimetableQuery extends ITimetableFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Statistics and Analytics
export interface ITimetableStatistics {
  totalEntries: number;
  activeEntries: number;
  totalDuration: number;
  averagePeriodDuration: number;
  byDayOfWeek: Record<TDayOfWeek, {
    count: number;
    totalDuration: number;
  }>;
  byPeriodType: Record<TPeriodType, {
    count: number;
    totalDuration: number;
    percentage: number;
  }>;
  bySubject: Record<string, {
    count: number;
    totalDuration: number;
    teachers: number;
  }>;
  byTeacher: Record<string, {
    totalPeriods: number;
    totalHours: number;
    subjects: number;
    classes: number;
  }>;
  byRoom: Record<string, {
    totalPeriods: number;
    totalHours: number;
    utilizationRate: number;
  }>;
  conflicts: {
    totalConflicts: number;
    roomConflicts: number;
    teacherConflicts: number;
    studentConflicts: number;
  };
  utilization: {
    roomUtilizationRate: number;
    teacherUtilizationRate: number;
    overallEfficiency: number;
  };
}

// Validation and Conflict Detection
export interface ITimetableConflict {
  type: 'room' | 'staff' | 'student' | 'time' | 'resource';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  entryId: string;
  conflictingEntryId?: string;
  suggestedResolution?: string;
}

export interface ITimetableValidationResult {
  isValid: boolean;
  conflicts: ITimetableConflict[];
  warnings: string[];
  suggestions: string[];
}

// Bulk Operations
export interface IBulkTimetableUpdateRequest {
  entryIds: string[];
  updates: Partial<IUpdateTimetableEntryRequest>;
}

export interface IBulkTimetableDeleteRequest {
  entryIds: string[];
  reason?: string;
}

// Settings and Preferences
export interface ITimetableSettings {
  schoolId: string;
  generalSettings: {
    defaultPeriodDuration: number;
    breakDuration: number;
    lunchDuration: number;
    assemblyDuration: number;
    workingDays: TDayOfWeek[];
    schoolStartTime: string;
    schoolEndTime: string;
  };
  schedulingRules: {
    maxPeriodsPerDay: number;
    maxConsecutivePeriods: number;
    minBreakBetweenPeriods: number;
    maxTeacherPeriodsPerDay: number;
    maxStudentPeriodsPerDay: number;
    avoidTeacherConsecutivePeriods: boolean;
    balanceTeacherWorkload: boolean;
  };
  conflictResolution: {
    allowOverlappingPeriods: boolean;
    autoResolveConflicts: boolean;
    notifyOnConflicts: boolean;
    requireApprovalForChanges: boolean;
  };
  notificationSettings: {
    notifyTeachersOnScheduleChange: boolean;
    notifyStudentsOnScheduleChange: boolean;
    notifyParentsOnScheduleChange: boolean;
    reminderMinutesBefore: number;
  };
}

// All types are exported above with their declarations