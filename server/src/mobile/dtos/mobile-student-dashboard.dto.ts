// Academia Pro - Mobile Student Dashboard DTO
// DTO for mobile student dashboard endpoint

import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IStudentDashboardResponse,
  IScheduleItem,
  IAssignmentSummary,
  IGradeSummary,
  INotificationSummary,
  IQuickAction,
  TAssignmentStatus,
  TAssignmentPriority,
  TMobileNotificationType
} from '@academia-pro/types/mobile';

export class ScheduleItemDto implements IScheduleItem {
  @ApiProperty({
    description: 'Period number',
    example: 1,
  })
  @IsString()
  period: number;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Mr. Johnson',
  })
  @IsString()
  teacher: string;

  @ApiProperty({
    description: 'Class time',
    example: '08:00 - 09:00',
  })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Classroom',
    example: 'Room 101',
  })
  @IsString()
  room: string;

  @ApiProperty({
    description: 'Period status',
    example: 'completed',
    enum: ['completed', 'in_progress', 'upcoming'],
  })
  @IsString()
  status: 'completed' | 'in_progress' | 'upcoming';

  @ApiPropertyOptional({
    description: 'Attendance status',
    example: 'present',
    enum: ['present', 'absent', 'late', 'excused'],
  })
  @IsOptional()
  @IsString()
  attendance?: 'present' | 'absent' | 'late' | 'excused';

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Homework due next class',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignmentSummaryDto implements IAssignmentSummary {
  @ApiProperty({
    description: 'Assignment ID',
    example: 'assign-1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Mathematics Homework - Algebra',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Mr. Johnson',
  })
  @IsString()
  teacher: string;

  @ApiProperty({
    description: 'Due date',
    example: '2024-01-20T23:59:59Z',
  })
  @IsString()
  dueDate: string;

  @ApiProperty({
    description: 'Assignment status',
    example: TAssignmentStatus.PENDING,
    enum: TAssignmentStatus,
  })
  status: TAssignmentStatus;

  @ApiProperty({
    description: 'Assignment priority',
    example: TAssignmentPriority.HIGH,
    enum: TAssignmentPriority,
  })
  priority: TAssignmentPriority;
}

export class GradeSummaryDto implements IGradeSummary {
  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Current grade',
    example: 'A',
  })
  @IsString()
  currentGrade: string;

  @ApiProperty({
    description: 'Score percentage',
    example: 92,
  })
  score: number;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Mr. Johnson',
  })
  @IsString()
  teacher: string;

  @ApiProperty({
    description: 'Grade trend',
    example: 'improving',
    enum: ['improving', 'stable', 'declining'],
  })
  @IsString()
  trend: 'improving' | 'stable' | 'declining';
}

export class NotificationSummaryDto implements INotificationSummary {
  @ApiProperty({
    description: 'Notification ID',
    example: 'notif-1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Notification type',
    example: TMobileNotificationType.ASSIGNMENT,
    enum: TMobileNotificationType,
  })
  type: TMobileNotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Assignment Posted',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Mathematics homework has been posted. Due date: January 20th.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Notification timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Read status',
    example: false,
  })
  read: boolean;

  @ApiProperty({
    description: 'Notification priority',
    example: 'high',
    enum: ['low', 'medium', 'high'],
  })
  @IsString()
  priority: 'low' | 'medium' | 'high';
}

export class QuickActionDto implements IQuickAction {
  @ApiProperty({
    description: 'Action identifier',
    example: 'view_timetable',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Action label',
    example: 'My Timetable',
  })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Action icon',
    example: 'calendar',
  })
  @IsString()
  icon: string;
}

export class StudentDashboardResponseDto implements IStudentDashboardResponse {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsString()
  studentId: string;

  @ApiPropertyOptional({
    description: 'Device ID',
    example: 'device-uuid-456',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Student information',
    type: Object,
  })
  studentInfo: {
    name: string;
    grade: string;
    rollNumber: string;
    profileImage?: string;
  };

  @ApiProperty({
    description: 'Today\'s schedule',
    type: [ScheduleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  todaySchedule: ScheduleItemDto[];

  @ApiProperty({
    description: 'Pending assignments',
    type: [AssignmentSummaryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentSummaryDto)
  pendingAssignments: AssignmentSummaryDto[];

  @ApiProperty({
    description: 'Recent grades',
    type: [GradeSummaryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeSummaryDto)
  recentGrades: GradeSummaryDto[];

  @ApiProperty({
    description: 'Recent notifications',
    type: [NotificationSummaryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationSummaryDto)
  notifications: NotificationSummaryDto[];

  @ApiProperty({
    description: 'Quick actions',
    type: [QuickActionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuickActionDto)
  quickActions: QuickActionDto[];
}