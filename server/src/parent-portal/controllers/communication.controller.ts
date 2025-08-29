import { Controller, Get, Post, Param, Query, Body, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ParentPortalCommunicationService } from '../services/communication.service';
import {
  SendMessageDto,
  RequestAppointmentDto,
  MessageThreadsQueryDto,
  MessagesQueryDto,
  AppointmentsQueryDto,
  AppointmentSlotsQueryDto,
  CommunicationStatsQueryDto,
  MessageThreadResponseDto,
  MessageResponseDto,
  SendMessageResponseDto,
  RequestAppointmentResponseDto,
  AppointmentSlotResponseDto,
  AppointmentResponseDto,
  CommunicationStatsResponseDto,
  CommunicationContactResponseDto,
  EmergencyContactResponseDto,
  MessageThreadsListResponseDto,
  MessagesListResponseDto,
  AppointmentsListResponseDto,
} from '../dtos/communication.dto';
import { CommunicationCategory, CommunicationPriority } from '../entities/communication-record.entity';
import { AppointmentStatus } from '../entities/appointment.entity';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';

@ApiTags('Parent Portal - Communication')
@Controller('parent-portal/communication')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalCommunicationController {
  private readonly logger = new Logger(ParentPortalCommunicationController.name);

  constructor(
    private readonly communicationService: ParentPortalCommunicationService,
  ) {}

  @Get('threads')
  @ApiOperation({
    summary: 'Get message threads',
    description: 'Retrieve message threads for the authenticated parent with optional filtering.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by communication category',
    enum: ['academic', 'attendance', 'behavior', 'health', 'administrative', 'emergency', 'event', 'general'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by thread status',
    enum: ['active', 'archived', 'resolved'],
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filter by specific student ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of threads to retrieve',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Message threads retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        threads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              threadId: { type: 'string' },
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['parent', 'teacher', 'admin', 'system'] },
                    avatar: { type: 'string' },
                  },
                },
              },
              subject: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              status: { type: 'string', enum: ['active', 'archived', 'resolved'] },
              lastMessage: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  senderId: { type: 'string' },
                  senderName: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  isRead: { type: 'boolean' },
                },
              },
              messageCount: { type: 'number' },
              unreadCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              studentId: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        unreadCount: { type: 'number' },
      },
    },
  })
  async getMessageThreads(
    @Request() req: any,
    @Query() query: MessageThreadsQueryDto,
  ): Promise<MessageThreadsListResponseDto> {
    this.logger.log(`Getting message threads for parent: ${req.user.userId}`);

    const result = await this.communicationService.getMessageThreads(
      req.user.parentPortalAccessId,
      {
        ...query,
        category: query.category as CommunicationCategory,
      },
    );

    this.logger.log(`Message threads retrieved: ${result.threads.length}, unread: ${result.unreadCount}`);

    return result;
  }

  @Get('messages')
  @ApiOperation({
    summary: 'Get messages',
    description: 'Retrieve messages for the authenticated parent with optional filtering.',
  })
  @ApiQuery({
    name: 'threadId',
    required: false,
    description: 'Filter by specific thread ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of messages to retrieve',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    type: 'number',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering messages',
    type: 'string',
    format: 'date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering messages',
    type: 'string',
    format: 'date',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              messageId: { type: 'string' },
              threadId: { type: 'string' },
              senderId: { type: 'string' },
              senderName: { type: 'string' },
              senderType: { type: 'string', enum: ['parent', 'teacher', 'admin', 'system'] },
              recipientId: { type: 'string' },
              recipientName: { type: 'string' },
              subject: { type: 'string' },
              content: { type: 'string' },
              communicationType: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              status: { type: 'string' },
              isRead: { type: 'boolean' },
              readAt: { type: 'string', format: 'date-time' },
              sentAt: { type: 'string', format: 'date-time' },
              attachments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fileName: { type: 'string' },
                    fileSize: { type: 'number' },
                    mimeType: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              metadata: { type: 'object' },
            },
          },
        },
        total: { type: 'number' },
        unreadCount: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getMessages(
    @Request() req: any,
    @Query() query: MessagesQueryDto,
  ): Promise<MessagesListResponseDto> {
    this.logger.log(`Getting messages for parent: ${req.user.userId}, thread: ${query.threadId}`);

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const result = await this.communicationService.getMessages(
      req.user.parentPortalAccessId,
      query.threadId,
      {
        limit: query.limit,
        offset: query.offset,
        startDate,
        endDate,
      },
    );

    this.logger.log(`Messages retrieved: ${result.messages.length}, unread: ${result.unreadCount}`);

    return result;
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message',
    description: 'Send a message to teachers, administrators, or school staff.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['recipientId', 'recipientType', 'subject', 'message'],
      properties: {
        studentId: { type: 'string', description: 'Student ID if message is about a specific student' },
        recipientId: { type: 'string', description: 'Recipient ID (teacher, admin, etc.)' },
        recipientType: { type: 'string', enum: ['teacher', 'admin', 'school'], description: 'Type of recipient' },
        subject: { type: 'string', description: 'Message subject' },
        message: { type: 'string', description: 'Message content' },
        category: { type: 'string', enum: ['academic', 'attendance', 'behavior', 'health', 'administrative', 'emergency', 'event', 'general'], description: 'Message category' },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Message priority' },
        attachments: {
          type: 'array',
          description: 'File attachments',
          items: {
            type: 'object',
            properties: {
              fileName: { type: 'string' },
              fileSize: { type: 'number' },
              mimeType: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        messageId: { type: 'string' },
        status: { type: 'string' },
        sentAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async sendMessage(
    @Request() req: any,
    @Body() messageData: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    this.logger.log(`Sending message from parent: ${req.user.userId} to ${messageData.recipientType}: ${messageData.recipientId}`);

    const result = await this.communicationService.sendMessage(
      req.user.parentPortalAccessId,
      {
        ...messageData,
        category: messageData.category as CommunicationCategory,
        priority: messageData.priority as CommunicationPriority,
      },
    );

    this.logger.log(`Message sent successfully: ${result.messageId}`);

    return result;
  }

  @Post('messages/:messageId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark message as read',
    description: 'Mark a specific message as read for the authenticated parent.',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message ID to mark as read',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Marking message as read: ${messageId}, parent: ${req.user.userId}`);

    await this.communicationService.markMessageAsRead(req.user.parentPortalAccessId, messageId);

    this.logger.log(`Message marked as read: ${messageId}`);

    return {
      success: true,
      message: 'Message marked as read successfully',
    };
  }

  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request an appointment',
    description: 'Request an appointment with teachers or school staff.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['studentId', 'appointmentType', 'preferredDate', 'title'],
      properties: {
        studentId: { type: 'string', description: 'Student ID for the appointment' },
        appointmentType: { type: 'string', enum: ['parent_teacher', 'counseling', 'administrative', 'medical', 'other'], description: 'Type of appointment' },
        preferredDate: { type: 'string', format: 'date-time', description: 'Preferred appointment date and time' },
        preferredTime: { type: 'string', description: 'Preferred time (if different from date)' },
        durationMinutes: { type: 'number', description: 'Expected duration in minutes' },
        title: { type: 'string', description: 'Appointment title' },
        description: { type: 'string', description: 'Appointment description' },
        urgency: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Appointment urgency' },
        requestedBy: { type: 'string', description: 'Name of person requesting appointment' },
        contactPhone: { type: 'string', description: 'Contact phone number' },
        specialRequirements: { type: 'string', description: 'Special requirements or notes' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment requested successfully',
    schema: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        status: { type: 'string' },
        requestedAt: { type: 'string', format: 'date-time' },
        estimatedResponseTime: { type: 'string' },
      },
    },
  })
  async requestAppointment(
    @Request() req: any,
    @Body() appointmentData: RequestAppointmentDto,
  ): Promise<RequestAppointmentResponseDto> {
    this.logger.log(`Requesting appointment for student: ${appointmentData.studentId}, parent: ${req.user.userId}`);

    const result = await this.communicationService.requestAppointment(
      req.user.parentPortalAccessId,
      appointmentData,
    );

    this.logger.log(`Appointment requested successfully: ${result.appointmentId}`);

    return result;
  }

  @Get('appointments/slots/:studentId/:teacherId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get available appointment slots',
    description: 'Retrieve available appointment slots for a specific teacher and date range.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    type: 'string',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher ID to check availability for',
    type: 'string',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for availability check',
    type: 'string',
    format: 'date',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for availability check',
    type: 'string',
    format: 'date',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment slots retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          timeSlots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                available: { type: 'boolean' },
                teacherId: { type: 'string' },
                teacherName: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async getAppointmentSlots(
    @Param('studentId') studentId: string,
    @Param('teacherId') teacherId: string,
    @Query() query: AppointmentSlotsQueryDto,
    @Request() req: any,
  ): Promise<AppointmentSlotResponseDto[]> {
    this.logger.log(`Getting appointment slots for teacher: ${teacherId}, student: ${studentId}`);

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const slots = await this.communicationService.getAppointmentSlots(
      req.user.parentPortalAccessId,
      studentId,
      teacherId,
      startDate,
      endDate,
    );

    this.logger.log(`Appointment slots retrieved: ${slots.length} days`);

    return slots;
  }

  @Get('appointments')
  @ApiOperation({
    summary: 'Get appointments',
    description: 'Retrieve appointments for the authenticated parent with optional filtering.',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filter by specific student ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by appointment status',
    enum: ['requested', 'confirmed', 'cancelled', 'completed'],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering',
    type: 'string',
    format: 'date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering',
    type: 'string',
    format: 'date',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of appointments to retrieve',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        appointments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              appointmentId: { type: 'string' },
              studentId: { type: 'string' },
              appointmentType: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              appointmentDate: { type: 'string', format: 'date-time' },
              durationMinutes: { type: 'number' },
              status: { type: 'string' },
              priority: { type: 'string' },
              teacherName: { type: 'string' },
              location: { type: 'string' },
              notes: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        upcomingCount: { type: 'number' },
      },
    },
  })
  async getAppointments(
    @Request() req: any,
    @Query() query: AppointmentsQueryDto,
  ): Promise<AppointmentsListResponseDto> {
    this.logger.log(`Getting appointments for parent: ${req.user.userId}`);

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const result = await this.communicationService.getAppointments(
      req.user.parentPortalAccessId,
      {
        studentId: query.studentId,
        status: query.status as AppointmentStatus,
        startDate,
        endDate,
        limit: query.limit,
        offset: query.offset,
      },
    );

    this.logger.log(`Appointments retrieved: ${result.total}, upcoming: ${result.upcomingCount}`);

    return result;
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get communication statistics',
    description: 'Retrieve communication statistics and analytics for the authenticated parent.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range for statistics',
    enum: ['week', 'month', 'quarter', 'year'],
  })
  @ApiResponse({
    status: 200,
    description: 'Communication statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalMessages: { type: 'number' },
        unreadMessages: { type: 'number' },
        sentToday: { type: 'number' },
        receivedToday: { type: 'number' },
        activeThreads: { type: 'number' },
        averageResponseTime: { type: 'number' },
        communicationByCategory: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        communicationByType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        topContacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              contactId: { type: 'string' },
              contactName: { type: 'string' },
              contactType: { type: 'string' },
              messageCount: { type: 'number' },
              lastContact: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getCommunicationStats(
    @Request() req: any,
    @Query() query: CommunicationStatsQueryDto,
  ): Promise<CommunicationStatsResponseDto> {
    this.logger.log(`Getting communication stats for parent: ${req.user.userId}, range: ${query.timeRange}`);

    const stats = await this.communicationService.getCommunicationStats(
      req.user.parentPortalAccessId,
      query.timeRange || 'month',
    );

    this.logger.log(`Communication stats retrieved for parent: ${req.user.userId}`);

    return stats;
  }

  @Get('contacts')
  @ApiOperation({
    summary: 'Get communication contacts',
    description: 'Retrieve list of teachers and staff that the parent can communicate with.',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication contacts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          contactId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['teacher', 'admin', 'counselor', 'nurse'] },
          email: { type: 'string' },
          phone: { type: 'string' },
          subjects: { type: 'array', items: { type: 'string' } },
          isPrimaryContact: { type: 'boolean' },
          lastContact: { type: 'string', format: 'date-time' },
          responseTime: { type: 'string' },
        },
      },
    },
  })
  async getContacts(@Request() req: any): Promise<CommunicationContactResponseDto[]> {
    this.logger.log(`Getting communication contacts for parent: ${req.user.userId}`);

    // Mock data - would integrate with staff/user management
    const contacts = [
      {
        contactId: 'teacher-001',
        name: 'Ms. Johnson',
        type: 'teacher' as const,
        email: 'johnson@school.com',
        phone: '+1-555-0101',
        subjects: ['Mathematics', 'Algebra'],
        isPrimaryContact: true,
        lastContact: new Date(),
        responseTime: '2-4 hours',
      },
      {
        contactId: 'teacher-002',
        name: 'Mr. Davis',
        type: 'teacher' as const,
        email: 'davis@school.com',
        phone: '+1-555-0102',
        subjects: ['English Literature', 'Writing'],
        isPrimaryContact: false,
        lastContact: new Date(Date.now() - 86400000),
        responseTime: '4-6 hours',
      },
      {
        contactId: 'admin-001',
        name: 'Mrs. Smith',
        type: 'admin' as const,
        email: 'smith@school.com',
        phone: '+1-555-0103',
        subjects: [],
        isPrimaryContact: false,
        lastContact: new Date(Date.now() - 172800000),
        responseTime: '1-2 business days',
      },
    ];

    this.logger.log(`Communication contacts retrieved: ${contacts.length}`);

    return contacts;
  }

  @Get('emergency-contacts')
  @ApiOperation({
    summary: 'Get emergency contacts',
    description: 'Retrieve emergency contact information for urgent situations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency contacts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          contactId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['nurse', 'counselor', 'security', 'admin'] },
          phone: { type: 'string' },
          email: { type: 'string' },
          priority: { type: 'number' },
          availableHours: { type: 'string' },
          emergencyProtocols: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  async getEmergencyContacts(@Request() req: any): Promise<EmergencyContactResponseDto[]> {
    this.logger.log(`Getting emergency contacts for parent: ${req.user.userId}`);

    // Mock data - would integrate with staff management
    const emergencyContacts = [
      {
        contactId: 'nurse-001',
        name: 'Mrs. Wilson',
        type: 'nurse' as const,
        phone: '+1-555-0001',
        email: 'nurse@school.com',
        priority: 1,
        availableHours: '8:00 AM - 4:00 PM',
        emergencyProtocols: ['Medical emergencies', 'Allergies', 'Injuries'],
      },
      {
        contactId: 'security-001',
        name: 'Mr. Brown',
        type: 'security' as const,
        phone: '+1-555-0002',
        email: 'security@school.com',
        priority: 2,
        availableHours: '24/7',
        emergencyProtocols: ['Security incidents', 'Lockdowns', 'Evacuations'],
      },
      {
        contactId: 'counselor-001',
        name: 'Ms. Garcia',
        type: 'counselor' as const,
        phone: '+1-555-0003',
        email: 'counselor@school.com',
        priority: 3,
        availableHours: '8:00 AM - 4:00 PM',
        emergencyProtocols: ['Mental health crises', 'Family emergencies', 'Student support'],
      },
    ];

    this.logger.log(`Emergency contacts retrieved: ${emergencyContacts.length}`);

    return emergencyContacts;
  }
}