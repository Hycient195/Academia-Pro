import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum CommunicationType {
  TEACHER_MESSAGE = 'teacher_message',
  PARENT_MESSAGE = 'parent_message',
  PEER_MESSAGE = 'peer_message',
  GROUP_ANNOUNCEMENT = 'group_announcement',
  SCHOOL_ANNOUNCEMENT = 'school_announcement',
  EVENT_NOTIFICATION = 'event_notification',
  ASSIGNMENT_NOTIFICATION = 'assignment_notification',
  GRADE_NOTIFICATION = 'grade_notification',
  ATTENDANCE_ALERT = 'attendance_alert',
  EMERGENCY_ALERT = 'emergency_alert',
}

export enum CommunicationDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum CommunicationChannel {
  PORTAL_MESSAGE = 'portal_message',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification',
  VOICE_CALL = 'voice_call',
}

@Entity('student_communication_records')
@Index(['studentPortalAccessId', 'communicationType'])
@Index(['studentPortalAccessId', 'createdAt'])
@Index(['communicationType', 'createdAt'])
export class StudentCommunicationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({
    name: 'communication_type',
    type: 'enum',
    enum: CommunicationType,
  })
  communicationType: CommunicationType;

  @Column({
    name: 'direction',
    type: 'enum',
    enum: CommunicationDirection,
  })
  direction: CommunicationDirection;

  @Column({
    name: 'channel',
    type: 'enum',
    enum: CommunicationChannel,
  })
  channel: CommunicationChannel;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId: string;

  @Column({ name: 'sender_name', type: 'varchar', length: 100, nullable: true })
  senderName: string;

  @Column({ name: 'sender_role', type: 'varchar', length: 50, nullable: true })
  senderRole: string;

  @Column({ name: 'recipient_id', type: 'uuid', nullable: true })
  recipientId: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 100, nullable: true })
  recipientName: string;

  @Column({ name: 'subject', type: 'varchar', length: 200, nullable: true })
  subject: string;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'is_important', type: 'boolean', default: false })
  isImportant: boolean;

  @Column({ name: 'priority_level', type: 'varchar', length: 20, default: 'normal' })
  priorityLevel: 'low' | 'normal' | 'high' | 'urgent';

  @Column({ name: 'has_attachments', type: 'boolean', default: false })
  hasAttachments: boolean;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;

  @Column({ name: 'thread_id', type: 'uuid', nullable: true })
  threadId: string;

  @Column({ name: 'parent_message_id', type: 'uuid', nullable: true })
  parentMessageId: string;

  @Column({ name: 'response_required', type: 'boolean', default: false })
  responseRequired: boolean;

  @Column({ name: 'response_deadline', type: 'timestamp', nullable: true })
  responseDeadline: Date;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    assignmentId?: string;
    gradeId?: string;
    eventId?: string;
    courseId?: string;
    category?: string;
    tags?: string[];
  };

  @Column({ name: 'delivery_status', type: 'jsonb', nullable: true })
  deliveryStatus: {
    emailSent?: boolean;
    emailSentAt?: Date;
    smsSent?: boolean;
    smsSentAt?: Date;
    pushSent?: boolean;
    pushSentAt?: Date;
    deliveryErrors?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}