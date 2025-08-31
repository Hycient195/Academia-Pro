import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Curriculum } from '../curriculum.entity';
import { Subject } from '../subject.entity';
import { CurriculumStandard } from './curriculum-standard.entity';

export enum SyllabusStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SyllabusType {
  COMPREHENSIVE = 'comprehensive',
  UNIT_BASED = 'unit_based',
  TOPIC_BASED = 'topic_based',
  SKILL_BASED = 'skill_based',
}

@Entity('syllabi')
@Index(['curriculumId', 'subjectId'])
@Index(['academicYear', 'gradeLevel'])
@Index(['status', 'academicYear'])
export class Syllabus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'curriculum_id', type: 'uuid' })
  curriculumId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: SyllabusType,
    default: SyllabusType.COMPREHENSIVE,
  })
  type: SyllabusType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SyllabusStatus,
    default: SyllabusStatus.DRAFT,
  })
  status: SyllabusStatus;

  @Column({ name: 'version', type: 'varchar', length: 20, default: '1.0' })
  version: string;

  @Column({ name: 'total_weeks', type: 'int' })
  totalWeeks: number;

  @Column({ name: 'total_hours', type: 'decimal', precision: 6, scale: 2 })
  totalHours: number;

  @Column({ name: 'objectives', type: 'jsonb', nullable: true })
  objectives: {
    general: string[];
    specific: string[];
    learningOutcomes: string[];
  };

  @Column({ name: 'units', type: 'jsonb', nullable: true })
  units: Array<{
    id: string;
    title: string;
    description: string;
    durationWeeks: number;
    durationHours: number;
    sequenceOrder: number;
    topics: Array<{
      id: string;
      title: string;
      description: string;
      durationHours: number;
      learningObjectives: string[];
      resources: string[];
      assessmentMethods: string[];
    }>;
    standards: string[]; // Curriculum standard IDs
  }>;

  @Column({ name: 'assessment_plan', type: 'jsonb', nullable: true })
  assessmentPlan: {
    formative: Array<{
      type: string;
      frequency: string;
      weight: number;
      description: string;
    }>;
    summative: Array<{
      type: string;
      timing: string;
      weight: number;
      description: string;
    }>;
    totalAssessmentWeight: number;
  };

  @Column({ name: 'resources', type: 'jsonb', nullable: true })
  resources: {
    textbooks: Array<{
      title: string;
      author: string;
      publisher: string;
      isbn?: string;
      required: boolean;
    }>;
    digitalResources: Array<{
      title: string;
      type: string;
      url: string;
      description: string;
    }>;
    supplementaryMaterials: Array<{
      title: string;
      type: string;
      description: string;
    }>;
  };

  @Column({ name: 'teaching_methodology', type: 'jsonb', nullable: true })
  teachingMethodology: {
    approaches: string[];
    strategies: string[];
    tools: string[];
    differentiation: string[];
  };

  @Column({ name: 'prerequisites', type: 'jsonb', nullable: true })
  prerequisites: {
    knowledge: string[];
    skills: string[];
    previousSubjects: string[];
  };

  @Column({ name: 'differentiation', type: 'jsonb', nullable: true })
  differentiation: {
    advancedLearners: string[];
    strugglingLearners: string[];
    specialNeeds: string[];
    culturalConsiderations: string[];
  };

  @Column({ name: 'timeline', type: 'jsonb', nullable: true })
  timeline: Array<{
    week: number;
    unit: string;
    topics: string[];
    activities: string[];
    assessments: string[];
    homework: string[];
  }>;

  @Column({ name: 'progress_tracking', type: 'jsonb', nullable: true })
  progressTracking: {
    milestones: Array<{
      week: number;
      description: string;
      assessment: string;
      criteria: string[];
    }>;
    checkpoints: Array<{
      week: number;
      type: string;
      description: string;
    }>;
  };

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ name: 'is_template', type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Curriculum)
  @JoinColumn({ name: 'curriculum_id' })
  curriculum: Curriculum;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(() => CurriculumStandard, standard => standard.curriculum)
  standards: CurriculumStandard[];

  // Virtual properties
  get isDraft(): boolean {
    return this.status === SyllabusStatus.DRAFT;
  }

  get isPublished(): boolean {
    return this.status === SyllabusStatus.PUBLISHED;
  }

  get isApproved(): boolean {
    return this.status === SyllabusStatus.APPROVED;
  }

  get completionPercentage(): number {
    if (!this.units || this.units.length === 0) return 0;

    const completedUnits = this.units.filter(unit =>
      unit.topics && unit.topics.length > 0
    ).length;

    return Math.round((completedUnits / this.units.length) * 100);
  }

  get totalTopics(): number {
    if (!this.units) return 0;
    return this.units.reduce((total, unit) =>
      total + (unit.topics ? unit.topics.length : 0), 0
    );
  }

  // Methods
  approve(approvedBy: string): void {
    this.status = SyllabusStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.updatedAt = new Date();
  }

  publish(): void {
    if (this.status !== SyllabusStatus.APPROVED) {
      throw new Error('Syllabus must be approved before publishing');
    }
    this.status = SyllabusStatus.PUBLISHED;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = SyllabusStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  updateVersion(newVersion: string): void {
    this.version = newVersion;
    this.updatedAt = new Date();
  }

  addUnit(unit: any): void {
    if (!this.units) {
      this.units = [];
    }
    this.units.push({
      ...unit,
      id: `unit-${Date.now()}`,
      sequenceOrder: this.units.length + 1,
    });
    this.updatedAt = new Date();
  }

  updateUnit(unitId: string, updates: any): void {
    if (!this.units) return;

    const unitIndex = this.units.findIndex(u => u.id === unitId);
    if (unitIndex !== -1) {
      this.units[unitIndex] = { ...this.units[unitIndex], ...updates };
      this.updatedAt = new Date();
    }
  }

  removeUnit(unitId: string): void {
    if (!this.units) return;

    this.units = this.units.filter(u => u.id !== unitId);
    // Reorder remaining units
    this.units.forEach((unit, index) => {
      unit.sequenceOrder = index + 1;
    });
    this.updatedAt = new Date();
  }

  // Static factory methods
  static createSyllabus(
    curriculumId: string,
    subjectId: string,
    schoolId: string,
    academicYear: string,
    gradeLevel: string,
    createdBy: string,
    title: string,
  ): Syllabus {
    const syllabus = new Syllabus();
    syllabus.curriculumId = curriculumId;
    syllabus.subjectId = subjectId;
    syllabus.schoolId = schoolId;
    syllabus.academicYear = academicYear;
    syllabus.gradeLevel = gradeLevel;
    syllabus.createdBy = createdBy;
    syllabus.title = title;
    syllabus.status = SyllabusStatus.DRAFT;
    syllabus.version = '1.0';
    syllabus.totalWeeks = 36; // Default academic year
    syllabus.totalHours = 0;

    return syllabus;
  }

  static createFromTemplate(
    templateId: string,
    curriculumId: string,
    subjectId: string,
    schoolId: string,
    academicYear: string,
    gradeLevel: string,
    createdBy: string,
    title: string,
  ): Syllabus {
    const syllabus = Syllabus.createSyllabus(
      curriculumId,
      subjectId,
      schoolId,
      academicYear,
      gradeLevel,
      createdBy,
      title,
    );

    syllabus.templateId = templateId;
    syllabus.isTemplate = false;

    return syllabus;
  }
}