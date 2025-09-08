// Academia Pro - Communication Service
// Main service for managing all communication channels and orchestration

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { MessageStatus, RecipientType } from '../entities/message.entity';
import { NotificationStatus, NotificationType } from '../entities/notification.entity';
import { NoticeStatus } from '../entities/notice-board.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { NoticeBoard, NoticeComment } from '../entities/notice-board.entity';
import { CommunicationTemplate } from '../entities/template.entity';
import { SMSProvider } from '../providers/sms.provider';
import { EmailProvider } from '../providers/email.provider';
import { PushProvider } from '../providers/push.provider';
import { WhatsAppProvider } from '../providers/whatsapp.provider';
import { TelegramProvider } from '../providers/telegram.provider';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(NoticeBoard)
    private readonly noticeBoardRepository: Repository<NoticeBoard>,

    @InjectRepository(NoticeComment)
    private readonly noticeCommentRepository: Repository<NoticeComment>,

    @InjectRepository(CommunicationTemplate)
    private readonly templateRepository: Repository<CommunicationTemplate>,

    private readonly smsProvider: SMSProvider,
    private readonly emailProvider: EmailProvider,
    private readonly pushProvider: PushProvider,
    private readonly whatsappProvider: WhatsAppProvider,
    private readonly telegramProvider: TelegramProvider,

    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  // Message Management
  async sendMessage(messageData: any, senderId: string): Promise<Message> {
    const message = this.messageRepository.create({
      ...messageData,
      senderId,
      status: 'sent',
      sentAt: new Date(),
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send notifications to recipients if needed
    if (messageData.sendNotifications && !Array.isArray(savedMessage)) {
      await this.notifyMessageRecipients(savedMessage);
    }

    return Array.isArray(savedMessage) ? savedMessage[0] : savedMessage;
  }

  async getMessages(userId: string, filters?: any): Promise<Message[]> {
    const query = this.messageRepository.createQueryBuilder('m')
      .where('m.senderId = :userId OR m.recipientId = :userId', { userId })
      .leftJoinAndSelect('m.replies', 'replies')
      .orderBy('m.createdAt', 'DESC');

    if (filters?.messageType) {
      query.andWhere('m.messageType = :messageType', { messageType: filters.messageType });
    }

    if (filters?.status) {
      query.andWhere('m.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('m.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return await query.getMany();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.recipientId === userId) {
      message.status = MessageStatus.READ;
      message.readAt = new Date();
      message.readBy = [...(message.readBy || []), {
        userId,
        userName: userId, // Should fetch from user service
        readAt: new Date(),
      }];
      await this.messageRepository.save(message);
    }
  }

  // Notification Management
  async sendNotification(notificationData: any, senderId: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...notificationData,
      createdBy: senderId,
      createdByName: senderId, // Should fetch from user service
      updatedBy: senderId,
      updatedByName: senderId,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send the notification through appropriate channels
    if (!Array.isArray(savedNotification)) {
      await this.dispatchNotification(savedNotification);
    }

    return Array.isArray(savedNotification) ? savedNotification[0] : savedNotification;
  }

  async sendBulkNotifications(notificationsData: any[], senderId: string): Promise<Notification[]> {
    const savedNotifications: Notification[] = [];

    // Save notifications one by one to avoid type issues
    for (const data of notificationsData) {
      const notification = this.notificationRepository.create({
        ...data,
        createdBy: senderId,
        createdByName: senderId,
        updatedBy: senderId,
        updatedByName: senderId,
      });

      const savedNotification = await this.notificationRepository.save(notification);
      if (!Array.isArray(savedNotification)) {
        await this.dispatchNotification(savedNotification);
        savedNotifications.push(savedNotification);
      }
    }

    return savedNotifications;
  }

  private async dispatchNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.notificationType) {
        case 'sms':
          if (notification.phoneNumber) {
            await this.smsProvider.sendSMS({
              to: notification.phoneNumber,
              body: notification.message,
              from: notification.phoneNumber, // Should be configured
            });
          }
          break;

        case 'email':
          if (notification.email) {
            await this.emailProvider.sendEmail({
              to: notification.email,
              subject: notification.subject || 'Notification',
              html: notification.message,
              text: notification.message,
            });
          }
          break;

        case 'push':
          if (notification.deviceToken) {
            await this.pushProvider.sendPushNotification({
              to: notification.deviceToken,
              title: notification.subject || 'Notification',
              body: notification.message,
              data: {
                type: notification.category,
                notificationId: notification.id,
              },
            });
          }
          break;

        case 'whatsapp':
          if (notification.whatsappNumber) {
            const whatsappResult = await this.whatsappProvider.sendWhatsAppMessage({
              to: notification.whatsappNumber,
              content: notification.message,
              type: 'text',
            });

            if (whatsappResult.success) {
              notification.providerMessageId = whatsappResult.messageId;
              notification.cost = whatsappResult.cost;
              notification.providerResponse = whatsappResult.providerResponse;
            } else {
              throw new Error(whatsappResult.error || 'WhatsApp sending failed');
            }
          }
          break;

        case 'telegram':
          if (notification.telegramChatId) {
            const telegramResult = await this.telegramProvider.sendTelegramMessage({
              chatId: notification.telegramChatId,
              text: notification.message,
              parseMode: 'HTML',
            });

            if (telegramResult.success) {
              notification.providerMessageId = telegramResult.messageId?.toString();
              notification.cost = telegramResult.cost;
              notification.providerResponse = telegramResult.providerResponse;
            } else {
              throw new Error(telegramResult.error || 'Telegram sending failed');
            }
          }
          break;
      }

      // Update notification status
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await this.notificationRepository.save(notification);

    } catch (error) {
      this.logger.error(`Failed to dispatch notification ${notification.id}`, error);
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error.message;
      await this.notificationRepository.save(notification);
    }
  }

  // Notice Board Management
  async createNotice(noticeData: any, creatorId: string): Promise<NoticeBoard> {
    const notice = this.noticeBoardRepository.create({
      ...noticeData,
      createdBy: creatorId,
      createdByName: creatorId, // Should fetch from user service
      updatedBy: creatorId,
      updatedByName: creatorId,
    });

    const savedNotice = await this.noticeBoardRepository.save(notice);

    // Send notifications if required
    if (noticeData.sendNotifications && !Array.isArray(savedNotice)) {
      await this.notifyNoticeRecipients(savedNotice);
    }

    return Array.isArray(savedNotice) ? savedNotice[0] : savedNotice;
  }

  async publishNotice(noticeId: string, publisherId: string): Promise<NoticeBoard> {
    const notice = await this.noticeBoardRepository.findOne({ where: { id: noticeId } });
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    notice.status = NoticeStatus.PUBLISHED;
    notice.publishedAt = new Date();
    notice.publishedBy = publisherId;
    notice.publishedByName = publisherId; // Should fetch from user service

    const savedNotice = await this.noticeBoardRepository.save(notice);

    // Send notifications to target audience
    await this.notifyNoticeRecipients(savedNotice);

    return savedNotice;
  }

  async addCommentToNotice(noticeId: string, commentData: any, userId: string): Promise<NoticeComment> {
    const notice = await this.noticeBoardRepository.findOne({ where: { id: noticeId } });
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    if (!notice.allowComments) {
      throw new BadRequestException('Comments are not allowed for this notice');
    }

    const comment = this.noticeCommentRepository.create({
      noticeId,
      userId,
      userName: userId, // Should fetch from user service
      userRole: userId, // Should fetch from user service
      comment: commentData.comment,
      isModerated: notice.moderateComments,
    });

    const savedComment = await this.noticeCommentRepository.save(comment);

    // Update notice comment count
    notice.commentCount += 1;
    await this.noticeBoardRepository.save(notice);

    return savedComment;
  }

  async getNotices(schoolId: string, filters?: any): Promise<NoticeBoard[]> {
    const query = this.noticeBoardRepository.createQueryBuilder('n')
      .where('n.schoolId = :schoolId', { schoolId })
      .leftJoinAndSelect('n.comments', 'comments')
      .orderBy('n.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('n.status = :status', { status: filters.status });
    }

    if (filters?.noticeType) {
      query.andWhere('n.noticeType = :noticeType', { noticeType: filters.noticeType });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('n.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return await query.getMany();
  }

  // Template Management
  async createTemplate(templateData: any, creatorId: string): Promise<CommunicationTemplate> {
    const template = this.templateRepository.create({
      ...templateData,
      createdBy: creatorId,
      createdByName: creatorId, // Should fetch from user service
      updatedBy: creatorId,
      updatedByName: creatorId,
    });

    const savedTemplate = await this.templateRepository.save(template);
    return Array.isArray(savedTemplate) ? savedTemplate[0] : savedTemplate;
  }

  async getTemplates(schoolId: string, filters?: any): Promise<CommunicationTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('t')
      .where('t.schoolId = :schoolId', { schoolId })
      .orderBy('t.createdAt', 'DESC');

    if (filters?.templateType) {
      query.andWhere('t.templateType = :templateType', { templateType: filters.templateType });
    }

    if (filters?.category) {
      query.andWhere('t.category = :category', { category: filters.category });
    }

    if (filters?.status) {
      query.andWhere('t.status = :status', { status: filters.status });
    }

    return await query.getMany();
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<any> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Simple template rendering - replace variables in template
    let subject = template.subjectTemplate || '';
    let content = template.contentTemplate;
    let shortContent = template.shortContentTemplate || '';

    // Replace variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, variables[key]);
      content = content.replace(regex, variables[key]);
      shortContent = shortContent.replace(regex, variables[key]);
    });

    return {
      subject,
      content,
      shortContent,
      templateType: template.templateType,
    };
  }

  // Communication Analytics
  async getCommunicationAnalytics(schoolId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    const { start, end } = dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };

    const [
      messageStats,
      notificationStats,
      noticeStats,
      templateStats,
    ] = await Promise.all([
      this.getMessageStats(schoolId, start, end),
      this.getNotificationStats(schoolId, start, end),
      this.getNoticeStats(schoolId, start, end),
      this.getTemplateStats(schoolId),
    ]);

    return {
      period: { start, end },
      messages: messageStats,
      notifications: notificationStats,
      notices: noticeStats,
      templates: templateStats,
      generatedAt: new Date(),
    };
  }

  private async getMessageStats(schoolId: string, start: Date, end: Date): Promise<any> {
    const messages = await this.messageRepository.find({
      where: {
        schoolId,
        createdAt: Between(start, end),
      },
    });

    return {
      total: messages.length,
      byType: this.groupBy(messages, 'messageType'),
      byStatus: this.groupBy(messages, 'status'),
      averageResponseTime: this.calculateAverageResponseTime(messages),
    };
  }

  private async getNotificationStats(schoolId: string, start: Date, end: Date): Promise<any> {
    const notifications = await this.notificationRepository.find({
      where: {
        schoolId,
        createdAt: Between(start, end),
      },
    });

    return {
      total: notifications.length,
      byType: this.groupBy(notifications, 'notificationType'),
      byStatus: this.groupBy(notifications, 'status'),
      byCategory: this.groupBy(notifications, 'category'),
      totalCost: notifications.reduce((sum, n) => sum + (n.cost || 0), 0),
    };
  }

  private async getNoticeStats(schoolId: string, start: Date, end: Date): Promise<any> {
    const notices = await this.noticeBoardRepository.find({
      where: {
        schoolId,
        createdAt: Between(start, end),
      },
    });

    return {
      total: notices.length,
      byType: this.groupBy(notices, 'noticeType'),
      byStatus: this.groupBy(notices, 'status'),
      totalViews: notices.reduce((sum, n) => sum + (n.viewCount || 0), 0),
      totalComments: notices.reduce((sum, n) => sum + (n.commentCount || 0), 0),
    };
  }

  private async getTemplateStats(schoolId: string): Promise<any> {
    const templates = await this.templateRepository.find({
      where: { schoolId },
    });

    return {
      total: templates.length,
      byType: this.groupBy(templates, 'templateType'),
      byStatus: this.groupBy(templates, 'status'),
      totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
    };
  }

  // Helper Methods
  private async notifyMessageRecipients(message: Message): Promise<void> {
    // Implementation for sending notifications about new messages
    this.logger.log(`Notifying recipients of message ${message.id}`);
  }

  private async notifyNoticeRecipients(notice: NoticeBoard): Promise<void> {
    // Implementation for sending notifications about new notices
    this.logger.log(`Notifying recipients of notice ${notice.id}`);
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const value = item[key];
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});
  }

  private calculateAverageResponseTime(messages: Message[]): number {
    // Calculate average response time for messages
    const responseTimes: number[] = [];

    messages.forEach(message => {
      if (message.sentAt && message.readAt) {
        responseTimes.push(message.readAt.getTime() - message.sentAt.getTime());
      }
    });

    if (responseTimes.length === 0) return 0;

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  // ==================== CUSTOM AUDIT METHODS ====================

  /**
   * Audit communication channel usage and preferences
   */
  async auditCommunicationChannelUsage(channelType: string, recipientCount: number, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_ACCESSED,
      resource: 'communication_channel',
      severity: recipientCount > 100 ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
      userId,
      schoolId,
      details: {
        channelType,
        recipientCount,
        timestamp: new Date(),
        module: 'communication',
        eventType: 'channel_usage',
      },
    });
  }

  /**
   * Audit bulk communication operations with sampling
   */
  async auditBulkCommunicationOperation(operation: string, totalRecipients: number, successCount: number, userId: string, schoolId?: string): Promise<void> {
    // Only audit if operation affects significant number of recipients or has failures
    if (totalRecipients >= 20 || successCount < totalRecipients) {
      await this.auditService.logActivity({
        action: AuditAction.DATA_UPDATED,
        resource: 'bulk_communication',
        severity: totalRecipients >= 100 ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
        userId,
        schoolId,
        details: {
          operation,
          totalRecipients,
          successCount,
          failureCount: totalRecipients - successCount,
          timestamp: new Date(),
          module: 'communication',
          eventType: 'bulk_operation',
          sampled: totalRecipients < 100, // Mark as sampled for smaller operations
        },
      });
    }
  }

  /**
   * Audit emergency communication alerts
   */
  async auditEmergencyCommunication(alertId: string, alertType: string, recipientCount: number, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.SECURITY_ALERT,
      resource: 'emergency_communication',
      resourceId: alertId,
      severity: AuditSeverity.HIGH,
      userId,
      schoolId,
      details: {
        alertType,
        recipientCount,
        timestamp: new Date(),
        module: 'communication',
        eventType: 'emergency_alert',
      },
    });
  }

  /**
   * Audit communication template usage
   */
  async auditTemplateUsage(templateId: string, usageType: string, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_ACCESSED,
      resource: 'communication_template',
      resourceId: templateId,
      severity: AuditSeverity.LOW,
      userId,
      schoolId,
      details: {
        usageType,
        timestamp: new Date(),
        module: 'communication',
        eventType: 'template_usage',
      },
    });
  }

  /**
   * Audit communication settings changes
   */
  async auditCommunicationSettingsChange(settingsType: string, changes: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resource: 'communication_settings',
      severity: AuditSeverity.MEDIUM,
      userId,
      schoolId,
      details: {
        settingsType,
        changes: this.sanitizeAuditData(changes),
        timestamp: new Date(),
        module: 'communication',
        eventType: 'settings_change',
      },
    });
  }

  /**
   * Sanitize sensitive data for audit logging
   */
  private sanitizeAuditData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'apiKey', 'secret', 'token', 'phoneNumber', 'email', 'personalInfo'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}