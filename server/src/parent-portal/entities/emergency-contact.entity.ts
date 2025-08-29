import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EmergencyContactType {
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  RELATIVE = 'relative',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  DOCTOR = 'doctor',
  HOSPITAL = 'hospital',
  OTHER = 'other',
}

export enum EmergencyContactPriority {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

@Entity('emergency_contacts')
@Index(['parentPortalAccessId', 'priority'])
@Index(['studentId', 'priority'])
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 200 })
  contactName: string;

  @Column({
    name: 'contact_type',
    type: 'enum',
    enum: EmergencyContactType,
  })
  contactType: EmergencyContactType;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EmergencyContactPriority,
    default: EmergencyContactPriority.SECONDARY,
  })
  priority: EmergencyContactPriority;

  @Column({ name: 'relationship', type: 'varchar', length: 100, nullable: true })
  relationship: string;

  @Column({ name: 'primary_phone', type: 'varchar', length: 20 })
  primaryPhone: string;

  @Column({ name: 'secondary_phone', type: 'varchar', length: 20, nullable: true })
  secondaryPhone: string;

  @Column({ name: 'email', type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'can_pickup_student', type: 'boolean', default: false })
  canPickupStudent: boolean;

  @Column({ name: 'medical_decisions', type: 'boolean', default: false })
  medicalDecisions: boolean;

  @Column({ name: 'educational_decisions', type: 'boolean', default: false })
  educationalDecisions: boolean;

  @Column({ name: 'court_authorized', type: 'boolean', default: false })
  courtAuthorized: boolean;

  @Column({ name: 'court_order_details', type: 'text', nullable: true })
  courtOrderDetails: string;

  @Column({ name: 'restrictions', type: 'text', nullable: true })
  restrictions: string;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ name: 'last_verified', type: 'timestamp', nullable: true })
  lastVerified: Date;

  @Column({ name: 'verification_required', type: 'boolean', default: true })
  verificationRequired: boolean;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isVerified(): boolean {
    return !this.verificationRequired ||
           (this.lastVerified && this.lastVerified > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)); // Within last year
  }

  canMakeMedicalDecisions(): boolean {
    return this.medicalDecisions && this.isActive && this.isVerified();
  }

  canMakeEducationalDecisions(): boolean {
    return this.educationalDecisions && this.isActive && this.isVerified();
  }

  canPickup(): boolean {
    return this.canPickupStudent && this.isActive && this.isVerified();
  }

  markAsVerified(): void {
    this.lastVerified = new Date();
    this.verificationRequired = false;
  }

  deactivate(reason?: string): void {
    this.isActive = false;
    if (reason) {
      this.restrictions = reason;
    }
  }

  activate(): void {
    this.isActive = true;
    this.verificationRequired = true;
  }
}