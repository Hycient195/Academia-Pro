import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Class } from '../class.entity';

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  WITHDRAWN = 'withdrawn',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave',
}

export enum EnrollmentType {
  REGULAR = 'regular',
  TRANSFER = 'transfer',
  PROMOTION = 'promotion',
  DEMOTION = 'demotion',
  REPEAT = 'repeat',
}

@Entity('student_class_enrollments')
@Unique(['studentId', 'classId', 'academicYear'])
@Index(['studentId', 'academicYear'])
@Index(['classId', 'academicYear'])
@Index(['enrollmentStatus', 'academicYear'])
@Index(['enrollmentDate'])
export class StudentClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({
    name: 'enrollment_status',
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  enrollmentStatus: EnrollmentStatus;

  @Column({
    name: 'enrollment_type',
    type: 'enum',
    enum: EnrollmentType,
    default: EnrollmentType.REGULAR,
  })
  enrollmentType: EnrollmentType;

  @Column({ name: 'enrollment_date', type: 'date' })
  enrollmentDate: Date;

  @Column({ name: 'withdrawal_date', type: 'date', nullable: true })
  withdrawalDate: Date;

  @Column({ name: 'transfer_date', type: 'date', nullable: true })
  transferDate: Date;

  @Column({ name: 'roll_number', type: 'varchar', length: 20, nullable: true })
  rollNumber: string;

  @Column({ name: 'seat_number', type: 'varchar', length: 20, nullable: true })
  seatNumber: string;

  @Column({ name: 'is_class_leader', type: 'boolean', default: false })
  isClassLeader: boolean;

  @Column({ name: 'is_monitor', type: 'boolean', default: false })
  isMonitor: boolean;

  @Column({ name: 'special_needs', type: 'text', nullable: true })
  specialNeeds: string;

  @Column({ name: 'learning_support', type: 'jsonb', nullable: true })
  learningSupport: {
    type: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    provider: string;
  };

  @Column({ name: 'attendance_summary', type: 'jsonb', nullable: true })
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedAbsences: number;
    unexcusedAbsences: number;
    attendancePercentage: number;
  };

  @Column({ name: 'academic_performance', type: 'jsonb', nullable: true })
  academicPerformance: {
    overallGrade: string;
    gradePointAverage: number;
    subjectGrades: Record<string, string>;
    rankInClass: number;
    totalStudents: number;
    promotionStatus: string;
  };

  @Column({ name: 'behavior_records', type: 'jsonb', nullable: true })
  behaviorRecords: Array<{
    date: Date;
    type: 'positive' | 'negative';
    description: string;
    points: number;
    recordedBy: string;
  }>;

  @Column({ name: 'parent_communication', type: 'jsonb', nullable: true })
  parentCommunication: Array<{
    date: Date;
    type: string;
    subject: string;
    message: string;
    response: string;
    status: 'sent' | 'responded' | 'pending';
  }>;

  @Column({ name: 'transport_details', type: 'jsonb', nullable: true })
  transportDetails: {
    required: boolean;
    routeId: string;
    pickupPoint: string;
    dropPoint: string;
    distance: number;
    fee: number;
  };

  @Column({ name: 'fee_details', type: 'jsonb', nullable: true })
  feeDetails: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    scholarshipAmount: number;
    discountAmount: number;
    paymentPlan: string;
  };

  @Column({ name: 'emergency_contacts', type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>;

  @Column({ name: 'medical_info', type: 'jsonb', nullable: true })
  medicalInfo: {
    bloodGroup: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    doctorName: string;
    doctorPhone: string;
    insuranceInfo?: string;
  };

  @Column({ name: 'previous_school_info', type: 'jsonb', nullable: true })
  previousSchoolInfo: {
    schoolName: string;
    grade: string;
    performance: string;
    transferReason: string;
    documents: string[];
  };

  @Column({ name: 'enrolled_by', type: 'uuid' })
  enrolledBy: string;

  @Column({ name: 'withdrawn_by', type: 'uuid', nullable: true })
  withdrawnBy: string;

  @Column({ name: 'withdrawal_reason', type: 'varchar', length: 500, nullable: true })
  withdrawalReason: string;

  @Column({ name: 'final_grade', type: 'varchar', length: 10, nullable: true })
  finalGrade: string;

  @Column({ name: 'exit_notes', type: 'text', nullable: true })
  exitNotes: string;

  @Column({ name: 'transfer_destination', type: 'varchar', length: 200, nullable: true })
  transferDestination: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  // Virtual properties
  get isActive(): boolean {
    return this.enrollmentStatus === EnrollmentStatus.ENROLLED;
  }

  get attendancePercentage(): number {
    return this.attendanceSummary?.attendancePercentage || 0;
  }

  get hasSpecialNeeds(): boolean {
    return !!(this.specialNeeds || this.learningSupport);
  }

  get hasTransport(): boolean {
    return this.transportDetails?.required || false;
  }

  get outstandingFee(): number {
    return this.feeDetails ? this.feeDetails.pendingAmount : 0;
  }

  // Methods
  enroll(enrolledBy: string, rollNumber?: string): void {
    this.enrollmentStatus = EnrollmentStatus.ENROLLED;
    this.enrolledBy = enrolledBy;
    if (rollNumber) {
      this.rollNumber = rollNumber;
    }
    this.enrollmentDate = new Date();
    this.updatedAt = new Date();
  }

  withdraw(withdrawnBy: string, reason?: string, finalGrade?: string, exitNotes?: string): void {
    this.enrollmentStatus = EnrollmentStatus.WITHDRAWN;
    this.withdrawnBy = withdrawnBy;
    this.withdrawalDate = new Date();
    if (reason) {
      this.withdrawalReason = reason;
    }
    if (finalGrade) {
      this.finalGrade = finalGrade;
    }
    if (exitNotes) {
      this.exitNotes = exitNotes;
    }
    this.updatedAt = new Date();
  }

  transfer(destination: string, transferredBy: string): void {
    this.enrollmentStatus = EnrollmentStatus.TRANSFERRED;
    this.transferDestination = destination;
    this.transferDate = new Date();
    this.withdrawnBy = transferredBy;
    this.updatedAt = new Date();
  }

  suspend(reason?: string): void {
    this.enrollmentStatus = EnrollmentStatus.SUSPENDED;
    if (reason) {
      this.notes = reason;
    }
    this.updatedAt = new Date();
  }

  reactivate(): void {
    this.enrollmentStatus = EnrollmentStatus.ENROLLED;
    this.updatedAt = new Date();
  }

  updateAttendanceSummary(summary: any): void {
    this.attendanceSummary = summary;
    this.updatedAt = new Date();
  }

  updateAcademicPerformance(performance: any): void {
    this.academicPerformance = performance;
    this.updatedAt = new Date();
  }

  addBehaviorRecord(record: any): void {
    if (!this.behaviorRecords) {
      this.behaviorRecords = [];
    }
    this.behaviorRecords.push({
      ...record,
      date: new Date(),
    });
    this.updatedAt = new Date();
  }

  // Static factory methods
  static createEnrollment(
    studentId: string,
    classId: string,
    schoolId: string,
    academicYear: string,
    enrolledBy: string,
    enrollmentType: EnrollmentType = EnrollmentType.REGULAR,
  ): StudentClass {
    const enrollment = new StudentClass();
    enrollment.studentId = studentId;
    enrollment.classId = classId;
    enrollment.schoolId = schoolId;
    enrollment.academicYear = academicYear;
    enrollment.enrollmentType = enrollmentType;
    enrollment.enrolledBy = enrolledBy;
    enrollment.enrollmentDate = new Date();

    return enrollment;
  }

  static createTransfer(
    studentId: string,
    classId: string,
    schoolId: string,
    academicYear: string,
    transferredBy: string,
    fromClassId: string,
  ): StudentClass {
    const enrollment = new StudentClass();
    enrollment.studentId = studentId;
    enrollment.classId = classId;
    enrollment.schoolId = schoolId;
    enrollment.academicYear = academicYear;
    enrollment.enrollmentType = EnrollmentType.TRANSFER;
    enrollment.enrolledBy = transferredBy;
    enrollment.enrollmentDate = new Date();
    enrollment.notes = `Transferred from class ${fromClassId}`;

    return enrollment;
  }
}