import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { ParentStudentLink, AuthorizationLevel } from '../entities/parent-student-link.entity';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';
import { CommunicationRecord, CommunicationType, CommunicationDirection, CommunicationStatus, CommunicationPriority, CommunicationCategory } from '../entities/communication-record.entity';
import { Appointment, AppointmentType, AppointmentStatus, AppointmentPriority } from '../entities/appointment.entity';

export interface MessageThread {
  threadId: string;
  participants: Array<{
    id: string;
    name: string;
    type: 'parent' | 'teacher' | 'admin' | 'system';
    avatar?: string;
  }>;
  subject: string;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  status: 'active' | 'archived' | 'resolved';
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    isRead: boolean;
  };
  messageCount: number;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  studentId?: string;
}

export interface MessageList {
  messages: Array<{
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    senderType: 'parent' | 'teacher' | 'admin' | 'system';
    recipientId: string;
    recipientName: string;
    subject: string;
    content: string;
    communicationType: CommunicationType;
    category: CommunicationCategory;
    priority: CommunicationPriority;
    status: CommunicationStatus;
    isRead: boolean;
    readAt?: Date;
    sentAt: Date;
    attachments: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      url: string;
    }>;
    metadata?: any;
  }>;
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface AppointmentRequest {
  studentId: string;
  appointmentType: AppointmentType;
  preferredDate: Date;
  preferredTime?: string;
  durationMinutes?: number;
  title: string;
  description?: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  requestedBy: string;
  contactPhone?: string;
  specialRequirements?: string;
}

export interface AppointmentSlot {
  date: Date;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    teacherId?: string;
    teacherName?: string;
  }>;
}

export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  sentToday: number;
  receivedToday: number;
  activeThreads: number;
  averageResponseTime: number; // in hours
  communicationByCategory: Record<CommunicationCategory, number>;
  communicationByType: Record<CommunicationType, number>;
  topContacts: Array<{
    contactId: string;
    contactName: string;
    contactType: string;
    messageCount: number;
    lastContact: Date;
  }>;
}

@Injectable()
export class ParentPortalCommunicationService {
  private readonly logger = new Logger(ParentPortalCommunicationService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
    @InjectRepository(PortalActivityLog)
    private portalActivityLogRepository: Repository<PortalActivityLog>,
    @InjectRepository(CommunicationRecord)
    private communicationRecordRepository: Repository<CommunicationRecord>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private dataSource: DataSource,
  ) {}

  async getMessageThreads(
    parentPortalAccessId: string,
    options?: {
      category?: CommunicationCategory;
      status?: 'active' | 'archived' | 'resolved';
      studentId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    threads: MessageThread[];
    total: number;
    unreadCount: number;
  }> {
    try {
      this.logger.log(`Getting message threads for parent: ${parentPortalAccessId}`);

      const { category, status = 'active', studentId, limit = 20, offset = 0 } = options || {};

      // Get all communications for this parent
      const query = this.communicationRecordRepository.createQueryBuilder('comm')
        .where('comm.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId })
        .andWhere('comm.communication_type IN (:...types)', {
          types: ['in_app_message', 'email', 'sms']
        });

      if (category) {
        query.andWhere('comm.category = :category', { category });
      }

      if (studentId) {
        query.andWhere('comm.student_id = :studentId', { studentId });
      }

      // Group by conversation threads (simplified - using subject as thread identifier)
      const communications = await query
        .orderBy('comm.timestamp', 'DESC')
        .skip(offset)
        .take(limit * 2) // Get more to group into threads
        .getMany();

      // Group communications into threads
      const threadMap = new Map<string, CommunicationRecord[]>();
      communications.forEach(comm => {
        const threadKey = `${comm.subject}_${comm.studentId || 'general'}`;
        if (!threadMap.has(threadKey)) {
          threadMap.set(threadKey, []);
        }
        threadMap.get(threadKey)!.push(comm);
      });

      // Convert to MessageThread format
      const threads: MessageThread[] = [];
      for (const [threadKey, threadMessages] of threadMap.entries()) {
        const sortedMessages = threadMessages.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const lastMessage = sortedMessages[0];
        const unreadCount = sortedMessages.filter(m => !m.isRead).length;

        threads.push({
          threadId: threadKey,
          participants: this.extractParticipants(sortedMessages),
          subject: lastMessage.subject,
          category: lastMessage.category,
          priority: lastMessage.priority,
          status: this.determineThreadStatus(sortedMessages),
          lastMessage: {
            content: lastMessage.message,
            senderId: lastMessage.senderId || 'system',
            senderName: lastMessage.senderName || 'System',
            timestamp: lastMessage.timestamp,
            isRead: lastMessage.isRead,
          },
          messageCount: sortedMessages.length,
          unreadCount,
          createdAt: sortedMessages[sortedMessages.length - 1].timestamp,
          updatedAt: lastMessage.timestamp,
          studentId: lastMessage.studentId,
        });
      }

      // Sort threads by last message timestamp
      threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      // Calculate total unread count
      const unreadCount = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

      this.logger.log(`Message threads retrieved for parent: ${parentPortalAccessId}, threads: ${threads.length}, unread: ${unreadCount}`);

      return {
        threads: threads.slice(0, limit),
        total: threads.length,
        unreadCount,
      };
    } catch (error) {
      this.logger.error(`Message threads error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMessages(
    parentPortalAccessId: string,
    threadId?: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<MessageList> {
    try {
      this.logger.log(`Getting messages for parent: ${parentPortalAccessId}, thread: ${threadId}`);

      const { limit = 50, offset = 0, startDate, endDate } = options || {};

      let query = this.communicationRecordRepository.createQueryBuilder('comm')
        .where('comm.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId })
        .andWhere('comm.communication_type IN (:...types)', {
          types: ['in_app_message', 'email', 'sms']
        });

      if (threadId) {
        // Parse thread ID to get subject and student ID
        const [subject, studentId] = threadId.split('_');
        query = query.andWhere('comm.subject = :subject', { subject });
        if (studentId !== 'general') {
          query = query.andWhere('comm.student_id = :studentId', { studentId });
        }
      }

      if (startDate) {
        query = query.andWhere('comm.timestamp >= :startDate', { startDate });
      }

      if (endDate) {
        query = query.andWhere('comm.timestamp <= :endDate', { endDate });
      }

      const [communications, total] = await query
        .orderBy('comm.timestamp', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Calculate unread count
      const unreadCount = await this.communicationRecordRepository.count({
        where: {
          parentPortalAccessId,
          isRead: false,
          communicationType: 'in_app_message' as any,
        },
      });

      const messages = communications.map(comm => ({
        messageId: comm.id,
        threadId: threadId || `${comm.subject}_${comm.studentId || 'general'}`,
        senderId: comm.senderId || 'system',
        senderName: comm.senderName || 'System',
        senderType: this.getSenderType(comm.senderType),
        recipientId: parentPortalAccessId,
        recipientName: 'Parent',
        subject: comm.subject,
        content: comm.message,
        communicationType: comm.communicationType,
        category: comm.category,
        priority: comm.priority,
        status: comm.status,
        isRead: comm.isRead,
        readAt: comm.readAt,
        sentAt: comm.timestamp,
        attachments: comm.attachments || [],
        metadata: comm.metadata,
      }));

      this.logger.log(`Messages retrieved for parent: ${parentPortalAccessId}, count: ${messages.length}, unread: ${unreadCount}`);

      return {
        messages,
        total,
        unreadCount,
        page: Math.floor(offset / limit) + 1,
        limit,
      };
    } catch (error) {
      this.logger.error(`Messages error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendMessage(
    parentPortalAccessId: string,
    messageData: {
      studentId?: string;
      recipientId: string;
      recipientType: 'teacher' | 'admin' | 'school';
      subject: string;
      message: string;
      category: CommunicationCategory;
      priority?: CommunicationPriority;
      attachments?: Array<{
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
      }>;
    },
  ): Promise<{
    messageId: string;
    status: CommunicationStatus;
    sentAt: Date;
  }> {
    try {
      this.logger.log(`Sending message from parent: ${parentPortalAccessId} to ${messageData.recipientType}: ${messageData.recipientId}`);

      // Verify parent has access to the student (if specified)
      if (messageData.studentId) {
        await this.verifyStudentAccess(parentPortalAccessId, messageData.studentId, AuthorizationLevel.LIMITED);
      }

      // Create communication record
      const communication = await this.communicationRecordRepository.save({
        parentPortalAccessId,
        studentId: messageData.studentId,
        schoolId: '', // Would get from parent access
        senderId: parentPortalAccessId,
        senderType: 'parent',
        senderName: 'Parent', // Would get from parent profile
        communicationType: CommunicationType.IN_APP_MESSAGE,
        direction: CommunicationDirection.OUTBOUND,
        status: CommunicationStatus.SENT,
        priority: messageData.priority || CommunicationPriority.NORMAL,
        category: messageData.category,
        subject: messageData.subject,
        message: messageData.message,
        attachments: messageData.attachments,
        isRead: false,
        metadata: {
          recipientId: messageData.recipientId,
          recipientType: messageData.recipientType,
          sentAt: new Date(),
        },
      });

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.SEND_MESSAGE,
        `Sent message to ${messageData.recipientType}: ${messageData.subject}`,
        messageData.studentId,
      );

      this.logger.log(`Message sent successfully: ${communication.id}`);

      return {
        messageId: communication.id,
        status: communication.status,
        sentAt: communication.timestamp,
      };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markMessageAsRead(
    parentPortalAccessId: string,
    messageId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Marking message as read: ${messageId}, parent: ${parentPortalAccessId}`);

      const communication = await this.communicationRecordRepository.findOne({
        where: {
          id: messageId,
          parentPortalAccessId,
        },
      });

      if (!communication) {
        throw new NotFoundException('Message not found');
      }

      if (!communication.isRead) {
        communication.isRead = true;
        communication.readAt = new Date();
        await this.communicationRecordRepository.save(communication);
      }

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.VIEW_MESSAGES,
        `Marked message as read: ${communication.subject}`,
        communication.studentId,
      );

      this.logger.log(`Message marked as read: ${messageId}`);
    } catch (error) {
      this.logger.error(`Mark message as read error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestAppointment(
    parentPortalAccessId: string,
    appointmentData: AppointmentRequest,
  ): Promise<{
    appointmentId: string;
    status: AppointmentStatus;
    requestedAt: Date;
    estimatedResponseTime: string;
  }> {
    try {
      this.logger.log(`Requesting appointment for student: ${appointmentData.studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to the student
      await this.verifyStudentAccess(parentPortalAccessId, appointmentData.studentId, AuthorizationLevel.LIMITED);

      // Create appointment record
      const appointment = await this.appointmentRepository.save({
        parentPortalAccessId,
        studentId: appointmentData.studentId,
        schoolId: '', // Would get from parent access
        appointmentType: appointmentData.appointmentType,
        status: AppointmentStatus.REQUESTED,
        priority: this.mapUrgencyToPriority(appointmentData.urgency),
        title: appointmentData.title,
        description: appointmentData.description,
        appointmentDate: appointmentData.preferredDate,
        durationMinutes: appointmentData.durationMinutes || 30,
        requestedAt: new Date(),
        createdBy: appointmentData.requestedBy,
      });

      // Create communication record for the appointment request
      await this.communicationRecordRepository.save({
        parentPortalAccessId,
        studentId: appointmentData.studentId,
        schoolId: '', // Would get from parent access
        communicationType: CommunicationType.IN_APP_MESSAGE,
        direction: CommunicationDirection.OUTBOUND,
        status: CommunicationStatus.SENT,
        priority: CommunicationPriority.NORMAL,
        category: CommunicationCategory.ADMINISTRATIVE,
        subject: `Appointment Request: ${appointmentData.title}`,
        message: `Appointment requested for ${appointmentData.appointmentType} on ${appointmentData.preferredDate.toDateString()}. ${appointmentData.description || ''}`,
        isRead: false,
        metadata: {
          appointmentId: appointment.id,
          appointmentType: appointmentData.appointmentType,
          preferredDate: appointmentData.preferredDate,
          contactPhone: appointmentData.contactPhone,
          specialRequirements: appointmentData.specialRequirements,
        },
      });

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.BOOK_APPOINTMENT,
        `Requested appointment: ${appointmentData.title}`,
        appointmentData.studentId,
      );

      this.logger.log(`Appointment requested successfully: ${appointment.id}`);

      return {
        appointmentId: appointment.id,
        status: appointment.status,
        requestedAt: appointment.requestedAt!,
        estimatedResponseTime: this.getEstimatedResponseTime(appointmentData.urgency),
      };
    } catch (error) {
      this.logger.error(`Request appointment error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAppointmentSlots(
    parentPortalAccessId: string,
    studentId: string,
    teacherId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentSlot[]> {
    try {
      this.logger.log(`Getting appointment slots for teacher: ${teacherId}, student: ${studentId}`);

      // Verify parent has access to the student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.LIMITED);

      // Get existing appointments for the date range
      const existingAppointments = await this.appointmentRepository.find({
        where: {
          appointmentDate: Between(startDate, endDate),
          status: AppointmentStatus.CONFIRMED,
        },
      });

      // Generate available slots (mock implementation)
      const slots: AppointmentSlot[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Weekdays only
          const daySlots = this.generateDaySlots(currentDate, existingAppointments);
          if (daySlots.timeSlots.some(slot => slot.available)) {
            slots.push({
              date: new Date(currentDate),
              timeSlots: daySlots.timeSlots,
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.logger.log(`Appointment slots retrieved: ${slots.length} days with available slots`);

      return slots;
    } catch (error) {
      this.logger.error(`Get appointment slots error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAppointments(
    parentPortalAccessId: string,
    options?: {
      studentId?: string;
      status?: AppointmentStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    appointments: Array<{
      appointmentId: string;
      studentId: string;
      appointmentType: AppointmentType;
      title: string;
      description?: string;
      appointmentDate: Date;
      durationMinutes: number;
      status: AppointmentStatus;
      priority: AppointmentPriority;
      teacherName?: string;
      location?: string;
      notes?: string;
      createdAt: Date;
    }>;
    total: number;
    upcomingCount: number;
  }> {
    try {
      this.logger.log(`Getting appointments for parent: ${parentPortalAccessId}`);

      const { studentId, status, startDate, endDate, limit = 20, offset = 0 } = options || {};

      let query = this.appointmentRepository.createQueryBuilder('appt')
        .where('appt.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId });

      if (studentId) {
        query = query.andWhere('appt.student_id = :studentId', { studentId });
      }

      if (status) {
        query = query.andWhere('appt.status = :status', { status });
      }

      if (startDate) {
        query = query.andWhere('appt.appointment_date >= :startDate', { startDate });
      }

      if (endDate) {
        query = query.andWhere('appt.appointment_date <= :endDate', { endDate });
      }

      const [appointments, total] = await query
        .orderBy('appt.appointment_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Count upcoming appointments
      const upcomingCount = await this.appointmentRepository.count({
        where: {
          parentPortalAccessId,
          appointmentDate: MoreThan(new Date()),
          status: AppointmentStatus.CONFIRMED,
        },
      });

      const formattedAppointments = appointments.map(appt => ({
        appointmentId: appt.id,
        studentId: appt.studentId,
        appointmentType: appt.appointmentType,
        title: appt.title,
        description: appt.description,
        appointmentDate: appt.appointmentDate,
        durationMinutes: appt.durationMinutes,
        status: appt.status,
        priority: appt.priority,
        teacherName: appt.teacherName,
        location: appt.location,
        notes: appt.notes,
        createdAt: appt.createdAt,
      }));

      this.logger.log(`Appointments retrieved for parent: ${parentPortalAccessId}, count: ${total}, upcoming: ${upcomingCount}`);

      return {
        appointments: formattedAppointments,
        total,
        upcomingCount,
      };
    } catch (error) {
      this.logger.error(`Get appointments error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCommunicationStats(
    parentPortalAccessId: string,
    timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ): Promise<CommunicationStats> {
    try {
      this.logger.log(`Getting communication stats for parent: ${parentPortalAccessId}, range: ${timeRange}`);

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get communication statistics
      const [totalMessages, unreadMessages, sentToday, receivedToday] = await Promise.all([
        this.communicationRecordRepository.count({
          where: {
            parentPortalAccessId,
            timestamp: Between(startDate, endDate),
          },
        }),
        this.communicationRecordRepository.count({
          where: {
            parentPortalAccessId,
            isRead: false,
          },
        }),
        this.communicationRecordRepository.count({
          where: {
            parentPortalAccessId,
            direction: CommunicationDirection.OUTBOUND,
            timestamp: MoreThan(new Date(new Date().setHours(0, 0, 0, 0))),
          },
        }),
        this.communicationRecordRepository.count({
          where: {
            parentPortalAccessId,
            direction: CommunicationDirection.INBOUND,
            timestamp: MoreThan(new Date(new Date().setHours(0, 0, 0, 0))),
          },
        }),
      ]);

      // Get communication by category
      const categoryStats = await this.communicationRecordRepository
        .createQueryBuilder('comm')
        .select('comm.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('comm.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId })
        .andWhere('comm.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
        .groupBy('comm.category')
        .getRawMany();

      const communicationByCategory: Record<CommunicationCategory, number> = {
        [CommunicationCategory.ACADEMIC]: 0,
        [CommunicationCategory.ATTENDANCE]: 0,
        [CommunicationCategory.BEHAVIOR]: 0,
        [CommunicationCategory.HEALTH]: 0,
        [CommunicationCategory.ADMINISTRATIVE]: 0,
        [CommunicationCategory.EMERGENCY]: 0,
        [CommunicationCategory.EVENT]: 0,
        [CommunicationCategory.GENERAL]: 0,
      };

      categoryStats.forEach(stat => {
        communicationByCategory[stat.category] = parseInt(stat.count);
      });

      // Get communication by type
      const typeStats = await this.communicationRecordRepository
        .createQueryBuilder('comm')
        .select('comm.communication_type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('comm.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId })
        .andWhere('comm.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
        .groupBy('comm.communication_type')
        .getRawMany();

      const communicationByType: Record<CommunicationType, number> = {
        [CommunicationType.EMAIL]: 0,
        [CommunicationType.SMS]: 0,
        [CommunicationType.PUSH_NOTIFICATION]: 0,
        [CommunicationType.IN_APP_MESSAGE]: 0,
        [CommunicationType.PHONE_CALL]: 0,
        [CommunicationType.VIDEO_CALL]: 0,
      };

      typeStats.forEach(stat => {
        communicationByType[stat.type] = parseInt(stat.count);
      });

      // Get top contacts (mock data)
      const topContacts = [
        {
          contactId: 'teacher-001',
          contactName: 'Ms. Johnson',
          contactType: 'teacher',
          messageCount: 15,
          lastContact: new Date(),
        },
        {
          contactId: 'admin-001',
          contactName: 'Mr. Smith',
          contactType: 'admin',
          messageCount: 8,
          lastContact: new Date(Date.now() - 86400000),
        },
      ];

      const stats: CommunicationStats = {
        totalMessages,
        unreadMessages,
        sentToday,
        receivedToday,
        activeThreads: Math.floor(totalMessages / 3), // Rough estimate
        averageResponseTime: 4.2, // Mock data
        communicationByCategory,
        communicationByType,
        topContacts,
      };

      this.logger.log(`Communication stats retrieved for parent: ${parentPortalAccessId}`, stats);

      return stats;
    } catch (error) {
      this.logger.error(`Communication stats error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async verifyStudentAccess(
    parentPortalAccessId: string,
    studentId: string,
    requiredLevel: AuthorizationLevel,
  ): Promise<void> {
    const studentLink = await this.parentStudentLinkRepository.findOne({
      where: {
        parentPortalAccessId,
        studentId,
        isActive: true,
      },
    });

    if (!studentLink) {
      throw new NotFoundException('Student not found or access denied');
    }

    if (!studentLink.isAuthorizedFor(requiredLevel)) {
      throw new ForbiddenException(`Insufficient authorization level. Required: ${requiredLevel}`);
    }
  }

  private extractParticipants(messages: CommunicationRecord[]): Array<{
    id: string;
    name: string;
    type: 'parent' | 'teacher' | 'admin' | 'system';
    avatar?: string;
  }> {
    const participants = new Map<string, any>();

    messages.forEach(message => {
      const senderId = message.senderId || 'system';
      const senderName = message.senderName || 'System';
      const senderType = this.getSenderType(message.senderType);

      if (!participants.has(senderId)) {
        participants.set(senderId, {
          id: senderId,
          name: senderName,
          type: senderType,
        });
      }
    });

    return Array.from(participants.values());
  }

  private determineThreadStatus(messages: CommunicationRecord[]): 'active' | 'archived' | 'resolved' {
    const lastMessage = messages[0];
    const daysSinceLastMessage = (Date.now() - new Date(lastMessage.timestamp).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastMessage > 30) {
      return 'archived';
    }

    if (lastMessage.category === CommunicationCategory.EMERGENCY) {
      return 'resolved';
    }

    return 'active';
  }

  private getSenderType(senderType?: string): 'parent' | 'teacher' | 'admin' | 'system' {
    switch (senderType) {
      case 'teacher':
        return 'teacher';
      case 'admin':
        return 'admin';
      case 'parent':
        return 'parent';
      default:
        return 'system';
    }
  }

  private mapUrgencyToPriority(urgency: string): AppointmentPriority {
    switch (urgency) {
      case 'urgent':
        return AppointmentPriority.URGENT;
      case 'high':
        return AppointmentPriority.HIGH;
      case 'low':
        return AppointmentPriority.LOW;
      default:
        return AppointmentPriority.NORMAL;
    }
  }

  private getEstimatedResponseTime(urgency: string): string {
    switch (urgency) {
      case 'urgent':
        return 'Within 2 hours';
      case 'high':
        return 'Within 24 hours';
      case 'low':
        return 'Within 3-5 business days';
      default:
        return 'Within 1-2 business days';
    }
  }

  private generateDaySlots(date: Date, existingAppointments: Appointment[]): {
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      teacherId?: string;
      teacherName?: string;
    }>;
  } {
    const timeSlots = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) { // 30-minute slots
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = minute === 0
          ? `${hour.toString().padStart(2, '0')}:30`
          : `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Check if slot is available
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        const isAvailable = !existingAppointments.some(appt => {
          const apptStart = new Date(appt.appointmentDate);
          const apptEnd = new Date(apptStart.getTime() + (appt.durationMinutes || 30) * 60000);
          return slotDateTime >= apptStart && slotDateTime < apptEnd;
        });

        timeSlots.push({
          startTime,
          endTime,
          available: isAvailable,
          teacherId: isAvailable ? 'teacher-001' : undefined,
          teacherName: isAvailable ? 'Ms. Johnson' : undefined,
        });
      }
    }

    return { timeSlots };
  }

  private async logActivity(
    parentPortalAccessId: string,
    activityType: PortalActivityType,
    description: string,
    studentId?: string,
  ): Promise<void> {
    try {
      await this.portalActivityLogRepository.save({
        parentPortalAccessId,
        studentId,
        activityType,
        description,
        action: activityType.replace('_', ' '),
        ipAddress: 'system', // Would get from request context
        success: true,
      });
    } catch (error) {
      this.logger.error('Failed to log activity', error);
    }
  }
}