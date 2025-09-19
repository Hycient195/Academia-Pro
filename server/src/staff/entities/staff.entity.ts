// Academia Pro - Staff Entity
// Database entity for managing all staff members and their information

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique, ManyToMany, JoinTable } from 'typeorm';
import { Department } from './department.entity';

export enum StaffType {
  TEACHING = 'teaching',
  ADMINISTRATIVE = 'administrative',
  SUPPORT = 'support',
  TECHNICAL = 'technical',
  MEDICAL = 'medical',
  SECURITY = 'security',
  OPERATIONS = 'operations',
  FINANCE = 'finance',
  MAINTENANCE = 'maintenance',
  LIBRARIAN = 'librarian',
  COUNSELOR = 'counselor',
  OTHER = 'other',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  RETIRED = 'retired',
  DECEASED = 'deceased',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERN = 'intern',
  VOLUNTEER = 'volunteer',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
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

export enum QualificationLevel {
  HIGH_SCHOOL = 'high_school',
  DIPLOMA = 'diploma',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
  POST_DOC = 'post_doc',
  PROFESSIONAL_CERTIFICATION = 'professional_certification',
  OTHER = 'other',
}

@Entity('staff')
@Unique(['schoolId', 'employeeId'])
@Index(['schoolId', 'staffType'])
@Index(['schoolId', 'status'])
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 20, unique: true })
  employeeId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 50, nullable: true })
  middleName?: string;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({
    name: 'marital_status',
    type: 'enum',
    enum: MaritalStatus,
    nullable: true,
  })
  maritalStatus?: MaritalStatus;

  @Column({
    name: 'blood_group',
    type: 'enum',
    enum: BloodGroup,
    nullable: true,
  })
  bloodGroup?: BloodGroup;

  // Contact Information (consolidated into JSONB to reduce column count)
  @Column({ name: 'contact_info', type: 'jsonb' })
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone?: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };

  // Address Information (consolidated into JSONB to reduce column count)
  @Column({ name: 'address_info', type: 'jsonb' })
  addressInfo: {
    current: {
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
    permanent?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  // Employment Information
  @Column({
    name: 'staff_type',
    type: 'enum',
    enum: StaffType,
  })
  staffType: StaffType;

  @ManyToMany(() => Department, (department) => department.staff, {
    cascade: true,
  })
  @JoinTable({
    name: 'staff_departments', // join table name
    joinColumn: { name: 'staffId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'departmentId', referencedColumnName: 'id' },
  })
  departments: Department[];

  @Column({ name: 'designation', type: 'varchar', length: 100 })
  designation: string;

  @Column({ name: 'reporting_to', type: 'uuid', nullable: true })
  reportingTo?: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ name: 'joining_date', type: 'date' })
  joiningDate: Date;

  @Column({ name: 'probation_end_date', type: 'date', nullable: true })
  probationEndDate?: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate?: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  // Compensation Information (consolidated into JSONB to reduce column count)
  @Column({ name: 'compensation', type: 'jsonb', nullable: true })
  compensation?: {
    basicSalary: number;
    salaryCurrency: string;
    houseAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    grossSalary: number;
    taxDeductible?: number;
    providentFund?: number;
    otherDeductions?: number;
    netSalary: number;
    paymentMethod: string;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      branch?: string;
      ifscCode?: string;
    };
  };

  // Educational Qualifications
  @Column({ name: 'qualifications', type: 'jsonb', default: [] })
  qualifications: Array<{
    level: QualificationLevel;
    field: string;
    institution: string;
    yearOfCompletion: number;
    grade?: string;
    certificateNumber?: string;
    isVerified: boolean;
  }>;

  @Column({ name: 'certifications', type: 'jsonb', default: [] })
  certifications: Array<{
    name: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber?: string;
    isVerified: boolean;
  }>;

  // Experience Information
  @Column({ name: 'previous_experience', type: 'jsonb', default: [] })
  previousExperience: Array<{
    organization: string;
    designation: string;
    startDate: Date;
    endDate?: Date;
    responsibilities: string;
    reasonForLeaving?: string;
  }>;

  @Column({ name: 'total_experience_years', type: 'decimal', precision: 4, scale: 1, default: 0 })
  totalExperienceYears: number;

  // Performance and Evaluation
  @Column({ name: 'performance_rating', type: 'decimal', precision: 3, scale: 1, nullable: true })
  performanceRating?: number; // 1.0 to 5.0

  @Column({ name: 'last_performance_review', type: 'date', nullable: true })
  lastPerformanceReview?: Date;

  @Column({ name: 'next_performance_review', type: 'date', nullable: true })
  nextPerformanceReview?: Date;

  @Column({ name: 'performance_notes', type: 'text', nullable: true })
  performanceNotes?: string;

  // Leave Information
  @Column({ name: 'annual_leave_balance', type: 'int', default: 30 })
  annualLeaveBalance: number;

  @Column({ name: 'sick_leave_balance', type: 'int', default: 12 })
  sickLeaveBalance: number;

  @Column({ name: 'maternity_leave_balance', type: 'int', default: 0 })
  maternityLeaveBalance: number;

  @Column({ name: 'paternity_leave_balance', type: 'int', default: 0 })
  paternityLeaveBalance: number;

  @Column({ name: 'casual_leave_balance', type: 'int', default: 12 })
  casualLeaveBalance: number;

  // Work Schedule
  @Column({ name: 'working_hours_per_week', type: 'int', default: 40 })
  workingHoursPerWeek: number;

  @Column({ name: 'working_days_per_week', type: 'int', default: 5 })
  workingDaysPerWeek: number;

  @Column({ name: 'shift_start_time', type: 'varchar', length: 20, default: '08:00' })
  shiftStartTime: string;

  @Column({ name: 'shift_end_time', type: 'varchar', length: 20, default: '17:00' })
  shiftEndTime: string;

  // Medical Information
  @Column({ name: 'medical_info', type: 'jsonb', nullable: true })
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    doctorName?: string;
    doctorPhone?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    insuranceExpiryDate?: Date;
  };

  // Documents
  @Column({ name: 'documents', type: 'jsonb', default: [] })
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadDate: Date;
    isVerified: boolean;
    expiryDate?: Date;
  }>;

  // Digital Access
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'biometric_id', type: 'varchar', length: 50, nullable: true })
  biometricId?: string;

  @Column({ name: 'rfid_card_number', type: 'varchar', length: 50, nullable: true })
  rfidCardNumber?: string;

  // Communication Preferences
  @Column({ name: 'communication_preferences', type: 'jsonb', default: {} })
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    newsletter: boolean;
    emergencyAlerts: boolean;
  };

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    specialSkills?: string[];
    languages?: string[];
    hobbies?: string[];
    achievements?: string[];
    publications?: Array<{
      title: string;
      journal: string;
      year: number;
      doi?: string;
    }>;
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Virtual properties
  get fullName(): string {
    if (this.middleName) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  // Backward compatibility getters for contact info
  get email(): string {
    return this.contactInfo.email;
  }

  set email(value: string) {
    this.contactInfo.email = value;
  }

  get phone(): string {
    return this.contactInfo.phone;
  }

  set phone(value: string) {
    this.contactInfo.phone = value;
  }

  get alternatePhone(): string | undefined {
    return this.contactInfo.alternatePhone;
  }

  set alternatePhone(value: string | undefined) {
    this.contactInfo.alternatePhone = value;
  }

  get emergencyContactName(): string {
    return this.contactInfo.emergencyContact.name;
  }

  set emergencyContactName(value: string) {
    this.contactInfo.emergencyContact.name = value;
  }

  get emergencyContactPhone(): string {
    return this.contactInfo.emergencyContact.phone;
  }

  set emergencyContactPhone(value: string) {
    this.contactInfo.emergencyContact.phone = value;
  }

  get emergencyContactRelation(): string {
    return this.contactInfo.emergencyContact.relation;
  }

  set emergencyContactRelation(value: string) {
    this.contactInfo.emergencyContact.relation = value;
  }

  // Backward compatibility getters for address info
  get currentAddress(): any {
    return this.addressInfo.current;
  }

  set currentAddress(value: any) {
    this.addressInfo.current = value;
  }

  get permanentAddress(): any {
    return this.addressInfo.permanent;
  }

  set permanentAddress(value: any) {
    this.addressInfo.permanent = value;
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

  get experienceInYears(): number {
    const joiningDate = new Date(this.joiningDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joiningDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round((diffDays / 365) * 10) / 10;
  }

  get totalLeaveBalance(): number {
    return this.annualLeaveBalance + this.sickLeaveBalance +
           this.maternityLeaveBalance + this.paternityLeaveBalance +
           this.casualLeaveBalance;
  }

  get isOnProbation(): boolean {
    if (!this.probationEndDate) return false;
    return new Date() <= new Date(this.probationEndDate);
  }

  get isContractExpiring(): boolean {
    if (!this.contractEndDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(this.contractEndDate) <= thirtyDaysFromNow;
  }

  get highestQualification(): QualificationLevel | null {
    if (this.qualifications.length === 0) return null;

    const levelOrder = {
      [QualificationLevel.HIGH_SCHOOL]: 1,
      [QualificationLevel.DIPLOMA]: 2,
      [QualificationLevel.BACHELORS]: 3,
      [QualificationLevel.MASTERS]: 4,
      [QualificationLevel.PHD]: 5,
      [QualificationLevel.POST_DOC]: 6,
      [QualificationLevel.PROFESSIONAL_CERTIFICATION]: 3,
      [QualificationLevel.OTHER]: 0,
    };

    return this.qualifications.reduce((highest, qual) =>
      levelOrder[qual.level] > levelOrder[highest] ? qual.level : highest,
      this.qualifications[0].level
    );
  }

  // Methods
  updateSalary(components: {
    basicSalary?: number;
    houseAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    taxDeductible?: number;
    providentFund?: number;
    otherDeductions?: number;
  }): void {
    if (!this.compensation) {
      this.compensation = {
        basicSalary: 0,
        salaryCurrency: 'NGN',
        grossSalary: 0,
        netSalary: 0,
        paymentMethod: 'bank_transfer'
      };
    }

    if (components.basicSalary !== undefined) this.compensation.basicSalary = components.basicSalary;
    if (components.houseAllowance !== undefined) this.compensation.houseAllowance = components.houseAllowance;
    if (components.transportAllowance !== undefined) this.compensation.transportAllowance = components.transportAllowance;
    if (components.medicalAllowance !== undefined) this.compensation.medicalAllowance = components.medicalAllowance;
    if (components.otherAllowances !== undefined) this.compensation.otherAllowances = components.otherAllowances;

    this.compensation.grossSalary = this.compensation.basicSalary +
      (this.compensation.houseAllowance || 0) +
      (this.compensation.transportAllowance || 0) +
      (this.compensation.medicalAllowance || 0) +
      (this.compensation.otherAllowances || 0);

    if (components.taxDeductible !== undefined) this.compensation.taxDeductible = components.taxDeductible;
    if (components.providentFund !== undefined) this.compensation.providentFund = components.providentFund;
    if (components.otherDeductions !== undefined) this.compensation.otherDeductions = components.otherDeductions;

    this.compensation.netSalary = this.compensation.grossSalary -
      (this.compensation.taxDeductible || 0) -
      (this.compensation.providentFund || 0) -
      (this.compensation.otherDeductions || 0);
  }

  deductLeave(leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual', days: number): boolean {
    switch (leaveType) {
      case 'annual':
        if (this.annualLeaveBalance >= days) {
          this.annualLeaveBalance -= days;
          return true;
        }
        break;
      case 'sick':
        if (this.sickLeaveBalance >= days) {
          this.sickLeaveBalance -= days;
          return true;
        }
        break;
      case 'maternity':
        if (this.maternityLeaveBalance >= days) {
          this.maternityLeaveBalance -= days;
          return true;
        }
        break;
      case 'paternity':
        if (this.paternityLeaveBalance >= days) {
          this.paternityLeaveBalance -= days;
          return true;
        }
        break;
      case 'casual':
        if (this.casualLeaveBalance >= days) {
          this.casualLeaveBalance -= days;
          return true;
        }
        break;
    }
    return false;
  }

  addLeave(leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual', days: number): void {
    switch (leaveType) {
      case 'annual':
        this.annualLeaveBalance += days;
        break;
      case 'sick':
        this.sickLeaveBalance += days;
        break;
      case 'maternity':
        this.maternityLeaveBalance += days;
        break;
      case 'paternity':
        this.paternityLeaveBalance += days;
        break;
      case 'casual':
        this.casualLeaveBalance += days;
        break;
    }
  }

  updatePerformance(rating: number, notes?: string): void {
    this.performanceRating = rating;
    this.lastPerformanceReview = new Date();
    if (notes) this.performanceNotes = notes;

    // Set next review date (typically annual)
    const nextReview = new Date(this.lastPerformanceReview);
    nextReview.setFullYear(nextReview.getFullYear() + 1);
    this.nextPerformanceReview = nextReview;
  }

  addQualification(qualification: typeof this.qualifications[0]): void {
    this.qualifications.push(qualification);
  }

  addCertification(certification: typeof this.certifications[0]): void {
    this.certifications.push(certification);
  }

  addExperience(experience: typeof this.previousExperience[0]): void {
    this.previousExperience.push(experience);
    this.updateTotalExperience();
  }

  private updateTotalExperience(): void {
    const currentExperience = this.experienceInYears;
    const previousExperience = this.previousExperience.reduce((total, exp) => {
      if (exp.endDate) {
        const start = new Date(exp.startDate);
        const end = new Date(exp.endDate);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }
      return total;
    }, 0);

    this.totalExperienceYears = Math.round((currentExperience + previousExperience) * 10) / 10;
  }

  terminate(reason: string): void {
    this.status = StaffStatus.TERMINATED;
    this.internalNotes = (this.internalNotes || '') + `\n\nTERMINATED: ${reason} (${new Date().toISOString()})`;
  }

  suspend(reason: string): void {
    this.status = StaffStatus.SUSPENDED;
    this.internalNotes = (this.internalNotes || '') + `\n\nSUSPENDED: ${reason} (${new Date().toISOString()})`;
  }

  reactivate(): void {
    this.status = StaffStatus.ACTIVE;
    this.internalNotes = (this.internalNotes || '') + `\n\nREACTIVATED: ${new Date().toISOString()}`;
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => School)
  // @JoinColumn({ name: 'school_id' })
  // school: School;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  // @ManyToOne(() => Staff)
  // @JoinColumn({ name: 'reporting_to' })
  // manager: Staff;

  // @OneToMany(() => Staff)
  // subordinates: Staff[];
}