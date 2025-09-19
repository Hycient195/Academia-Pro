// Academia Pro - Student Entity
// Database entity for student management and academic records

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../schools/school.entity';
import { TStudentStage, TGradeCode } from '@academia-pro/types/student/student.types';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

// Use shared enums
export type { TStudentStage, TGradeCode };

export enum EnrollmentType {
  REGULAR = 'regular',
  SPECIAL_NEEDS = 'special_needs',
  GIFTED = 'gifted',
  INTERNATIONAL = 'international',
  TRANSFER = 'transfer',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Entity('students')
@Index(['schoolId', 'status'])
@Index(['schoolId', 'stage', 'gradeCode', 'status'])
@Index(['admissionNumber'], { unique: true })
@Index(['email'])
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
  })
  gender: 'male' | 'female' | 'other';

  @Column({
    type: 'enum',
    enum: BloodGroup,
    nullable: true,
  })
  bloodGroup?: BloodGroup;

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Academic Information
  @Column({ type: 'varchar', length: 50, unique: true })
  admissionNumber: string;

  @Column({ type: 'varchar', length: 20 })
  currentGrade: string; // e.g., 'Grade 10', 'Class 8' - legacy

  @Column({ type: 'varchar', length: 10 })
  currentSection: string; // e.g., 'A', 'B', 'C' - legacy

  @Column({
    type: 'enum',
    enum: TStudentStage,
    nullable: true,
  })
  stage?: TStudentStage;

  @Column({ type: 'varchar', length: 10 })
  gradeCode: string;

  @Column({ type: 'varchar', length: 20 })
  streamSection: string; // e.g., 'Science Stream A'

  @Column({ type: 'date' })
  admissionDate: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentType,
    default: EnrollmentType.REGULAR,
  })
  enrollmentType: EnrollmentType;

  // New fields
  @Column({ type: 'boolean', default: false })
  isBoarding: boolean;

  @Column({ type: 'jsonb', default: [] })
  promotionHistory: {
    fromGrade: TGradeCode;
    toGrade: TGradeCode;
    academicYear: string;
    performedBy: string;
    timestamp: Date;
    reason?: string;
  }[];

  @Column({ type: 'jsonb', default: [] })
  transferHistory: {
    fromSchool?: string;
    toSchool?: string;
    fromSection?: string;
    toSection?: string;
    reason: string;
    academicYear?: string;
    timestamp: Date;
    type: 'internal' | 'external';
  }[];

  @Column({ type: 'int', nullable: true })
  graduationYear?: number;

  // School Information
  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string; // Link to user account

  // Status and Classification
  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  // Family Information
  @Column({ type: 'jsonb', nullable: true })
  parentInfo: {
    fatherFirstName: string;
    fatherLastName: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherFirstName: string;
    motherLastName: string;
    motherPhone?: string;
    motherEmail?: string;
    motherOccupation?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianOccupation?: string;
    guardianRelation?: string;
    guardianCustomRelation?: string;
  };

  // Medical Information
  @Column({ type: 'jsonb', nullable: true })
  medicalInfo: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact?: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      relation: string;
      occupation?: string;
    };
    doctorInfo?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      clinic?: string;
    };
    insuranceInfo?: {
      provider?: string;
      policyNumber?: string;
      expiryDate?: string;
    };
  };

  // Academic Performance
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gpa?: number;

  @Column({ type: 'int', nullable: true })
  totalCredits?: number;

  @Column({ type: 'jsonb', default: {} })
  academicStanding: {
    honors?: boolean;
    probation?: boolean;
    academicWarning?: boolean;
    disciplinaryStatus?: string;
  };

  // Transportation Information
  @Column({ type: 'jsonb', nullable: true })
  transportation: {
    required: boolean;
    routeId?: string;
    stopId?: string;
    pickupTime?: string;
    dropTime?: string;
    distance?: number;
    fee?: number;
  };

  // Hostel Information
  @Column({ type: 'jsonb', nullable: true })
  hostel: {
    required: boolean;
    hostelId?: string;
    roomId?: string;
    roomNumber?: string;
    bedNumber?: string;
    fee?: number;
    wardenContact?: string;
  };

  // Financial Information
  @Column({ type: 'jsonb', default: {} })
  financialInfo: {
    feeCategory: string;
    scholarship?: {
      type: string;
      amount: number;
      percentage: number;
      validUntil: Date;
    };
    outstandingBalance: number;
    paymentPlan?: string;
    lastPaymentDate?: Date;
  };

  // Documents and Records
  @Column({ type: 'jsonb', default: [] })
  documents: {
    type: string; // 'birth_certificate', 'transcript', 'photo', etc.
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
    verified: boolean;
  }[];

  // Preferences and Settings
  @Column({ type: 'jsonb', default: {} })
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      parentCommunication: boolean;
    };
    extracurricular: string[];
    careerInterests?: string[];
  };

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Virtual properties
  get fullName(): string {
    if (this.middleName) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  get isActive(): boolean {
    return this.status === StudentStatus.ACTIVE;
  }

  get hasTransportation(): boolean {
    return this.transportation?.required || false;
  }

  get hasHostel(): boolean {
    return this.hostel?.required || false;
  }

  get hasScholarship(): boolean {
    return !!(this.financialInfo?.scholarship);
  }

  // Methods
  updateAcademicStanding(updates: Partial<typeof this.academicStanding>): void {
    this.academicStanding = {
      ...this.academicStanding,
      ...updates,
    };
  }

  addDocument(document: typeof this.documents[0]): void {
    this.documents = [...this.documents, document];
  }

  updateMedicalInfo(updates: Partial<typeof this.medicalInfo>): void {
    this.medicalInfo = {
      ...this.medicalInfo,
      ...updates,
    };
  }

  updateFinancialInfo(updates: Partial<typeof this.financialInfo>): void {
    this.financialInfo = {
      ...this.financialInfo,
      ...updates,
    };
  }


  // Relations
  @ManyToOne(() => School, school => school.students)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  // @ManyToOne(() => User, user => user.student)
  // @JoinColumn({ name: 'userId' })
  // user: User;

  // @OneToMany(() => Enrollment, enrollment => enrollment.student)
  // enrollments: Enrollment[];

  // @OneToMany(() => Attendance, attendance => attendance.student)
  // attendance: Attendance[];

  // @OneToMany(() => Grade, grade => grade.student)
  // grades: Grade[];
}