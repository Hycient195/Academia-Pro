import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AppointmentType {
  PARENT_TEACHER_CONFERENCE = 'parent_teacher_conference',
  PROGRESS_REVIEW = 'progress_review',
  DISCIPLINARY_MEETING = 'disciplinary_meeting',
  IEP_MEETING = 'iep_meeting',
  GENERAL_CONSULTATION = 'general_consultation',
  EMERGENCY_MEETING = 'emergency_meeting',
}

export enum AppointmentStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum AppointmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('appointments')
@Index(['parentPortalAccessId', 'appointmentDate'])
@Index(['studentId', 'appointmentDate'])
@Index(['status', 'appointmentDate'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
  teacherId: string;

  @Column({ name: 'teacher_name', type: 'varchar', length: 200, nullable: true })
  teacherName: string;

  @Column({
    name: 'appointment_type',
    type: 'enum',
    enum: AppointmentType,
  })
  appointmentType: AppointmentType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.REQUESTED,
  })
  status: AppointmentStatus;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: AppointmentPriority,
    default: AppointmentPriority.NORMAL,
  })
  priority: AppointmentPriority;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'appointment_date', type: 'timestamp' })
  appointmentDate: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 30 })
  durationMinutes: number;

  @Column({ name: 'location', type: 'varchar', length: 200, nullable: true })
  location: string;

  @Column({ name: 'virtual_meeting_url', type: 'varchar', length: 500, nullable: true })
  virtualMeetingUrl: string;

  @Column({ name: 'requested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'outcome', type: 'text', nullable: true })
  outcome: string;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isUpcoming(): boolean {
    return this.appointmentDate > new Date() &&
           [AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED].includes(this.status);
  }

  isPast(): boolean {
    return this.appointmentDate < new Date();
  }

  canBeCancelled(): boolean {
    return [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED].includes(this.status);
  }

  confirm(): void {
    this.status = AppointmentStatus.CONFIRMED;
    this.confirmedAt = new Date();
  }

  cancel(reason?: string): void {
    this.status = AppointmentStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.cancellationReason = reason;
    }
  }

  complete(outcome?: string): void {
    this.status = AppointmentStatus.COMPLETED;
    this.completedAt = new Date();
    if (outcome) {
      this.outcome = outcome;
    }
  }

  reschedule(newDate: Date): void {
    this.appointmentDate = newDate;
    this.status = AppointmentStatus.RESCHEDULED;
  }
}