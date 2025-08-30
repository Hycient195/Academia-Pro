// Academia Pro - Timetable Entity
// Database entity for managing class schedules and resource allocation

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum PeriodType {
  REGULAR_CLASS = 'regular_class',
  LAB_SESSION = 'lab_session',
  PRACTICAL = 'practical',
  BREAK = 'break',
  LUNCH = 'lunch',
  ASSEMBLY = 'assembly',
  EXAM = 'exam',
  SPECIAL_EVENT = 'special_event',
  SPORTS = 'sports',
  CLUB_ACTIVITY = 'club_activity',
  STUDY_PERIOD = 'study_period',
  OFFICE_HOURS = 'office_hours',
  OTHER = 'other',
}

export enum TimetableStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum PriorityLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('timetables')
@Unique(['schoolId', 'academicYear', 'gradeLevel', 'section', 'dayOfWeek', 'startTime'])
@Index(['schoolId', 'academicYear'])
@Index(['teacherId', 'dayOfWeek'])
@Index(['roomId', 'dayOfWeek', 'startTime'])
@Index(['subjectId', 'classId'])
@Index(['status', 'academicYear'])
export class Timetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'subject_name', type: 'varchar', length: 100 })
  subjectName: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ name: 'teacher_name', type: 'varchar', length: 100 })
  teacherName: string;

  // Scheduling Information
  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ name: 'start_time', type: 'varchar', length: 20 })
  startTime: string; // HH:MM format

  @Column({ name: 'end_time', type: 'varchar', length: 20 })
  endTime: string; // HH:MM format

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'period_number', type: 'int', nullable: true })
  periodNumber: number; // 1, 2, 3, etc.

  @Column({
    name: 'period_type',
    type: 'enum',
    enum: PeriodType,
    default: PeriodType.REGULAR_CLASS,
  })
  periodType: PeriodType;

  // Resource Allocation
  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId: string;

  @Column({ name: 'room_name', type: 'varchar', length: 100, nullable: true })
  roomName: string;

  @Column({ name: 'room_capacity', type: 'int', nullable: true })
  roomCapacity: number;

  @Column({ name: 'room_type', type: 'varchar', length: 50, nullable: true })
  roomType: string; // classroom, lab, auditorium, etc.

  @Column({ name: 'equipment_required', type: 'jsonb', default: [] })
  equipmentRequired: Array<{
    equipmentId: string;
    equipmentName: string;
    quantity: number;
  }>;

  // Recurrence and Scheduling
  @Column({
    name: 'recurrence_type',
    type: 'enum',
    enum: RecurrenceType,
    default: RecurrenceType.WEEKLY,
  })
  recurrenceType: RecurrenceType;

  @Column({ name: 'recurrence_end_date', type: 'timestamp', nullable: true })
  recurrenceEndDate: Date;

  @Column({ name: 'is_recurring', type: 'boolean', default: true })
  isRecurring: boolean;

  // Status and Lifecycle
  @Column({
    type: 'enum',
    enum: TimetableStatus,
    default: TimetableStatus.DRAFT,
  })
  status: TimetableStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_cancelled', type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  // Special Events and Notes
  @Column({ name: 'event_title', type: 'varchar', length: 200, nullable: true })
  eventTitle: string;

  @Column({ name: 'event_description', type: 'text', nullable: true })
  eventDescription: string;

  @Column({ name: 'is_special_event', type: 'boolean', default: false })
  isSpecialEvent: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  // Attendance and Tracking
  @Column({ name: 'expected_students', type: 'int', nullable: true })
  expectedStudents: number;

  @Column({ name: 'actual_students', type: 'int', nullable: true })
  actualStudents: number;

  @Column({ name: 'attendance_marked', type: 'boolean', default: false })
  attendanceMarked: boolean;

  // Conflict Resolution
  @Column({ name: 'has_conflicts', type: 'boolean', default: false })
  hasConflicts: boolean;

  @Column({ name: 'conflict_details', type: 'jsonb', default: [] })
  conflictDetails: Array<{
    conflictType: string;
    conflictDescription: string;
    severity: 'low' | 'medium' | 'high';
    resolution?: string;
  }>;

  @Column({ name: 'alternative_room_suggestions', type: 'jsonb', default: [] })
  alternativeRoomSuggestions: string[]; // Room IDs

  // Priority and Optimization
  @Column({
    name: 'priority_level',
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.NORMAL,
  })
  priorityLevel: PriorityLevel;

  @Column({ name: 'is_fixed', type: 'boolean', default: false })
  isFixed: boolean; // Cannot be moved by auto-scheduler

  @Column({ name: 'optimization_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  optimizationScore: number;

  // Notifications and Communication
  @Column({ name: 'notify_students', type: 'boolean', default: true })
  notifyStudents: boolean;

  @Column({ name: 'notify_teachers', type: 'boolean', default: true })
  notifyTeachers: boolean;

  @Column({ name: 'notify_parents', type: 'boolean', default: false })
  notifyParents: boolean;

  @Column({ name: 'reminder_minutes_before', type: 'int', default: 15 })
  reminderMinutesBefore: number;

  // Digital Access and Integration
  @Column({ name: 'is_online_class', type: 'boolean', default: false })
  isOnlineClass: boolean;

  @Column({ name: 'online_meeting_link', type: 'varchar', length: 500, nullable: true })
  onlineMeetingLink: string;

  @Column({ name: 'online_meeting_id', type: 'varchar', length: 100, nullable: true })
  onlineMeetingId: string;

  @Column({ name: 'online_meeting_password', type: 'varchar', length: 50, nullable: true })
  onlineMeetingPassword: string;

  // Mobile and Digital Features
  @Column({ name: 'qr_code_enabled', type: 'boolean', default: false })
  qrCodeEnabled: boolean;

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ name: 'mobile_checkin_enabled', type: 'boolean', default: false })
  mobileCheckinEnabled: boolean;

  // Analytics and Reporting
  @Column({ name: 'average_attendance_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageAttendanceRate: number;

  @Column({ name: 'punctuality_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  punctualityRate: number;

  @Column({ name: 'utilization_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number;

  // Metadata and Additional Information
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    syllabusTopic?: string;
    learningObjectives?: string[];
    requiredMaterials?: string[];
    assessmentType?: string;
    specialInstructions?: string;
    accessibilityNotes?: string;
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  // Virtual properties
  get isToday(): boolean {
    const today = new Date().getDay();
    const dayMap = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    return dayMap[today] === this.dayOfWeek;
  }

  get isInProgress(): boolean {
    if (!this.isToday) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
  }

  get isUpcoming(): boolean {
    if (!this.isToday) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;

    return currentTime < startTimeMinutes && (startTimeMinutes - currentTime) <= 60; // Within next hour
  }

  get timeUntilStart(): number {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;

    return startTimeMinutes - currentTime;
  }

  get hasRoomConflict(): boolean {
    return this.conflictDetails.some(conflict =>
      conflict.conflictType === 'room_conflict' && conflict.severity === 'high'
    );
  }

  get hasTeacherConflict(): boolean {
    return this.conflictDetails.some(conflict =>
      conflict.conflictType === 'teacher_conflict' && conflict.severity === 'high'
    );
  }

  get utilizationEfficiency(): number {
    if (!this.expectedStudents || !this.roomCapacity) return 0;
    return (this.expectedStudents / this.roomCapacity) * 100;
  }

  // Methods
  markAttendance(attendanceCount: number): void {
    this.actualStudents = attendanceCount;
    this.attendanceMarked = true;

    if (this.expectedStudents && this.expectedStudents > 0) {
      this.averageAttendanceRate = (attendanceCount / this.expectedStudents) * 100;
    }
  }

  addConflict(conflictType: string, description: string, severity: 'low' | 'medium' | 'high'): void {
    this.conflictDetails.push({
      conflictType,
      conflictDescription: description,
      severity,
    });
    this.hasConflicts = true;
  }

  resolveConflict(conflictIndex: number, resolution: string): void {
    if (this.conflictDetails[conflictIndex]) {
      this.conflictDetails[conflictIndex].resolution = resolution;
    }

    // Check if all conflicts are resolved
    const unresolvedConflicts = this.conflictDetails.filter(c => !c.resolution);
    this.hasConflicts = unresolvedConflicts.length > 0;
  }

  updateOptimizationScore(score: number): void {
    this.optimizationScore = score;
  }

  publish(): void {
    this.status = TimetableStatus.PUBLISHED;
  }

  activate(): void {
    this.status = TimetableStatus.ACTIVE;
  }

  cancel(reason: string): void {
    this.isCancelled = true;
    this.cancellationReason = reason;
    this.status = TimetableStatus.CANCELLED;
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => School)
  // @JoinColumn({ name: 'school_id' })
  // school: School;

  // @ManyToOne(() => Class)
  // @JoinColumn({ name: 'class_id' })
  // class: Class;

  // @ManyToOne(() => Subject)
  // @JoinColumn({ name: 'subject_id' })
  // subject: Subject;

  // @ManyToOne(() => Teacher)
  // @JoinColumn({ name: 'teacher_id' })
  // teacher: Teacher;

  // @ManyToOne(() => Room)
  // @JoinColumn({ name: 'room_id' })
  // room: Room;
}