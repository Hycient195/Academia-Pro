import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum ActivityType {
  SPORTS = 'sports',
  ARTS = 'arts',
  MUSIC = 'music',
  DANCE = 'dance',
  DRAMA = 'drama',
  DEBATE = 'debate',
  SCIENCE_CLUB = 'science_club',
  LITERARY_CLUB = 'literary_club',
  ENVIRONMENT_CLUB = 'environment_club',
  COMMUNITY_SERVICE = 'community_service',
  STUDENT_COUNCIL = 'student_council',
  CLUB = 'club',
  COMPETITION = 'competition',
  WORKSHOP = 'workshop',
  CAMP = 'camp',
  OTHER = 'other',
}

export enum ActivityStatus {
  REGISTERED = 'registered',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

export enum ParticipationLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('student_extracurricular_activities')
@Index(['studentPortalAccessId', 'activityType'])
@Index(['studentPortalAccessId', 'status'])
@Index(['activityId', 'academicYear'])
export class StudentExtracurricularActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @Column({ name: 'activity_name', type: 'varchar', length: 200 })
  activityName: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.REGISTERED,
  })
  status: ActivityStatus;

  @Column({
    name: 'participation_level',
    type: 'enum',
    enum: ParticipationLevel,
    default: ParticipationLevel.BEGINNER,
  })
  participationLevel: ParticipationLevel;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'registration_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @Column({ name: 'coach_teacher_id', type: 'uuid', nullable: true })
  coachTeacherId: string;

  @Column({ name: 'coach_teacher_name', type: 'varchar', length: 100, nullable: true })
  coachTeacherName: string;

  @Column({ name: 'venue', type: 'varchar', length: 200, nullable: true })
  venue: string;

  @Column({ name: 'schedule', type: 'jsonb', nullable: true })
  schedule: Array<{
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    duration: number; // minutes
  }>;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  feeAmount: number;

  @Column({ name: 'fee_currency', type: 'varchar', length: 3, default: 'NGN' })
  feeCurrency: string;

  @Column({ name: 'is_paid', type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ name: 'achievements', type: 'jsonb', nullable: true })
  achievements: Array<{
    title: string;
    description: string;
    date: Date;
    level: string;
    certificateUrl?: string;
  }>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    attendanceRate: number;
    participationScore: number;
    skillDevelopment: number;
    leadershipScore?: number;
    teamworkScore?: number;
    overallGrade?: string;
  };

  @Column({ name: 'feedback_from_coach', type: 'text', nullable: true })
  feedbackFromCoach: string;

  @Column({ name: 'student_feedback', type: 'text', nullable: true })
  studentFeedback: string;

  @Column({ name: 'parent_feedback', type: 'text', nullable: true })
  parentFeedback: string;

  @Column({ name: 'withdrawal_reason', type: 'text', nullable: true })
  withdrawalReason: string;

  @Column({ name: 'withdrawal_date', type: 'timestamp', nullable: true })
  withdrawalDate: Date;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    difficulty?: string;
    prerequisites?: string[];
    equipment?: string[];
    maxParticipants?: number;
    currentParticipants?: number;
  };

  @Column({ name: 'certificates_earned', type: 'jsonb', nullable: true })
  certificatesEarned: Array<{
    certificateId: string;
    certificateName: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateUrl: string;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}