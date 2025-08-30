import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../student.entity';

export enum AlumniStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  CONTACT_LOST = 'contact_lost',
}

export enum GraduationType {
  REGULAR = 'regular',
  EARLY = 'early',
  LATE = 'late',
  CONDITIONAL = 'conditional',
  HONORS = 'honors',
  VALEDICTORIAN = 'valedictorian',
  SALUTATORIAN = 'salutatorian',
}

@Entity('student_alumni')
@Index(['studentId'])
@Index(['graduationYear', 'status'])
@Index(['email'])
@Index(['contactNumber'])
export class StudentAlumni {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    type: 'enum',
    enum: AlumniStatus,
    default: AlumniStatus.ACTIVE,
  })
  status: AlumniStatus;

  // Graduation Information
  @Column({ name: 'graduation_date', type: 'timestamp' })
  graduationDate: Date;

  @Column({ name: 'graduation_year', type: 'int' })
  graduationYear: number;

  @Column({
    name: 'graduation_type',
    type: 'enum',
    enum: GraduationType,
    default: GraduationType.REGULAR,
  })
  graduationType: GraduationType;

  @Column({ name: 'graduation_gpa', type: 'decimal', precision: 5, scale: 2, nullable: true })
  graduationGPA: number;

  @Column({ name: 'graduation_rank', type: 'int', nullable: true })
  graduationRank: number;

  @Column({ name: 'class_size', type: 'int', nullable: true })
  classSize: number;

  @Column({ name: 'valedictorian_speech', type: 'boolean', default: false })
  valedictorianSpeech: boolean;

  // Academic Achievements
  @Column({ name: 'academic_honors', type: 'jsonb', default: [] })
  academicHonors: Array<{
    honorType: string;
    honorName: string;
    awardDate: Date;
    description: string;
  }>;

  @Column({ name: 'extracurricular_achievements', type: 'jsonb', default: [] })
  extracurricularAchievements: Array<{
    activityType: string;
    achievement: string;
    date: Date;
    description: string;
  }>;

  // Post-Graduation Information
  @Column({ name: 'higher_education', type: 'jsonb', default: [] })
  higherEducation: Array<{
    institutionName: string;
    program: string;
    degree: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
    status: 'enrolled' | 'graduated' | 'withdrawn' | 'transferred';
  }>;

  @Column({ name: 'career_information', type: 'jsonb', nullable: true })
  careerInformation: {
    currentOccupation: string;
    companyName: string;
    jobTitle: string;
    industry: string;
    startDate: Date;
    salaryRange?: string;
    careerSatisfaction: number; // 1-10 scale
  };

  @Column({ name: 'professional_achievements', type: 'jsonb', default: [] })
  professionalAchievements: Array<{
    achievementType: string;
    achievementName: string;
    date: Date;
    description: string;
  }>;

  // Contact Information
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'contact_number', type: 'varchar', length: 20, nullable: true })
  contactNumber: string;

  @Column({ name: 'alternate_contact', type: 'varchar', length: 20, nullable: true })
  alternateContact: string;

  @Column({ name: 'current_address', type: 'jsonb', nullable: true })
  currentAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ name: 'social_media_profiles', type: 'jsonb', default: [] })
  socialMediaProfiles: Array<{
    platform: string;
    username: string;
    profileUrl: string;
  }>;

  // Engagement and Involvement
  @Column({ name: 'alumni_association_member', type: 'boolean', default: false })
  alumniAssociationMember: boolean;

  @Column({ name: 'volunteer_activities', type: 'jsonb', default: [] })
  volunteerActivities: Array<{
    activityName: string;
    organization: string;
    date: Date;
    description: string;
  }>;

  @Column({ name: 'mentorship_programs', type: 'jsonb', default: [] })
  mentorshipPrograms: Array<{
    programName: string;
    role: 'mentor' | 'mentee';
    startDate: Date;
    endDate?: Date;
    description: string;
  }>;

  @Column({ name: 'school_events_attended', type: 'jsonb', default: [] })
  schoolEventsAttended: Array<{
    eventName: string;
    eventDate: Date;
    eventType: string;
    description: string;
  }>;

  // Donations and Contributions
  @Column({ name: 'donations_made', type: 'jsonb', default: [] })
  donationsMade: Array<{
    donationType: string;
    amount: number;
    currency: string;
    date: Date;
    purpose: string;
  }>;

  @Column({ name: 'scholarships_established', type: 'jsonb', default: [] })
  scholarshipsEstablished: Array<{
    scholarshipName: string;
    amount: number;
    currency: string;
    establishmentDate: Date;
    description: string;
  }>;

  // Communication Preferences
  @Column({ name: 'communication_preferences', type: 'jsonb', default: {} })
  communicationPreferences: {
    emailNewsletter: boolean;
    eventInvitations: boolean;
    surveyParticipation: boolean;
    mentorshipOpportunities: boolean;
    fundraisingAppeals: boolean;
    preferredContactMethod: 'email' | 'phone' | 'mail';
  };

  // Last Contact Information
  @Column({ name: 'last_contact_date', type: 'timestamp', nullable: true })
  lastContactDate: Date;

  @Column({ name: 'last_contact_method', type: 'varchar', length: 50, nullable: true })
  lastContactMethod: string;

  @Column({ name: 'last_contact_notes', type: 'text', nullable: true })
  lastContactNotes: string;

  // Survey and Feedback
  @Column({ name: 'survey_responses', type: 'jsonb', default: [] })
  surveyResponses: Array<{
    surveyName: string;
    surveyDate: Date;
    responses: Record<string, any>;
  }>;

  @Column({ name: 'feedback_provided', type: 'jsonb', default: [] })
  feedbackProvided: Array<{
    feedbackType: string;
    feedbackDate: Date;
    feedbackContent: string;
    response?: string;
  }>;

  // Metadata
  @Column({ name: 'notable_alumni', type: 'boolean', default: false })
  notableAlumni: boolean;

  @Column({ name: 'featured_in_newsletter', type: 'boolean', default: false })
  featuredInNewsletter: boolean;

  @Column({ name: 'hall_of_fame', type: 'boolean', default: false })
  hallOfFame: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    categories?: string[];
    specialNotes?: string;
    legacyInformation?: string;
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