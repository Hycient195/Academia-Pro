// Academia Pro - Learning Objective Entity
// Database entity for learning objectives

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TLearningObjectiveType, TGradeLevel } from '../../../common/src/types/academic/academic.types';

@Entity('learning_objectives')
export class LearningObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TLearningObjectiveType,
  })
  type: TLearningObjectiveType;

  @Column({
    type: 'enum',
    enum: TGradeLevel,
  })
  gradeLevel: TGradeLevel;

  @Column({ length: 36, nullable: true })
  subjectId: string;

  @Column({ length: 36, nullable: true })
  curriculumId: string;

  @Column({ type: 'int', default: 1 })
  bloomLevel: number; // 1-6 scale

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Subject, subject => subject.learningObjectives)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne(() => Curriculum, curriculum => curriculum.learningObjectives)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  // Methods
  updateBloomLevel(level: number): void {
    if (level >= 1 && level <= 6) {
      this.bloomLevel = level;
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

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}

// Forward declarations for relations
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';