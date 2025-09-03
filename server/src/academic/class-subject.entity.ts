// Academia Pro - Class Subject Entity
// Database entity for class-subject-teacher relationships

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

// Type-only imports to avoid circular dependency issues
import type { Class } from './class.entity';
import type { Subject } from './subject.entity';
import { ISubjectSchedule } from '../../../common/src/types/academic/academic.types';

@Entity('class_subjects')
export class ClassSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

   @Column({ type: 'uuid' })
  classId: string;

   @Column({ type: 'uuid' })
  subjectId: string;

   @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ type: 'json', nullable: true })
  schedule: ISubjectSchedule[];

  // Relations
  @ManyToOne(() => require('./class.entity').Class, (class_: any) => class_.classSubjects)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => require('./subject.entity').Subject, (subject: any) => subject.classSubjects)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  // Methods
  updateSchedule(schedule: ISubjectSchedule[]): void {
    this.schedule = schedule;
  }

  addScheduleItem(item: ISubjectSchedule): void {
    if (!this.schedule) {
      this.schedule = [];
    }
    this.schedule.push(item);
  }

  removeScheduleItem(dayOfWeek: number): void {
    if (this.schedule) {
      this.schedule = this.schedule.filter(item => item.dayOfWeek !== dayOfWeek);
    }
  }

  updateTeacher(teacherId: string): void {
    this.teacherId = teacherId;
  }
}