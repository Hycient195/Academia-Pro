import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum CareerInterestLevel {
  NOT_INTERESTED = 'not_interested',
  SLIGHTLY_INTERESTED = 'slightly_interested',
  MODERATELY_INTERESTED = 'moderately_interested',
  VERY_INTERESTED = 'very_interested',
  HIGHLY_INTERESTED = 'highly_interested',
}

export enum CareerReadinessLevel {
  EXPLORING = 'exploring',
  LEARNING = 'learning',
  BUILDING_SKILLS = 'building_skills',
  GAINING_EXPERIENCE = 'gaining_experience',
  PREPARING_APPLICATIONS = 'preparing_applications',
  READY_TO_APPLY = 'ready_to_apply',
}

export enum PreferredWorkEnvironment {
  OFFICE = 'office',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  OUTDOOR = 'outdoor',
  LABORATORY = 'laboratory',
  CLASSROOM = 'classroom',
  HOSPITAL = 'hospital',
  CREATIVE_STUDIO = 'creative_studio',
  FACTORY = 'factory',
  RETAIL = 'retail',
}

@Entity('student_career_profiles')
@Index(['studentPortalAccessId'])
@Index(['academicYear', 'gradeLevel'])
export class StudentCareerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 20 })
  gradeLevel: string;

  @Column({
    name: 'career_readiness_level',
    type: 'enum',
    enum: CareerReadinessLevel,
    default: CareerReadinessLevel.EXPLORING,
  })
  careerReadinessLevel: CareerReadinessLevel;

  @Column({ name: 'career_interests', type: 'jsonb', nullable: true })
  careerInterests: Array<{
    careerField: string;
    interestLevel: CareerInterestLevel;
    reasons: string[];
    skillsRequired: string[];
  }>;

  @Column({ name: 'preferred_work_environments', type: 'jsonb', nullable: true })
  preferredWorkEnvironments: PreferredWorkEnvironment[];

  @Column({ name: 'work_values', type: 'jsonb', nullable: true })
  workValues: Array<{
    value: string;
    importance: 'low' | 'medium' | 'high';
    description: string;
  }>;

  @Column({ name: 'skills_assessment', type: 'jsonb', nullable: true })
  skillsAssessment: {
    technicalSkills: Array<{
      skillName: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      experience: string;
    }>;
    softSkills: Array<{
      skillName: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      examples: string[];
    }>;
    languages: Array<{
      language: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';
      certification?: string;
    }>;
  };

  @Column({ name: 'career_assessments_taken', type: 'jsonb', nullable: true })
  careerAssessmentsTaken: Array<{
    assessmentName: string;
    assessmentDate: Date;
    results: Record<string, any>;
    recommendations: string[];
    counselorNotes: string;
  }>;

  @Column({ name: 'career_goals', type: 'jsonb', nullable: true })
  careerGoals: Array<{
    goalType: 'short_term' | 'medium_term' | 'long_term';
    goalDescription: string;
    targetDate: Date;
    actionSteps: string[];
    progress: number; // percentage
    status: 'active' | 'completed' | 'cancelled';
  }>;

  @Column({ name: 'college_university_interests', type: 'jsonb', nullable: true })
  collegeUniversityInterests: Array<{
    institutionName: string;
    programOfInterest: string;
    location: string;
    applicationStatus: 'interested' | 'applied' | 'accepted' | 'rejected' | 'enrolled';
    applicationDeadline?: Date;
    notes: string;
  }>;

  @Column({ name: 'internship_experiences', type: 'jsonb', nullable: true })
  internshipExperiences: Array<{
    companyName: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    responsibilities: string[];
    skillsGained: string[];
    supervisorName: string;
    supervisorContact: string;
    performanceRating?: number;
    recommendationLetter?: boolean;
  }>;

  @Column({ name: 'volunteer_experiences', type: 'jsonb', nullable: true })
  volunteerExperiences: Array<{
    organizationName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    hoursPerWeek: number;
    responsibilities: string[];
    skillsDeveloped: string[];
    impact: string;
  }>;

  @Column({ name: 'certifications_achievements', type: 'jsonb', nullable: true })
  certificationsAchievements: Array<{
    certificationName: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId: string;
    verificationUrl?: string;
    skillsDemonstrated: string[];
  }>;

  @Column({ name: 'career_counseling_sessions', type: 'jsonb', nullable: true })
  careerCounselingSessions: Array<{
    sessionDate: Date;
    counselorName: string;
    sessionType: string;
    topicsDiscussed: string[];
    actionItems: string[];
    followUpDate?: Date;
    notes: string;
  }>;

  @Column({ name: 'industry_exposure', type: 'jsonb', nullable: true })
  industryExposure: Array<{
    industryName: string;
    exposureType: 'visit' | 'webinar' | 'workshop' | 'project' | 'internship';
    date: Date;
    organization: string;
    keyLearnings: string[];
    contactsMade: Array<{
      name: string;
      position: string;
      contactInfo: string;
    }>;
  }>;

  @Column({ name: 'career_resources_accessed', type: 'jsonb', nullable: true })
  careerResourcesAccessed: Array<{
    resourceType: string;
    resourceName: string;
    accessDate: Date;
    completionStatus: 'started' | 'in_progress' | 'completed';
    timeSpent: number; // minutes
    rating?: number; // 1-5 scale
    notes: string;
  }>;

  @Column({ name: 'future_plans', type: 'jsonb', nullable: true })
  futurePlans: {
    postSecondaryEducation: {
      planned: boolean;
      preferredType: 'university' | 'college' | 'technical_school' | 'trade_school' | 'other';
      preferredField: string;
      targetCountries: string[];
      budgetConsiderations: string;
    };
    gapYear: {
      planned: boolean;
      activities: string[];
      duration: number; // months
    };
    entrepreneurship: {
      interested: boolean;
      businessIdeas: string[];
      skillsNeeded: string[];
    };
  };

  @Column({ name: 'career_counselor_id', type: 'uuid', nullable: true })
  careerCounselorId: string;

  @Column({ name: 'career_counselor_name', type: 'varchar', length: 100, nullable: true })
  careerCounselorName: string;

  @Column({ name: 'last_counseling_session', type: 'timestamp', nullable: true })
  lastCounselingSession: Date;

  @Column({ name: 'next_counseling_session', type: 'timestamp', nullable: true })
  nextCounselingSession: Date;

  @Column({ name: 'profile_completion_percentage', type: 'int', default: 0 })
  profileCompletionPercentage: number;

  @Column({ name: 'last_updated_by', type: 'varchar', length: 100, nullable: true })
  lastUpdatedBy: string;

  @Column({ name: 'last_updated_by_role', type: 'varchar', length: 50, nullable: true })
  lastUpdatedByRole: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}