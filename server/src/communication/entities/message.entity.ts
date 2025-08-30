// Academia Pro - Message Entity
// Database entity for internal messaging system

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum MessageType {
  DIRECT = 'direct',
  GROUP = 'group',
  ANNOUNCEMENT = 'announcement',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MessageStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum RecipientType {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  STAFF = 'staff',
  ALL = 'all',
  GROUP = 'group',
}

@Entity('messages')
@Index(['senderId', 'createdAt'])
@Index(['recipientId', 'createdAt'])
@Index(['schoolId', 'messageType'])
@Index(['status', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_name', type: 'varchar', length: 100 })
  senderName: string;

  @Column({ name: 'sender_role', type: 'varchar', length: 50 })
  senderRole: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageType,
    default: MessageType.DIRECT,
  })
  messageType: MessageType;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: MessagePriority,
    default: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.DRAFT,
  })
  status: MessageStatus;

  @Column({ name: 'subject', type: 'varchar', length: 200 })
  subject: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  // Recipients
  @Column({ name: 'recipient_id', type: 'uuid', nullable: true })
  recipientId: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 100, nullable: true })
  recipientName: string;

  @Column({ name: 'recipient_role', type: 'varchar', length: 50, nullable: true })
  recipientRole: string;

  @Column({
    name: 'recipient_type',
    type: 'enum',
    enum: RecipientType,
    nullable: true,
  })
  recipientType: RecipientType;

  // Group messaging
  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string;

  @Column({ name: 'group_name', type: 'varchar', length: 100, nullable: true })
  groupName: string;

  @Column({ name: 'recipients_list', type: 'jsonb', default: [] })
  recipientsList: Array<{
    id: string;
    name: string;
    role: string;
    type: RecipientType;
  }>;

  // Attachments
  @Column({ name: 'attachments', type: 'jsonb', default: [] })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }>;

  // Message threading
  @Column({ name: 'parent_message_id', type: 'uuid', nullable: true })
  parentMessageId: string;

  @Column({ name: 'thread_id', type: 'uuid', nullable: true })
  threadId: string;

  @Column({ name: 'is_reply', type: 'boolean', default: false })
  isReply: boolean;

  // Delivery tracking
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'read_by', type: 'jsonb', default: [] })
  readBy: Array<{
    userId: string;
    userName: string;
    readAt: Date;
  }>;

  // Delivery failures
  @Column({ name: 'delivery_failures', type: 'jsonb', default: [] })
  deliveryFailures: Array<{
    recipientId: string;
    recipientName: string;
    failureReason: string;
    failedAt: Date;
  }>;

  // Academic context
  @Column({ name: 'academic_year', type: 'varchar', length: 20, nullable: true })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Scheduling
  @Column({ name: 'scheduled_send_at', type: 'timestamp', nullable: true })
  scheduledSendAt: Date;

  @Column({ name: 'is_scheduled', type: 'boolean', default: false })
  isScheduled: boolean;

  // Template usage
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @Column({ name: 'template_name', type: 'varchar', length: 100, nullable: true })
  templateName: string;

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    urgency?: string;
    requiresResponse?: boolean;
    followUpRequired?: boolean;
    relatedRecords?: string[];
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
  @ManyToOne(() => Message)
  @JoinColumn({ name: 'parent_message_id' })
  parentMessage: Message;

  @OneToMany(() => Message, message => message.parentMessage)
  replies: Message[];
}