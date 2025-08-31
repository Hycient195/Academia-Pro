import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification',
  IN_APP_MESSAGE = 'in_app_message',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',     // From parent to school
  OUTBOUND = 'outbound',   // From school to parent
}

export enum CommunicationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum CommunicationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum CommunicationCategory {
  ACADEMIC = 'academic',           // Grades, assignments, progress
  ATTENDANCE = 'attendance',       // Attendance records, tardiness
  BEHAVIOR = 'behavior',           // Conduct, discipline
  HEALTH = 'health',               // Medical, wellness
  ADMINISTRATIVE = 'administrative', // Fees, documents, general
  EMERGENCY = 'emergency',         // Urgent situations
  EVENT = 'event',                 // School events, activities
  GENERAL = 'general',             // General communications
}

@Entity('communication_records')
@Index(['parentPortalAccessId', 'timestamp'])
@Index(['studentId', 'timestamp'])
@Index(['communicationType', 'timestamp'])
@Index(['status', 'timestamp'])
@Index(['category', 'timestamp'])
export class CommunicationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId: string; // Teacher, admin, or system

  @Column({ name: 'sender_type', type: 'varchar', length: 50, nullable: true })
  senderType: string; // 'teacher', 'admin', 'system'

  @Column({ name: 'sender_name', type: 'varchar', length: 200, nullable: true })
  senderName: string;

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
    name: 'status',
    type: 'enum',
    enum: CommunicationStatus,
    default: CommunicationStatus.PENDING,
  })
  status: CommunicationStatus;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: CommunicationPriority,
    default: CommunicationPriority.NORMAL,
  })
  priority: CommunicationPriority;

  @Column({
    name: 'category',
    type: 'enum',
    enum: CommunicationCategory,
  })
  category: CommunicationCategory;

  @Column({ name: 'subject', type: 'varchar', length: 500 })
  subject: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'html_content', type: 'text', nullable: true })
  htmlContent: string;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    uploadedAt: Date;
  }>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    templateId?: string;
    campaignId?: string;
    scheduledAt?: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    retryCount?: number;
    externalMessageId?: string; // For SMS/email providers
    deliveryProvider?: string;
    cost?: number;
    recipientCount?: number;
    clickCount?: number;
    openCount?: number;
    bounceCount?: number;
    unsubscribeCount?: number;
    // Appointment-related metadata
    appointmentId?: string;
    appointmentType?: string;
    preferredDate?: Date;
    contactPhone?: string;
    specialRequirements?: string;
    // Message-related metadata
    recipientId?: string;
    recipientType?: string;
  };

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt: Date;

  @Column({ name: 'requires_response', type: 'boolean', default: false })
  requiresResponse: boolean;

  @Column({ name: 'response_deadline', type: 'timestamp', nullable: true })
  responseDeadline: Date;

  @Column({ name: 'parent_response', type: 'text', nullable: true })
  parentResponse: string;

  @Column({ name: 'response_at', type: 'timestamp', nullable: true })
  responseAt: Date;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ name: 'escalation_level', type: 'int', default: 0 })
  escalationLevel: number;

  @Column({ name: 'escalated_to', type: 'varchar', length: 100, nullable: true })
  escalatedTo: string;

  @Column({ name: 'escalated_at', type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  sentimentScore: number; // -1 to 1, negative to positive

  @Column({ name: 'language', type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ name: 'translation_required', type: 'boolean', default: false })
  translationRequired: boolean;

  @Column({ name: 'translated_content', type: 'text', nullable: true })
  translatedContent: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isDelivered(): boolean {
    return [CommunicationStatus.DELIVERED, CommunicationStatus.READ].includes(this.status);
  }

  isOverdue(): boolean {
    if (!this.responseDeadline) return false;
    return new Date() > this.responseDeadline && !this.parentResponse;
  }

  requiresFollowUp(): boolean {
    return this.followUpRequired ||
           this.isOverdue() ||
           this.status === CommunicationStatus.FAILED;
  }

  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
    if (this.metadata) {
      this.metadata.readAt = new Date();
    }
  }

  markAsDelivered(): void {
    this.status = CommunicationStatus.DELIVERED;
    if (this.metadata) {
      this.metadata.deliveredAt = new Date();
    }
  }

  markAsFailed(reason?: string): void {
    this.status = CommunicationStatus.FAILED;
    if (this.metadata) {
      this.metadata.failedAt = new Date();
      if (reason) {
        this.metadata.failureReason = reason;
      }
    }
  }

  addAttachment(attachment: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  }): void {
    if (!this.attachments) {
      this.attachments = [];
    }

    this.attachments.push({
      ...attachment,
      uploadedAt: new Date(),
    });
  }

  escalate(level: number, escalatedTo: string, notes?: string): void {
    this.escalationLevel = level;
    this.escalatedTo = escalatedTo;
    this.escalatedAt = new Date();

    if (notes) {
      this.followUpNotes = notes;
    }

    this.followUpRequired = true;
  }

  addResponse(response: string): void {
    this.parentResponse = response;
    this.responseAt = new Date();
    this.isRead = true;
    this.readAt = new Date();
  }

  // Static factory methods
  static createEmailCommunication(
    parentPortalAccessId: string,
    schoolId: string,
    subject: string,
    message: string,
    senderId: string,
    senderName: string,
    category: CommunicationCategory,
    createdBy: string,
    options?: {
      studentId?: string;
      priority?: CommunicationPriority;
      attachments?: any[];
      metadata?: any;
    },
  ): Partial<CommunicationRecord> {
    return {
      parentPortalAccessId,
      studentId: options?.studentId,
      schoolId,
      senderId,
      senderType: 'system',
      senderName,
      communicationType: CommunicationType.EMAIL,
      direction: CommunicationDirection.OUTBOUND,
      status: CommunicationStatus.PENDING,
      priority: options?.priority || CommunicationPriority.NORMAL,
      category,
      subject,
      message,
      attachments: options?.attachments,
      metadata: {
        ...options?.metadata,
        deliveryProvider: 'system',
      },
      createdBy,
    };
  }

  static createSMSCommunication(
    parentPortalAccessId: string,
    schoolId: string,
    message: string,
    senderId: string,
    senderName: string,
    category: CommunicationCategory,
    createdBy: string,
    options?: {
      studentId?: string;
      priority?: CommunicationPriority;
      metadata?: any;
    },
  ): Partial<CommunicationRecord> {
    return {
      parentPortalAccessId,
      studentId: options?.studentId,
      schoolId,
      senderId,
      senderType: 'system',
      senderName,
      communicationType: CommunicationType.SMS,
      direction: CommunicationDirection.OUTBOUND,
      status: CommunicationStatus.PENDING,
      priority: options?.priority || CommunicationPriority.NORMAL,
      category,
      subject: 'SMS Notification',
      message,
      metadata: {
        ...options?.metadata,
        deliveryProvider: 'system',
        cost: 0.01, // Example cost per SMS
      },
      createdBy,
    };
  }

  static createInAppMessage(
    parentPortalAccessId: string,
    schoolId: string,
    subject: string,
    message: string,
    senderId: string,
    senderName: string,
    category: CommunicationCategory,
    createdBy: string,
    options?: {
      studentId?: string;
      priority?: CommunicationPriority;
      requiresResponse?: boolean;
      responseDeadline?: Date;
    },
  ): Partial<CommunicationRecord> {
    return {
      parentPortalAccessId,
      studentId: options?.studentId,
      schoolId,
      senderId,
      senderType: 'system',
      senderName,
      communicationType: CommunicationType.IN_APP_MESSAGE,
      direction: CommunicationDirection.OUTBOUND,
      status: CommunicationStatus.SENT,
      priority: options?.priority || CommunicationPriority.NORMAL,
      category,
      subject,
      message,
      requiresResponse: options?.requiresResponse || false,
      responseDeadline: options?.responseDeadline,
      metadata: {
        deliveredAt: new Date(),
      },
      createdBy,
    };
  }
}