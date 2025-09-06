// Academia Pro - Subject Entity
// Database entity for academic subjects

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
// import { TSubjectType, TGradeLevel } from '@academia-pro/types/academic';

// Type-only imports to avoid circular dependency issues
import type { Curriculum } from './curriculum.entity';
import type { ClassSubject } from './class-subject.entity';
import type { CurriculumSubject } from './curriculum-subject.entity';
import type { LearningObjective } from './learning-objective.entity';
import { TGradeLevel, TSubjectType } from '@academia-pro/types/academic';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: TSubjectType,
    default: TSubjectType.CORE,
  })
  type: TSubjectType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  grade: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  credits: number;

  @Column({ type: 'json', nullable: true })
  prerequisites: string[];

  @Column({
    type: 'json',
    default: [],
  })
  gradeLevels: TGradeLevel[];

  @Column({ default: true })
  isActive: boolean;

   @Column({ type: 'uuid' })
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToMany(() => require('./curriculum.entity').Curriculum, (curriculum: any) => curriculum.subjects)
  curricula: Curriculum[];

  @OneToMany(() => require('./class-subject.entity').ClassSubject, (classSubject: any) => classSubject.subject)
  classSubjects: ClassSubject[];

  @OneToMany(() => require('./curriculum-subject.entity').CurriculumSubject, (curriculumSubject: any) => curriculumSubject.subject)
  curriculumSubjects: CurriculumSubject[];

  @OneToMany(() => require('./learning-objective.entity').LearningObjective, (objective: any) => objective.subject)
  learningObjectives: LearningObjective[];

  // Methods
  updateGradeLevels(gradeLevels: TGradeLevel[]): void {
    this.gradeLevels = gradeLevels;
    this.updatedAt = new Date();
  }

  addPrerequisite(subjectCode: string): void {
    if (!this.prerequisites) {
      this.prerequisites = [];
    }
    if (!this.prerequisites.includes(subjectCode)) {
      this.prerequisites.push(subjectCode);
      this.updatedAt = new Date();
    }
  }

  removePrerequisite(subjectCode: string): void {
    if (this.prerequisites) {
      this.prerequisites = this.prerequisites.filter(code => code !== subjectCode);
      this.updatedAt = new Date();
    }
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}