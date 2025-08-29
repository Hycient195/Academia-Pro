// Academia Pro - Class Subject Entity
// Database entity for class-subject-teacher relationships

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('class_subjects')
export class ClassSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  classId: string;

  @Column({ length: 36 })
  subjectId: string;

  @Column({ length: 36 })
  teacherId: string;

  @Column({ type: 'json', nullable: true })
  schedule: ISubjectSchedule[];

  // Relations
  @ManyToOne(() => Class, class_ => class_.classSubjects)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => Subject, subject => subject.classSubjects)
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

// Import interfaces and forward declarations
import { ISubjectSchedule } from '../../../common/src/types/academic/academic.types';
import { Class } from './class.entity';
import { Subject } from './subject.entity';