import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ParentPortalAccess } from './parent-portal-access.entity';

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  GRANDPARENT = 'grandparent',
  AUNT_UNCLE = 'aunt_uncle',
  OTHER = 'other',
}

export enum AuthorizationLevel {
  EMERGENCY = 'emergency',     // Emergency contact only
  VIEW_ONLY = 'view_only',     // View grades and basic info
  LIMITED = 'limited',         // View + basic communication
  FULL = 'full',              // Full access to all features
}

@Entity('parent_student_links')
@Index(['parentPortalAccessId', 'studentId'])
@Index(['studentId', 'relationshipType'])
@Index(['authorizationLevel', 'isActive'])
export class ParentStudentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'relationship_type',
    type: 'enum',
    enum: RelationshipType,
  })
  relationshipType: RelationshipType;

  @Column({
    name: 'authorization_level',
    type: 'enum',
    enum: AuthorizationLevel,
    default: AuthorizationLevel.VIEW_ONLY,
  })
  authorizationLevel: AuthorizationLevel;

  @Column({ name: 'is_primary_guardian', type: 'boolean', default: false })
  isPrimaryGuardian: boolean;

  @Column({ name: 'is_emergency_contact', type: 'boolean', default: false })
  isEmergencyContact: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'can_pickup_student', type: 'boolean', default: false })
  canPickupStudent: boolean;

  @Column({ name: 'medical_decision_maker', type: 'boolean', default: false })
  medicalDecisionMaker: boolean;

  @Column({ name: 'educational_decision_maker', type: 'boolean', default: false })
  educationalDecisionMaker: boolean;

  @Column({ name: 'receives_report_cards', type: 'boolean', default: true })
  receivesReportCards: boolean;

  @Column({ name: 'receives_progress_reports', type: 'boolean', default: true })
  receivesProgressReports: boolean;

  @Column({ name: 'receives_attendance_alerts', type: 'boolean', default: true })
  receivesAttendanceAlerts: boolean;

  @Column({ name: 'receives_conduct_alerts', type: 'boolean', default: true })
  receivesConductAlerts: boolean;

  @Column({ name: 'receives_fee_alerts', type: 'boolean', default: true })
  receivesFeeAlerts: boolean;

  @Column({ name: 'receives_event_notifications', type: 'boolean', default: true })
  receivesEventNotifications: boolean;

  @Column({ name: 'contact_priority', type: 'int', default: 1 })
  contactPriority: number; // 1 = primary, 2 = secondary, etc.

  @Column({ name: 'court_ordered_custody', type: 'boolean', default: false })
  courtOrderedCustody: boolean;

  @Column({ name: 'custody_details', type: 'text', nullable: true })
  custodyDetails: string;

  @Column({ name: 'restriction_notes', type: 'text', nullable: true })
  restrictionNotes: string;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ name: 'verification_documents', type: 'jsonb', nullable: true })
  verificationDocuments: Array<{
    type: string; // 'birth_certificate', 'court_order', 'id_card', etc.
    documentId: string;
    verified: boolean;
    verifiedBy: string;
    verifiedAt: Date;
    expiryDate?: Date;
  }>;

  @Column({ name: 'access_restrictions', type: 'jsonb', nullable: true })
  accessRestrictions: {
    restrictedDataTypes?: string[]; // 'medical', 'disciplinary', 'financial', etc.
    restrictedUntil?: Date;
    restrictedBy?: string;
    restrictionReason?: string;
  };

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount: number;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ParentPortalAccess)
  @JoinColumn({ name: 'parent_portal_access_id' })
  parentPortalAccess: ParentPortalAccess;

  // Helper methods
  isAuthorizedFor(level: AuthorizationLevel): boolean {
    const levels = {
      [AuthorizationLevel.EMERGENCY]: 1,
      [AuthorizationLevel.VIEW_ONLY]: 2,
      [AuthorizationLevel.LIMITED]: 3,
      [AuthorizationLevel.FULL]: 4,
    };

    return levels[this.authorizationLevel] >= levels[level];
  }

  canAccessDataType(dataType: string): boolean {
    if (!this.accessRestrictions?.restrictedDataTypes) {
      return true;
    }

    return !this.accessRestrictions.restrictedDataTypes.includes(dataType);
  }

  isVerificationComplete(): boolean {
    if (!this.verificationDocuments || this.verificationDocuments.length === 0) {
      return false;
    }

    return this.verificationDocuments.every(doc => doc.verified);
  }

  hasValidCustody(): boolean {
    if (!this.courtOrderedCustody) {
      return true; // No court order needed
    }

    if (!this.verificationDocuments) {
      return false;
    }

    const courtOrder = this.verificationDocuments.find(
      doc => doc.type === 'court_order' && doc.verified
    );

    return courtOrder && (!courtOrder.expiryDate || courtOrder.expiryDate > new Date());
  }

  updateLastAccess(): void {
    this.lastAccessedAt = new Date();
    this.accessCount++;
  }

  addVerificationDocument(document: {
    type: string;
    documentId: string;
    verifiedBy: string;
    expiryDate?: Date;
  }): void {
    if (!this.verificationDocuments) {
      this.verificationDocuments = [];
    }

    this.verificationDocuments.push({
      ...document,
      verified: false,
      verifiedAt: new Date(),
    });
  }

  verifyDocument(documentId: string, verifiedBy: string): boolean {
    if (!this.verificationDocuments) {
      return false;
    }

    const document = this.verificationDocuments.find(doc => doc.documentId === documentId);
    if (!document) {
      return false;
    }

    document.verified = true;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();

    return true;
  }

  setAccessRestriction(restriction: {
    restrictedDataTypes: string[];
    restrictedUntil?: Date;
    restrictedBy: string;
    restrictionReason: string;
  }): void {
    this.accessRestrictions = restriction;
  }

  removeAccessRestriction(): void {
    this.accessRestrictions = null;
  }

  getActiveRestrictions(): string[] {
    if (!this.accessRestrictions?.restrictedUntil) {
      return this.accessRestrictions?.restrictedDataTypes || [];
    }

    if (this.accessRestrictions.restrictedUntil < new Date()) {
      // Restriction has expired
      this.accessRestrictions = null;
      return [];
    }

    return this.accessRestrictions.restrictedDataTypes || [];
  }

  // Static factory methods
  static createBasicLink(
    parentPortalAccessId: string,
    studentId: string,
    schoolId: string,
    relationshipType: RelationshipType,
    createdBy: string,
  ): Partial<ParentStudentLink> {
    return {
      parentPortalAccessId,
      studentId,
      schoolId,
      relationshipType,
      authorizationLevel: AuthorizationLevel.VIEW_ONLY,
      isActive: true,
      receivesReportCards: true,
      receivesProgressReports: true,
      receivesAttendanceAlerts: true,
      receivesConductAlerts: true,
      receivesFeeAlerts: true,
      receivesEventNotifications: true,
      contactPriority: 1,
      createdBy,
    };
  }
}