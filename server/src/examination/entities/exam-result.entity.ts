// Academia Pro - Exam Result Entity
// Database entity for managing individual student exam results and grades

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';

export enum ResultStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  REVIEWED = 'reviewed',
  PUBLISHED = 'published',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum GradeScale {
  LETTER = 'letter',
  PERCENTAGE = 'percentage',
  GPA = 'gpa',
  POINTS = 'points',
  CUSTOM = 'custom',
}

@Entity('exam_results')
@Unique(['examId', 'studentId'])
@Index(['examId', 'status'])
@Index(['studentId', 'examDate'])
@Index(['grade', 'examId'])
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.NOT_STARTED,
  })
  status: ResultStatus;

  // Scoring Information
  @Column({ name: 'obtained_marks', type: 'decimal', precision: 8, scale: 2, nullable: true })
  obtainedMarks: number;

  @Column({ name: 'total_marks', type: 'decimal', precision: 8, scale: 2 })
  totalMarks: number;

  @Column({ name: 'percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ name: 'grade', type: 'varchar', length: 10, nullable: true })
  grade: string;

  @Column({ name: 'grade_points', type: 'decimal', precision: 4, scale: 2, nullable: true })
  gradePoints: number;

  @Column({
    name: 'grade_scale',
    type: 'enum',
    enum: GradeScale,
    default: GradeScale.PERCENTAGE,
  })
  gradeScale: GradeScale;

  // Exam Timing
  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'time_taken_minutes', type: 'int', nullable: true })
  timeTakenMinutes: number;

  @Column({ name: 'exam_date', type: 'date' })
  examDate: Date;

  // Proctoring and Monitoring
  @Column({ name: 'proctor_notes', type: 'text', nullable: true })
  proctorNotes: string;

  @Column({ name: 'violation_count', type: 'int', default: 0 })
  violationCount: number;

  @Column({ name: 'violations', type: 'jsonb', default: [] })
  violations: Array<{
    type: string;
    timestamp: Date;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;

  // Detailed Scoring (for question-wise breakdown)
  @Column({ name: 'question_scores', type: 'jsonb', default: [] })
  questionScores: Array<{
    questionId: string;
    obtainedMarks: number;
    totalMarks: number;
    timeSpentSeconds: number;
    attempts: number;
    isCorrect: boolean;
  }>;

  // Feedback and Comments
  @Column({ name: 'teacher_comments', type: 'text', nullable: true })
  teacherComments: string;

  @Column({ name: 'student_feedback', type: 'text', nullable: true })
  studentFeedback: string;

  @Column({ name: 'improvement_areas', type: 'jsonb', default: [] })
  improvementAreas: string[];

  @Column({ name: 'strengths', type: 'jsonb', default: [] })
  strengths: string[];

  // Re-evaluation and Appeals
  @Column({ name: 're_evaluation_requested', type: 'boolean', default: false })
  reEvaluationRequested: boolean;

  @Column({ name: 're_evaluation_reason', type: 'text', nullable: true })
  reEvaluationReason: string;

  @Column({ name: 're_evaluation_date', type: 'timestamp', nullable: true })
  reEvaluationDate: Date;

  @Column({ name: 'original_marks', type: 'decimal', precision: 8, scale: 2, nullable: true })
  originalMarks: number;

  @Column({ name: 're_evaluated_marks', type: 'decimal', precision: 8, scale: 2, nullable: true })
  reEvaluatedMarks: number;

  @Column({ name: 're_evaluation_notes', type: 'text', nullable: true })
  reEvaluationNotes: string;

  // Academic Year and Context
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  @Column({ name: 'subject_name', type: 'varchar', length: 100 })
  subjectName: string;

  // Performance Analytics
  @Column({ name: 'rank_in_class', type: 'int', nullable: true })
  rankInClass: number;

  @Column({ name: 'rank_in_section', type: 'int', nullable: true })
  rankInSection: number;

  @Column({ name: 'percentile_rank', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentileRank: number;

  @Column({ name: 'class_average', type: 'decimal', precision: 5, scale: 2, nullable: true })
  classAverage: number;

  @Column({ name: 'section_average', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sectionAverage: number;

  // Certification and Records
  @Column({ name: 'certificate_issued', type: 'boolean', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl: string;

  @Column({ name: 'transcript_included', type: 'boolean', default: true })
  transcriptIncluded: boolean;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string;

  @Column({ name: 'graded_at', type: 'timestamp', nullable: true })
  gradedAt: Date;

  // Virtual properties
  get isPassed(): boolean {
    if (!this.percentage) return false;
    // Passing logic will be handled in the service layer with exam data
    return this.percentage >= 40; // Default passing percentage
  }

  get gradeLetter(): string {
    if (!this.percentage) return 'N/A';

    if (this.percentage >= 90) return 'A';
    if (this.percentage >= 80) return 'B';
    if (this.percentage >= 70) return 'C';
    if (this.percentage >= 60) return 'D';
    return 'F';
  }

  get isAboveAverage(): boolean {
    return this.classAverage ? this.percentage > this.classAverage : false;
  }

  get performanceLevel(): string {
    if (!this.percentage) return 'Not Assessed';

    if (this.percentage >= 90) return 'Excellent';
    if (this.percentage >= 80) return 'Very Good';
    if (this.percentage >= 70) return 'Good';
    if (this.percentage >= 60) return 'Satisfactory';
    if (this.percentage >= 50) return 'Needs Improvement';
    return 'Unsatisfactory';
  }

  get timeEfficiency(): number {
    // Time efficiency calculation will be handled in the service layer
    // with exam duration data
    return 0;
  }

  // Methods
  calculatePercentage(): void {
    if (this.obtainedMarks !== undefined && this.totalMarks > 0) {
      this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
    }
  }

  assignGrade(): void {
    if (!this.percentage) return;

    // Standard grading scale (customizable)
    if (this.percentage >= 90) this.grade = 'A';
    else if (this.percentage >= 80) this.grade = 'B';
    else if (this.percentage >= 70) this.grade = 'C';
    else if (this.percentage >= 60) this.grade = 'D';
    else this.grade = 'F';

    // GPA calculation (4.0 scale)
    const gradePointsMap: Record<string, number> = {
      'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
    };
    this.gradePoints = gradePointsMap[this.grade] || 0;
  }

  submitExam(): void {
    this.status = ResultStatus.SUBMITTED;
    this.submittedAt = new Date();

    if (this.startedAt) {
      this.timeTakenMinutes = Math.floor(
        (this.submittedAt.getTime() - this.startedAt.getTime()) / (1000 * 60)
      );
    }
  }

  gradeResult(obtainedMarks: number, graderId: string): void {
    this.obtainedMarks = obtainedMarks;
    this.calculatePercentage();
    this.assignGrade();
    this.status = ResultStatus.GRADED;
    this.gradedBy = graderId;
    this.gradedAt = new Date();
  }

  requestReEvaluation(reason: string): void {
    this.reEvaluationRequested = true;
    this.reEvaluationReason = reason;
    this.status = ResultStatus.DISPUTED;
  }

  resolveReEvaluation(newMarks: number, notes: string): void {
    this.originalMarks = this.obtainedMarks;
    this.reEvaluatedMarks = newMarks;
    this.obtainedMarks = newMarks;
    this.calculatePercentage();
    this.assignGrade();
    this.reEvaluationNotes = notes;
    this.reEvaluationDate = new Date();
    this.status = ResultStatus.REVIEWED;
  }

  addViolation(type: string, description: string, severity: 'low' | 'medium' | 'high'): void {
    this.violations.push({
      type,
      timestamp: new Date(),
      description,
      severity,
    });
    this.violationCount++;
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => Exam)
  // @JoinColumn({ name: 'exam_id' })
  // exam: Exam;

  // @ManyToOne(() => Student)
  // @JoinColumn({ name: 'student_id' })
  // student: Student;
}