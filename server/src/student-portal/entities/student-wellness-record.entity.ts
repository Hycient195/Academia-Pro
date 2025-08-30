import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum WellnessCheckType {
  DAILY_CHECK = 'daily_check',
  WEEKLY_ASSESSMENT = 'weekly_assessment',
  MONTHLY_REVIEW = 'monthly_review',
  EMERGENCY_REPORT = 'emergency_report',
  COUNSELING_SESSION = 'counseling_session',
  HEALTH_SCREENING = 'health_screening',
  MENTAL_HEALTH_CHECK = 'mental_health_check',
  PHYSICAL_ACTIVITY_LOG = 'physical_activity_log',
}

export enum WellnessStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  CONCERNING = 'concerning',
  CRITICAL = 'critical',
}

export enum MoodLevel {
  VERY_HAPPY = 'very_happy',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  VERY_SAD = 'very_sad',
  ANXIOUS = 'anxious',
  STRESSED = 'stressed',
  ANGRY = 'angry',
}

@Entity('student_wellness_records')
@Index(['studentPortalAccessId', 'checkType'])
@Index(['studentPortalAccessId', 'createdAt'])
@Index(['checkType', 'createdAt'])
export class StudentWellnessRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({
    name: 'check_type',
    type: 'enum',
    enum: WellnessCheckType,
  })
  checkType: WellnessCheckType;

  @Column({
    name: 'overall_status',
    type: 'enum',
    enum: WellnessStatus,
    nullable: true,
  })
  overallStatus: WellnessStatus;

  @Column({
    name: 'mood_level',
    type: 'enum',
    enum: MoodLevel,
    nullable: true,
  })
  moodLevel: MoodLevel;

  @Column({ name: 'mood_description', type: 'text', nullable: true })
  moodDescription: string;

  @Column({ name: 'stress_level', type: 'int', nullable: true })
  stressLevel: number; // 1-10 scale

  @Column({ name: 'sleep_quality', type: 'int', nullable: true })
  sleepQuality: number; // 1-10 scale

  @Column({ name: 'energy_level', type: 'int', nullable: true })
  energyLevel: number; // 1-10 scale

  @Column({ name: 'physical_activity_hours', type: 'decimal', precision: 4, scale: 1, nullable: true })
  physicalActivityHours: number;

  @Column({ name: 'screen_time_hours', type: 'decimal', precision: 4, scale: 1, nullable: true })
  screenTimeHours: number;

  @Column({ name: 'academic_pressure_level', type: 'int', nullable: true })
  academicPressureLevel: number; // 1-10 scale

  @Column({ name: 'social_interaction_quality', type: 'int', nullable: true })
  socialInteractionQuality: number; // 1-10 scale

  @Column({ name: 'health_concerns', type: 'jsonb', nullable: true })
  healthConcerns: Array<{
    concernType: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    reportedDate: Date;
  }>;

  @Column({ name: 'medication_taken', type: 'jsonb', nullable: true })
  medicationTaken: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    lastTaken: Date;
  }>;

  @Column({ name: 'counseling_sessions', type: 'jsonb', nullable: true })
  counselingSessions: Array<{
    sessionDate: Date;
    counselorName: string;
    sessionType: string;
    notes: string;
    followUpRequired: boolean;
  }>;

  @Column({ name: 'emergency_contacts_used', type: 'jsonb', nullable: true })
  emergencyContactsUsed: Array<{
    contactDate: Date;
    contactType: string;
    reason: string;
    outcome: string;
  }>;

  @Column({ name: 'wellness_goals', type: 'jsonb', nullable: true })
  wellnessGoals: Array<{
    goalType: string;
    goalDescription: string;
    targetDate: Date;
    progress: number; // percentage
    status: 'active' | 'completed' | 'cancelled';
  }>;

  @Column({ name: 'support_resources_used', type: 'jsonb', nullable: true })
  supportResourcesUsed: Array<{
    resourceType: string;
    resourceName: string;
    accessDate: Date;
    duration: number; // minutes
    helpfulness: number; // 1-5 scale
  }>;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'reported_by', type: 'varchar', length: 100, nullable: true })
  reportedBy: string;

  @Column({ name: 'reported_by_role', type: 'varchar', length: 50, nullable: true })
  reportedByRole: string;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ name: 'confidential', type: 'boolean', default: true })
  confidential: boolean;

  @Column({ name: 'shared_with_parents', type: 'boolean', default: false })
  sharedWithParents: boolean;

  @Column({ name: 'shared_with_teachers', type: 'boolean', default: false })
  sharedWithTeachers: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    assessmentMethod?: string;
    assessmentTool?: string;
    environmentalFactors?: string[];
    triggers?: string[];
    copingStrategies?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}