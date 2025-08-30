import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum AchievementType {
  ACADEMIC = 'academic',
  SPORTS = 'sports',
  ARTS = 'arts',
  CULTURAL = 'cultural',
  LEADERSHIP = 'leadership',
  COMMUNITY_SERVICE = 'community_service',
  INNOVATION = 'innovation',
  SPECIAL_RECOGNITION = 'special_recognition',
  COMPETITION = 'competition',
  CERTIFICATION = 'certification',
  AWARD = 'award',
  SCHOLARSHIP = 'scholarship',
  OTHER = 'other',
}

export enum AchievementLevel {
  SCHOOL = 'school',
  DISTRICT = 'district',
  STATE = 'state',
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
  REGIONAL = 'regional',
}

export enum AchievementStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REVOKED = 'revoked',
}

@Entity('student_achievements')
@Index(['studentId', 'achievementType'])
@Index(['studentId', 'achievementDate'])
@Index(['achievementType', 'achievementLevel'])
@Index(['status', 'achievementDate'])
export class StudentAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'achievement_type',
    type: 'enum',
    enum: AchievementType,
  })
  achievementType: AchievementType;

  @Column({ name: 'achievement_title', type: 'varchar', length: 200 })
  achievementTitle: string;

  @Column({ name: 'achievement_description', type: 'text' })
  achievementDescription: string;

  @Column({
    name: 'achievement_level',
    type: 'enum',
    enum: AchievementLevel,
    default: AchievementLevel.SCHOOL,
  })
  achievementLevel: AchievementLevel;

  @Column({
    type: 'enum',
    enum: AchievementStatus,
    default: AchievementStatus.PENDING,
  })
  status: AchievementStatus;

  @Column({ name: 'achievement_date', type: 'timestamp' })
  achievementDate: Date;

  @Column({ name: 'announcement_date', type: 'timestamp', nullable: true })
  announcementDate: Date;

  @Column({ name: 'event_name', type: 'varchar', length: 200, nullable: true })
  eventName: string;

  @Column({ name: 'event_organizer', type: 'varchar', length: 200, nullable: true })
  eventOrganizer: string;

  @Column({ name: 'competition_name', type: 'varchar', length: 200, nullable: true })
  competitionName: string;

  @Column({ name: 'position_rank', type: 'varchar', length: 50, nullable: true })
  positionRank: string; // e.g., '1st Place', 'Gold Medal', 'Winner'

  @Column({ name: 'participants_count', type: 'int', nullable: true })
  participantsCount: number;

  @Column({ name: 'prize_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  prizeAmount: number;

  @Column({ name: 'prize_currency', type: 'varchar', length: 3, default: 'USD' })
  prizeCurrency: string;

  @Column({ name: 'prize_description', type: 'text', nullable: true })
  prizeDescription: string;

  // Certificate Information
  @Column({ name: 'certificate_issued', type: 'boolean', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_number', type: 'varchar', length: 100, nullable: true })
  certificateNumber: string;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl: string;

  @Column({ name: 'certificate_issue_date', type: 'timestamp', nullable: true })
  certificateIssueDate: Date;

  // Verification Information
  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_by_name', type: 'varchar', length: 100, nullable: true })
  verifiedByName: string;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ name: 'verification_method', type: 'varchar', length: 50, nullable: true })
  verificationMethod: string;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string;

  // Supporting Documents
  @Column({ name: 'supporting_documents', type: 'jsonb', default: [] })
  supportingDocuments: Array<{
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadDate: Date;
  }>;

  // Recognition and Impact
  @Column({ name: 'recognition_level', type: 'varchar', length: 50, nullable: true })
  recognitionLevel: string;

  @Column({ name: 'impact_description', type: 'text', nullable: true })
  impactDescription: string;

  @Column({ name: 'school_impact', type: 'text', nullable: true })
  schoolImpact: string;

  @Column({ name: 'community_impact', type: 'text', nullable: true })
  communityImpact: string;

  // Academic Year and Grade
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @Column({ name: 'section', type: 'varchar', length: 20, nullable: true })
  section: string;

  // Publication and Sharing
  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'publish_on_website', type: 'boolean', default: true })
  publishOnWebsite: boolean;

  @Column({ name: 'publish_in_newsletter', type: 'boolean', default: false })
  publishInNewsletter: boolean;

  @Column({ name: 'share_with_parents', type: 'boolean', default: true })
  shareWithParents: boolean;

  @Column({ name: 'share_with_community', type: 'boolean', default: false })
  shareWithCommunity: boolean;

  // Social Media and External Recognition
  @Column({ name: 'social_media_posted', type: 'boolean', default: false })
  socialMediaPosted: boolean;

  @Column({ name: 'social_media_urls', type: 'jsonb', default: [] })
  socialMediaUrls: Array<{
    platform: string;
    url: string;
    postDate: Date;
  }>;

  // Follow-up and Long-term Tracking
  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ name: 'long_term_impact', type: 'text', nullable: true })
  longTermImpact: string;

  // Metadata and Additional Information
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    priority?: 'low' | 'normal' | 'high';
    featured?: boolean;
    pressCoverage?: Array<{
      publication: string;
      date: Date;
      url?: string;
    }>;
    relatedAchievements?: string[];
    skillsDemonstrated?: string[];
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