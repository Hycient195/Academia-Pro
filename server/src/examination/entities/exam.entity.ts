// Academia Pro - Exam Entity
// Database entity for managing examinations and assessments

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';

export enum ExamType {
  QUIZ = 'quiz',
  MID_TERM = 'mid_term',
  FINAL = 'final',
  PRACTICAL = 'practical',
  PROJECT = 'project',
  ASSIGNMENT = 'assignment',
  PRESENTATION = 'presentation',
  LAB_WORK = 'lab_work',
  COMPREHENSIVE = 'comprehensive',
  ENTRANCE = 'entrance',
  SCHOLARSHIP = 'scholarship',
  OTHER = 'other',
}

export enum ExamStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  GRADED = 'graded',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export enum GradingMethod {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  HYBRID = 'hybrid',
  PEER_REVIEW = 'peer_review',
  EXTERNAL = 'external',
}

export enum AssessmentType {
  FORMATIVE = 'formative',
  SUMMATIVE = 'summative',
  DIAGNOSTIC = 'diagnostic',
  PLACEMENT = 'placement',
}

@Entity('exams')
@Index(['subjectId', 'examType'])
@Index(['classId', 'scheduledDate'])
@Index(['status', 'scheduledDate'])
@Index(['academicYear', 'examType'])
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Exam Information
  @Column({ type: 'varchar', length: 200 })
  examTitle: string;

  @Column({ type: 'text', nullable: true })
  examDescription: string;

  @Column({
    name: 'exam_type',
    type: 'enum',
    enum: ExamType,
  })
  examType: ExamType;

  @Column({
    name: 'assessment_type',
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.SUMMATIVE,
  })
  assessmentType: AssessmentType;

  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.DRAFT,
  })
  status: ExamStatus;

  // Academic Context
  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Scheduling Information
  @Column({ name: 'scheduled_date', type: 'timestamp' })
  scheduledDate: Date;

  @Column({ name: 'start_time', type: 'varchar', length: 20 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 20 })
  endTime: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'buffer_time_minutes', type: 'int', default: 15 })
  bufferTimeMinutes: number;

  // Exam Configuration
  @Column({ name: 'total_marks', type: 'decimal', precision: 8, scale: 2 })
  totalMarks: number;

  @Column({ name: 'passing_marks', type: 'decimal', precision: 8, scale: 2 })
  passingMarks: number;

  @Column({ name: 'weightage_percentage', type: 'decimal', precision: 5, scale: 2, default: 100.00 })
  weightagePercentage: number;

  @Column({
    name: 'grading_method',
    type: 'enum',
    enum: GradingMethod,
    default: GradingMethod.MANUAL,
  })
  gradingMethod: GradingMethod;

  // Question and Content Information
  @Column({ name: 'total_questions', type: 'int', nullable: true })
  totalQuestions: number;

  @Column({ name: 'question_paper_url', type: 'varchar', length: 500, nullable: true })
  questionPaperUrl: string;

  @Column({ name: 'answer_key_url', type: 'varchar', length: 500, nullable: true })
  answerKeyUrl: string;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions: string;

  // Exam Rules and Settings
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'allow_retake', type: 'boolean', default: false })
  allowRetake: boolean;

  @Column({ name: 'max_retakes', type: 'int', default: 1 })
  maxRetakes: number;

  @Column({ name: 'shuffle_questions', type: 'boolean', default: false })
  shuffleQuestions: boolean;

  @Column({ name: 'shuffle_options', type: 'boolean', default: false })
  shuffleOptions: boolean;

  @Column({ name: 'show_results_immediately', type: 'boolean', default: false })
  showResultsImmediately: boolean;

  @Column({ name: 'allow_review_after_submission', type: 'boolean', default: true })
  allowReviewAfterSubmission: boolean;

  // Proctoring and Security
  @Column({ name: 'requires_proctoring', type: 'boolean', default: false })
  requiresProctoring: boolean;

  @Column({ name: 'proctor_id', type: 'uuid', nullable: true })
  proctorId: string;

  @Column({ name: 'monitoring_enabled', type: 'boolean', default: false })
  monitoringEnabled: boolean;

  @Column({ name: 'screenshot_interval_minutes', type: 'int', nullable: true })
  screenshotIntervalMinutes: number;

  @Column({ name: 'tab_switch_allowed', type: 'boolean', default: false })
  tabSwitchAllowed: boolean;

  @Column({ name: 'max_tab_switches', type: 'int', default: 3 })
  maxTabSwitches: number;

  // Student Eligibility
  @Column({ name: 'eligibility_criteria', type: 'jsonb', default: {} })
  eligibilityCriteria: {
    minimumAttendancePercentage?: number;
    prerequisiteExams?: string[];
    requiredAssignments?: string[];
    specialPermissions?: string[];
  };

  @Column({ name: 'excluded_students', type: 'jsonb', default: [] })
  excludedStudents: string[]; // Student IDs

  // Notification Settings
  @Column({ name: 'notify_students', type: 'boolean', default: true })
  notifyStudents: boolean;

  @Column({ name: 'notify_parents', type: 'boolean', default: false })
  notifyParents: boolean;

  @Column({ name: 'reminder_hours_before', type: 'int', default: 24 })
  reminderHoursBefore: number;

  // Results and Grading
  @Column({ name: 'results_published', type: 'boolean', default: false })
  resultsPublished: boolean;

  @Column({ name: 'results_publish_date', type: 'timestamp', nullable: true })
  resultsPublishDate: Date;

  @Column({ name: 'grade_distribution', type: 'jsonb', default: {} })
  gradeDistribution: {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    F?: number;
    customGrades?: Record<string, number>;
  };

  // Statistics
  @Column({ name: 'enrolled_students_count', type: 'int', default: 0 })
  enrolledStudentsCount: number;

  @Column({ name: 'submitted_count', type: 'int', default: 0 })
  submittedCount: number;

  @Column({ name: 'graded_count', type: 'int', default: 0 })
  gradedCount: number;

  @Column({ name: 'average_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageScore: number;

  @Column({ name: 'highest_score', type: 'decimal', precision: 8, scale: 2, nullable: true })
  highestScore: number;

  @Column({ name: 'lowest_score', type: 'decimal', precision: 8, scale: 2, nullable: true })
  lowestScore: number;

  @Column({ name: 'pass_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  passPercentage: number;

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
  get isScheduled(): boolean {
    return this.status === ExamStatus.SCHEDULED;
  }

  get isInProgress(): boolean {
    return this.status === ExamStatus.IN_PROGRESS;
  }

  get isCompleted(): boolean {
    return this.status === ExamStatus.COMPLETED || this.status === ExamStatus.GRADED;
  }

  get isGraded(): boolean {
    return this.status === ExamStatus.GRADED;
  }

  get timeRemaining(): number {
    const now = new Date();
    const endTime = new Date(this.scheduledDate);
    const [hours, minutes] = this.endTime.split(':').map(Number);
    endTime.setHours(hours, minutes, 0, 0);

    const diffMs = endTime.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
  }

  get submissionRate(): number {
    return this.enrolledStudentsCount > 0
      ? (this.submittedCount / this.enrolledStudentsCount) * 100
      : 0;
  }

  get gradingProgress(): number {
    return this.submittedCount > 0
      ? (this.gradedCount / this.submittedCount) * 100
      : 0;
  }

  // Methods
  canStart(): boolean {
    const now = new Date();
    const examStart = new Date(this.scheduledDate);
    const [hours, minutes] = this.startTime.split(':').map(Number);
    examStart.setHours(hours, minutes, 0, 0);

    const examEnd = new Date(this.scheduledDate);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    examEnd.setHours(endHours, endMinutes, 0, 0);

    return now >= examStart && now <= examEnd;
  }

  isEligible(studentId: string): boolean {
    return !this.excludedStudents.includes(studentId);
  }

  updateStatistics(enrolled: number, submitted: number, graded: number): void {
    this.enrolledStudentsCount = enrolled;
    this.submittedCount = submitted;
    this.gradedCount = graded;
  }

  publishResults(): void {
    this.resultsPublished = true;
    this.resultsPublishDate = new Date();
    this.status = ExamStatus.GRADED;
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => Subject)
  // @JoinColumn({ name: 'subject_id' })
  // subject: Subject;

  // @ManyToOne(() => Class)
  // @JoinColumn({ name: 'class_id' })
  // class: Class;

  // @OneToMany(() => ExamResult, result => result.exam)
  // results: ExamResult[];
}