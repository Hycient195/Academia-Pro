// Academia Pro - Class Entity
// Database entity for academic classes

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TGradeLevel } from '../../../common/src/types/academic/academic.types';

// Type-only imports to avoid circular dependency issues
import type { ClassSubject } from './class-subject.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: TGradeLevel,
  })
  gradeLevel: TGradeLevel;

  @Column({ length: 20 })
  section: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentEnrollment: number;

  @Column({ type: 'uuid', nullable: true })
  classTeacherId: string;

  @Column({ length: 20 })
  academicYear: string;

  @Column({ default: true })
  isActive: boolean;

   @Column({ type: 'uuid' })
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => require('./class-subject.entity').ClassSubject, (classSubject: any) => classSubject.class)
  classSubjects: ClassSubject[];

  // Methods
  enrollStudent(): boolean {
    if (this.currentEnrollment < this.capacity) {
      this.currentEnrollment++;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  unenrollStudent(): boolean {
    if (this.currentEnrollment > 0) {
      this.currentEnrollment--;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  updateCapacity(newCapacity: number): void {
    this.capacity = newCapacity;
    this.updatedAt = new Date();
  }

  assignClassTeacher(teacherId: string): void {
    this.classTeacherId = teacherId;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getAvailableSeats(): number {
    return this.capacity - this.currentEnrollment;
  }

  isFull(): boolean {
    return this.currentEnrollment >= this.capacity;
  }
}