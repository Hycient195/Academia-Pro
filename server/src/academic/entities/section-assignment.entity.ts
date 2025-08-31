import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index, Unique } from 'typeorm';
import { Class } from '../class.entity';

export enum SectionType {
  ACADEMIC = 'academic',
  ELECTIVE = 'elective',
  SPECIAL_PROGRAM = 'special_program',
  REMEDIAL = 'remedial',
  ADVANCED = 'advanced',
}

export enum SectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FULL = 'full',
  CANCELLED = 'cancelled',
}

@Entity('section_assignments')
@Unique(['classId', 'sectionName', 'academicYear'])
@Index(['classId', 'academicYear'])
@Index(['sectionType', 'status'])
@Index(['academicYear', 'gradeLevel'])
export class SectionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({ name: 'section_name', type: 'varchar', length: 10 })
  sectionName: string; // A, B, C, etc.

  @Column({ name: 'section_full_name', type: 'varchar', length: 50 })
  sectionFullName: string; // Grade 10 - Section A

  @Column({
    name: 'section_type',
    type: 'enum',
    enum: SectionType,
    default: SectionType.ACADEMIC,
  })
  sectionType: SectionType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SectionStatus,
    default: SectionStatus.ACTIVE,
  })
  status: SectionStatus;

  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @Column({ name: 'current_enrollment', type: 'int', default: 0 })
  currentEnrollment: number;

  @Column({ name: 'min_enrollment', type: 'int', nullable: true })
  minEnrollment: number;

  @Column({ name: 'max_enrollment', type: 'int', nullable: true })
  maxEnrollment: number;

  @Column({ name: 'class_teacher_id', type: 'uuid', nullable: true })
  classTeacherId: string;

  @Column({ name: 'class_teacher_name', type: 'varchar', length: 100, nullable: true })
  classTeacherName: string;

  @Column({ name: 'assistant_teacher_id', type: 'uuid', nullable: true })
  assistantTeacherId: string;

  @Column({ name: 'assistant_teacher_name', type: 'varchar', length: 100, nullable: true })
  assistantTeacherName: string;

  @Column({ name: 'room_number', type: 'varchar', length: 20, nullable: true })
  roomNumber: string;

  @Column({ name: 'building', type: 'varchar', length: 50, nullable: true })
  building: string;

  @Column({ name: 'floor', type: 'varchar', length: 10, nullable: true })
  floor: string;

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ name: 'schedule', type: 'jsonb', nullable: true })
  schedule: Record<string, Array<{
    subject: string;
    teacher: string;
    startTime: string;
    endTime: string;
    room: string;
  }>>;

  @Column({ name: 'student_list', type: 'jsonb', nullable: true })
  studentList: Array<{
    studentId: string;
    studentName: string;
    rollNumber: number;
    enrollmentDate: Date;
    status: string;
  }>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    averageGrade: number;
    attendanceRate: number;
    topPerformers: number;
    needsSupport: number;
    gradeDistribution: Record<string, number>;
  };

  @Column({ name: 'resources', type: 'jsonb', nullable: true })
  resources: {
    textbooks: string[];
    equipment: string[];
    digitalResources: string[];
    specialFacilities: string[];
  };

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  // Virtual properties
  get isFull(): boolean {
    return this.currentEnrollment >= this.capacity;
  }

  get availableSeats(): number {
    return Math.max(0, this.capacity - this.currentEnrollment);
  }

  get utilizationRate(): number {
    return this.capacity > 0 ? (this.currentEnrollment / this.capacity) * 100 : 0;
  }

  get isActive(): boolean {
    return this.status === SectionStatus.ACTIVE;
  }

  get sectionIdentifier(): string {
    return `${this.gradeLevel}-${this.sectionName}`;
  }

  // Methods
  enrollStudent(studentId: string, studentName: string, rollNumber: number): void {
    if (this.isFull) {
      throw new Error('Section is at full capacity');
    }

    if (!this.studentList) {
      this.studentList = [];
    }

    // Check if student is already enrolled
    const existingStudent = this.studentList.find(s => s.studentId === studentId);
    if (existingStudent) {
      throw new Error('Student is already enrolled in this section');
    }

    this.studentList.push({
      studentId,
      studentName,
      rollNumber,
      enrollmentDate: new Date(),
      status: 'active',
    });

    this.currentEnrollment++;
    this.updatedAt = new Date();
  }

  withdrawStudent(studentId: string): void {
    if (!this.studentList) return;

    const studentIndex = this.studentList.findIndex(s => s.studentId === studentId);
    if (studentIndex !== -1) {
      this.studentList[studentIndex].status = 'withdrawn';
      this.currentEnrollment--;
      this.updatedAt = new Date();
    }
  }

  assignClassTeacher(teacherId: string, teacherName: string, assignedBy: string): void {
    this.classTeacherId = teacherId;
    this.classTeacherName = teacherName;
    this.assignedBy = assignedBy;
    this.assignedAt = new Date();
    this.updatedAt = new Date();
  }

  assignAssistantTeacher(teacherId: string, teacherName: string): void {
    this.assistantTeacherId = teacherId;
    this.assistantTeacherName = teacherName;
    this.updatedAt = new Date();
  }

  updateSchedule(schedule: any): void {
    this.schedule = schedule;
    this.updatedAt = new Date();
  }

  updatePerformanceMetrics(metrics: any): void {
    this.performanceMetrics = metrics;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = SectionStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = SectionStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  // Static factory methods
  static createSection(
    classId: string,
    schoolId: string,
    academicYear: string,
    gradeLevel: string,
    sectionName: string,
    capacity: number,
    createdBy: string,
  ): SectionAssignment {
    const section = new SectionAssignment();
    section.classId = classId;
    section.schoolId = schoolId;
    section.academicYear = academicYear;
    section.gradeLevel = gradeLevel;
    section.sectionName = sectionName;
    section.sectionFullName = `${gradeLevel} - Section ${sectionName}`;
    section.capacity = capacity;
    section.currentEnrollment = 0;
    section.createdBy = createdBy;
    section.status = SectionStatus.ACTIVE;

    return section;
  }

  static createElectiveSection(
    classId: string,
    schoolId: string,
    academicYear: string,
    gradeLevel: string,
    sectionName: string,
    subjectName: string,
    capacity: number,
    createdBy: string,
  ): SectionAssignment {
    const section = SectionAssignment.createSection(
      classId,
      schoolId,
      academicYear,
      gradeLevel,
      sectionName,
      capacity,
      createdBy,
    );

    section.sectionType = SectionType.ELECTIVE;
    section.sectionFullName = `${gradeLevel} - ${subjectName} Section ${sectionName}`;

    return section;
  }
}