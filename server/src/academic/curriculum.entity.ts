// Academia Pro - Curriculum Entity
// Database entity for academic curricula

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { TGradeLevel, TAcademicYearStatus } from '../../../common/src/types/academic/academic.types';

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

  @Column({ length: 36 })
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToMany(() => Subject, subject => subject.curricula)
  @JoinTable({
    name: 'curriculum_subjects',
    joinColumn: { name: 'curriculumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subjectId', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @OneToMany(() => CurriculumSubject, curriculumSubject => curriculumSubject.curriculum)
  curriculumSubjects: CurriculumSubject[];

  @OneToMany(() => LearningObjective, objective => objective.curriculum)
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

// Forward declarations for relations
import { Subject } from './subject.entity';
import { CurriculumSubject } from './curriculum-subject.entity';
import { LearningObjective } from './learning-objective.entity';