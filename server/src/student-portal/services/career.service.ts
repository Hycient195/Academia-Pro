import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentCareerProfile } from '../entities/student-career-profile.entity';
import { StudentActivityLog, StudentActivityType } from '../entities/student-activity-log.entity';

export interface CareerProfileDto {
  careerInterests: string[];
  preferredIndustries: string[];
  workValues: string[];
  skills: Array<{
    skillName: string;
    proficiency: number; // 1-5
    category: string;
  }>;
  longTermGoals: string;
  shortTermGoals: string[];
  assessmentResults?: {
    personalityType?: string;
    strengths?: string[];
    areasForDevelopment?: string[];
    recommendedCareers?: string[];
  };
  lastUpdated: Date;
}

export interface CareerAssessmentDto {
  id: string;
  title: string;
  description: string;
  type: 'personality' | 'skills' | 'interests' | 'values';
  estimatedTime: number; // minutes
  questionsCount: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}

export interface CareerGoalDto {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'skills' | 'experience' | 'networking' | 'personal';
  targetDate: Date;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'cancelled';
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
    completedAt?: Date;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

export interface CollegeDto {
  id: string;
  name: string;
  location: string;
  type: 'public' | 'private' | 'community';
  ranking?: number;
  tuition: {
    inState?: number;
    outOfState?: number;
    average: number;
  };
  acceptanceRate?: number;
  programs: string[];
  size: 'small' | 'medium' | 'large';
  website?: string;
  matchScore?: number; // 0-100 based on student profile
  isFavorite: boolean;
}

export interface CareerOpportunityDto {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'part_time' | 'volunteer' | 'research';
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  applicationDeadline?: Date;
  compensation?: string;
  duration?: string;
  matchScore?: number; // 0-100 based on student profile
  applicationStatus?: 'not_applied' | 'applied' | 'interviewing' | 'accepted' | 'rejected';
}

@Injectable()
export class StudentPortalCareerService {
  private readonly logger = new Logger(StudentPortalCareerService.name);

  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
    @InjectRepository(StudentCareerProfile)
    private careerProfileRepository: Repository<StudentCareerProfile>,
    @InjectRepository(StudentActivityLog)
    private activityLogRepository: Repository<StudentActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getCareerProfile(studentId: string): Promise<CareerProfileDto> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // Get or create career profile
    let careerProfile = await this.careerProfileRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
    });

    if (!careerProfile) {
      // Create default profile
      careerProfile = this.careerProfileRepository.create({
        studentPortalAccessId: portalAccess.id,
        academicYear: '2024-2025',
        gradeLevel: portalAccess.gradeLevel,
        careerInterests: [],
        preferredWorkEnvironments: [],
        workValues: [],
        skillsAssessment: {
          technicalSkills: [],
          softSkills: [],
          languages: [],
        },
        careerAssessmentsTaken: [],
        careerGoals: [],
        collegeUniversityInterests: [],
        internshipExperiences: [],
        volunteerExperiences: [],
        certificationsAchievements: [],
        careerCounselingSessions: [],
        industryExposure: [],
        careerResourcesAccessed: [],
        futurePlans: {
          postSecondaryEducation: {
            planned: false,
            preferredType: 'university',
            preferredField: '',
            targetCountries: [],
            budgetConsiderations: '',
          },
          gapYear: {
            planned: false,
            activities: [],
            duration: 0,
          },
          entrepreneurship: {
            interested: false,
            businessIdeas: [],
            skillsNeeded: [],
          },
        },
        profileCompletionPercentage: 0,
      });

      careerProfile = await this.careerProfileRepository.save(careerProfile);
    }

    return {
      careerInterests: careerProfile.careerInterests?.map(ci => ci.careerField) || [],
      preferredIndustries: careerProfile.preferredWorkEnvironments || [],
      workValues: careerProfile.workValues?.map(wv => wv.value) || [],
      skills: [
        ...(careerProfile.skillsAssessment?.technicalSkills?.map(skill => ({
          skillName: skill.skillName,
          proficiency: this.skillProficiencyToNumber(skill.proficiency),
          category: 'technical',
        })) || []),
        ...(careerProfile.skillsAssessment?.softSkills?.map(skill => ({
          skillName: skill.skillName,
          proficiency: this.skillProficiencyToNumber(skill.proficiency),
          category: 'soft',
        })) || []),
      ],
      longTermGoals: careerProfile.careerGoals?.find(cg => cg.goalType === 'long_term')?.goalDescription || '',
      shortTermGoals: careerProfile.careerGoals?.filter(cg => cg.goalType === 'short_term').map(cg => cg.goalDescription) || [],
      assessmentResults: careerProfile.careerAssessmentsTaken?.[0]?.results,
      lastUpdated: careerProfile.updatedAt || careerProfile.createdAt,
    };
  }

  async updateCareerProfile(studentId: string, profileData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // Get or create career profile
    let careerProfile = await this.careerProfileRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
    });

    if (!careerProfile) {
      careerProfile = this.careerProfileRepository.create({
        studentPortalAccessId: portalAccess.id,
        academicYear: '2024-2025',
        gradeLevel: portalAccess.gradeLevel,
        careerInterests: [],
        preferredWorkEnvironments: [],
        workValues: [],
        skillsAssessment: {
          technicalSkills: [],
          softSkills: [],
          languages: [],
        },
        careerAssessmentsTaken: [],
        careerGoals: [],
        collegeUniversityInterests: [],
        internshipExperiences: [],
        volunteerExperiences: [],
        certificationsAchievements: [],
        careerCounselingSessions: [],
        industryExposure: [],
        careerResourcesAccessed: [],
        futurePlans: {
          postSecondaryEducation: {
            planned: false,
            preferredType: 'university',
            preferredField: '',
            targetCountries: [],
            budgetConsiderations: '',
          },
          gapYear: {
            planned: false,
            activities: [],
            duration: 0,
          },
          entrepreneurship: {
            interested: false,
            businessIdeas: [],
            skillsNeeded: [],
          },
        },
        profileCompletionPercentage: 0,
      });
    }

    // Update profile data
    Object.assign(careerProfile, {
      careerInterests: profileData.careerInterests,
      preferredIndustries: profileData.preferredIndustries,
      workValues: profileData.workValues,
      skills: profileData.skills,
      longTermGoals: profileData.longTermGoals,
      shortTermGoals: profileData.shortTermGoals,
    });

    const savedProfile = await this.careerProfileRepository.save(careerProfile);

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: 'Updated career profile',
      resourceType: 'career_profile',
      metadata: { updatedFields: Object.keys(profileData) },
    } as any);

    return {
      success: true,
      message: 'Career profile updated successfully',
      lastUpdated: savedProfile.updatedAt,
    };
  }

  async getCareerAssessments(studentId: string): Promise<CareerAssessmentDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement assessment retrieval from database
    // For now, return mock assessments
    return [
      {
        id: 'assessment-001',
        title: 'Career Interest Assessment',
        description: 'Discover your career interests and personality type',
        type: 'interests',
        estimatedTime: 15,
        questionsCount: 60,
        status: 'not_started',
      },
      {
        id: 'assessment-002',
        title: 'Skills Assessment',
        description: 'Evaluate your current skills and areas for development',
        type: 'skills',
        estimatedTime: 20,
        questionsCount: 80,
        status: 'not_started',
      },
      {
        id: 'assessment-003',
        title: 'Work Values Assessment',
        description: 'Identify what matters most to you in a career',
        type: 'values',
        estimatedTime: 10,
        questionsCount: 40,
        status: 'not_started',
      },
    ];
  }

  async startCareerAssessment(studentId: string, assessmentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement assessment session creation

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Started career assessment ${assessmentId}`,
      resourceType: 'assessment',
      metadata: { assessmentId },
    } as any);

    return {
      id: 'session-' + Date.now(),
      assessmentId,
      startedAt: new Date(),
      status: 'in_progress',
      questions: [], // TODO: Return assessment questions
    };
  }

  async submitCareerAssessment(
    studentId: string,
    assessmentId: string,
    submissionData: {
      answers: Array<{
        questionId: string;
        answer: string;
        score: number;
      }>;
      timeSpent?: number;
    },
  ): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // Calculate assessment score
    const totalScore = submissionData.answers.reduce((sum, answer) => sum + answer.score, 0);
    const maxScore = submissionData.answers.length * 5; // Assuming 5-point scale
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    // TODO: Generate assessment results based on answers
    const results = {
      personalityType: 'Analytical Thinker',
      strengths: ['Problem Solving', 'Data Analysis', 'Logical Reasoning'],
      areasForDevelopment: ['Public Speaking', 'Team Leadership'],
      recommendedCareers: ['Software Developer', 'Data Analyst', 'Research Scientist'],
    };

    // Update career profile with results
    const careerProfile = await this.careerProfileRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
    });

    if (careerProfile) {
      const assessmentRecord = {
        assessmentName: assessmentId,
        assessmentDate: new Date(),
        results,
        recommendations: [], // TODO: Generate recommendations based on results
        counselorNotes: '',
      };

      careerProfile.careerAssessmentsTaken = careerProfile.careerAssessmentsTaken || [];
      careerProfile.careerAssessmentsTaken.push(assessmentRecord);
      await this.careerProfileRepository.save(careerProfile);
    }

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Completed career assessment ${assessmentId}`,
      resourceType: 'assessment',
      metadata: {
        assessmentId,
        score: percentageScore,
        timeSpent: submissionData.timeSpent,
      },
    } as any);

    return {
      assessmentId,
      score: percentageScore,
      results,
      completedAt: new Date(),
      message: 'Assessment completed successfully',
    };
  }

  async getAssessmentResults(studentId: string, assessmentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Assessment results not found');
    }

    // Get career profile with results
    const careerProfile = await this.careerProfileRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
    });

    if (!careerProfile || !careerProfile.careerAssessmentsTaken || careerProfile.careerAssessmentsTaken.length === 0) {
      throw new Error('Assessment results not found');
    }

    const latestAssessment = careerProfile.careerAssessmentsTaken[careerProfile.careerAssessmentsTaken.length - 1];

    return {
      assessmentId,
      results: latestAssessment.results,
      generatedAt: careerProfile.updatedAt,
    };
  }

  async getCareerGoals(studentId: string): Promise<CareerGoalDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement career goals retrieval
    return [
      {
        id: 'goal-001',
        title: 'Complete Computer Science Certification',
        description: 'Finish online CS certification course',
        category: 'education',
        targetDate: new Date('2025-06-30'),
        progress: 65,
        status: 'active',
        milestones: [
          {
            id: 'milestone-001',
            title: 'Complete Python Basics',
            description: 'Finish Python programming fundamentals',
            dueDate: new Date('2024-12-31'),
            completed: true,
            completedAt: new Date('2024-12-15'),
          },
          {
            id: 'milestone-002',
            title: 'Build Portfolio Project',
            description: 'Create a web application project',
            dueDate: new Date('2025-03-31'),
            completed: false,
          },
        ],
        priority: 'high',
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-12-20'),
      },
    ];
  }

  async createCareerGoal(studentId: string, goalData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement career goal creation

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Created career goal: ${goalData.title}`,
      resourceType: 'career_goal',
      metadata: {
        goalTitle: goalData.title,
        category: goalData.category,
        targetDate: goalData.targetDate,
      },
    } as any);

    return {
      id: 'goal-' + Date.now(),
      status: 'created',
      createdAt: new Date(),
      message: 'Career goal created successfully',
    };
  }

  async updateGoalProgress(studentId: string, goalId: string, progressData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement goal progress update

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Updated progress for goal ${goalId}`,
      resourceType: 'career_goal',
      metadata: {
        goalId,
        progress: progressData.progress,
      },
    } as any);

    return {
      success: true,
      message: 'Goal progress updated successfully',
      updatedAt: new Date(),
    };
  }

  async getCollegeRecommendations(studentId: string): Promise<CollegeDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      return [];
    }

    // TODO: Implement personalized college recommendations based on student profile
    return [
      {
        id: 'college-001',
        name: 'State University',
        location: 'Local City, State',
        type: 'public',
        ranking: 150,
        tuition: {
          inState: 8000,
          outOfState: 25000,
          average: 12000,
        },
        acceptanceRate: 75,
        programs: ['Computer Science', 'Engineering', 'Business'],
        size: 'large',
        website: 'https://www.stateuniversity.edu',
        matchScore: 85,
        isFavorite: false,
      },
      {
        id: 'college-002',
        name: 'Liberal Arts College',
        location: 'Nearby City, State',
        type: 'private',
        ranking: 80,
        tuition: {
          average: 45000,
        },
        acceptanceRate: 45,
        programs: ['Psychology', 'English', 'Biology'],
        size: 'medium',
        website: 'https://www.liberalartscollege.edu',
        matchScore: 78,
        isFavorite: true,
      },
    ];
  }

  async searchColleges(studentId: string, searchCriteria: any): Promise<CollegeDto[]> {
    // TODO: Implement college search with filters
    return this.getCollegeRecommendations(studentId); // Return recommendations for now
  }

  async addCollegeToFavorites(studentId: string, collegeId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement favorites management

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Added college ${collegeId} to favorites`,
      resourceType: 'college',
      metadata: { collegeId },
    } as any);

    return {
      success: true,
      message: 'College added to favorites successfully',
    };
  }

  async getCareerOpportunities(studentId: string): Promise<CareerOpportunityDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement opportunity retrieval based on student profile
    return [
      {
        id: 'opportunity-001',
        title: 'Software Development Intern',
        company: 'Tech Startup Inc.',
        type: 'internship',
        location: 'Remote',
        description: 'Work on real projects with experienced developers',
        requirements: ['Basic programming knowledge', 'Enrolled in CS program'],
        skills: ['JavaScript', 'Python', 'Git'],
        applicationDeadline: new Date('2025-01-15'),
        compensation: '$20/hour',
        duration: '3 months',
        matchScore: 90,
        applicationStatus: 'not_applied',
      },
      {
        id: 'opportunity-002',
        title: 'Research Assistant',
        company: 'University Lab',
        type: 'research',
        location: 'On-campus',
        description: 'Assist in ongoing research projects',
        requirements: ['Strong academic record', 'Relevant coursework'],
        skills: ['Data Analysis', 'Research Methods'],
        applicationDeadline: new Date('2025-02-01'),
        compensation: '$15/hour',
        duration: '6 months',
        matchScore: 85,
        applicationStatus: 'applied',
      },
    ];
  }

  async applyForOpportunity(studentId: string, opportunityId: string, applicationData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement opportunity application

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Applied for opportunity ${opportunityId}`,
      resourceType: 'opportunity',
      metadata: {
        opportunityId,
        applicationData: Object.keys(applicationData),
      },
    } as any);

    return {
      id: 'application-' + Date.now(),
      opportunityId,
      status: 'submitted',
      submittedAt: new Date(),
      message: 'Application submitted successfully',
    };
  }

  async getCounselingSessions(studentId: string): Promise<any[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement counseling session retrieval
    return [
      {
        id: 'session-001',
        counselorName: 'Dr. Sarah Johnson',
        sessionDate: new Date('2024-12-15'),
        topics: ['Career Planning', 'College Applications'],
        status: 'completed',
        notes: 'Discussed college options and career paths',
      },
      {
        id: 'session-002',
        counselorName: 'Dr. Sarah Johnson',
        sessionDate: new Date('2025-01-10'),
        topics: ['Resume Building', 'Interview Skills'],
        status: 'scheduled',
      },
    ];
  }

  async scheduleCounselingAppointment(studentId: string, appointmentData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement appointment scheduling

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: 'Scheduled career counseling appointment',
      resourceType: 'counseling',
      metadata: {
        preferredDate: appointmentData.preferredDate,
        topics: appointmentData.topics,
      },
    } as any);

    return {
      id: 'appointment-' + Date.now(),
      status: 'scheduled',
      scheduledAt: new Date(),
      message: 'Counseling appointment scheduled successfully',
      estimatedConfirmation: 'Within 24 hours',
    };
  }

  async getCareerResources(studentId: string): Promise<any[]> {
    // TODO: Implement personalized resource recommendations
    return [
      {
        id: 'resource-001',
        title: 'Resume Writing Guide',
        type: 'guide',
        category: 'job_search',
        description: 'Complete guide to writing effective resumes',
        url: '/resources/resume-guide',
        tags: ['resume', 'job_search', 'career'],
        difficulty: 'beginner',
        estimatedTime: 30,
      },
      {
        id: 'resource-002',
        title: 'Interview Preparation',
        type: 'video_course',
        category: 'job_search',
        description: 'Master common interview questions and techniques',
        url: '/resources/interview-prep',
        tags: ['interview', 'job_search', 'communication'],
        difficulty: 'intermediate',
        estimatedTime: 120,
      },
      {
        id: 'resource-003',
        title: 'Career Exploration Quiz',
        type: 'interactive',
        category: 'self_assessment',
        description: 'Discover career paths that match your interests',
        url: '/resources/career-quiz',
        tags: ['assessment', 'interests', 'career_planning'],
        difficulty: 'beginner',
        estimatedTime: 15,
      },
    ];
  }

  async trackResourceAccess(studentId: string, resourceId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Accessed career resource ${resourceId}`,
      resourceType: 'career_resource',
      resourceId,
      metadata: { resourceId },
    } as any);

    return {
      success: true,
      message: 'Resource access tracked successfully',
    };
  }

  private skillProficiencyToNumber(proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'): number {
    switch (proficiency) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  }

  private numberToSkillProficiency(value: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (value >= 4) return 'expert';
    if (value >= 3) return 'advanced';
    if (value >= 2) return 'intermediate';
    return 'beginner';
  }
}