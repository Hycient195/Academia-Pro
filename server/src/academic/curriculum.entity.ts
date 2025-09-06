// Academia Pro - Curriculum Entity
// Database entity for academic curricula

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';

// Type-only imports to avoid circular dependency issues
import type { Subject } from './subject.entity';
import type { CurriculumSubject } from './curriculum-subject.entity';
import type { LearningObjective } from './learning-objective.entity';
import { TAcademicYearStatus, TGradeLevel } from '@academia-pro/types/academic';

@Entity('curricula')
export class Curriculum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TGradeLevel,
  })
  gradeLevel: TGradeLevel;

  @Column({ length: 20 })
  academicYear: string;

  @Column({
    type: 'enum',
    enum: TAcademicYearStatus,
    default: TAcademicYearStatus.PLANNING,
  })
  status: TAcademicYearStatus;

  @Column({ type: 'uuid' })
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToMany(() => require('./subject.entity').Subject, (subject: any) => subject.curricula)
  @JoinTable({
    name: 'curriculum_subjects',
    joinColumn: { name: 'curriculumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subjectId', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @OneToMany(() => require('./curriculum-subject.entity').CurriculumSubject, (curriculumSubject: any) => curriculumSubject.curriculum)
  curriculumSubjects: CurriculumSubject[];

  @OneToMany(() => require('./learning-objective.entity').LearningObjective, (objective: any) => objective.curriculum)
  learningObjectives: LearningObjective[];

  // Methods
  activate(): void {
    this.status = TAcademicYearStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  complete(): void {
    this.status = TAcademicYearStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = TAcademicYearStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  addSubject(subject: Subject, hoursPerWeek: number, assessmentWeight: number, isCompulsory: boolean = true): void {
    if (!this.subjects) {
      this.subjects = [];
    }
    if (!this.subjects.find(s => s.id === subject.id)) {
      this.subjects.push(subject);
      this.updatedAt = new Date();
    }
  }

  removeSubject(subjectId: string): void {
    if (this.subjects) {
      this.subjects = this.subjects.filter(subject => subject.id !== subjectId);
      this.updatedAt = new Date();
    }
  }
}