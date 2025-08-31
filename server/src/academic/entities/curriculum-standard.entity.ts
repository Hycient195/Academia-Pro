import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Curriculum } from '../curriculum.entity';
import { Subject } from '../subject.entity';

export enum StandardType {
  NATIONAL = 'national',
  STATE = 'state',
  DISTRICT = 'district',
  SCHOOL = 'school',
  INTERNATIONAL = 'international',
}

export enum StandardCategory {
  CORE_SUBJECTS = 'core_subjects',
  ELECTIVES = 'electives',
  SPECIAL_PROGRAMS = 'special_programs',
  EXTRACURRICULAR = 'extracurricular',
  ASSESSMENT = 'assessment',
}

export enum ProficiencyLevel {
  BEGINNING = 'beginning',
  DEVELOPING = 'developing',
  PROFICIENT = 'proficient',
  ADVANCED = 'advanced',
  MASTER = 'master',
}

@Entity('curriculum_standards')
@Index(['curriculumId', 'subjectId'])
@Index(['standardType', 'category'])
@Index(['gradeLevel', 'subjectId'])
export class CurriculumStandard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'curriculum_id', type: 'uuid' })
  curriculumId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'standard_code', type: 'varchar', length: 50 })
  standardCode: string;

  @Column({ name: 'standard_name', type: 'varchar', length: 200 })
  standardName: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({
    name: 'standard_type',
    type: 'enum',
    enum: StandardType,
    default: StandardType.NATIONAL,
  })
  standardType: StandardType;

  @Column({
    name: 'category',
    type: 'enum',
    enum: StandardCategory,
    default: StandardCategory.CORE_SUBJECTS,
  })
  category: StandardCategory;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'domain', type: 'varchar', length: 100, nullable: true })
  domain: string;

  @Column({ name: 'cluster', type: 'varchar', length: 100, nullable: true })
  cluster: string;

  @Column({ name: 'standard', type: 'varchar', length: 100, nullable: true })
  standard: string;

  @Column({ name: 'sub_standard', type: 'varchar', length: 100, nullable: true })
  subStandard: string;

  @Column({ name: 'learning_target', type: 'text', nullable: true })
  learningTarget: string;

  @Column({
    name: 'proficiency_level',
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.DEVELOPING,
  })
  proficiencyLevel: ProficiencyLevel;

  @Column({ name: 'assessment_criteria', type: 'jsonb', nullable: true })
  assessmentCriteria: {
    knowledge: string[];
    skills: string[];
    understanding: string[];
    application: string[];
  };

  @Column({ name: 'prerequisites', type: 'jsonb', nullable: true })
  prerequisites: string[];

  @Column({ name: 'related_standards', type: 'jsonb', nullable: true })
  relatedStandards: string[];

  @Column({ name: 'resources', type: 'jsonb', nullable: true })
  resources: {
    textbooks: string[];
    digitalResources: string[];
    supplementaryMaterials: string[];
  };

  @Column({ name: 'estimated_hours', type: 'int', nullable: true })
  estimatedHours: number;

  @Column({ name: 'sequence_order', type: 'int', default: 0 })
  sequenceOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_core_standard', type: 'boolean', default: true })
  isCoreStandard: boolean;

  @Column({ name: 'version', type: 'varchar', length: 20, default: '1.0' })
  version: string;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'review_date', type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

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

  // Virtual properties
  get fullStandardCode(): string {
    const parts = [this.domain, this.cluster, this.standard, this.subStandard].filter(Boolean);
    return parts.length > 0 ? parts.join('.') : this.standardCode;
  }

  get isExpired(): boolean {
    return this.reviewDate ? this.reviewDate < new Date() : false;
  }

  get isEffective(): boolean {
    return !this.effectiveDate || this.effectiveDate <= new Date();
  }

  // Methods
  updateVersion(newVersion: string): void {
    this.version = newVersion;
    this.updatedAt = new Date();
  }

  markForReview(reviewDate: Date): void {
    this.reviewDate = reviewDate;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  // Static factory methods
  static createNationalStandard(
    curriculumId: string,
    subjectId: string,
    schoolId: string,
    standardData: Partial<CurriculumStandard>,
  ): CurriculumStandard {
    const standard = new CurriculumStandard();
    standard.curriculumId = curriculumId;
    standard.subjectId = subjectId;
    standard.schoolId = schoolId;
    standard.standardType = StandardType.NATIONAL;
    standard.isCoreStandard = true;

    Object.assign(standard, standardData);
    return standard;
  }

  static createSchoolStandard(
    curriculumId: string,
    subjectId: string,
    schoolId: string,
    standardData: Partial<CurriculumStandard>,
  ): CurriculumStandard {
    const standard = new CurriculumStandard();
    standard.curriculumId = curriculumId;
    standard.subjectId = subjectId;
    standard.schoolId = schoolId;
    standard.standardType = StandardType.SCHOOL;
    standard.isCoreStandard = false;

    Object.assign(standard, standardData);
    return standard;
  }
}