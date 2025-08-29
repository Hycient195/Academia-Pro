import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

export enum ClassroomType {
  LIVE_SESSION = 'live_session',           // Real-time interactive session
  RECORDED_SESSION = 'recorded_session',   // Pre-recorded content
  HYBRID_SESSION = 'hybrid_session',       // Mix of live and recorded
  SELF_PACED = 'self_paced',              // Student-controlled pacing
}

export enum ClassroomStatus {
  DRAFT = 'draft',                        // Being prepared
  SCHEDULED = 'scheduled',                // Scheduled for future
  ACTIVE = 'active',                      // Currently in session
  PAUSED = 'paused',                      // Temporarily paused
  COMPLETED = 'completed',                // Session finished
  CANCELLED = 'cancelled',                // Session cancelled
  ARCHIVED = 'archived',                  // Moved to archive
}

export enum AccessLevel {
  PUBLIC = 'public',                      // Open to all enrolled students
  PRIVATE = 'private',                    // Restricted access
  INVITATION_ONLY = 'invitation_only',     // By invitation only
  PASSWORD_PROTECTED = 'password_protected', // Requires password
}

@Entity('virtual_classrooms')
@Index(['schoolId', 'status'])
@Index(['scheduledStartTime', 'status'])
@Index(['subjectId', 'academicYear'])
export class VirtualClassroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'term', type: 'varchar', length: 20 })
  term: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'classroom_type',
    type: 'enum',
    enum: ClassroomType,
    default: ClassroomType.LIVE_SESSION,
  })
  classroomType: ClassroomType;

  @Column({
    type: 'enum',
    enum: ClassroomStatus,
    default: ClassroomStatus.DRAFT,
  })
  status: ClassroomStatus;

  @Column({
    name: 'access_level',
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.PUBLIC,
  })
  accessLevel: AccessLevel;

  @Column({ name: 'access_code', type: 'varchar', length: 50, nullable: true })
  accessCode: string;

  @Column({ name: 'max_participants', type: 'int', default: 50 })
  maxParticipants: number;

  @Column({ name: 'current_participants', type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ name: 'scheduled_start_time', type: 'timestamp' })
  scheduledStartTime: Date;

  @Column({ name: 'scheduled_end_time', type: 'timestamp' })
  scheduledEndTime: Date;

  @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ name: 'meeting_url', type: 'varchar', length: 500, nullable: true })
  meetingUrl: string;

  @Column({ name: 'meeting_id', type: 'varchar', length: 100, nullable: true })
  meetingId: string;

  @Column({ name: 'recording_url', type: 'varchar', length: 500, nullable: true })
  recordingUrl: string;

  @Column({ name: 'recording_available', type: 'boolean', default: false })
  recordingAvailable: boolean;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_pattern', type: 'jsonb', nullable: true })
  recurrencePattern: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };

  @Column({ name: 'learning_objectives', type: 'text', nullable: true })
  learningObjectives: string;

  @Column({ name: 'prerequisites', type: 'text', nullable: true })
  prerequisites: string;

  @Column({ name: 'materials_required', type: 'text', nullable: true })
  materialsRequired: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'settings', type: 'jsonb', nullable: true })
  settings: {
    allowChat: boolean;
    allowScreenShare: boolean;
    allowRecording: boolean;
    allowBreakoutRooms: boolean;
    muteOnEntry: boolean;
    waitingRoom: boolean;
    allowPolls: boolean;
    allowWhiteboard: boolean;
    allowFileSharing: boolean;
    maxVideoStreams: number;
    quality: 'low' | 'medium' | 'high';
  };

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    createdBy: string;
    lastModifiedBy: string;
    version: number;
    source: string;
    externalId?: string;
    integrationData?: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be implemented when other entities are created)
  // @OneToMany(() => ClassroomSession, session => session.classroom)
  // sessions: ClassroomSession[];

  // @OneToMany(() => StudentProgress, progress => progress.classroom)
  // studentProgress: StudentProgress[];

  // @OneToMany(() => LearningAnalytics, analytics => analytics.classroom)
  // analytics: LearningAnalytics[];

  // @OneToMany(() => InteractiveElement, element => element.classroom)
  // interactiveElements: InteractiveElement[];
}