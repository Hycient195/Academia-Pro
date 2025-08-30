import { Controller, Get, Post, Put, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';
import { StudentAccessGuard } from '../guards/student-access.guard';
import { StudentPortalCareerService } from '../services/career.service';

@ApiTags('Student Portal - Career')
@Controller('student-portal/career')
@UseGuards(StudentPortalGuard, StudentAccessGuard)
export class StudentPortalCareerController {
  private readonly logger = new Logger(StudentPortalCareerController.name);

  constructor(
    private readonly careerService: StudentPortalCareerService,
  ) {}

  // ==================== CAREER PROFILE ====================

  @Get(':studentId/profile')
  @ApiOperation({
    summary: 'Get career profile',
    description: 'Returns the student\'s career profile including interests, goals, and assessments.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Career profile retrieved successfully',
  })
  async getCareerProfile(@Param('studentId') studentId: string) {
    this.logger.log(`Getting career profile for student ${studentId}`);
    return this.careerService.getCareerProfile(studentId);
  }

  @Put(':studentId/profile')
  @ApiOperation({
    summary: 'Update career profile',
    description: 'Update the student\'s career interests, goals, and preferences.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Career profile update data',
    schema: {
      type: 'object',
      properties: {
        careerInterests: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of career interests',
        },
        preferredIndustries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preferred industries',
        },
        workValues: {
          type: 'array',
          items: { type: 'string' },
          description: 'Important work values (e.g., work-life balance, salary, creativity)',
        },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              proficiency: { type: 'number', minimum: 1, maximum: 5 },
              category: { type: 'string' },
            },
          },
          description: 'Skills and proficiency levels',
        },
        longTermGoals: {
          type: 'string',
          description: 'Long-term career goals',
        },
        shortTermGoals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Short-term career goals',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Career profile updated successfully',
  })
  async updateCareerProfile(
    @Param('studentId') studentId: string,
    @Body() profileData: any,
  ) {
    this.logger.log(`Updating career profile for student ${studentId}`);
    return this.careerService.updateCareerProfile(studentId, profileData);
  }

  // ==================== CAREER ASSESSMENTS ====================

  @Get(':studentId/assessments')
  @ApiOperation({
    summary: 'Get career assessments',
    description: 'Returns completed and available career assessments.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Career assessments retrieved successfully',
  })
  async getCareerAssessments(@Param('studentId') studentId: string) {
    this.logger.log(`Getting career assessments for student ${studentId}`);
    return this.careerService.getCareerAssessments(studentId);
  }

  @Post(':studentId/assessments/:assessmentId/start')
  @ApiOperation({
    summary: 'Start career assessment',
    description: 'Start a new career assessment session.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'assessmentId',
    description: 'Unique identifier of the assessment',
  })
  @ApiResponse({
    status: 201,
    description: 'Career assessment started successfully',
  })
  async startCareerAssessment(
    @Param('studentId') studentId: string,
    @Param('assessmentId') assessmentId: string,
  ) {
    this.logger.log(`Starting career assessment ${assessmentId} for student ${studentId}`);
    return this.careerService.startCareerAssessment(studentId, assessmentId);
  }

  @Post(':studentId/assessments/:assessmentId/submit')
  @ApiOperation({
    summary: 'Submit career assessment',
    description: 'Submit completed assessment answers and get results.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'assessmentId',
    description: 'Unique identifier of the assessment',
  })
  @ApiBody({
    description: 'Assessment answers',
    schema: {
      type: 'object',
      required: ['answers'],
      properties: {
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
              score: { type: 'number' },
            },
          },
          description: 'Array of question answers',
        },
        timeSpent: {
          type: 'number',
          description: 'Time spent on assessment in minutes',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Career assessment submitted successfully',
  })
  async submitCareerAssessment(
    @Param('studentId') studentId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() submissionData: {
      answers: Array<{
        questionId: string;
        answer: string;
        score: number;
      }>;
      timeSpent?: number;
    },
  ) {
    this.logger.log(`Submitting career assessment ${assessmentId} for student ${studentId}`);
    return this.careerService.submitCareerAssessment(studentId, assessmentId, submissionData);
  }

  @Get(':studentId/assessments/:assessmentId/results')
  @ApiOperation({
    summary: 'Get assessment results',
    description: 'Returns detailed results and recommendations from a completed assessment.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'assessmentId',
    description: 'Unique identifier of the assessment',
  })
  @ApiResponse({
    status: 200,
    description: 'Assessment results retrieved successfully',
  })
  async getAssessmentResults(
    @Param('studentId') studentId: string,
    @Param('assessmentId') assessmentId: string,
  ) {
    this.logger.log(`Getting assessment results for ${assessmentId}, student ${studentId}`);
    return this.careerService.getAssessmentResults(studentId, assessmentId);
  }

  // ==================== CAREER GOALS ====================

  @Get(':studentId/goals')
  @ApiOperation({
    summary: 'Get career goals',
    description: 'Returns the student\'s career goals and progress tracking.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Career goals retrieved successfully',
  })
  async getCareerGoals(@Param('studentId') studentId: string) {
    this.logger.log(`Getting career goals for student ${studentId}`);
    return this.careerService.getCareerGoals(studentId);
  }

  @Post(':studentId/goals')
  @ApiOperation({
    summary: 'Create career goal',
    description: 'Create a new career goal with milestones and deadlines.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Career goal data',
    schema: {
      type: 'object',
      required: ['title', 'description', 'targetDate'],
      properties: {
        title: {
          type: 'string',
          description: 'Goal title',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the goal',
        },
        category: {
          type: 'string',
          enum: ['education', 'skills', 'experience', 'networking', 'personal'],
          description: 'Goal category',
        },
        targetDate: {
          type: 'string',
          format: 'date',
          description: 'Target completion date',
        },
        milestones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              dueDate: { type: 'string', format: 'date' },
              completed: { type: 'boolean', default: false },
            },
          },
          description: 'Goal milestones',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Goal priority',
          default: 'medium',
        },
        reminders: {
          type: 'boolean',
          description: 'Enable reminders for this goal',
          default: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Career goal created successfully',
  })
  async createCareerGoal(
    @Param('studentId') studentId: string,
    @Body() goalData: {
      title: string;
      description: string;
      category?: 'education' | 'skills' | 'experience' | 'networking' | 'personal';
      targetDate: Date;
      milestones?: Array<{
        title: string;
        description: string;
        dueDate: Date;
        completed?: boolean;
      }>;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      reminders?: boolean;
    },
  ) {
    this.logger.log(`Creating career goal for student ${studentId}`);
    return this.careerService.createCareerGoal(studentId, goalData);
  }

  @Put(':studentId/goals/:goalId/progress')
  @ApiOperation({
    summary: 'Update goal progress',
    description: 'Update the progress of a specific career goal.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'goalId',
    description: 'Unique identifier of the career goal',
  })
  @ApiBody({
    description: 'Progress update data',
    schema: {
      type: 'object',
      properties: {
        progress: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Progress percentage (0-100)',
        },
        notes: {
          type: 'string',
          description: 'Progress notes or updates',
        },
        milestoneUpdates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              milestoneId: { type: 'string' },
              completed: { type: 'boolean' },
              notes: { type: 'string' },
            },
          },
          description: 'Milestone completion updates',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Goal progress updated successfully',
  })
  async updateGoalProgress(
    @Param('studentId') studentId: string,
    @Param('goalId') goalId: string,
    @Body() progressData: {
      progress?: number;
      notes?: string;
      milestoneUpdates?: Array<{
        milestoneId: string;
        completed: boolean;
        notes?: string;
      }>;
    },
  ) {
    this.logger.log(`Updating progress for goal ${goalId}, student ${studentId}`);
    return this.careerService.updateGoalProgress(studentId, goalId, progressData);
  }

  // ==================== COLLEGE/UNIVERSITY INFORMATION ====================

  @Get(':studentId/colleges')
  @ApiOperation({
    summary: 'Get college recommendations',
    description: 'Returns personalized college and university recommendations based on profile.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'College recommendations retrieved successfully',
  })
  async getCollegeRecommendations(@Param('studentId') studentId: string) {
    this.logger.log(`Getting college recommendations for student ${studentId}`);
    return this.careerService.getCollegeRecommendations(studentId);
  }

  @Get(':studentId/colleges/search')
  @ApiOperation({
    summary: 'Search colleges',
    description: 'Search for colleges and universities based on criteria.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'College search results retrieved successfully',
  })
  async searchColleges(
    @Param('studentId') studentId: string,
    @Body() searchCriteria: {
      location?: string;
      program?: string;
      tuitionRange?: { min: number; max: number };
      rankingRange?: { min: number; max: number };
      size?: 'small' | 'medium' | 'large';
      type?: 'public' | 'private' | 'community';
    },
  ) {
    this.logger.log(`Searching colleges for student ${studentId}`);
    return this.careerService.searchColleges(studentId, searchCriteria);
  }

  @Post(':studentId/colleges/:collegeId/favorites')
  @ApiOperation({
    summary: 'Add college to favorites',
    description: 'Add a college to the student\'s favorites list.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'collegeId',
    description: 'Unique identifier of the college',
  })
  @ApiResponse({
    status: 201,
    description: 'College added to favorites successfully',
  })
  async addCollegeToFavorites(
    @Param('studentId') studentId: string,
    @Param('collegeId') collegeId: string,
  ) {
    this.logger.log(`Adding college ${collegeId} to favorites for student ${studentId}`);
    return this.careerService.addCollegeToFavorites(studentId, collegeId);
  }

  // ==================== INTERNSHIPS & OPPORTUNITIES ====================

  @Get(':studentId/opportunities')
  @ApiOperation({
    summary: 'Get career opportunities',
    description: 'Returns internships, jobs, and other career opportunities.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Career opportunities retrieved successfully',
  })
  async getCareerOpportunities(@Param('studentId') studentId: string) {
    this.logger.log(`Getting career opportunities for student ${studentId}`);
    return this.careerService.getCareerOpportunities(studentId);
  }

  @Post(':studentId/opportunities/:opportunityId/apply')
  @ApiOperation({
    summary: 'Apply for opportunity',
    description: 'Apply for an internship or job opportunity.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'opportunityId',
    description: 'Unique identifier of the opportunity',
  })
  @ApiBody({
    description: 'Application data',
    schema: {
      type: 'object',
      properties: {
        coverLetter: {
          type: 'string',
          description: 'Cover letter or application statement',
        },
        resume: {
          type: 'string',
          description: 'Resume file URL or ID',
        },
        availability: {
          type: 'string',
          description: 'Availability information',
        },
        additionalInfo: {
          type: 'string',
          description: 'Additional information for the application',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
  })
  async applyForOpportunity(
    @Param('studentId') studentId: string,
    @Param('opportunityId') opportunityId: string,
    @Body() applicationData: {
      coverLetter?: string;
      resume?: string;
      availability?: string;
      additionalInfo?: string;
    },
  ) {
    this.logger.log(`Applying for opportunity ${opportunityId}, student ${studentId}`);
    return this.careerService.applyForOpportunity(studentId, opportunityId, applicationData);
  }

  // ==================== CAREER COUNSELING ====================

  @Get(':studentId/counseling')
  @ApiOperation({
    summary: 'Get counseling sessions',
    description: 'Returns career counseling session history and upcoming appointments.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Counseling sessions retrieved successfully',
  })
  async getCounselingSessions(@Param('studentId') studentId: string) {
    this.logger.log(`Getting counseling sessions for student ${studentId}`);
    return this.careerService.getCounselingSessions(studentId);
  }

  @Post(':studentId/counseling/appointment')
  @ApiOperation({
    summary: 'Schedule counseling appointment',
    description: 'Schedule a career counseling appointment with a counselor.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Appointment data',
    schema: {
      type: 'object',
      required: ['preferredDate', 'topics'],
      properties: {
        counselorId: {
          type: 'string',
          description: 'Preferred counselor ID (optional)',
        },
        preferredDate: {
          type: 'string',
          format: 'date',
          description: 'Preferred appointment date',
        },
        preferredTime: {
          type: 'string',
          description: 'Preferred time slot',
        },
        topics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Topics to discuss',
        },
        urgency: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Appointment urgency',
          default: 'medium',
        },
        additionalNotes: {
          type: 'string',
          description: 'Additional notes or context',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Counseling appointment scheduled successfully',
  })
  async scheduleCounselingAppointment(
    @Param('studentId') studentId: string,
    @Body() appointmentData: {
      counselorId?: string;
      preferredDate: Date;
      preferredTime?: string;
      topics: string[];
      urgency?: 'low' | 'medium' | 'high';
      additionalNotes?: string;
    },
  ) {
    this.logger.log(`Scheduling counseling appointment for student ${studentId}`);
    return this.careerService.scheduleCounselingAppointment(studentId, appointmentData);
  }

  // ==================== CAREER RESOURCES ====================

  @Get(':studentId/resources')
  @ApiOperation({
    summary: 'Get career resources',
    description: 'Returns career development resources, articles, and tools.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Career resources retrieved successfully',
  })
  async getCareerResources(@Param('studentId') studentId: string) {
    this.logger.log(`Getting career resources for student ${studentId}`);
    return this.careerService.getCareerResources(studentId);
  }

  @Post(':studentId/resources/:resourceId/access')
  @ApiOperation({
    summary: 'Track resource access',
    description: 'Track when a student accesses a career resource.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Unique identifier of the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource access tracked successfully',
  })
  async trackResourceAccess(
    @Param('studentId') studentId: string,
    @Param('resourceId') resourceId: string,
  ) {
    this.logger.log(`Tracking resource access ${resourceId} for student ${studentId}`);
    return this.careerService.trackResourceAccess(studentId, resourceId);
  }
}