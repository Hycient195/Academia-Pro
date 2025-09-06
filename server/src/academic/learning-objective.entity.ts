// Academia Pro - Learning Objective Entity
// Database entity for learning objectives

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TLearningObjectiveType, TGradeLevel } from '@academia-pro/types/academic';

// Forward declarations for circular dependencies
import type { Subject } from './subject.entity';
import type { Curriculum } from './curriculum.entity';

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

  @Column({ type: 'uuid', nullable: true })
  subjectId: string;

  @Column({ type: 'uuid', nullable: true })
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
  @ManyToOne('Subject', { eager: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne('Curriculum', { eager: false })
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