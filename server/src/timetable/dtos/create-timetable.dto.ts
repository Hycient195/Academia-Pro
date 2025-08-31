// Academia Pro - Create Timetable DTO
// DTO for creating new timetable entries and schedules

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min, Max, MaxLength, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateTimetableEntryRequest, IEquipmentRequirement, ITimetableMetadata, TDayOfWeek, TPeriodType, TRecurrenceType, TPriorityLevel } from '@academia-pro/common/timetable';
import { Type } from 'class-transformer';

export class EquipmentRequirementDto implements IEquipmentRequirement {
   @ApiProperty({
     description: 'Equipment ID',
     example: 'equipment-uuid-123',
   })
   @IsNotEmpty({ message: 'Equipment ID is required' })
   @IsString({ message: 'Equipment ID must be a string' })
   equipmentId: string;

   @ApiProperty({
     description: 'Equipment name',
     example: 'Projector',
   })
   @IsNotEmpty({ message: 'Equipment name is required' })
   @IsString({ message: 'Equipment name must be a string' })
   equipmentName: string;

   @ApiProperty({
     description: 'Quantity required',
     example: 1,
     minimum: 1,
   })
   @IsNotEmpty({ message: 'Quantity is required' })
   @IsNumber({}, { message: 'Quantity must be a number' })
   @Min(1, { message: 'Quantity must be at least 1' })
   quantity: number;
 }

export class TimetableMetadataDto implements ITimetableMetadata {
  @ApiPropertyOptional({
    description: 'Syllabus topic for this period',
    example: 'Introduction to Algebra',
  })
  @IsOptional()
  @IsString({ message: 'Syllabus topic must be a string' })
  syllabusTopic?: string;

  @ApiPropertyOptional({
    description: 'Learning objectives',
    example: ['Understand basic algebraic concepts', 'Solve simple equations'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Learning objectives must be an array' })
  @IsString({ each: true, message: 'Each learning objective must be a string' })
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Required materials',
    example: ['Textbook', 'Notebook', 'Calculator'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Required materials must be an array' })
  @IsString({ each: true, message: 'Each required material must be a string' })
  requiredMaterials?: string[];

  @ApiPropertyOptional({
    description: 'Assessment type',
    example: 'formative',
  })
  @IsOptional()
  @IsString({ message: 'Assessment type must be a string' })
  assessmentType?: string;

  @ApiPropertyOptional({
    description: 'Special instructions',
    example: 'Bring completed homework assignment',
  })
  @IsOptional()
  @IsString({ message: 'Special instructions must be a string' })
  specialInstructions?: string;

  @ApiPropertyOptional({
    description: 'Accessibility notes',
    example: 'Wheelchair accessible room required',
  })
  @IsOptional()
  @IsString({ message: 'Accessibility notes must be a string' })
  accessibilityNotes?: string;
}

export class CreateTimetableDto implements ICreateTimetableEntryRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear: string;

  @ApiProperty({
    description: 'Grade level',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Grade level is required' })
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel: string;

  @ApiPropertyOptional({
    description: 'Section',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-456',
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsString({ message: 'Class ID must be a string' })
  classId: string;

  @ApiProperty({
    description: 'Subject ID',
    example: 'subject-uuid-789',
  })
  @IsNotEmpty({ message: 'Subject ID is required' })
  @IsString({ message: 'Subject ID must be a string' })
  subjectId: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Subject name is required' })
  @IsString({ message: 'Subject name must be a string' })
  @MaxLength(100, { message: 'Subject name cannot exceed 100 characters' })
  subjectName: string;

  @ApiProperty({
    description: 'Teacher ID',
    example: 'teacher-uuid-101',
  })
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsString({ message: 'Teacher ID must be a string' })
  teacherId: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Ms. Johnson',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Teacher name is required' })
  @IsString({ message: 'Teacher name must be a string' })
  @MaxLength(100, { message: 'Teacher name cannot exceed 100 characters' })
  teacherName: string;

  @ApiProperty({
    description: 'Day of the week',
    example: DayOfWeek.MONDAY,
    enum: DayOfWeek,
  })
  @IsNotEmpty({ message: 'Day of week is required' })
  @IsEnum(TDayOfWeek, { message: 'Invalid day of week' })
  dayOfWeek: TDayOfWeek;

  @ApiProperty({
    description: 'Start time (HH:MM format)',
    example: '09:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:MM format)',
    example: '10:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  endTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    minimum: 15,
    maximum: 480,
  })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  @Max(480, { message: 'Duration cannot exceed 480 minutes (8 hours)' })
  durationMinutes: number;

  @ApiPropertyOptional({
    description: 'Period number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Period number must be a number' })
  @Min(1, { message: 'Period number must be at least 1' })
  periodNumber?: number;

  @ApiPropertyOptional({
    description: 'Type of period',
    example: PeriodType.REGULAR_CLASS,
    enum: PeriodType,
  })
  @IsOptional()
  @IsEnum(TPeriodType, { message: 'Invalid period type' })
  periodType?: TPeriodType;

  @ApiPropertyOptional({
    description: 'Room ID',
    example: 'room-uuid-202',
  })
  @IsOptional()
  @IsString({ message: 'Room ID must be a string' })
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Room name',
    example: 'Room 101',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Room name must be a string' })
  @MaxLength(100, { message: 'Room name cannot exceed 100 characters' })
  roomName?: string;

  @ApiPropertyOptional({
    description: 'Room capacity',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Room capacity must be a number' })
  @Min(1, { message: 'Room capacity must be at least 1' })
  roomCapacity?: number;

  @ApiPropertyOptional({
    description: 'Room type',
    example: 'classroom',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Room type must be a string' })
  @MaxLength(50, { message: 'Room type cannot exceed 50 characters' })
  roomType?: string;

  @ApiPropertyOptional({
    description: 'Equipment requirements',
    type: [EquipmentRequirementDto],
  })
  @IsOptional()
  @IsArray({ message: 'Equipment requirements must be an array' })
  @ValidateNested({ each: true })
  equipmentRequired?: EquipmentRequirementDto[];

  @ApiPropertyOptional({
    description: 'Recurrence type',
    example: RecurrenceType.WEEKLY,
    enum: RecurrenceType,
  })
  @IsOptional()
  @IsEnum(TRecurrenceType, { message: 'Invalid recurrence type' })
  recurrenceType?: TRecurrenceType;

  @ApiPropertyOptional({
    description: 'Recurrence end date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString({ message: 'Recurrence end date must be a string' })
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a recurring schedule',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is recurring must be a boolean' })
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Event title (for special events)',
    example: 'Science Fair Preparation',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event title must be a string' })
  @MaxLength(200, { message: 'Event title cannot exceed 200 characters' })
  eventTitle?: string;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Students will prepare projects for the annual science fair',
  })
  @IsOptional()
  @IsString({ message: 'Event description must be a string' })
  eventDescription?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a special event',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is special event must be a boolean' })
  isSpecialEvent?: boolean;

  @ApiPropertyOptional({
    description: 'Whether approval is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Requires approval must be a boolean' })
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Expected number of students',
    example: 25,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Expected students must be a number' })
  @Min(1, { message: 'Expected students must be at least 1' })
  expectedStudents?: number;

  @ApiPropertyOptional({
    description: 'Priority level',
    example: PriorityLevel.NORMAL,
    enum: PriorityLevel,
  })
  @IsOptional()
  @IsEnum(TPriorityLevel, { message: 'Invalid priority level' })
  priorityLevel?: TPriorityLevel;

  @ApiPropertyOptional({
    description: 'Whether this schedule is fixed (cannot be moved)',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is fixed must be a boolean' })
  isFixed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify students',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify students must be a boolean' })
  notifyStudents?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify teachers',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify teachers must be a boolean' })
  notifyTeachers?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify parents',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify parents must be a boolean' })
  notifyParents?: boolean;

  @ApiPropertyOptional({
    description: 'Reminder minutes before class',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reminder minutes must be a number' })
  @Min(0, { message: 'Reminder minutes cannot be negative' })
  reminderMinutesBefore?: number;

  @ApiPropertyOptional({
    description: 'Whether this is an online class',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is online class must be a boolean' })
  isOnlineClass?: boolean;

  @ApiPropertyOptional({
    description: 'Online meeting link',
    example: 'https://meet.google.com/abc-defg-hij',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Online meeting link must be a string' })
  @MaxLength(500, { message: 'Online meeting link cannot exceed 500 characters' })
  onlineMeetingLink?: string;

  @ApiPropertyOptional({
    description: 'Online meeting ID',
    example: '123-456-789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Online meeting ID must be a string' })
  @MaxLength(100, { message: 'Online meeting ID cannot exceed 100 characters' })
  onlineMeetingId?: string;

  @ApiPropertyOptional({
    description: 'Online meeting password',
    example: 'meeting123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Online meeting password must be a string' })
  @MaxLength(50, { message: 'Online meeting password cannot exceed 50 characters' })
  onlineMeetingPassword?: string;

  @ApiPropertyOptional({
    description: 'Whether QR code is enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'QR code enabled must be a boolean' })
  qrCodeEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Whether mobile check-in is enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Mobile check-in enabled must be a boolean' })
  mobileCheckinEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['core_subject', 'mathematics', 'algebra'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: TimetableMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  metadata?: TimetableMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Teacher requested this time slot due to scheduling constraints',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class BulkCreateTimetableDto {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  academicYear: string;

  @ApiProperty({
    description: 'Timetable entries to create',
    type: [CreateTimetableDto],
  })
  @IsNotEmpty({ message: 'Timetable entries are required' })
  @IsArray({ message: 'Timetable entries must be an array' })
  @ValidateNested({ each: true })
  entries: CreateTimetableDto[];
}

export class UpdateTimetableDto {
  @ApiPropertyOptional({
    description: 'Day of the week',
    example: DayOfWeek.MONDAY,
    enum: DayOfWeek,
  })
  @IsOptional()
  @IsEnum(TDayOfWeek, { message: 'Invalid day of week' })
  dayOfWeek?: TDayOfWeek;

  @ApiPropertyOptional({
    description: 'Start time (HH:MM format)',
    example: '09:00',
  })
  @IsOptional()
  @IsString({ message: 'Start time must be a string' })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (HH:MM format)',
    example: '10:00',
  })
  @IsOptional()
  @IsString({ message: 'End time must be a string' })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Room ID',
    example: 'room-uuid-202',
  })
  @IsOptional()
  @IsString({ message: 'Room ID must be a string' })
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Room name',
    example: 'Room 101',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Room name must be a string' })
  @MaxLength(100, { message: 'Room name cannot exceed 100 characters' })
  roomName?: string;

  @ApiPropertyOptional({
    description: 'Equipment requirements',
    type: [EquipmentRequirementDto],
  })
  @IsOptional()
  @IsArray({ message: 'Equipment requirements must be an array' })
  @ValidateNested({ each: true })
  equipmentRequired?: EquipmentRequirementDto[];

  @ApiPropertyOptional({
    description: 'Event title (for special events)',
    example: 'Science Fair Preparation',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event title must be a string' })
  @MaxLength(200, { message: 'Event title cannot exceed 200 characters' })
  eventTitle?: string;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Students will prepare projects for the annual science fair',
  })
  @IsOptional()
  @IsString({ message: 'Event description must be a string' })
  eventDescription?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a special event',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is special event must be a boolean' })
  isSpecialEvent?: boolean;

  @ApiPropertyOptional({
    description: 'Online meeting link',
    example: 'https://meet.google.com/abc-defg-hij',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Online meeting link must be a string' })
  @MaxLength(500, { message: 'Online meeting link cannot exceed 500 characters' })
  onlineMeetingLink?: string;

  @ApiPropertyOptional({
    description: 'Online meeting password',
    example: 'meeting123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Online meeting password must be a string' })
  @MaxLength(50, { message: 'Online meeting password cannot exceed 50 characters' })
  onlineMeetingPassword?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: TimetableMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  metadata?: TimetableMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Updated due to room maintenance',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}