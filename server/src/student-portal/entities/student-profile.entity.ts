import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum StudentGradeLevel {
  PRESCHOOL = 'preschool',
  KINDERGARTEN = 'kindergarten',
  ELEMENTARY = 'elementary',
  MIDDLE_SCHOOL = 'middle_school',
  HIGH_SCHOOL = 'high_school',
  COLLEGE_PREP = 'college_prep',
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
}

export enum PersonalityType {
  INTROVERT = 'introvert',
  EXTROVERT = 'extrovert',
  AMBIVERT = 'ambivert',
}

@Entity('student_profiles')
@Index(['portalAccessId', 'schoolId'])
@Index(['gradeLevel', 'schoolId'])
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'portal_access_id', type: 'uuid' })
  portalAccessId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'grade_level',
    type: 'enum',
    enum: StudentGradeLevel,
  })
  gradeLevel: StudentGradeLevel;

  @Column({ name: 'current_gpa', type: 'decimal', precision: 3, scale: 2, nullable: true })
  currentGPA: number;

  @Column({ name: 'academic_standing', type: 'varchar', length: 50, default: 'good_standing' })
  academicStanding: string;

  @Column({
    name: 'learning_style',
    type: 'enum',
    enum: LearningStyle,
    nullable: true,
  })
  learningStyle: LearningStyle;

  @Column({
    name: 'personality_type',
    type: 'enum',
    enum: PersonalityType,
    nullable: true,
  })
  personalityType: PersonalityType;

  @Column({ name: 'strengths', type: 'simple-array', nullable: true })
  strengths: string[];

  @Column({ name: 'challenges', type: 'simple-array', nullable: true })
  challenges: string[];

  @Column({ name: 'interests', type: 'simple-array', nullable: true })
  interests: string[];

  @Column({ name: 'hobbies', type: 'simple-array', nullable: true })
  hobbies: string[];

  @Column({ name: 'favorite_subjects', type: 'simple-array', nullable: true })
  favoriteSubjects: string[];

  @Column({ name: 'career_aspirations', type: 'simple-array', nullable: true })
  careerAspirations: string[];

  @Column({ name: 'learning_goals', type: 'jsonb', nullable: true })
  learningGoals: {
    shortTerm: string[];
    longTerm: string[];
    academic: string[];
    personal: string[];
  };

  @Column({ name: 'preferred_study_times', type: 'simple-array', nullable: true })
  preferredStudyTimes: string[];

  @Column({ name: 'study_environment', type: 'jsonb', nullable: true })
  studyEnvironment: {
    quietSpace: boolean;
    groupStudy: boolean;
    backgroundMusic: boolean;
    naturalLight: boolean;
    ergonomicSetup: boolean;
  };

  @Column({ name: 'digital_skills', type: 'jsonb', nullable: true })
  digitalSkills: {
    basicComputer: number;      // 1-10 scale
    internetSafety: number;
    researchSkills: number;
    presentationSkills: number;
    codingBasics: number;
    digitalArt: number;
  };

  @Column({ name: 'social_skills', type: 'jsonb', nullable: true })
  socialSkills: {
    communication: number;      // 1-10 scale
    teamwork: number;
    leadership: number;
    conflictResolution: number;
    empathy: number;
    publicSpeaking: number;
  };

  @Column({ name: 'emotional_intelligence', type: 'jsonb', nullable: true })
  emotionalIntelligence: {
    selfAwareness: number;      // 1-10 scale
    selfRegulation: number;
    motivation: number;
    empathy: number;
    socialSkills: number;
  };

  @Column({ name: 'time_management', type: 'jsonb', nullable: true })
  timeManagement: {
    punctuality: number;        // 1-10 scale
    organization: number;
    prioritization: number;
    deadlineMeeting: number;
    procrastinationLevel: number;
  };

  @Column({ name: 'health_wellness', type: 'jsonb', nullable: true })
  healthWellness: {
    sleepHours: number;
    exerciseFrequency: string;
    stressLevel: number;        // 1-10 scale
    nutritionHabits: string;
    mentalHealth: number;
  };

  @Column({ name: 'extracurricular_interests', type: 'jsonb', nullable: true })
  extracurricularInterests: {
    sports: string[];
    arts: string[];
    clubs: string[];
    volunteering: string[];
    leadership: string[];
  };

  @Column({ name: 'technology_usage', type: 'jsonb', nullable: true })
  technologyUsage: {
    dailyScreenTime: number;    // minutes
    educationalApps: string[];
    gamingPreferences: string[];
    socialMedia: string[];
    onlineSafety: number;       // 1-10 scale
  };

  @Column({ name: 'parent_communication', type: 'jsonb', nullable: true })
  parentCommunication: {
    preferredContactMethod: string;
    updateFrequency: string;
    involvementLevel: string;
    emergencyContacts: string[];
  };

  @Column({ name: 'accessibility_needs', type: 'jsonb', nullable: true })
  accessibilityNeeds: {
    visualImpairment: boolean;
    hearingImpairment: boolean;
    mobilityIssues: boolean;
    learningDisabilities: string[];
    accommodations: string[];
  };

  @Column({ name: 'cultural_background', type: 'jsonb', nullable: true })
  culturalBackground: {
    primaryLanguage: string;
    languagesSpoken: string[];
    culturalTraditions: string[];
    religiousObservances: string[];
    dietaryRestrictions: string[];
  };

  @Column({ name: 'motivation_level', type: 'decimal', precision: 3, scale: 2, default: 7.0 })
  motivationLevel: number; // 1.0 to 10.0 scale

  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, default: 7.0 })
  confidenceLevel: number; // 1.0 to 10.0 scale

  @Column({ name: 'growth_mindset_score', type: 'decimal', precision: 3, scale: 2, default: 7.0 })
  growthMindsetScore: number; // 1.0 to 10.0 scale

  @Column({ name: 'last_profile_update', type: 'timestamp', nullable: true })
  lastProfileUpdate: Date;

  @Column({ name: 'profile_completion_percentage', type: 'int', default: 0 })
  profileCompletionPercentage: number; // 0-100

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess)
  @JoinColumn({ name: 'portal_access_id' })
  portalAccess: StudentPortalAccess;

}