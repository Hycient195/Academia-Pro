import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

export enum ContentType {
  VIDEO = 'video',                        // Video lectures, tutorials
  AUDIO = 'audio',                        // Podcasts, audio lectures
  DOCUMENT = 'document',                   // PDFs, presentations, notes
  INTERACTIVE = 'interactive',             // Quizzes, simulations, games
  IMAGE = 'image',                         // Diagrams, charts, infographics
  PRESENTATION = 'presentation',           // Slideshows, lectures
  ASSESSMENT = 'assessment',               // Tests, quizzes, assignments
  RESOURCE = 'resource',                   // Additional materials, references
}

export enum ContentFormat {
  MP4 = 'mp4',                            // Video format
  PDF = 'pdf',                            // Document format
  DOCX = 'docx',                          // Word document
  PPTX = 'pptx',                          // PowerPoint presentation
  XLSX = 'xlsx',                          // Excel spreadsheet
  JPG = 'jpg',                            // JPEG image
  PNG = 'png',                            // PNG image
  MP3 = 'mp3',                            // Audio format
  HTML = 'html',                          // HTML content
  SCORM = 'scorm',                        // SCORM package
  JSON = 'json',                          // Interactive content data
}

export enum ContentStatus {
  DRAFT = 'draft',                        // Being created/edited
  REVIEW = 'review',                      // Under review
  PUBLISHED = 'published',                // Available to students
  ARCHIVED = 'archived',                  // No longer active
  DEPRECATED = 'deprecated',              // Replaced by newer version
}

export enum AccessLevel {
  PUBLIC = 'public',                      // Available to all enrolled students
  RESTRICTED = 'restricted',              // Limited to specific groups/classes
  PRIVATE = 'private',                    // Teacher-only access
  PREMIUM = 'premium',                    // Requires additional permissions
}

@Entity('digital_content')
@Index(['schoolId', 'status'])
@Index(['subjectId', 'contentType'])
@Index(['createdBy', 'status'])
@Index(['publishDate', 'status'])
export class DigitalContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentType,
  })
  contentType: ContentType;

  @Column({
    name: 'content_format',
    type: 'enum',
    enum: ContentFormat,
  })
  contentFormat: ContentFormat;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  @Column({
    name: 'access_level',
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.PUBLIC,
  })
  accessLevel: AccessLevel;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes: number;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'preview_url', type: 'varchar', length: 500, nullable: true })
  previewUrl: string;

  @Column({ name: 'transcript_url', type: 'varchar', length: 500, nullable: true })
  transcriptUrl: string;

  @Column({ name: 'transcript_text', type: 'text', nullable: true })
  transcriptText: string;

  @Column({ name: 'language', type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ name: 'difficulty_level', type: 'varchar', length: 20, nullable: true })
  difficultyLevel: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20, nullable: true })
  gradeLevel: string;

  @Column({ name: 'estimated_completion_time', type: 'int', nullable: true })
  estimatedCompletionTime: number; // minutes

  @Column({ name: 'learning_objectives', type: 'text', nullable: true })
  learningObjectives: string;

  @Column({ name: 'prerequisites', type: 'text', nullable: true })
  prerequisites: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    version: string;
    checksum: string;
    encoding: string;
    compression: string;
    quality: string;
    resolution?: string;
    bitrate?: number;
    frameRate?: number;
    aspectRatio?: string;
    codec?: string;
    source: string;
    externalId?: string;
    integrationData?: any;
  };

  @Column({ name: 'publish_date', type: 'timestamp', nullable: true })
  publishDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_downloadable', type: 'boolean', default: true })
  isDownloadable: boolean;

  @Column({ name: 'requires_authentication', type: 'boolean', default: true })
  requiresAuthentication: boolean;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'rating_average', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAverage: number;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ name: 'review_status', type: 'varchar', length: 50, nullable: true })
  reviewStatus: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be implemented when other entities are created)
  // @OneToMany(() => ContentVersion, version => version.content)
  // versions: ContentVersion[];

  // @OneToMany(() => StudentProgress, progress => progress.content)
  // studentProgress: StudentProgress[];

  // @OneToMany(() => LearningAnalytics, analytics => analytics.content)
  // analytics: LearningAnalytics[];
}