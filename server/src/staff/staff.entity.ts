// Academia Pro - Staff Entity
// Database entity for staff and HR management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TEmploymentType, TEmploymentStatus, TDepartment, TPosition, TQualificationLevel, TLeaveType, TLeaveStatus } from '../../../common/src/types/staff/staff.types';

@Entity('staff')
@Index(['schoolId', 'employeeId'], { unique: true })
@Index(['schoolId', 'email'], { unique: true })
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other']
  })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'jsonb' })
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

  @Column({
    type: 'enum',
    enum: TDepartment
  })
  department: TDepartment;

  @Column({
    type: 'enum',
    enum: TPosition
  })
  position: TPosition;

  @Column({
    type: 'enum',
    enum: TEmploymentType,
    default: TEmploymentType.FULL_TIME
  })
  employmentType: TEmploymentType;

  @Column({
    type: 'enum',
    enum: TEmploymentStatus,
    default: TEmploymentStatus.ACTIVE
  })
  employmentStatus: TEmploymentStatus;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  contractEndDate?: Date;

  @Column({ type: 'jsonb' })
  salary: {
    basicSalary: number;
    allowances: Array<{
      type: string;
      amount: number;
      isTaxable: boolean;
      description?: string;
    }>;
    deductions: Array<{
      type: string;
      amount: number;
      description?: string;
    }>;
    netSalary: number;
    paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      branchCode?: string;
      swiftCode?: string;
    };
    taxInfo: {
      taxId: string;
      taxBracket: string;
      annualIncome: number;
      taxDeducted: number;
    };
  };

  @Column({ type: 'jsonb', default: [] })
  qualifications: Array<{
    id: string;
    level: TQualificationLevel;
    field: string;
    institution: string;
    yearOfCompletion: number;
    grade?: string;
    certificateNumber?: string;
    isVerified: boolean;
    documents: Array<{
      id: string;
      type: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      uploadedAt: Date;
      uploadedBy: string;
      isVerified: boolean;
      verificationDate?: Date;
      verifiedBy?: string;
    }>;
  }>;

  @Column({ type: 'jsonb' })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };

  @Column({ type: 'jsonb' })
  workSchedule: {
    workingDays: string[];
    workingHours: {
      startTime: string;
      endTime: string;
    };
    breakTime?: {
      startTime: string;
      endTime: string;
    };
    totalHoursPerWeek: number;
    overtimeAllowed: boolean;
  };

  @Column({ type: 'jsonb' })
  benefits: {
    healthInsurance: boolean;
    lifeInsurance: boolean;
    retirementPlan: boolean;
    paidLeave: number;
    sickLeave: number;
    maternityLeave: number;
    otherBenefits: string[];
  };

  @Column({ type: 'jsonb', default: [] })
  performance: Array<{
    id: string;
    reviewPeriod: string;
    reviewerId: string;
    rating: number;
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    reviewDate: Date;
    nextReviewDate?: Date;
  }>;

  @Column({ type: 'jsonb', default: [] })
  leaves: Array<{
    id: string;
    leaveType: TLeaveType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: TLeaveStatus;
    approvedBy?: string;
    approvalDate?: Date;
    comments?: string;
    documents: Array<{
      id: string;
      type: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      uploadedAt: Date;
      uploadedBy: string;
      isVerified: boolean;
      verificationDate?: Date;
      verifiedBy?: string;
    }>;
    createdAt: Date;
  }>;

  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
    isVerified: boolean;
    verificationDate?: Date;
    verifiedBy?: string;
  }>;

  @Column()
  schoolId: string;

  @Column({ nullable: true })
  managerId?: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: Staff;

  @OneToMany(() => Staff, staff => staff.manager)
  subordinates?: Staff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Business logic methods
  updateSalary(salaryInfo: Partial<typeof this.salary>): void {
    this.salary = { ...this.salary, ...salaryInfo };
    // Recalculate net salary
    this.salary.netSalary = this.calculateNetSalary();
  }

  private calculateNetSalary(): number {
    const totalAllowances = this.salary.allowances.reduce((sum, allowance) =>
      sum + (allowance.isTaxable ? allowance.amount : 0), 0);
    const totalDeductions = this.salary.deductions.reduce((sum, deduction) =>
      sum + deduction.amount, 0);

    return this.salary.basicSalary + totalAllowances - totalDeductions;
  }

  addQualification(qualification: typeof this.qualifications[0]): void {
    this.qualifications.push({
      ...qualification,
      id: qualification.id || this.generateId(),
      isVerified: false,
    });
  }

  updateQualification(qualificationId: string, updates: Partial<typeof this.qualifications[0]>): void {
    const index = this.qualifications.findIndex(q => q.id === qualificationId);
    if (index !== -1) {
      this.qualifications[index] = { ...this.qualifications[index], ...updates };
    }
  }

  addPerformanceReview(review: typeof this.performance[0]): void {
    this.performance.push({
      ...review,
      id: review.id || this.generateId(),
    });
  }

  addLeave(leave: typeof this.leaves[0]): void {
    this.leaves.push({
      ...leave,
      id: leave.id || this.generateId(),
      status: leave.status || TLeaveStatus.PENDING,
      createdAt: new Date(),
    });
  }

  updateLeave(leaveId: string, updates: Partial<typeof this.leaves[0]>): void {
    const index = this.leaves.findIndex(l => l.id === leaveId);
    if (index !== -1) {
      this.leaves[index] = { ...this.leaves[index], ...updates };
    }
  }

  addDocument(document: typeof this.documents[0]): void {
    this.documents.push({
      ...document,
      id: document.id || this.generateId(),
      uploadedAt: new Date(),
      isVerified: false,
    });
  }

  private generateId(): string {
    return `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
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

  get experience(): number {
    const hireDate = new Date(this.hireDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  }

  get leaveBalance(): { annual: number; sick: number; maternity: number } {
    const currentYear = new Date().getFullYear();
    const usedLeaves = this.leaves.filter(leave =>
      leave.status === TLeaveStatus.APPROVED &&
      new Date(leave.startDate).getFullYear() === currentYear
    );

    const usedAnnual = usedLeaves
      .filter(leave => leave.leaveType === TLeaveType.ANNUAL)
      .reduce((sum, leave) => sum + leave.totalDays, 0);

    const usedSick = usedLeaves
      .filter(leave => leave.leaveType === TLeaveType.SICK)
      .reduce((sum, leave) => sum + leave.totalDays, 0);

    const usedMaternity = usedLeaves
      .filter(leave => leave.leaveType === TLeaveType.MATERNITY)
      .reduce((sum, leave) => sum + leave.totalDays, 0);

    return {
      annual: this.benefits.paidLeave - usedAnnual,
      sick: this.benefits.sickLeave - usedSick,
      maternity: this.benefits.maternityLeave - usedMaternity,
    };
  }

  get subordinatesCount(): number {
    return this.subordinates?.length || 0;
  }

  get lastPerformanceRating(): number | undefined {
    if (this.performance.length === 0) return undefined;
    const sortedReviews = this.performance.sort((a, b) =>
      new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
    );
    return sortedReviews[0].rating;
  }
}