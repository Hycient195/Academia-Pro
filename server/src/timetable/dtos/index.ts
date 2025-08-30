// Academia Pro - Timetable DTOs
// Export all timetable-related Data Transfer Objects

export {
  CreateTimetableDto,
  BulkCreateTimetableDto,
  UpdateTimetableDto,
  EquipmentRequirementDto,
  TimetableMetadataDto,
} from './create-timetable.dto';

// Re-export types for convenience
export type {
  DayOfWeek,
  PeriodType,
  TimetableStatus,
  RecurrenceType,
  PriorityLevel,
} from '../entities/timetable.entity';