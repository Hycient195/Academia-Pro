import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum DisciplineType {
  ACADEMIC = 'academic',
  BEHAVIORAL = 'behavioral',
  ATTENDANCE = 'attendance',
  BULLYING = 'bullying',
  CHEATING = 'cheating',
  DEFIANCE = 'defiance',
  DISRUPTION = 'disruption',
  FIGHTING = 'fighting',
  INAPPROPRIATE_LANGUAGE = 'inappropriate_language',
  PROPERTY_DAMAGE = 'property_damage',
  THEFT = 'theft',
  SUBSTANCE_ABUSE = 'substance_abuse',
  ELECTRONIC_DEVICE_MISUSE = 'electronic_device_misuse',
  OTHER = 'other',
}

export enum DisciplineSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum DisciplineStatus {
  REPORTED = 'reported',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  APPEALED = 'appealed',
  APPEAL_UPHELD = 'appeal_upheld',
  APPEAL_DENIED = 'appeal_denied',
  DISMISSED = 'dismissed',
}

export enum DisciplineAction {
  WARNING = 'warning',
  VERBAL_REPRIMAND = 'verbal_reprimand',
  WRITTEN_REPRIMAND = 'written_reprimand',
  DETENTION = 'detention',
  SUSPENSION = 'suspension',
  EXPULSION = 'expulsion',
  COMMUNITY_SERVICE = 'community_service',
  BEHAVIORAL_CONTRACT = 'behavioral_contract',
  COUNSELING_REFERRAL = 'counseling_referral',
  PARENT_CONFERENCE = 'parent_conference',
  LOSS_OF_PRIVILEGES = 'loss_of_privileges',
  PROBATION = 'probation',
  OTHER = 'other',
}

@Entity('student_discipline')
@Index(['studentId', 'disciplineType'])
@Index(['studentId', 'incidentDate'])
@Index(['status', 'incidentDate'])
@Index(['reportedBy', 'incidentDate'])
export class StudentDiscipline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'discipline_type',
    type: 'enum',
    enum: DisciplineType,
  })
  disciplineType: DisciplineType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: DisciplineSeverity,
    default: DisciplineSeverity.MINOR,
  })
  severity: DisciplineSeverity;

  @Column({
    type: 'enum',
    enum: DisciplineStatus,
    default: DisciplineStatus.REPORTED,
  })
  status: DisciplineStatus;

  // Incident Information
  @Column({ name: 'incident_date', type: 'timestamp' })
  incidentDate: Date;

  @Column({ name: 'incident_time', type: 'varchar', length: 20, nullable: true })
  incidentTime: string;

  @Column({ name: 'incident_location', type: 'varchar', length: 200 })
  incidentLocation: string;

  @Column({ name: 'incident_description', type: 'text' })
  incidentDescription: string;

  @Column({ name: 'witnesses', type: 'jsonb', default: [] })
  witnesses: Array<{
    name: string;
    role: string;
    contact?: string;
    statement?: string;
  }>;

  // Reporting Information
  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy: string;

  @Column({ name: 'reported_by_name', type: 'varchar', length: 100 })
  reportedByName: string;

  @Column({ name: 'reported_by_role', type: 'varchar', length: 50 })
  reportedByRole: string;

  @Column({ name: 'report_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ name: 'report_details', type: 'text', nullable: true })
  reportDetails: string;

  // Investigation Information
  @Column({ name: 'investigation_required', type: 'boolean', default: false })
  investigationRequired: boolean;

  @Column({ name: 'investigator_id', type: 'uuid', nullable: true })
  investigatorId: string;

  @Column({ name: 'investigator_name', type: 'varchar', length: 100, nullable: true })
  investigatorName: string;

  @Column({ name: 'investigation_start_date', type: 'timestamp', nullable: true })
  investigationStartDate: Date;

  @Column({ name: 'investigation_end_date', type: 'timestamp', nullable: true })
  investigationEndDate: Date;

  @Column({ name: 'investigation_findings', type: 'text', nullable: true })
  investigationFindings: string;

  // Disciplinary Action
  @Column({
    name: 'discipline_action',
    type: 'enum',
    enum: DisciplineAction,
    nullable: true,
  })
  disciplineAction: DisciplineAction;

  @Column({ name: 'action_description', type: 'text', nullable: true })
  actionDescription: string;

  @Column({ name: 'action_start_date', type: 'timestamp', nullable: true })
  actionStartDate: Date;

  @Column({ name: 'action_end_date', type: 'timestamp', nullable: true })
  actionEndDate: Date;

  @Column({ name: 'action_duration_days', type: 'int', nullable: true })
  actionDurationDays: number;

  // Appeal Process
  @Column({ name: 'appeal_submitted', type: 'boolean', default: false })
  appealSubmitted: boolean;

  @Column({ name: 'appeal_date', type: 'timestamp', nullable: true })
  appealDate: Date;

  @Column({ name: 'appeal_reason', type: 'text', nullable: true })
  appealReason: string;

  @Column({ name: 'appeal_hearing_date', type: 'timestamp', nullable: true })
  appealHearingDate: Date;

  @Column({ name: 'appeal_decision', type: 'varchar', length: 50, nullable: true })
  appealDecision: 'upheld' | 'denied' | 'modified';

  @Column({ name: 'appeal_decision_date', type: 'timestamp', nullable: true })
  appealDecisionDate: Date;

  @Column({ name: 'appeal_notes', type: 'text', nullable: true })
  appealNotes: string;

  // Communication and Follow-up
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'parent_notification_date', type: 'timestamp', nullable: true })
  parentNotificationDate: Date;

  @Column({ name: 'parent_acknowledgment', type: 'boolean', default: false })
  parentAcknowledgment: boolean;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  // Supporting Documents
  @Column({ name: 'supporting_documents', type: 'jsonb', default: [] })
  supportingDocuments: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadDate: Date;
  }>;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Impact Assessment
  @Column({ name: 'impact_on_student', type: 'text', nullable: true })
  impactOnStudent: string;

  @Column({ name: 'impact_on_class', type: 'text', nullable: true })
  impactOnClass: string;

  @Column({ name: 'preventive_measures', type: 'text', nullable: true })
  preventiveMeasures: string;

  // Resolution and Outcomes
  @Column({ name: 'resolution_date', type: 'timestamp', nullable: true })
  resolutionDate: Date;

  @Column({ name: 'resolution_summary', type: 'text', nullable: true })
  resolutionSummary: string;

  @Column({ name: 'lessons_learned', type: 'text', nullable: true })
  lessonsLearned: string;

  @Column({ name: 'preventive_actions_taken', type: 'text', nullable: true })
  preventiveActionsTaken: string;

  // Metadata
  @Column({ name: 'is_repeated_offense', type: 'boolean', default: false })
  isRepeatedOffense: boolean;

  @Column({ name: 'previous_offenses_count', type: 'int', default: 0 })
  previousOffensesCount: number;

  @Column({ name: 'confidential', type: 'boolean', default: false })
  confidential: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    relatedIncidents?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}