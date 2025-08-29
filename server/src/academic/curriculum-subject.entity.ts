// Academia Pro - Curriculum Subject Entity
// Database entity for curriculum-subject relationships

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('curriculum_subjects')
export class CurriculumSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  curriculumId: string;

  @Column({ length: 36 })
  subjectId: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 0 })
  hoursPerWeek: number;

  @Column({ type: 'int', default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  assessmentWeight: number;

  @Column({ default: true })
  isCompulsory: boolean;

  // Relations
  @ManyToOne(() => Curriculum, curriculum => curriculum.curriculumSubjects)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @ManyToOne(() => Subject, subject => subject.curriculumSubjects)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  // Methods
  updateHours(hoursPerWeek: number, totalHours: number): void {
    this.hoursPerWeek = hoursPerWeek;
    this.totalHours = totalHours;
  }

  updateAssessmentWeight(weight: number): void {
    this.assessmentWeight = weight;
  }

  setCompulsory(isCompulsory: boolean): void {
    this.isCompulsory = isCompulsory;
  }
}

// Forward declarations for relations
import { Curriculum } from './curriculum.entity';
import { Subject } from './subject.entity';