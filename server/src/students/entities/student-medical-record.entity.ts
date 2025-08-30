import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum MedicalRecordType {
  PHYSICAL_EXAM = 'physical_exam',
  DENTAL_EXAM = 'dental_exam',
  VISION_SCREENING = 'vision_screening',
  HEARING_TEST = 'hearing_test',
  ALLERGY_ASSESSMENT = 'allergy_assessment',
  IMMUNIZATION = 'immunization',
  ILLNESS = 'illness',
  INJURY = 'injury',
  MEDICATION = 'medication',
  SURGERY = 'surgery',
  HOSPITALIZATION = 'hospitalization',
  EMERGENCY_TREATMENT = 'emergency_treatment',
  MENTAL_HEALTH_ASSESSMENT = 'mental_health_assessment',
  SPECIALIST_CONSULTATION = 'specialist_consultation',
  OTHER = 'other',
}

export enum MedicalStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ONGOING = 'ongoing',
  MONITORING = 'monitoring',
  CRITICAL = 'critical',
}

export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

@Entity('student_medical_records')
@Index(['studentId', 'recordType'])
@Index(['studentId', 'recordDate'])
@Index(['status', 'recordDate'])
@Index(['severity', 'recordDate'])
export class StudentMedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'record_type',
    type: 'enum',
    enum: MedicalRecordType,
  })
  recordType: MedicalRecordType;

  @Column({ name: 'record_title', type: 'varchar', length: 200 })
  recordTitle: string;

  @Column({ name: 'record_description', type: 'text' })
  recordDescription: string;

  @Column({
    type: 'enum',
    enum: MedicalStatus,
    default: MedicalStatus.ACTIVE,
  })
  status: MedicalStatus;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: SeverityLevel,
    nullable: true,
  })
  severity: SeverityLevel;

  // Date and Time Information
  @Column({ name: 'record_date', type: 'timestamp' })
  recordDate: Date;

  @Column({ name: 'record_time', type: 'varchar', length: 20, nullable: true })
  recordTime: string;

  @Column({ name: 'reported_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportedDate: Date;

  // Healthcare Provider Information
  @Column({ name: 'healthcare_provider_id', type: 'uuid', nullable: true })
  healthcareProviderId: string;

  @Column({ name: 'healthcare_provider_name', type: 'varchar', length: 200 })
  healthcareProviderName: string;

  @Column({ name: 'healthcare_provider_type', type: 'varchar', length: 100 })
  healthcareProviderType: string; // 'doctor', 'nurse', 'dentist', 'specialist', etc.

  @Column({ name: 'healthcare_provider_contact', type: 'varchar', length: 100, nullable: true })
  healthcareProviderContact: string;

  @Column({ name: 'facility_name', type: 'varchar', length: 200, nullable: true })
  facilityName: string;

  @Column({ name: 'facility_address', type: 'text', nullable: true })
  facilityAddress: string;

  // Medical Details
  @Column({ name: 'symptoms', type: 'jsonb', default: [] })
  symptoms: string[];

  @Column({ name: 'diagnosis', type: 'text', nullable: true })
  diagnosis: string;

  @Column({ name: 'treatment', type: 'text', nullable: true })
  treatment: string;

  @Column({ name: 'medications_prescribed', type: 'jsonb', default: [] })
  medicationsPrescribed: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_instructions', type: 'text', nullable: true })
  followUpInstructions: string;

  // Immunization Information
  @Column({ name: 'vaccine_name', type: 'varchar', length: 100, nullable: true })
  vaccineName: string;

  @Column({ name: 'vaccine_dose', type: 'varchar', length: 50, nullable: true })
  vaccineDose: string;

  @Column({ name: 'vaccine_batch_number', type: 'varchar', length: 50, nullable: true })
  vaccineBatchNumber: string;

  @Column({ name: 'next_dose_due', type: 'timestamp', nullable: true })
  nextDoseDue: Date;

  // Allergy Information
  @Column({ name: 'allergies_identified', type: 'jsonb', default: [] })
  allergiesIdentified: Array<{
    allergen: string;
    reaction: string;
    severity: SeverityLevel;
    firstObserved: Date;
  }>;

  // Emergency Information
  @Column({ name: 'emergency_treatment_given', type: 'text', nullable: true })
  emergencyTreatmentGiven: string;

  @Column({ name: 'emergency_contact_notified', type: 'boolean', default: false })
  emergencyContactNotified: boolean;

  @Column({ name: 'emergency_response_time', type: 'varchar', length: 50, nullable: true })
  emergencyResponseTime: string;

  // Parental Involvement
  @Column({ name: 'parent_notified', type: 'boolean', default: false })
  parentNotified: boolean;

  @Column({ name: 'parent_notification_date', type: 'timestamp', nullable: true })
  parentNotificationDate: Date;

  @Column({ name: 'parent_consent_obtained', type: 'boolean', default: false })
  parentConsentObtained: boolean;

  @Column({ name: 'parent_consent_date', type: 'timestamp', nullable: true })
  parentConsentDate: Date;

  // Supporting Documents
  @Column({ name: 'supporting_documents', type: 'jsonb', default: [] })
  supportingDocuments: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadDate: Date;
  }>;

  // Academic Impact
  @Column({ name: 'academic_impact', type: 'text', nullable: true })
  academicImpact: string;

  @Column({ name: 'days_absent_due_to_illness', type: 'int', default: 0 })
  daysAbsentDueToIllness: number;

  @Column({ name: 'special_accommodations_required', type: 'boolean', default: false })
  specialAccommodationsRequired: boolean;

  @Column({ name: 'accommodations_details', type: 'text', nullable: true })
  accommodationsDetails: string;

  // Privacy and Confidentiality
  @Column({ name: 'confidential', type: 'boolean', default: true })
  confidential: boolean;

  @Column({ name: 'information_sharing_restrictions', type: 'text', nullable: true })
  informationSharingRestrictions: string;

  // Resolution and Follow-up
  @Column({ name: 'resolution_date', type: 'timestamp', nullable: true })
  resolutionDate: Date;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'outcome', type: 'varchar', length: 100, nullable: true })
  outcome: string;

  // Metadata
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    relatedRecords?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_by_name', type: 'varchar', length: 100 })
  createdByName: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'updated_by_name', type: 'varchar', length: 100, nullable: true })
  updatedByName: string;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}