import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum ProgressStatus {
  NOT_STARTED = 'not_started',            // Content not accessed yet
  IN_PROGRESS = 'in_progress',             // Currently working on content
  COMPLETED = 'completed',                 // Finished the content
  REVIEW_NEEDED = 'review_needed',         // Requires teacher review
  EXPIRED = 'expired',                     // Access period expired
}

export enum CompletionType {
  VIEWED = 'viewed',                       // Content was viewed/watched
  INTERACTED = 'interacted',               // User interacted with content
  ASSESSED = 'assessed',                   // Completed assessment/test
  SUBMITTED = 'submitted',                 // Submitted assignment/work
  CERTIFIED = 'certified',                 // Earned certificate
}

@Entity('student_progress')
@Index(['studentId', 'contentId'])
@Index(['studentId', 'classroomId'])
@Index(['studentId', 'status'])
@Index(['lastAccessedAt'])
@Index(['completedAt'])
export class StudentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'content_id', type: 'uuid', nullable: true })
  contentId: string;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
  classroomId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({
    name: 'completion_type',
    type: 'enum',
    enum: CompletionType,
    nullable: true,
  })
  completionType: CompletionType;

  @Column({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ name: 'time_spent_seconds', type: 'int', default: 0 })
  timeSpentSeconds: number;

  @Column({ name: 'attempts_count', type: 'int', default: 0 })
  attemptsCount: number;

  @Column({ name: 'score_achieved', type: 'decimal', precision: 5, scale: 2, nullable: true })
  scoreAchieved: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxScore: number;

  @Column({ name: 'grade_received', type: 'varchar', length: 10, nullable: true })
  gradeReceived: string;

  @Column({ name: 'feedback_provided', type: 'text', nullable: true })
  feedbackProvided: string;

  @Column({ name: 'certificate_earned', type: 'boolean', default: false })
  certificateEarned: boolean;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl: string;

  @Column({ name: 'first_accessed_at', type: 'timestamp', nullable: true })
  firstAccessedAt: Date;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'deadline_at', type: 'timestamp', nullable: true })
  deadlineAt: Date;

  @Column({ name: 'is_overdue', type: 'boolean', default: false })
  isOverdue: boolean;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ name: 'is_bookmarked', type: 'boolean', default: false })
  isBookmarked: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'learning_path', type: 'jsonb', nullable: true })
  learningPath: {
    currentStep: number;
    totalSteps: number;
    nextContentId?: string;
    prerequisites: string[];
    recommendedSequence: string[];
  };

  @Column({ name: 'engagement_metrics', type: 'jsonb', nullable: true })
  engagementMetrics: {
    pageViews: number;
    interactions: number;
    questionsAsked: number;
    helpRequests: number;
    peerInteractions: number;
    averageSessionDuration: number;
    completionRate: number;
    revisitCount: number;
  };

  @Column({ name: 'assessment_results', type: 'jsonb', nullable: true })
  assessmentResults: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    timePerQuestion: number;
    difficultyLevel: string;
    topicsCovered: string[];
    strengths: string[];
    areasForImprovement: string[];
  };

  @Column({ name: 'adaptive_learning', type: 'jsonb', nullable: true })
  adaptiveLearning: {
    currentDifficulty: string;
    recommendedDifficulty: string;
    learningStyle: string;
    paceAdjustment: number;
    personalizedRecommendations: string[];
    skillGaps: string[];
    masteryLevel: string;
  };

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    deviceType: string;
    browserInfo: string;
    ipAddress: string;
    sessionId: string;
    source: string;
    campaignId?: string;
    referralUrl?: string;
    customFields: Record<string, any>;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  calculateProgressPercentage(): number {
    if (this.maxScore && this.maxScore > 0) {
      return (this.scoreAchieved / this.maxScore) * 100;
    }
    return this.progressPercentage;
  }

  isCompleted(): boolean {
    return this.status === ProgressStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === ProgressStatus.IN_PROGRESS;
  }

  isOverdueCheck(): boolean {
    if (!this.deadlineAt) return false;
    return new Date() > this.deadlineAt && !this.isCompleted();
  }

  getTimeSpentFormatted(): string {
    const hours = Math.floor(this.timeSpentSeconds / 3600);
    const minutes = Math.floor((this.timeSpentSeconds % 3600) / 60);
    const seconds = this.timeSpentSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  updateEngagementMetrics(metrics: Partial<StudentProgress['engagementMetrics']>): void {
    if (!this.engagementMetrics) {
      this.engagementMetrics = {
        pageViews: 0,
        interactions: 0,
        questionsAsked: 0,
        helpRequests: 0,
        peerInteractions: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        revisitCount: 0,
      };
    }

    Object.assign(this.engagementMetrics, metrics);
  }

  markAsCompleted(completionType: CompletionType, score?: number): void {
    this.status = ProgressStatus.COMPLETED;
    this.completionType = completionType;
    this.completedAt = new Date();

    if (score !== undefined) {
      this.scoreAchieved = score;
      this.progressPercentage = this.calculateProgressPercentage();
    }
  }

  updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
    if (!this.firstAccessedAt) {
      this.firstAccessedAt = new Date();
    }
  }
}