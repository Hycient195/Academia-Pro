// Academia Pro - Notification Entity
// Database entity for external notification system (SMS, Email, Push, WhatsApp)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum NotificationType {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  EXAMINATION = 'examination',
  FEE = 'fee',
  DISCIPLINE = 'discipline',
  HEALTH = 'health',
  EVENT = 'event',
  EMERGENCY = 'emergency',
  GENERAL = 'general',
  SYSTEM = 'system',
}

@Entity('notifications')
@Index(['recipientId', 'notificationType'])
@Index(['schoolId', 'status'])
@Index(['schoolId', 'notificationType'])
@Index(['status', 'createdAt'])
@Index(['scheduledSendAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({
    name: 'category',
    type: 'enum',
    enum: NotificationCategory,
    default: NotificationCategory.GENERAL,
  })
  category: NotificationCategory;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  // Recipient Information
  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 100 })
  recipientName: string;

  @Column({ name: 'recipient_role', type: 'varchar', length: 50 })
  recipientRole: string;

  // Contact Information
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'device_token', type: 'varchar', length: 255, nullable: true })
  deviceToken: string;

  @Column({ name: 'whatsapp_number', type: 'varchar', length: 20, nullable: true })
  whatsappNumber: string;

  @Column({ name: 'telegram_chat_id', type: 'varchar', length: 50, nullable: true })
  telegramChatId: string;

  // Message Content
  @Column({ name: 'subject', type: 'varchar', length: 200, nullable: true })
  subject: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'short_message', type: 'varchar', length: 160, nullable: true })
  shortMessage: string; // For SMS (160 chars limit)

  // Template Information
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @Column({ name: 'template_name', type: 'varchar', length: 100, nullable: true })
  templateName: string;

  @Column({ name: 'template_variables', type: 'jsonb', nullable: true })
  templateVariables: Record<string, any>;

  // Scheduling
  @Column({ name: 'scheduled_send_at', type: 'timestamp', nullable: true })
  scheduledSendAt: Date;

  @Column({ name: 'is_scheduled', type: 'boolean', default: false })
  isScheduled: boolean;

  // Delivery Tracking
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  // Provider Information
  @Column({ name: 'provider_name', type: 'varchar', length: 100, nullable: true })
  providerName: string; // Twilio, SendGrid, Firebase, etc.

  @Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })
  providerMessageId: string;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse: any;

  // Cost Tracking
  @Column({ name: 'cost', type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Failure Handling
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  // Related Records
  @Column({ name: 'related_entity_type', type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string; // 'student', 'fee', 'exam', etc.

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId: string;

  // Academic Context
  @Column({ name: 'academic_year', type: 'varchar', length: 20, nullable: true })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // User Preferences
  @Column({ name: 'bypass_preferences', type: 'boolean', default: false })
  bypassPreferences: boolean;

  @Column({ name: 'user_preferences', type: 'jsonb', nullable: true })
  userPreferences: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    whatsappEnabled: boolean;
    telegramEnabled: boolean;
  };

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    campaignId?: string;
    batchId?: string;
    source?: string;
    urgency?: string;
    requiresResponse?: boolean;
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
}