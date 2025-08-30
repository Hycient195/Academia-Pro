// Academia Pro - Hostel Allocation Entity
// Database entity for managing student hostel room allocations

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Hostel, AllocationStatus } from './hostel.entity';
import { Room } from './room.entity';

export enum AllocationType {
  REGULAR = 'regular',
  TEMPORARY = 'temporary',
  EMERGENCY = 'emergency',
  MEDICAL = 'medical',
  DISCIPLINARY = 'disciplinary',
  ACADEMIC = 'academic',
}

export enum CheckInStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum CheckOutStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  PENDING = 'pending',
  EARLY = 'early',
  FORCED = 'forced',
}

@Entity('hostel_allocations')
@Unique(['studentId', 'academicYear'])
@Index(['hostelId', 'roomId'])
@Index(['studentId', 'status'])
@Index(['academicYear', 'status'])
@Index(['allocationDate'])
@Index(['checkInDate'])
@Index(['checkOutDate'])
export class HostelAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'hostel_id', type: 'uuid' })
  hostelId: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @Column({ name: 'bed_number', type: 'varchar', length: 10, nullable: true })
  bedNumber?: string;

  @Column({
    name: 'allocation_type',
    type: 'enum',
    enum: AllocationType,
    default: AllocationType.REGULAR,
  })
  allocationType: AllocationType;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.ACTIVE,
  })
  status: AllocationStatus;

  // Dates
  @Column({ name: 'allocation_date', type: 'timestamp' })
  allocationDate: Date;

  @Column({ name: 'expected_check_in_date', type: 'date' })
  expectedCheckInDate: Date;

  @Column({ name: 'actual_check_in_date', type: 'timestamp', nullable: true })
  actualCheckInDate?: Date;

  @Column({ name: 'expected_check_out_date', type: 'date', nullable: true })
  expectedCheckOutDate?: Date;

  @Column({ name: 'actual_check_out_date', type: 'timestamp', nullable: true })
  actualCheckOutDate?: Date;

  @Column({
    name: 'check_in_status',
    type: 'enum',
    enum: CheckInStatus,
    default: CheckInStatus.PENDING,
  })
  checkInStatus: CheckInStatus;

  @Column({
    name: 'check_out_status',
    type: 'enum',
    enum: CheckOutStatus,
    default: CheckOutStatus.PENDING,
  })
  checkOutStatus: CheckOutStatus;

  // Academic Information
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section?: string;

  // Financial Information
  @Column({ name: 'monthly_rent', type: 'decimal', precision: 8, scale: 2 })
  monthlyRent: number;

  @Column({ name: 'security_deposit', type: 'decimal', precision: 8, scale: 2, default: 0 })
  securityDeposit: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'outstanding_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  outstandingAmount: number;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'pending' })
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';

  @Column({ name: 'last_payment_date', type: 'timestamp', nullable: true })
  lastPaymentDate?: Date;

  @Column({ name: 'next_payment_due', type: 'date', nullable: true })
  nextPaymentDue?: Date;

  // Preferences and Requirements
  @Column({ name: 'special_requirements', type: 'jsonb', default: [] })
  specialRequirements: string[];

  @Column({ name: 'medical_conditions', type: 'jsonb', default: [] })
  medicalConditions: Array<{
    condition: string;
    severity: 'mild' | 'moderate' | 'severe';
    notes?: string;
  }>;

  @Column({ name: 'dietary_restrictions', type: 'jsonb', default: [] })
  dietaryRestrictions: string[];

  @Column({ name: 'accessibility_needs', type: 'jsonb', default: [] })
  accessibilityNeeds: string[];

  // Emergency Contacts
  @Column({ name: 'emergency_contacts', type: 'jsonb' })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  }>;

  // Check-in/Check-out Details
  @Column({ name: 'check_in_notes', type: 'text', nullable: true })
  checkInNotes?: string;

  @Column({ name: 'check_out_notes', type: 'text', nullable: true })
  checkOutNotes?: string;

  @Column({ name: 'room_condition_on_check_in', type: 'jsonb', nullable: true })
  roomConditionOnCheckIn?: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    notes?: string;
    photos?: string[];
    inventory?: Array<{
      item: string;
      condition: 'excellent' | 'good' | 'fair' | 'poor';
    }>;
  };

  @Column({ name: 'room_condition_on_check_out', type: 'jsonb', nullable: true })
  roomConditionOnCheckOut?: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    notes?: string;
    photos?: string[];
    damages?: Array<{
      item: string;
      description: string;
      severity: 'minor' | 'moderate' | 'major';
      cost?: number;
    }>;
  };

  // Key and Access Information
  @Column({ name: 'room_key_number', type: 'varchar', length: 20, nullable: true })
  roomKeyNumber?: string;

  @Column({ name: 'access_card_number', type: 'varchar', length: 20, nullable: true })
  accessCardNumber?: string;

  @Column({ name: 'wifi_password', type: 'varchar', length: 50, nullable: true })
  wifiPassword?: string;

  // Transfer History
  @Column({ name: 'transfer_history', type: 'jsonb', default: [] })
  transferHistory: Array<{
    fromHostelId: string;
    fromRoomId: string;
    toHostelId: string;
    toRoomId: string;
    transferDate: Date;
    reason: string;
    approvedBy: string;
  }>;

  // Disciplinary Records
  @Column({ name: 'disciplinary_records', type: 'jsonb', default: [] })
  disciplinaryRecords: Array<{
    incidentDate: Date;
    type: string;
    description: string;
    action: string;
    status: 'active' | 'resolved' | 'dismissed';
  }>;

  // Visitor Records
  @Column({ name: 'visitor_records', type: 'jsonb', default: [] })
  visitorRecords: Array<{
    visitorName: string;
    visitorRelation: string;
    visitDate: Date;
    checkInTime: string;
    checkOutTime?: string;
    purpose: string;
    approvedBy?: string;
  }>;

  // Maintenance Requests
  @Column({ name: 'maintenance_requests', type: 'jsonb', default: [] })
  maintenanceRequests: Array<{
    requestDate: Date;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    resolvedDate?: Date;
    cost?: number;
  }>;

  // Performance and Behavior
  @Column({ name: 'behavior_rating', type: 'decimal', precision: 3, scale: 2, default: 3.0 })
  behaviorRating: number;

  @Column({ name: 'room_cleanliness_rating', type: 'decimal', precision: 3, scale: 2, default: 3.0 })
  roomCleanlinessRating: number;

  @Column({ name: 'performance_notes', type: 'text', nullable: true })
  performanceNotes?: string;

  // Metadata
  @Column({ name: 'preferences', type: 'jsonb', default: {} })
  preferences: {
    roomType?: string;
    floor?: 'ground' | 'middle' | 'top';
    nearWindow?: boolean;
    quietArea?: boolean;
    roommatePreference?: string;
  };

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    applicationId?: string;
    scholarshipApplied?: boolean;
    financialAid?: boolean;
    specialCircumstances?: string;
    legacy?: boolean;
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

  // Relations
  @ManyToOne(() => Hostel)
  @JoinColumn({ name: 'hostel_id' })
  hostel: Hostel;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  // Virtual properties
  get isActive(): boolean {
    return this.status === AllocationStatus.ACTIVE;
  }

  get isCheckedIn(): boolean {
    return this.checkInStatus === CheckInStatus.COMPLETED;
  }

  get isCheckedOut(): boolean {
    return this.checkOutStatus === CheckOutStatus.COMPLETED;
  }

  get daysAllocated(): number {
    const startDate = this.actualCheckInDate || this.allocationDate;
    const endDate = this.actualCheckOutDate || new Date();
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  get paymentCompletionRate(): number {
    if (this.monthlyRent === 0) return 100;
    const totalExpected = this.monthlyRent + this.securityDeposit;
    return Math.min(100, Math.round((this.paidAmount / totalExpected) * 100 * 100) / 100);
  }

  get hasSpecialRequirements(): boolean {
    return this.specialRequirements.length > 0 ||
           this.medicalConditions.length > 0 ||
           this.accessibilityNeeds.length > 0;
  }

  // Methods
  checkIn(checkInDate?: Date, notes?: string): void {
    this.actualCheckInDate = checkInDate || new Date();
    this.checkInStatus = CheckInStatus.COMPLETED;
    this.checkInNotes = notes;
    this.status = AllocationStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  checkOut(checkOutDate?: Date, notes?: string): void {
    this.actualCheckOutDate = checkOutDate || new Date();
    this.checkOutStatus = CheckOutStatus.COMPLETED;
    this.checkOutNotes = notes;
    this.status = AllocationStatus.TERMINATED;
    this.updatedAt = new Date();
  }

  updatePayment(amount: number, paymentDate?: Date): void {
    this.paidAmount += amount;
    this.lastPaymentDate = paymentDate || new Date();
    this.outstandingAmount = Math.max(0, (this.monthlyRent + this.securityDeposit) - this.paidAmount);

    if (this.outstandingAmount === 0) {
      this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
      this.paymentStatus = 'partial';
    }

    this.updatedAt = new Date();
  }

  addDisciplinaryRecord(record: typeof this.disciplinaryRecords[0]): void {
    this.disciplinaryRecords = [...this.disciplinaryRecords, record];
    this.updatedAt = new Date();
  }

  addVisitorRecord(record: typeof this.visitorRecords[0]): void {
    this.visitorRecords = [...this.visitorRecords, record];
    this.updatedAt = new Date();
  }

  addMaintenanceRequest(request: typeof this.maintenanceRequests[0]): void {
    this.maintenanceRequests = [...this.maintenanceRequests, request];
    this.updatedAt = new Date();
  }

  transferRoom(newHostelId: string, newRoomId: string, reason: string, approvedBy: string): void {
    const transferRecord = {
      fromHostelId: this.hostelId,
      fromRoomId: this.roomId,
      toHostelId: newHostelId,
      toRoomId: newRoomId,
      transferDate: new Date(),
      reason,
      approvedBy,
    };

    this.transferHistory = [...this.transferHistory, transferRecord];
    this.hostelId = newHostelId;
    this.roomId = newRoomId;
    this.updatedAt = new Date();
  }

  suspend(reason: string): void {
    this.status = AllocationStatus.SUSPENDED;
    this.internalNotes = (this.internalNotes || '') + `\nSuspended: ${reason} (${new Date().toISOString()})`;
    this.updatedAt = new Date();
  }

  reactivate(): void {
    this.status = AllocationStatus.ACTIVE;
    this.internalNotes = (this.internalNotes || '') + `\nReactivated: ${new Date().toISOString()})`;
    this.updatedAt = new Date();
  }
}