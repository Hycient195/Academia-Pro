import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SubstituteRequestReason {
  TEACHER_ABSENT = 'teacher_absent',
  TEACHER_SICK_LEAVE = 'teacher_sick_leave',
  EMERGENCY_LEAVE = 'emergency_leave',
  TRAINING_PROGRAM = 'training_program',
  MATERNITY_LEAVE = 'maternity_leave',
  EXAM_DUTY = 'exam_duty',
  ADMINISTRATIVE_DUTY = 'administrative_duty',
  OTHER = 'other',
}

export enum SubstituteRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SubstituteRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export class LessonPlanDto {
  @ApiProperty({
    description: 'Lesson plan title',
    example: 'Introduction to Algebra',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Lesson objectives',
    example: ['Understand basic algebraic concepts', 'Solve simple equations'],
  })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiPropertyOptional({
    description: 'Lesson materials and resources',
    example: ['Textbook pages 45-50', 'Whiteboard markers', 'Projector'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({
    description: 'Key activities for the lesson',
    example: ['Introduction (10 min)', 'Main activity (25 min)', 'Assessment (10 min)'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @ApiPropertyOptional({
    description: 'Homework assignment',
    example: 'Complete exercises 1-10 on page 51',
  })
  @IsOptional()
  @IsString()
  homework?: string;

  @ApiPropertyOptional({
    description: 'Assessment method',
    example: 'Class participation and exit ticket',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Special instructions for substitute teacher',
    example: 'Student John Doe needs extra help with math concepts',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateSubstituteRequestDto {
  @ApiProperty({
    description: 'Class-Subject assignment ID',
    example: 'class-subject-uuid-123',
  })
  @IsString()
  classSubjectId: string;

  @ApiProperty({
    description: 'Original teacher ID',
    example: 'teacher-uuid-456',
  })
  @IsString()
  originalTeacherId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;

  @ApiProperty({
    description: 'Date when substitute is needed',
    example: '2024-09-15T00:00:00Z',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Start time (HH:mm format)',
    example: '09:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:mm format)',
    example: '10:30',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Person requesting the substitute',
    example: 'admin-uuid-123',
  })
  @IsString()
  requestedBy: string;

  @ApiProperty({
    description: 'Reason for substitute request',
    enum: SubstituteRequestReason,
    example: SubstituteRequestReason.TEACHER_SICK_LEAVE,
  })
  @IsEnum(SubstituteRequestReason)
  reason: SubstituteRequestReason;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: SubstituteRequestPriority,
    example: SubstituteRequestPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(SubstituteRequestPriority)
  priority?: SubstituteRequestPriority;

  @ApiPropertyOptional({
    description: 'Detailed reason description',
    example: 'Teacher is on medical leave due to illness',
  })
  @IsOptional()
  @IsString()
  reasonDetails?: string;

  @ApiPropertyOptional({
    description: 'Lesson plan for the substitute teacher',
    type: LessonPlanDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LessonPlanDto)
  lessonPlan?: LessonPlanDto;

  @ApiPropertyOptional({
    description: 'Expected duration in hours',
    example: 1.5,
    minimum: 0.5,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(8)
  expectedDuration?: number;

  @ApiPropertyOptional({
    description: 'Contact information for original teacher',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  teacherContact?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Please ensure students complete the worksheet',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubstituteRequestDto {
  @ApiPropertyOptional({
    description: 'Start time (HH:mm format)',
    example: '09:15',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (HH:mm format)',
    example: '10:45',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: SubstituteRequestPriority,
    example: SubstituteRequestPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(SubstituteRequestPriority)
  priority?: SubstituteRequestPriority;

  @ApiPropertyOptional({
    description: 'Lesson plan for the substitute teacher',
    type: LessonPlanDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LessonPlanDto)
  lessonPlan?: LessonPlanDto;

  @ApiPropertyOptional({
    description: 'Expected duration in hours',
    example: 1.75,
    minimum: 0.5,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(8)
  expectedDuration?: number;

  @ApiPropertyOptional({
    description: 'Contact information for original teacher',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  teacherContact?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Updated notes for substitute teacher',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignSubstituteTeacherDto {
  @ApiProperty({
    description: 'Substitute teacher ID',
    example: 'substitute-teacher-uuid-123',
  })
  @IsString()
  substituteTeacherId: string;

  @ApiProperty({
    description: 'Person assigning the substitute',
    example: 'admin-uuid-456',
  })
  @IsString()
  assignedBy: string;

  @ApiPropertyOptional({
    description: 'Assignment notes',
    example: 'Substitute teacher has experience with this grade level',
  })
  @IsOptional()
  @IsString()
  assignmentNotes?: string;

  @ApiPropertyOptional({
    description: 'Expected start time',
    example: '2024-09-15T09:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expectedStartTime?: Date;
}

export class SubstituteFeedbackDto {
  @ApiProperty({
    description: 'Rating (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Feedback from substitute teacher',
    example: 'Students were well-behaved and engaged with the lesson',
  })
  @IsString()
  substituteFeedback: string;

  @ApiPropertyOptional({
    description: 'Feedback from original teacher',
    example: 'Thank you for covering my class. The lesson plan was followed well.',
  })
  @IsOptional()
  @IsString()
  teacherFeedback?: string;

  @ApiPropertyOptional({
    description: 'Lessons learned or improvements',
    example: 'Consider providing more background information about students',
  })
  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @ApiPropertyOptional({
    description: 'Would recommend this substitute again',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  recommendAgain?: boolean;

  @ApiProperty({
    description: 'Person providing feedback',
    example: 'teacher-uuid-789',
  })
  @IsString()
  feedbackBy: string;
}

export class SubstituteRequestFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by original teacher ID',
    example: 'teacher-uuid-123',
  })
  @IsOptional()
  @IsString()
  originalTeacherId?: string;

  @ApiPropertyOptional({
    description: 'Filter by substitute teacher ID',
    example: 'substitute-teacher-uuid-456',
  })
  @IsOptional()
  @IsString()
  substituteTeacherId?: string;

  @ApiPropertyOptional({
    description: 'Filter by date',
    example: '2024-09-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: SubstituteRequestStatus,
    example: SubstituteRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(SubstituteRequestStatus)
  status?: SubstituteRequestStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: SubstituteRequestPriority,
    example: SubstituteRequestPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(SubstituteRequestPriority)
  priority?: SubstituteRequestPriority;

  @ApiPropertyOptional({
    description: 'Filter by reason',
    enum: SubstituteRequestReason,
    example: SubstituteRequestReason.TEACHER_SICK_LEAVE,
  })
  @IsOptional()
  @IsEnum(SubstituteRequestReason)
  reason?: SubstituteRequestReason;

  @ApiProperty({
    description: 'School ID (required)',
    example: 'school-uuid-789',
  })
  @IsString()
  schoolId: string;
}

export class SubstituteRequestResponseDto {
  @ApiProperty({
    description: 'Substitute request ID',
    example: 'substitute-request-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Class-Subject assignment ID',
    example: 'class-subject-uuid-456',
  })
  classSubjectId: string;

  @ApiProperty({
    description: 'Original teacher ID',
    example: 'teacher-uuid-789',
  })
  originalTeacherId: string;

  @ApiPropertyOptional({
    description: 'Substitute teacher ID',
    example: 'substitute-teacher-uuid-101',
  })
  substituteTeacherId?: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-112',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Date when substitute is needed',
    example: '2024-09-15T00:00:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Start time',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time',
    example: '10:30',
  })
  endTime: string;

  @ApiProperty({
    description: 'Reason for substitute request',
    enum: SubstituteRequestReason,
    example: SubstituteRequestReason.TEACHER_SICK_LEAVE,
  })
  reason: SubstituteRequestReason;

  @ApiProperty({
    description: 'Priority level',
    enum: SubstituteRequestPriority,
    example: SubstituteRequestPriority.MEDIUM,
  })
  priority: SubstituteRequestPriority;

  @ApiProperty({
    description: 'Request status',
    enum: SubstituteRequestStatus,
    example: SubstituteRequestStatus.ASSIGNED,
  })
  status: SubstituteRequestStatus;

  @ApiPropertyOptional({
    description: 'Lesson plan',
    type: LessonPlanDto,
  })
  lessonPlan?: LessonPlanDto;

  @ApiPropertyOptional({
    description: 'Expected duration in hours',
    example: 1.5,
  })
  expectedDuration?: number;

  @ApiPropertyOptional({
    description: 'Actual duration in hours',
    example: 1.5,
  })
  actualDuration?: number;

  @ApiPropertyOptional({
    description: 'Assignment notes',
    example: 'Substitute has experience with this subject',
  })
  assignmentNotes?: string;

  @ApiPropertyOptional({
    description: 'Feedback',
    type: SubstituteFeedbackDto,
  })
  feedback?: SubstituteFeedbackDto;

  @ApiProperty({
    description: 'Person who requested the substitute',
    example: 'admin-uuid-123',
  })
  requestedBy: string;

  @ApiPropertyOptional({
    description: 'Person who assigned the substitute',
    example: 'admin-uuid-456',
  })
  assignedBy?: string;

  @ApiPropertyOptional({
    description: 'Assignment timestamp',
    example: '2024-09-14T15:30:00Z',
  })
  assignedAt?: Date;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
    example: '2024-09-15T10:30:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-09-14T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-09-14T15:30:00Z',
  })
  updatedAt: Date;
}

export class SubstituteRequestsListResponseDto {
  @ApiProperty({
    description: 'List of substitute requests',
    type: [SubstituteRequestResponseDto],
  })
  requests: SubstituteRequestResponseDto[];

  @ApiProperty({
    description: 'Total number of requests',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Summary statistics',
    example: {
      totalPending: 5,
      totalAssigned: 15,
      totalCompleted: 20,
      byPriority: { low: 10, medium: 8, high: 5, urgent: 2 },
      byReason: { teacher_sick_leave: 12, training_program: 5, emergency_leave: 3 },
    },
  })
  summary?: {
    totalPending: number;
    totalAssigned: number;
    totalCompleted: number;
    byPriority: Record<SubstituteRequestPriority, number>;
    byReason: Record<SubstituteRequestReason, number>;
  };
}

export class SubstituteAvailabilityDto {
  @ApiProperty({
    description: 'Substitute teacher ID',
    example: 'substitute-teacher-uuid-123',
  })
  @IsString()
  substituteTeacherId: string;

  @ApiProperty({
    description: 'Available dates',
    example: ['2024-09-15', '2024-09-16', '2024-09-17'],
  })
  @IsArray()
  @IsString({ each: true })
  availableDates: string[];

  @ApiProperty({
    description: 'Available time slots',
    example: ['09:00-12:00', '13:00-16:00'],
  })
  @IsArray()
  @IsString({ each: true })
  availableTimeSlots: string[];

  @ApiPropertyOptional({
    description: 'Subjects the substitute can teach',
    example: ['Mathematics', 'Science', 'English'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Grade levels the substitute can teach',
    example: ['Grade 1', 'Grade 2', 'Grade 3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeLevels?: string[];

  @ApiPropertyOptional({
    description: 'Special skills or certifications',
    example: ['Special Education Certified', 'ESL Certified'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialSkills?: string[];

  @ApiPropertyOptional({
    description: 'Preferred school locations',
    example: ['Main Campus', 'Branch Campus'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLocations?: string[];
}