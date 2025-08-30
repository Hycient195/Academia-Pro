import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  TRANSFER = 'transfer',
  GRADUATE = 'graduate',
  SUSPEND = 'suspend',
  REINSTATE = 'reinstate',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export enum AuditEntityType {
  STUDENT_PROFILE = 'student_profile',
  STUDENT_DOCUMENT = 'student_document',
  STUDENT_ACHIEVEMENT = 'student_achievement',
  STUDENT_DISCIPLINE = 'student_discipline',
  STUDENT_MEDICAL_RECORD = 'student_medical_record',
  STUDENT_TRANSFER = 'student_transfer',
  STUDENT_ENROLLMENT = 'student_enrollment',
  STUDENT_ATTENDANCE = 'student_attendance',
  STUDENT_GRADE = 'student_grade',
  STUDENT_PARENT = 'student_parent',
  STUDENT_EMERGENCY_CONTACT = 'student_emergency_contact',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('student_audit_logs')
@Index(['studentId', 'action'])
@Index(['studentId', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class StudentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'action',
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 200, nullable: true })
  entityName: string;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.LOW,
  })
  severity: AuditSeverity;

  // User Information
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  @Column({ name: 'user_role', type: 'varchar', length: 50 })
  userRole: string;

  @Column({ name: 'user_department', type: 'varchar', length: 100, nullable: true })
  userDepartment: string;

  // Change Information
  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', default: [] })
  changedFields: string[];

  @Column({ name: 'change_description', type: 'text' })
  changeDescription: string;

  // Context Information
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  };

  @Column({ name: 'location_info', type: 'jsonb', nullable: true })
  locationInfo: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  // Academic Context
  @Column({ name: 'academic_year', type: 'varchar', length: 20, nullable: true })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Compliance and Security
  @Column({ name: 'is_confidential', type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ name: 'requires_parent_consent', type: 'boolean', default: false })
  requiresParentConsent: boolean;

  @Column({ name: 'parent_consent_obtained', type: 'boolean', nullable: true })
  parentConsentObtained: boolean;

  @Column({ name: 'gdpr_compliant', type: 'boolean', default: true })
  gdprCompliant: boolean;

  @Column({ name: 'data_retention_period', type: 'int', nullable: true })
  dataRetentionPeriod: number; // days

  // Audit Trail
  @Column({ name: 'audit_batch_id', type: 'uuid', nullable: true })
  auditBatchId: string;

  @Column({ name: 'related_audit_ids', type: 'jsonb', default: [] })
  relatedAuditIds: string[];

  @Column({ name: 'audit_trail', type: 'jsonb', default: [] })
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    userId: string;
    userName: string;
    description: string;
  }>;

  // Business Rules Validation
  @Column({ name: 'business_rules_violated', type: 'jsonb', default: [] })
  businessRulesViolated: string[];

  @Column({ name: 'compliance_issues', type: 'jsonb', default: [] })
  complianceIssues: string[];

  @Column({ name: 'risk_assessment', type: 'jsonb', nullable: true })
  riskAssessment: {
    riskLevel: AuditSeverity;
    riskFactors: string[];
    mitigationActions: string[];
    reviewRequired: boolean;
  };

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    source?: string;
    integrationId?: string;
    externalReference?: string;
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'external_notes', type: 'text', nullable: true })
  externalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}