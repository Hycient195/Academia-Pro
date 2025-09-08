// Academia Pro - Communication Controller
// REST API endpoints for communication management system

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, SampleAudit, MonitorPerformance } from '../../common/audit/auditable.decorator';
import { CommunicationService } from '../services/communication.service';

@ApiTags('Communication Management')
@ApiBearerAuth()
@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // Message Management Endpoints
  @Post('messages')
  @AuditCreate('message', 'id')
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendMessage(@Body() messageData: any, @Request() req: any) {
    return await this.communicationService.sendMessage(messageData, req.user.id);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages for current user' })
  @ApiQuery({ name: 'messageType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(@Query() filters: any, @Request() req: any) {
    return await this.communicationService.getMessages(req.user.id, filters);
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markMessageAsRead(@Param('id') messageId: string, @Request() req: any) {
    await this.communicationService.markMessageAsRead(messageId, req.user.id);
    return { message: 'Message marked as read' };
  }

  // Notification Management Endpoints
  @Post('notifications')
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendNotification(@Body() notificationData: any, @Request() req: any) {
    return await this.communicationService.sendNotification(notificationData, req.user.id);
  }

  @Post('notifications/bulk')
  @SampleAudit(0.1) // Sample 10% of bulk notifications
  @AuditCreate('notification', '0.id')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendBulkNotifications(@Body() notificationsData: any[], @Request() req: any) {
    return await this.communicationService.sendBulkNotifications(notificationsData, req.user.id);
  }

  // Notice Board Management Endpoints
  @Post('notices')
  @ApiOperation({ summary: 'Create a new notice' })
  @ApiResponse({ status: 201, description: 'Notice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createNotice(@Body() noticeData: any, @Request() req: any) {
    return await this.communicationService.createNotice(noticeData, req.user.id);
  }

  @Put('notices/:id/publish')
  @ApiOperation({ summary: 'Publish a notice' })
  @ApiParam({ name: 'id', description: 'Notice ID' })
  @ApiResponse({ status: 200, description: 'Notice published successfully' })
  @ApiResponse({ status: 404, description: 'Notice not found' })
  async publishNotice(@Param('id') noticeId: string, @Request() req: any) {
    return await this.communicationService.publishNotice(noticeId, req.user.id);
  }

  @Get('notices')
  @ApiOperation({ summary: 'Get notices by school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'noticeType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Notices retrieved successfully' })
  async getNotices(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return await this.communicationService.getNotices(schoolId, filters);
  }

  @Post('notices/:id/comments')
  @ApiOperation({ summary: 'Add comment to notice' })
  @ApiParam({ name: 'id', description: 'Notice ID' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Notice not found' })
  async addCommentToNotice(
    @Param('id') noticeId: string,
    @Body() commentData: any,
    @Request() req: any,
  ) {
    return await this.communicationService.addCommentToNotice(noticeId, commentData, req.user.id);
  }

  // Template Management Endpoints
  @Post('templates')
  @ApiOperation({ summary: 'Create a new communication template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTemplate(@Body() templateData: any, @Request() req: any) {
    return await this.communicationService.createTemplate(templateData, req.user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get templates by school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'templateType', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return await this.communicationService.getTemplates(schoolId, filters);
  }

  @Post('templates/:id/render')
  @ApiOperation({ summary: 'Render template with variables' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async renderTemplate(
    @Param('id') templateId: string,
    @Body() variables: Record<string, any>,
  ) {
    return await this.communicationService.renderTemplate(templateId, variables);
  }

  // Communication Analytics Endpoints
  @Get('analytics')
  @ApiOperation({ summary: 'Get communication analytics' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getCommunicationAnalytics(
    @Query('schoolId') schoolId: string,
    @Query() dateRange: any,
  ) {
    return await this.communicationService.getCommunicationAnalytics(schoolId, dateRange);
  }

  // WhatsApp Communication Endpoints
  @Post('whatsapp/send')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiResponse({ status: 201, description: 'WhatsApp message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendWhatsAppMessage(@Body() whatsappData: any, @Request() req: any) {
    const { to, content, type = 'text', mediaUrl, caption } = whatsappData;

    if (!to || !content) {
      throw new BadRequestException('Recipient and content are required');
    }

    // Create notification record for tracking
    const notificationData = {
      schoolId: req.user.schoolId,
      notificationType: 'whatsapp',
      category: 'general',
      priority: 'normal',
      recipientId: req.user.id,
      recipientName: req.user.name,
      whatsappNumber: to,
      subject: 'WhatsApp Message',
      message: content,
      userPreferences: { whatsappEnabled: true },
    };

    return await this.communicationService.sendNotification(notificationData, req.user.id);
  }

  @Post('whatsapp/bulk')
  @ApiOperation({ summary: 'Send bulk WhatsApp messages' })
  @ApiResponse({ status: 201, description: 'Bulk WhatsApp messages sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendBulkWhatsAppMessages(@Body() bulkData: any, @Request() req: any) {
    const { recipients, content, type = 'text' } = bulkData;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new BadRequestException('Recipients are required');
    }

    const notificationsData = recipients.map((recipient: any) => ({
      schoolId: req.user.schoolId,
      notificationType: 'whatsapp',
      category: 'general',
      priority: 'normal',
      recipientId: req.user.id,
      recipientName: req.user.name,
      whatsappNumber: recipient.phone,
      subject: 'Bulk WhatsApp Message',
      message: content,
      userPreferences: { whatsappEnabled: true },
    }));

    return await this.communicationService.sendBulkNotifications(notificationsData, req.user.id);
  }

  // Telegram Communication Endpoints
  @Post('telegram/send')
  @ApiOperation({ summary: 'Send Telegram message' })
  @ApiResponse({ status: 201, description: 'Telegram message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendTelegramMessage(@Body() telegramData: any, @Request() req: any) {
    const { chatId, text, parseMode = 'HTML' } = telegramData;

    if (!chatId || !text) {
      throw new BadRequestException('Chat ID and text are required');
    }

    // Create notification record for tracking
    const notificationData = {
      schoolId: req.user.schoolId,
      notificationType: 'telegram',
      category: 'general',
      priority: 'normal',
      recipientId: req.user.id,
      recipientName: req.user.name,
      telegramChatId: chatId,
      subject: 'Telegram Message',
      message: text,
      userPreferences: { telegramEnabled: true },
    };

    return await this.communicationService.sendNotification(notificationData, req.user.id);
  }

  @Post('telegram/bulk')
  @ApiOperation({ summary: 'Send bulk Telegram messages' })
  @ApiResponse({ status: 201, description: 'Bulk Telegram messages sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendBulkTelegramMessages(@Body() bulkData: any, @Request() req: any) {
    const { recipients, text, parseMode = 'HTML' } = bulkData;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new BadRequestException('Recipients are required');
    }

    const notificationsData = recipients.map((recipient: any) => ({
      schoolId: req.user.schoolId,
      notificationType: 'telegram',
      category: 'general',
      priority: 'normal',
      recipientId: req.user.id,
      recipientName: req.user.name,
      telegramChatId: recipient.chatId,
      subject: 'Bulk Telegram Message',
      message: text,
      userPreferences: { telegramEnabled: true },
    }));

    return await this.communicationService.sendBulkNotifications(notificationsData, req.user.id);
  }

  // Quick Communication Endpoints
  @Post('quick-message')
  @ApiOperation({ summary: 'Send a quick message to multiple recipients' })
  @ApiResponse({ status: 201, description: 'Quick message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendQuickMessage(@Body() quickMessageData: any, @Request() req: any) {
    const { recipients, subject, content, messageType, priority } = quickMessageData;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new BadRequestException('Recipients are required');
    }

    const messageData = {
      subject,
      content,
      messageType: messageType || 'direct',
      priority: priority || 'normal',
      recipientsList: recipients,
      sendNotifications: true,
    };

    return await this.communicationService.sendMessage(messageData, req.user.id);
  }

  @Post('emergency-alert')
  @AuditCreate('emergency_alert', 'id')
  @ApiOperation({ summary: 'Send emergency alert to all users' })
  @ApiResponse({ status: 201, description: 'Emergency alert sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendEmergencyAlert(@Body() alertData: any, @Request() req: any) {
    const { title, message, schoolId, targetAudience } = alertData;

    if (!title || !message || !schoolId) {
      throw new BadRequestException('Title, message, and schoolId are required');
    }

    // Create emergency notice
    const noticeData = {
      schoolId,
      noticeType: 'emergency',
      priority: 'urgent',
      title,
      content: message,
      visibilityLevel: 'public',
      targetAudience: targetAudience || { allUsers: true },
      sendNotifications: true,
    };

    const notice = await this.communicationService.createNotice(noticeData, req.user.id);

    // Publish immediately
    return await this.communicationService.publishNotice(notice.id, req.user.id);
  }

  @Post('announcement')
  @ApiOperation({ summary: 'Create and publish school announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created and published successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createAnnouncement(@Body() announcementData: any, @Request() req: any) {
    const {
      schoolId,
      title,
      content,
      noticeType = 'announcement',
      priority = 'normal',
      targetAudience,
      publishImmediately = false,
    } = announcementData;

    if (!schoolId || !title || !content) {
      throw new BadRequestException('School ID, title, and content are required');
    }

    const noticeData = {
      schoolId,
      noticeType,
      priority,
      title,
      content,
      visibilityLevel: 'public',
      targetAudience: targetAudience || { allUsers: true },
      sendNotifications: true,
    };

    const notice = await this.communicationService.createNotice(noticeData, req.user.id);

    if (publishImmediately) {
      return await this.communicationService.publishNotice(notice.id, req.user.id);
    }

    return notice;
  }

  // Communication Settings Endpoints
  @Get('settings/:schoolId')
  @ApiOperation({ summary: 'Get communication settings for school' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getCommunicationSettings(@Param('schoolId') schoolId: string) {
    // This would retrieve communication settings from a settings service
    return {
      schoolId,
      smsEnabled: true,
      emailEnabled: true,
      pushEnabled: true,
      whatsappEnabled: false,
      defaultSender: 'school_admin@academiapro.com',
      rateLimits: {
        smsPerDay: 1000,
        emailPerDay: 5000,
        pushPerDay: 10000,
      },
    };
  }

  @Put('settings/:schoolId')
  @ApiOperation({ summary: 'Update communication settings for school' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateCommunicationSettings(
    @Param('schoolId') schoolId: string,
    @Body() settings: any,
  ) {
    // This would update communication settings
    return {
      schoolId,
      ...settings,
      updatedAt: new Date(),
    };
  }

  // Communication History Endpoints
  @Get('history/:userId')
  @ApiOperation({ summary: 'Get communication history for user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['messages', 'notifications', 'notices'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Communication history retrieved successfully' })
  async getCommunicationHistory(
    @Param('userId') userId: string,
    @Query() filters: any,
  ) {
    // This would aggregate communication history from multiple sources
    return {
      userId,
      history: [],
      filters,
      generatedAt: new Date(),
    };
  }
}