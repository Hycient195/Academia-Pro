// Academia Pro - Attendance Entity
// Database entity for tracking student attendance across various contexts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Student } from '../../students/student.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  HALF_DAY = 'half_day',
  MEDICAL_LEAVE = 'medical_leave',
  EMERGENCY = 'emergency',
}

export enum AttendanceType {
  CLASS = 'class',
  EXAM = 'exam',
  EVENT = 'event',
  ACTIVITY = 'activity',
  ASSEMBLY = 'assembly',
  FIELD_TRIP = 'field_trip',
  SPORTS = 'sports',
  CLUB = 'club',
  OTHER = 'other',
}

export enum AttendanceMethod {
  MANUAL = 'manual',
  BIOMETRIC = 'biometric',
  RFID = 'rfid',
  MOBILE_APP = 'mobile_app',
  WEB_PORTAL = 'web_portal',
  AUTOMATED = 'automated',
}

@Entity('attendance')
@Index(['studentId', 'attendanceDate'])
@Index(['studentId', 'attendanceType'])
@Index(['classId', 'attendanceDate'])
@Index(['markedBy', 'attendanceDate'])
@Index(['status', 'attendanceDate'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({
    name: 'attendance_type',
    type: 'enum',
    enum: AttendanceType,
    default: AttendanceType.CLASS,
  })
  attendanceType: AttendanceType;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: Date;

  @Column({ name: 'check_in_time', type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ name: 'check_out_time', type: 'timestamp', nullable: true })
  checkOutTime: Date;

  // Academic Context
  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId: string;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId: string;

  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId: string;

  @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
  teacherId: string;

  @Column({ name: 'period_number', type: 'int', nullable: true })
  periodNumber: number;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Event/Activity Context
  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string;

  @Column({ name: 'event_name', type: 'varchar', length: 200, nullable: true })
  eventName: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50, nullable: true })
  eventType: string;

  @Column({ name: 'location', type: 'varchar', length: 200, nullable: true })
  location: string;

  // Attendance Method and Verification
  @Column({
    name: 'attendance_method',
    type: 'enum',
    enum: AttendanceMethod,
    default: AttendanceMethod.MANUAL,
  })
  attendanceMethod: AttendanceMethod;

  @Column({ name: 'marked_by', type: 'uuid' })
  markedBy: string;

  @Column({ name: 'marked_by_name', type: 'varchar', length: 100 })
  markedByName: string;

  @Column({ name: 'marked_by_role', type: 'varchar', length: 50 })
  markedByRole: string;

  @Column({ name: 'verification_method', type: 'varchar', length: 50, nullable: true })
  verificationMethod: string;

  @Column({ name: 'device_id', type: 'varchar', length: 100, nullable: true })
  deviceId: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  // Time and Duration Tracking
  @Column({ name: 'scheduled_start_time', type: 'varchar', length: 20, nullable: true })
  scheduledStartTime: string;

  @Column({ name: 'scheduled_end_time', type: 'varchar', length: 20, nullable: true })
  scheduledEndTime: string;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes: number;

  @Column({ name: 'late_minutes', type: 'int', default: 0 })
  lateMinutes: number;

  // Reason and Notes
  @Column({ name: 'absence_reason', type: 'text', nullable: true })
  absenceReason: string;

  @Column({ name: 'excuse_type', type: 'varchar', length: 50, nullable: true })
  excuseType: string; // 'medical', 'family_emergency', 'transportation', etc.

  @Column({ name: 'excuse_document_url', type: 'varchar', length: 500, nullable: true })
  excuseDocumentUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  // Follow-up and Communication
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'parent_notification_date', type: 'timestamp', nullable: true })
  parentNotificationDate: Date;

  @Column({ name: 'parent_notification_method', type: 'varchar', length: 50, nullable: true })
  parentNotificationMethod: string;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  // Pattern Analysis
  @Column({ name: 'is_first_absence', type: 'boolean', default: false })
  isFirstAbsence: boolean;

  @Column({ name: 'consecutive_absences', type: 'int', default: 0 })
  consecutiveAbsences: number;

  @Column({ name: 'total_absences_this_month', type: 'int', default: 0 })
  totalAbsencesThisMonth: number;

  @Column({ name: 'total_absences_this_year', type: 'int', default: 0 })
  totalAbsencesThisYear: number;

  // Geolocation (for mobile/field attendance)
  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'geofence_compliance', type: 'boolean', nullable: true })
  geofenceCompliance: boolean;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  // Virtual properties
  get isPresent(): boolean {
    return this.status === AttendanceStatus.PRESENT;
  }

  get isAbsent(): boolean {
    return [AttendanceStatus.ABSENT, AttendanceStatus.MEDICAL_LEAVE, AttendanceStatus.EMERGENCY].includes(this.status);
  }

  get isLate(): boolean {
    return this.status === AttendanceStatus.LATE || this.lateMinutes > 0;
  }

  get isExcused(): boolean {
    return this.status === AttendanceStatus.EXCUSED;
  }

  get attendancePercentage(): number {
    return this.isPresent ? 100 : this.status === AttendanceStatus.HALF_DAY ? 50 : 0;
  }

  get durationHours(): number {
    if (this.actualDurationMinutes) {
      return Math.round((this.actualDurationMinutes / 60) * 100) / 100;
    }
    return 0;
  }

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // Methods
  markAsLate(minutes: number): void {
    this.status = AttendanceStatus.LATE;
    this.lateMinutes = minutes;
  }

  markAsAbsent(reason?: string): void {
    this.status = AttendanceStatus.ABSENT;
    if (reason) {
      this.absenceReason = reason;
    }
  }

  markAsExcused(reason?: string): void {
    this.status = AttendanceStatus.EXCUSED;
    if (reason) {
      this.absenceReason = reason;
    }
  }

  updatePatternData(consecutive: number, monthly: number, yearly: number): void {
    this.consecutiveAbsences = consecutive;
    this.totalAbsencesThisMonth = monthly;
    this.totalAbsencesThisYear = yearly;
    this.isFirstAbsence = yearly === 1;
  }

  addFollowUp(date: Date, notes?: string): void {
    this.followUpRequired = true;
    this.followUpDate = date;
    if (notes) {
      this.followUpNotes = notes;
    }
  }
}