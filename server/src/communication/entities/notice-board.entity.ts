// Academia Pro - Notice Board Entity
// Database entity for digital notice board management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';

export enum NoticeType {
  ANNOUNCEMENT = 'announcement',
  EVENT = 'event',
  POLICY_UPDATE = 'policy_update',
  EMERGENCY = 'emergency',
  ACADEMIC = 'academic',
  EXAMINATION = 'examination',
  HOLIDAY = 'holiday',
  GENERAL = 'general',
}

export enum NoticePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NoticeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
}

export enum VisibilityLevel {
  PUBLIC = 'public',
  STAFF_ONLY = 'staff_only',
  TEACHER_ONLY = 'teacher_only',
  PARENT_ONLY = 'parent_only',
  STUDENT_ONLY = 'student_only',
  SPECIFIC_GROUPS = 'specific_groups',
}

@Entity('notice_board')
@Index(['schoolId', 'status'])
@Index(['schoolId', 'noticeType'])
@Index(['schoolId', 'publishedAt'])
@Index(['schoolId', 'expiryDate'])
export class NoticeBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'notice_type',
    type: 'enum',
    enum: NoticeType,
    default: NoticeType.GENERAL,
  })
  noticeType: NoticeType;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: NoticePriority,
    default: NoticePriority.NORMAL,
  })
  priority: NoticePriority;

  @Column({
    type: 'enum',
    enum: NoticeStatus,
    default: NoticeStatus.DRAFT,
  })
  status: NoticeStatus;

  @Column({
    name: 'visibility_level',
    type: 'enum',
    enum: VisibilityLevel,
    default: VisibilityLevel.PUBLIC,
  })
  visibilityLevel: VisibilityLevel;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'summary', type: 'varchar', length: 500, nullable: true })
  summary: string;

  // Publishing Information
  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'published_by', type: 'uuid', nullable: true })
  publishedBy: string;

  @Column({ name: 'published_by_name', type: 'varchar', length: 100, nullable: true })
  publishedByName: string;

  // Scheduling
  @Column({ name: 'scheduled_publish_at', type: 'timestamp', nullable: true })
  scheduledPublishAt: Date;

  @Column({ name: 'is_scheduled', type: 'boolean', default: false })
  isScheduled: boolean;

  // Expiry
  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ name: 'auto_archive', type: 'boolean', default: true })
  autoArchive: boolean;

  // Target Audience
  @Column({ name: 'target_audience', type: 'jsonb', default: {} })
  targetAudience: {
    allUsers?: boolean;
    specificRoles?: string[];
    specificGrades?: string[];
    specificSections?: string[];
    specificGroups?: string[];
    excludeRoles?: string[];
  };

  // Attachments and Media
  @Column({ name: 'attachments', type: 'jsonb', default: [] })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }>;

  @Column({ name: 'featured_image_url', type: 'varchar', length: 500, nullable: true })
  featuredImageUrl: string;

  // Event Information (if notice is about an event)
  @Column({ name: 'event_details', type: 'jsonb', nullable: true })
  eventDetails: {
    eventDate: Date;
    eventTime: string;
    eventLocation: string;
    eventOrganizer: string;
    registrationRequired: boolean;
    registrationDeadline?: Date;
    maxAttendees?: number;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
  };

  // Engagement Tracking
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', type: 'int', default: 0 })
  shareCount: number;

  // User Interactions
  @Column({ name: 'user_views', type: 'jsonb', default: [] })
  userViews: Array<{
    userId: string;
    userName: string;
    viewedAt: Date;
  }>;

  @Column({ name: 'user_likes', type: 'jsonb', default: [] })
  userLikes: Array<{
    userId: string;
    userName: string;
    likedAt: Date;
  }>;

  // Comments
  @Column({ name: 'allow_comments', type: 'boolean', default: true })
  allowComments: boolean;

  @Column({ name: 'moderate_comments', type: 'boolean', default: false })
  moderateComments: boolean;

  // Notification Settings
  @Column({ name: 'send_notifications', type: 'boolean', default: true })
  sendNotifications: boolean;

  @Column({ name: 'notification_channels', type: 'jsonb', default: ['email', 'sms'] })
  notificationChannels: string[];

  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent: boolean;

  @Column({ name: 'notification_sent_at', type: 'timestamp', nullable: true })
  notificationSentAt: Date;

  // Academic Context
  @Column({ name: 'academic_year', type: 'varchar', length: 20, nullable: true })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Template Information
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @Column({ name: 'template_name', type: 'varchar', length: 100, nullable: true })
  templateName: string;

  // SEO and Accessibility
  @Column({ name: 'seo_title', type: 'varchar', length: 60, nullable: true })
  seoTitle: string;

  @Column({ name: 'seo_description', type: 'varchar', length: 160, nullable: true })
  seoDescription: string;

  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  // Metadata
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    pinned?: boolean;
    color?: string;
    icon?: string;
    externalLink?: string;
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
  @OneToMany(() => NoticeComment, comment => comment.notice)
  comments: NoticeComment[];
}

@Entity('notice_comments')
@Index(['noticeId', 'createdAt'])
export class NoticeComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notice_id', type: 'uuid' })
  noticeId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  @Column({ name: 'user_role', type: 'varchar', length: 50 })
  userRole: string;

  @Column({ name: 'comment', type: 'text' })
  comment: string;

  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy: string;

  @Column({ name: 'moderated_at', type: 'timestamp', nullable: true })
  moderatedAt: Date;

  @Column({ name: 'moderation_reason', type: 'varchar', length: 200, nullable: true })
  moderationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => NoticeBoard)
  @JoinColumn({ name: 'notice_id' })
  notice: NoticeBoard;
}