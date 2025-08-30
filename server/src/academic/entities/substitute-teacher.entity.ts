import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { ClassSubject } from './class-subject.entity';

export enum SubstituteRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SubstituteReason {
  SICK_LEAVE = 'sick_leave',
  PERSONAL_LEAVE = 'personal_leave',
  TRAINING = 'training',
  MEETING = 'meeting',
  EMERGENCY = 'emergency',
  MATERNITY_LEAVE = 'maternity_leave',
  OTHER = 'other',
}

export enum SubstitutePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('substitute_requests')
@Index(['classSubjectId', 'date'])
@Index(['substituteTeacherId', 'date'])
@Index(['status', 'date'])
@Index(['priority', 'status'])
export class SubstituteTeacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_subject_id', type: 'uuid' })
  classSubjectId: string;

  @Column({ name: 'original_teacher_id', type: 'uuid' })
  originalTeacherId: string;

  @Column({ name: 'substitute_teacher_id', type: 'uuid', nullable: true })
  substituteTeacherId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 4, scale: 2 })
  durationHours: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SubstituteRequestStatus,
    default: SubstituteRequestStatus.PENDING,
  })
  status: SubstituteRequestStatus;

  @Column({
    name: 'reason',
    type: 'enum',
    enum: SubstituteReason,
    default: SubstituteReason.OTHER,
  })
  reason: SubstituteReason;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: SubstitutePriority,
    default: SubstitutePriority.MEDIUM,
  })
  priority: SubstitutePriority;

  @Column({ name: 'reason_details', type: 'text', nullable: true })
  reasonDetails: string;

  @Column({ name: 'lesson_plan_provided', type: 'boolean', default: false })
  lessonPlanProvided: boolean;

  @Column({ name: 'lesson_plan_url', type: 'varchar', length: 500, nullable: true })
  lessonPlanUrl: string;

  @Column({ name: 'materials_provided', type: 'boolean', default: false })
  materialsProvided: boolean;

  @Column({ name: 'materials_location', type: 'varchar', length: 200, nullable: true })
  materialsLocation: string;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ name: 'classroom_number', type: 'varchar', length: 20, nullable: true })
  classroomNumber: string;

  @Column({ name: 'student_count', type: 'int', nullable: true })
  studentCount: number;

  @Column({ name: 'subject_name', type: 'varchar', length: 100 })
  subjectName: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20 })
  section: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'feedback_provided', type: 'boolean', default: false })
  feedbackProvided: boolean;

  @Column({ name: 'substitute_feedback', type: 'jsonb', nullable: true })
  substituteFeedback: {
    rating: number; // 1-5
    comments: string;
    challenges: string[];
    recommendations: string;
    submittedAt: Date;
  };

  @Column({ name: 'teacher_feedback', type: 'jsonb', nullable: true })
  teacherFeedback: {
    rating: number; // 1-5
    comments: string;
    lessonCoverage: string;
    submittedAt: Date;
  };

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_pattern', type: 'jsonb', nullable: true })
  recurringPattern: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: Date;
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  };

  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent: boolean;

  @Column({ name: 'reminder_sent', type: 'boolean', default: false })
  reminderSent: boolean;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ClassSubject)
  @JoinColumn({ name: 'class_subject_id' })
  classSubject: ClassSubject;

  // Virtual properties
  get isPending(): boolean {
    return this.status === SubstituteRequestStatus.PENDING;
  }

  get isApproved(): boolean {
    return this.status === SubstituteRequestStatus.APPROVED;
  }

  get isCompleted(): boolean {
    return this.status === SubstituteRequestStatus.COMPLETED;
  }

  get isUrgent(): boolean {
    return this.priority === SubstitutePriority.URGENT;
  }

  get isToday(): boolean {
    const today = new Date();
    return this.date.toDateString() === today.toDateString();
  }

  get isFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.date > today;
  }

  get needsSubstitute(): boolean {
    return !this.substituteTeacherId && this.isApproved;
  }

  // Methods
  approve(approvedBy: string): void {
    this.status = SubstituteRequestStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.updatedAt = new Date();
  }

  reject(approvedBy: string, reason?: string): void {
    this.status = SubstituteRequestStatus.REJECTED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    if (reason) {
      this.adminNotes = reason;
    }
    this.updatedAt = new Date();
  }

  assignSubstitute(substituteTeacherId: string, assignedBy: string): void {
    this.substituteTeacherId = substituteTeacherId;
    this.assignedBy = assignedBy;
    this.assignedAt = new Date();
    this.updatedAt = new Date();
  }

  complete(): void {
    this.status = SubstituteRequestStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = SubstituteRequestStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  addSubstituteFeedback(feedback: any): void {
    this.substituteFeedback = {
      ...feedback,
      submittedAt: new Date(),
    };
    this.feedbackProvided = true;
    this.updatedAt = new Date();
  }

  addTeacherFeedback(feedback: any): void {
    this.teacherFeedback = {
      ...feedback,
      submittedAt: new Date(),
    };
    this.updatedAt = new Date();
  }

  markNotificationSent(): void {
    this.notificationSent = true;
    this.updatedAt = new Date();
  }

  markReminderSent(): void {
    this.reminderSent = true;
    this.updatedAt = new Date();
  }

  // Static factory methods
  static createRequest(
    classSubjectId: string,
    originalTeacherId: string,
    schoolId: string,
    date: Date,
    startTime: string,
    endTime: string,
    requestedBy: string,
    reason: SubstituteReason = SubstituteReason.OTHER,
    priority: SubstitutePriority = SubstitutePriority.MEDIUM,
  ): SubstituteTeacher {
    const request = new SubstituteTeacher();
    request.classSubjectId = classSubjectId;
    request.originalTeacherId = originalTeacherId;
    request.schoolId = schoolId;
    request.date = date;
    request.startTime = startTime;
    request.endTime = endTime;
    request.requestedBy = requestedBy;
    request.reason = reason;
    request.priority = priority;

    // Calculate duration
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    request.durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return request;
  }

  static createRecurringRequest(
    classSubjectId: string,
    originalTeacherId: string,
    schoolId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    requestedBy: string,
    pattern: any,
    reason: SubstituteReason = SubstituteReason.OTHER,
  ): SubstituteTeacher {
    const request = SubstituteTeacher.createRequest(
      classSubjectId,
      originalTeacherId,
      schoolId,
      startDate,
      startTime,
      endTime,
      requestedBy,
      reason,
    );

    request.isRecurring = true;
    request.recurringPattern = {
      ...pattern,
      endDate,
    };

    return request;
  }
}