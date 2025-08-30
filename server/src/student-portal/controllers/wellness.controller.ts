import { Controller, Get, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';
import { StudentAccessGuard } from '../guards/student-access.guard';
import { StudentPortalWellnessService } from '../services/wellness.service';

@ApiTags('Student Portal - Wellness')
@Controller('student-portal/wellness')
@UseGuards(StudentPortalGuard, StudentAccessGuard)
export class StudentPortalWellnessController {
  private readonly logger = new Logger(StudentPortalWellnessController.name);

  constructor(
    private readonly wellnessService: StudentPortalWellnessService,
  ) {}

  // ==================== WELLNESS CHECK-INS ====================

  @Get(':studentId/checkins')
  @ApiOperation({
    summary: 'Get wellness check-ins',
    description: 'Returns the student\'s wellness check-in history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellness check-ins retrieved successfully',
  })
  async getWellnessCheckins(@Param('studentId') studentId: string) {
    this.logger.log(`Getting wellness check-ins for student ${studentId}`);
    return this.wellnessService.getWellnessCheckins(studentId);
  }

  @Post(':studentId/checkins')
  @ApiOperation({
    summary: 'Submit wellness check-in',
    description: 'Submit a daily wellness check-in with mood, stress, and health indicators.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Wellness check-in data',
    schema: {
      type: 'object',
      required: ['moodLevel', 'stressLevel', 'energyLevel'],
      properties: {
        moodLevel: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Mood level (1-10, where 10 is excellent)',
        },
        stressLevel: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Stress level (1-10, where 10 is very stressed)',
        },
        energyLevel: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Energy level (1-10, where 10 is very energetic)',
        },
        sleepQuality: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Sleep quality (1-10, where 10 is excellent sleep)',
        },
        sleepHours: {
          type: 'number',
          minimum: 0,
          maximum: 24,
          description: 'Hours of sleep last night',
        },
        physicalActivity: {
          type: 'string',
          enum: ['none', 'light', 'moderate', 'intense'],
          description: 'Physical activity level today',
        },
        notes: {
          type: 'string',
          description: 'Additional notes or concerns',
        },
        triggers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Stress triggers or concerns',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Wellness check-in submitted successfully',
  })
  async submitWellnessCheckin(
    @Param('studentId') studentId: string,
    @Body() checkinData: {
      moodLevel: number;
      stressLevel: number;
      energyLevel: number;
      sleepQuality?: number;
      sleepHours?: number;
      physicalActivity?: 'none' | 'light' | 'moderate' | 'intense';
      notes?: string;
      triggers?: string[];
    },
  ) {
    this.logger.log(`Submitting wellness check-in for student ${studentId}`);
    return this.wellnessService.submitWellnessCheckin(studentId, checkinData);
  }

  // ==================== WELLNESS INSIGHTS ====================

  @Get(':studentId/insights')
  @ApiOperation({
    summary: 'Get wellness insights',
    description: 'Returns personalized wellness insights and recommendations based on check-in data.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellness insights retrieved successfully',
  })
  async getWellnessInsights(@Param('studentId') studentId: string) {
    this.logger.log(`Getting wellness insights for student ${studentId}`);
    return this.wellnessService.getWellnessInsights(studentId);
  }

  @Get(':studentId/trends')
  @ApiOperation({
    summary: 'Get wellness trends',
    description: 'Returns wellness trends and patterns over time.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellness trends retrieved successfully',
  })
  async getWellnessTrends(@Param('studentId') studentId: string) {
    this.logger.log(`Getting wellness trends for student ${studentId}`);
    return this.wellnessService.getWellnessTrends(studentId);
  }

  // ==================== MENTAL HEALTH SUPPORT ====================

  @Get(':studentId/resources')
  @ApiOperation({
    summary: 'Get wellness resources',
    description: 'Returns available wellness and mental health resources.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellness resources retrieved successfully',
  })
  async getWellnessResources(@Param('studentId') studentId: string) {
    this.logger.log(`Getting wellness resources for student ${studentId}`);
    return this.wellnessService.getWellnessResources(studentId);
  }

  @Post(':studentId/counseling/request')
  @ApiOperation({
    summary: 'Request counseling session',
    description: 'Request a counseling session with school counselor or mental health professional.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Counseling request data',
    schema: {
      type: 'object',
      required: ['reason', 'preferredDate'],
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for requesting counseling',
        },
        preferredDate: {
          type: 'string',
          format: 'date',
          description: 'Preferred date for the session',
        },
        preferredTime: {
          type: 'string',
          description: 'Preferred time for the session',
        },
        urgency: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Urgency level of the request',
        },
        confidential: {
          type: 'boolean',
          description: 'Whether the session should be confidential',
          default: true,
        },
        additionalInfo: {
          type: 'string',
          description: 'Additional information or context',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Counseling request submitted successfully',
  })
  async requestCounseling(
    @Param('studentId') studentId: string,
    @Body() requestData: {
      reason: string;
      preferredDate: Date;
      preferredTime?: string;
      urgency?: 'low' | 'medium' | 'high' | 'urgent';
      confidential?: boolean;
      additionalInfo?: string;
    },
  ) {
    this.logger.log(`Requesting counseling for student ${studentId}`);
    return this.wellnessService.requestCounseling(studentId, requestData);
  }

  // ==================== WELLNESS GOALS ====================

  @Get(':studentId/goals')
  @ApiOperation({
    summary: 'Get wellness goals',
    description: 'Returns the student\'s wellness goals and progress.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellness goals retrieved successfully',
  })
  async getWellnessGoals(@Param('studentId') studentId: string) {
    this.logger.log(`Getting wellness goals for student ${studentId}`);
    return this.wellnessService.getWellnessGoals(studentId);
  }

  @Post(':studentId/goals')
  @ApiOperation({
    summary: 'Set wellness goal',
    description: 'Set a new wellness goal for tracking and improvement.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Wellness goal data',
    schema: {
      type: 'object',
      required: ['goalType', 'targetValue', 'timeframe'],
      properties: {
        goalType: {
          type: 'string',
          enum: ['mood', 'stress', 'sleep', 'exercise', 'social'],
          description: 'Type of wellness goal',
        },
        targetValue: {
          type: 'number',
          description: 'Target value to achieve',
        },
        timeframe: {
          type: 'string',
          enum: ['weekly', 'monthly', 'quarterly'],
          description: 'Timeframe for achieving the goal',
        },
        description: {
          type: 'string',
          description: 'Description of the goal',
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
    description: 'Wellness goal created successfully',
  })
  async setWellnessGoal(
    @Param('studentId') studentId: string,
    @Body() goalData: {
      goalType: 'mood' | 'stress' | 'sleep' | 'exercise' | 'social';
      targetValue: number;
      timeframe: 'weekly' | 'monthly' | 'quarterly';
      description?: string;
      reminders?: boolean;
    },
  ) {
    this.logger.log(`Setting wellness goal for student ${studentId}`);
    return this.wellnessService.setWellnessGoal(studentId, goalData);
  }

  // ==================== EMERGENCY CONTACTS ====================

  @Get(':studentId/emergency')
  @ApiOperation({
    summary: 'Get emergency contacts',
    description: 'Returns emergency contact information and procedures.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency contacts retrieved successfully',
  })
  async getEmergencyContacts(@Param('studentId') studentId: string) {
    this.logger.log(`Getting emergency contacts for student ${studentId}`);
    return this.wellnessService.getEmergencyContacts(studentId);
  }

  @Post(':studentId/emergency/alert')
  @ApiOperation({
    summary: 'Send emergency alert',
    description: 'Send an emergency alert to designated contacts and school authorities.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Emergency alert data',
    schema: {
      type: 'object',
      required: ['alertType', 'location'],
      properties: {
        alertType: {
          type: 'string',
          enum: ['medical', 'safety', 'mental_health', 'other'],
          description: 'Type of emergency',
        },
        location: {
          type: 'string',
          description: 'Current location of the student',
        },
        description: {
          type: 'string',
          description: 'Description of the emergency situation',
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Severity level of the emergency',
        },
        contacts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific contacts to notify (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Emergency alert sent successfully',
  })
  async sendEmergencyAlert(
    @Param('studentId') studentId: string,
    @Body() alertData: {
      alertType: 'medical' | 'safety' | 'mental_health' | 'other';
      location: string;
      description?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      contacts?: string[];
    },
  ) {
    this.logger.log(`Sending emergency alert for student ${studentId}`);
    return this.wellnessService.sendEmergencyAlert(studentId, alertData);
  }
}