import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum DocumentType {
  BIRTH_CERTIFICATE = 'birth_certificate',
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  ACADEMIC_TRANSCRIPT = 'academic_transcript',
  PREVIOUS_SCHOOL_CERTIFICATE = 'previous_school_certificate',
  TRANSFER_CERTIFICATE = 'transfer_certificate',
  MEDICAL_CERTIFICATE = 'medical_certificate',
  VACCINATION_RECORD = 'vaccination_record',
  ADDRESS_PROOF = 'address_proof',
  INCOME_CERTIFICATE = 'income_certificate',
  CASTE_CERTIFICATE = 'caste_certificate',
  DISABILITY_CERTIFICATE = 'disability_certificate',
  SCHOLARSHIP_CERTIFICATE = 'scholarship_certificate',
  ACHIEVEMENT_CERTIFICATE = 'achievement_certificate',
  PHOTO = 'photo',
  SIGNATURE = 'signature',
  PARENT_ID_PROOF = 'parent_id_proof',
  EMERGENCY_CONTACT_PROOF = 'emergency_contact_proof',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export enum VerificationMethod {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  THIRD_PARTY = 'third_party',
  BLOCKCHAIN = 'blockchain',
}

@Entity('student_documents')
@Index(['studentId', 'documentType'])
@Index(['studentId', 'status'])
@Index(['documentType', 'status'])
@Index(['verificationStatus'])
export class StudentDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ name: 'document_name', type: 'varchar', length: 200 })
  documentName: string;

  @Column({ name: 'document_description', type: 'text', nullable: true })
  documentDescription: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  // File Information
  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'original_file_name', type: 'varchar', length: 255 })
  originalFileName: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_hash', type: 'varchar', length: 128, nullable: true })
  fileHash: string;

  // Upload Information
  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ name: 'uploaded_by_name', type: 'varchar', length: 100 })
  uploadedByName: string;

  @Column({ name: 'upload_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate: Date;

  @Column({ name: 'upload_ip_address', type: 'varchar', length: 45, nullable: true })
  uploadIpAddress: string;

  // Verification Information
  @Column({ name: 'verification_required', type: 'boolean', default: true })
  verificationRequired: boolean;

  @Column({ name: 'verification_status', type: 'varchar', length: 50, default: 'pending' })
  verificationStatus: 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired';

  @Column({
    name: 'verification_method',
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  verificationMethod: VerificationMethod;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_by_name', type: 'varchar', length: 100, nullable: true })
  verifiedByName: string;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Document Validity
  @Column({ name: 'issue_date', type: 'timestamp', nullable: true })
  issueDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ name: 'is_expired', type: 'boolean', default: false })
  isExpired: boolean;

  @Column({ name: 'renewal_required', type: 'boolean', default: false })
  renewalRequired: boolean;

  @Column({ name: 'renewal_reminder_date', type: 'timestamp', nullable: true })
  renewalReminderDate: Date;

  // Access Control
  @Column({ name: 'is_confidential', type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ name: 'access_restricted', type: 'boolean', default: false })
  accessRestricted: boolean;

  @Column({ name: 'allowed_roles', type: 'jsonb', default: ['admin', 'teacher', 'parent'] })
  allowedRoles: string[];

  @Column({ name: 'access_expires_at', type: 'timestamp', nullable: true })
  accessExpiresAt: Date;

  // Document Metadata
  @Column({ name: 'document_number', type: 'varchar', length: 100, nullable: true })
  documentNumber: string;

  @Column({ name: 'issuing_authority', type: 'varchar', length: 200, nullable: true })
  issuingAuthority: string;

  @Column({ name: 'issuing_country', type: 'varchar', length: 100, nullable: true })
  issuingCountry: string;

  @Column({ name: 'issuing_state', type: 'varchar', length: 100, nullable: true })
  issuingState: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    relatedDocuments?: string[];
    externalVerificationUrl?: string;
    blockchainHash?: string;
  };

  // Version Control
  @Column({ name: 'version_number', type: 'int', default: 1 })
  versionNumber: number;

  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId: string;

  @Column({ name: 'is_latest_version', type: 'boolean', default: true })
  isLatestVersion: boolean;

  // Audit and Tracking
  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'last_downloaded_at', type: 'timestamp', nullable: true })
  lastDownloadedAt: Date;

  @Column({ name: 'last_downloaded_by', type: 'uuid', nullable: true })
  lastDownloadedBy: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'last_viewed_at', type: 'timestamp', nullable: true })
  lastViewedAt: Date;

  @Column({ name: 'last_viewed_by', type: 'uuid', nullable: true })
  lastViewedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}