import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum ResourceType {
  ASSIGNMENT = 'assignment',
  STUDY_MATERIAL = 'study_material',
  VIDEO_LECTURE = 'video_lecture',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project',
  LABORATORY = 'laboratory',
  LIBRARY_BOOK = 'library_book',
  DIGITAL_LIBRARY = 'digital_library',
  CAREER_RESOURCE = 'career_resource',
  WELLNESS_RESOURCE = 'wellness_resource',
  EXTRACURRICULAR_MATERIAL = 'extracurricular_material',
}

export enum AccessAction {
  VIEW = 'view',
  DOWNLOAD = 'download',
  PRINT = 'print',
  SHARE = 'share',
  SUBMIT = 'submit',
  COMPLETE = 'complete',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
}

@Entity('student_resource_access')
@Index(['studentPortalAccessId', 'resourceType'])
@Index(['studentPortalAccessId', 'createdAt'])
@Index(['resourceId', 'resourceType'])
export class StudentResourceAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100 })
  resourceId: string;

  @Column({
    name: 'resource_type',
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @Column({ name: 'resource_title', type: 'varchar', length: 200 })
  resourceTitle: string;

  @Column({
    name: 'access_action',
    type: 'enum',
    enum: AccessAction,
  })
  accessAction: AccessAction;

  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string;

  @Column({ name: 'subject_name', type: 'varchar', length: 100, nullable: true })
  subjectName: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20, nullable: true })
  gradeLevel: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  };

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  completionPercentage: number;

  @Column({ name: 'is_offline_access', type: 'boolean', default: false })
  isOfflineAccess: boolean;

  @Column({ name: 'download_timestamp', type: 'timestamp', nullable: true })
  downloadTimestamp: Date;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    assignmentDueDate?: Date;
    submissionDeadline?: Date;
    resourceFormat?: string;
    resourceCategory?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedDuration?: number; // minutes
  };

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    timeSpent: number; // seconds
    interactions: number;
    correctAnswers?: number;
    totalQuestions?: number;
    score?: number;
    grade?: string;
  };

  @Column({ name: 'learning_analytics', type: 'jsonb', nullable: true })
  learningAnalytics: {
    engagementLevel: 'low' | 'medium' | 'high';
    learningStyle?: string;
    preferredTimeOfDay?: string;
    studyPattern?: string;
    improvementAreas?: string[];
    strengths?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}