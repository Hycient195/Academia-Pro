import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';
import { StudentAccessGuard } from '../guards/student-access.guard';
import { StudentPortalCommunicationService } from '../services/communication.service';

@ApiTags('Student Portal - Communication')
@Controller('student-portal/communication')
@UseGuards(StudentPortalGuard, StudentAccessGuard)
export class StudentPortalCommunicationController {
  private readonly logger = new Logger(StudentPortalCommunicationController.name);

  constructor(
    private readonly communicationService: StudentPortalCommunicationService,
  ) {}

  // ==================== MESSAGES ENDPOINTS ====================

  @Get(':studentId/messages')
  @ApiOperation({
    summary: 'Get student messages',
    description: 'Returns messages for the specified student with optional filtering.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['teacher', 'parent', 'admin', 'system'],
    description: 'Filter by message type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['unread', 'read', 'archived'],
    description: 'Filter by message status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of messages to return (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of messages to skip for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  async getMessages(
    @Param('studentId') studentId: string,
    @Query() filters: {
      type?: 'teacher' | 'parent' | 'admin' | 'system';
      status?: 'unread' | 'read' | 'archived';
      limit?: number;
      offset?: number;
    },
  ): Promise<any[]> {
    this.logger.log(`Getting messages for student ${studentId} with filters:`, filters);
    return this.communicationService.getMessages(studentId, filters);
  }

  @Get(':studentId/messages/:messageId')
  @ApiOperation({
    summary: 'Get specific message',
    description: 'Returns detailed information for a specific message.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Unique identifier of the message',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
  })
  async getMessage(
    @Param('studentId') studentId: string,
    @Param('messageId') messageId: string,
  ) {
    this.logger.log(`Getting message ${messageId} for student ${studentId}`);
    return this.communicationService.getMessage(studentId, messageId);
  }

  @Post(':studentId/messages')
  @ApiOperation({
    summary: 'Send message',
    description: 'Send a message to teachers, parents, or administrators.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Message data',
    schema: {
      type: 'object',
      required: ['recipientId', 'subject', 'content'],
      properties: {
        recipientId: {
          type: 'string',
          description: 'ID of the recipient (teacher, parent, or admin)',
        },
        recipientType: {
          type: 'string',
          enum: ['teacher', 'parent', 'admin'],
          description: 'Type of recipient',
        },
        subject: {
          type: 'string',
          description: 'Message subject',
        },
        content: {
          type: 'string',
          description: 'Message content',
        },
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'urgent'],
          description: 'Message priority level',
          default: 'normal',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of attachment file URLs or IDs',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  async sendMessage(
    @Param('studentId') studentId: string,
    @Body() messageData: {
      recipientId: string;
      recipientType: 'teacher' | 'parent' | 'admin';
      subject: string;
      content: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      attachments?: string[];
    },
  ) {
    this.logger.log(`Sending message from student ${studentId} to ${messageData.recipientType} ${messageData.recipientId}`);
    return this.communicationService.sendMessage(studentId, messageData);
  }

  @Put(':studentId/messages/:messageId/read')
  @ApiOperation({
    summary: 'Mark message as read',
    description: 'Mark a specific message as read.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Unique identifier of the message',
  })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  async markMessageAsRead(
    @Param('studentId') studentId: string,
    @Param('messageId') messageId: string,
  ) {
    this.logger.log(`Marking message ${messageId} as read for student ${studentId}`);
    return this.communicationService.markMessageAsRead(studentId, messageId);
  }

  @Put(':studentId/messages/:messageId/archive')
  @ApiOperation({
    summary: 'Archive message',
    description: 'Archive a specific message.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Unique identifier of the message',
  })
  @ApiResponse({
    status: 200,
    description: 'Message archived successfully',
  })
  async archiveMessage(
    @Param('studentId') studentId: string,
    @Param('messageId') messageId: string,
  ) {
    this.logger.log(`Archiving message ${messageId} for student ${studentId}`);
    return this.communicationService.archiveMessage(studentId, messageId);
  }

  // ==================== ANNOUNCEMENTS ENDPOINTS ====================

  @Get(':studentId/announcements')
  @ApiOperation({
    summary: 'Get announcements',
    description: 'Returns school announcements and notices for the student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['academic', 'events', 'general', 'emergency'],
    description: 'Filter by announcement category',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of announcements to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
  })
  async getAnnouncements(
    @Param('studentId') studentId: string,
    @Query() filters: {
      category?: 'academic' | 'events' | 'general' | 'emergency';
      limit?: number;
    },
  ) {
    this.logger.log(`Getting announcements for student ${studentId} with filters:`, filters);
    return this.communicationService.getAnnouncements(studentId, filters);
  }

  // ==================== CONTACTS ENDPOINTS ====================

  @Get(':studentId/contacts')
  @ApiOperation({
    summary: 'Get student contacts',
    description: 'Returns list of teachers, counselors, and other school contacts.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['teacher', 'counselor', 'admin', 'support'],
    description: 'Filter by contact type',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
  })
  async getContacts(
    @Param('studentId') studentId: string,
    @Query('type') type?: 'teacher' | 'counselor' | 'admin' | 'support',
  ) {
    this.logger.log(`Getting contacts for student ${studentId}, type: ${type}`);
    return this.communicationService.getContacts(studentId, type);
  }

  // ==================== COMMUNICATION PREFERENCES ENDPOINTS ====================

  @Get(':studentId/preferences')
  @ApiOperation({
    summary: 'Get communication preferences',
    description: 'Returns the student\'s communication preferences and settings.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication preferences retrieved successfully',
  })
  async getCommunicationPreferences(@Param('studentId') studentId: string) {
    this.logger.log(`Getting communication preferences for student ${studentId}`);
    return this.communicationService.getCommunicationPreferences(studentId);
  }

  @Put(':studentId/preferences')
  @ApiOperation({
    summary: 'Update communication preferences',
    description: 'Update the student\'s communication preferences and notification settings.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Communication preferences data',
    schema: {
      type: 'object',
      properties: {
        emailNotifications: {
          type: 'boolean',
          description: 'Enable email notifications',
        },
        smsNotifications: {
          type: 'boolean',
          description: 'Enable SMS notifications',
        },
        pushNotifications: {
          type: 'boolean',
          description: 'Enable push notifications',
        },
        notificationTypes: {
          type: 'object',
          properties: {
            assignments: { type: 'boolean' },
            grades: { type: 'boolean' },
            attendance: { type: 'boolean' },
            events: { type: 'boolean' },
            announcements: { type: 'boolean' },
          },
        },
        quietHours: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            startTime: { type: 'string', format: 'time' },
            endTime: { type: 'string', format: 'time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Communication preferences updated successfully',
  })
  async updateCommunicationPreferences(
    @Param('studentId') studentId: string,
    @Body() preferences: any,
  ) {
    this.logger.log(`Updating communication preferences for student ${studentId}`);
    return this.communicationService.updateCommunicationPreferences(studentId, preferences);
  }
}