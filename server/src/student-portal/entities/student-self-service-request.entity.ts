import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum SelfServiceRequestType {
  PROFILE_UPDATE = 'profile_update',
  ADDRESS_CHANGE = 'address_change',
  CONTACT_UPDATE = 'contact_update',
  EMERGENCY_CONTACT_UPDATE = 'emergency_contact_update',
  MEDICAL_INFO_UPDATE = 'medical_info_update',
  LEAVE_APPLICATION = 'leave_application',
  TRANSPORT_CHANGE = 'transport_change',
  HOSTEL_CHANGE = 'hostel_change',
  SUBJECT_CHANGE = 'subject_change',
  TIMETABLE_CHANGE = 'timetable_change',
  LIBRARY_BOOK_RESERVATION = 'library_book_reservation',
  EQUIPMENT_REQUEST = 'equipment_request',
  FACILITY_BOOKING = 'facility_booking',
  CERTIFICATE_REQUEST = 'certificate_request',
  TRANSCRIPT_REQUEST = 'transcript_request',
  GRADE_CORRECTION = 'grade_correction',
  ATTENDANCE_CORRECTION = 'attendance_correction',
}

export enum RequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RequestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('student_self_service_requests')
@Index(['studentPortalAccessId', 'requestType'])
@Index(['studentPortalAccessId', 'status'])
@Index(['status', 'createdAt'])
export class StudentSelfServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({
    name: 'request_type',
    type: 'enum',
    enum: SelfServiceRequestType,
  })
  requestType: SelfServiceRequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: RequestPriority,
    default: RequestPriority.NORMAL,
  })
  priority: RequestPriority;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'request_data', type: 'jsonb' })
  requestData: Record<string, any>;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ name: 'assigned_to_name', type: 'varchar', length: 100, nullable: true })
  assignedToName: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_by_name', type: 'varchar', length: 100, nullable: true })
  reviewedByName: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_by_name', type: 'varchar', length: 100, nullable: true })
  approvedByName: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ name: 'completed_by', type: 'uuid', nullable: true })
  completedBy: string;

  @Column({ name: 'completed_by_name', type: 'varchar', length: 100, nullable: true })
  completedByName: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'completion_notes', type: 'text', nullable: true })
  completionNotes: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'expected_completion_date', type: 'timestamp', nullable: true })
  expectedCompletionDate: Date;

  @Column({ name: 'actual_completion_date', type: 'timestamp', nullable: true })
  actualCompletionDate: Date;

  @Column({ name: 'escalation_level', type: 'int', default: 0 })
  escalationLevel: number;

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  escalationReason: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    urgency?: string;
    impact?: string;
    relatedRecords?: string[];
  };

  @Column({ name: 'notification_history', type: 'jsonb', nullable: true })
  notificationHistory: Array<{
    type: string;
    sentAt: Date;
    recipient: string;
    status: string;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}