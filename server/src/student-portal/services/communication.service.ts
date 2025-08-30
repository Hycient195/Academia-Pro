import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentCommunicationRecord, CommunicationType, CommunicationDirection, CommunicationChannel } from '../entities/student-communication-record.entity';
import { StudentActivityLog, StudentActivityType } from '../entities/student-activity-log.entity';

export interface MessageDto {
  id: string;
  type: 'teacher' | 'parent' | 'admin' | 'system';
  senderId: string;
  senderName: string;
  senderRole: string;
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  attachments?: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
  createdAt: Date;
  readAt?: Date;
}

export interface SendMessageDto {
  recipientId: string;
  recipientType: 'teacher' | 'parent' | 'admin';
  subject: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
}

export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'events' | 'general' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishedAt: Date;
  expiresAt?: Date;
  isRead: boolean;
}

export interface ContactDto {
  id: string;
  name: string;
  role: string;
  type: 'teacher' | 'counselor' | 'admin' | 'support';
  email?: string;
  phone?: string;
  subjects?: string[];
  officeHours?: string;
  isPrimaryContact: boolean;
}

@Injectable()
export class StudentPortalCommunicationService {
  private readonly logger = new Logger(StudentPortalCommunicationService.name);

  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
    @InjectRepository(StudentCommunicationRecord)
    private communicationRepository: Repository<StudentCommunicationRecord>,
    @InjectRepository(StudentActivityLog)
    private activityLogRepository: Repository<StudentActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getMessages(
    studentId: string,
    filters: {
      type?: 'teacher' | 'parent' | 'admin' | 'system';
      status?: 'unread' | 'read' | 'archived';
      limit?: number;
      offset?: number;
    },
  ): Promise<MessageDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // Build query
    const query = this.communicationRepository
      .createQueryBuilder('comm')
      .where('comm.studentPortalAccessId = :portalAccessId', {
        portalAccessId: portalAccess.id,
      })
      .orderBy('comm.createdAt', 'DESC');

    if (filters.type) {
      query.andWhere('comm.communicationType = :type', { type: filters.type });
    }

    if (filters.status) {
      if (filters.status === 'unread') {
        query.andWhere('comm.isRead = :isRead', { isRead: false });
      } else if (filters.status === 'read') {
        query.andWhere('comm.isRead = :isRead', { isRead: true });
      } else if (filters.status === 'archived') {
        query.andWhere('comm.isArchived = :isArchived', { isArchived: true });
      }
    }

    if (filters.limit) {
      query.limit(Math.min(filters.limit, 100)); // Max 100 messages
    } else {
      query.limit(20); // Default 20 messages
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    const communications = await query.getMany();

    return communications.map(comm => ({
      id: comm.id,
      type: comm.communicationType as any,
      senderId: comm.senderId || '',
      senderName: comm.senderName || 'System',
      senderRole: comm.senderRole || 'Unknown',
      subject: comm.subject,
      content: comm.messageContent,
      priority: comm.priorityLevel as any,
      status: comm.isRead ? 'read' : 'unread',
      attachments: comm.attachments || [],
      createdAt: comm.createdAt,
      readAt: comm.readAt,
    }));
  }

  async getMessage(studentId: string, messageId: string): Promise<MessageDto | null> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return null;
    }

    const communication = await this.communicationRepository.findOne({
      where: {
        id: messageId,
        studentPortalAccessId: portalAccess.id,
      },
    });

    if (!communication) {
      return null;
    }

    // Mark as read if not already read
    if (!communication.isRead) {
      await this.communicationRepository.update(messageId, {
        isRead: true,
        readAt: new Date(),
      });
    }

    return {
      id: communication.id,
      type: communication.communicationType as any,
      senderId: communication.senderId || '',
      senderName: communication.senderName || 'System',
      senderRole: communication.senderRole || 'Unknown',
      subject: communication.subject,
      content: communication.messageContent,
      priority: communication.priorityLevel as any,
      status: communication.isRead ? 'read' : 'unread',
      attachments: communication.attachments || [],
      createdAt: communication.createdAt,
      readAt: communication.readAt,
    };
  }

  async sendMessage(studentId: string, messageData: SendMessageDto): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    // Create communication record
    const communication = this.communicationRepository.create({
      studentPortalAccessId: portalAccess.id,
      communicationType: CommunicationType.TEACHER_MESSAGE,
      direction: CommunicationDirection.OUTGOING,
      channel: CommunicationChannel.PORTAL_MESSAGE,
      senderId: studentId,
      senderName: `${portalAccess.student?.firstName} ${portalAccess.student?.lastName}`,
      senderRole: 'student',
      recipientId: messageData.recipientId,
      subject: messageData.subject,
      messageContent: messageData.content,
      priorityLevel: messageData.priority || 'normal',
      attachments: messageData.attachments || [],
      isRead: false,
      hasAttachments: (messageData.attachments && messageData.attachments.length > 0) || false,
    } as any);

    const savedCommunication = await this.communicationRepository.save(communication);

    // Log activity
    const comm = Array.isArray(savedCommunication) ? savedCommunication[0] : savedCommunication;
    const activityLog = this.activityLogRepository.create({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.COMMUNICATION_SEND,
      activityDescription: `Sent message to ${messageData.recipientType}`,
      resourceId: comm.id,
      resourceType: 'communication',
      metadata: {
        recipientType: messageData.recipientType,
        subject: messageData.subject,
      },
    } as any);

    await this.activityLogRepository.save(activityLog);

    return {
      id: comm.id,
      status: 'sent',
      sentAt: comm.createdAt,
    };
  }

  async markMessageAsRead(studentId: string, messageId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    const result = await this.communicationRepository.update(
      {
        id: messageId,
        studentPortalAccessId: portalAccess.id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    if (result.affected === 0) {
      throw new Error('Message not found or access denied');
    }

    return { success: true, messageId };
  }

  async archiveMessage(studentId: string, messageId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    const result = await this.communicationRepository.update(
      {
        id: messageId,
        studentPortalAccessId: portalAccess.id,
      },
      {
        metadata: {
          archived: true,
          archivedAt: new Date(),
        },
      } as any,
    );

    if (result.affected === 0) {
      throw new Error('Message not found or access denied');
    }

    return { success: true, messageId };
  }

  async getAnnouncements(
    studentId: string,
    filters: {
      category?: 'academic' | 'events' | 'general' | 'emergency';
      limit?: number;
    },
  ): Promise<AnnouncementDto[]> {
    // TODO: Implement announcements retrieval
    // This would integrate with the Communication module's notice board
    return [
      {
        id: 'announcement-001',
        title: 'Welcome to the New Academic Year',
        content: 'We are excited to welcome all students back for the new academic year...',
        category: 'general',
        priority: 'normal',
        publishedAt: new Date(),
        isRead: false,
      },
    ];
  }

  async getContacts(
    studentId: string,
    type?: 'teacher' | 'counselor' | 'admin' | 'support',
  ): Promise<ContactDto[]> {
    // TODO: Implement contacts retrieval
    // This would integrate with Staff, Academic, and other modules
    return [
      {
        id: 'contact-001',
        name: 'John Smith',
        role: 'Mathematics Teacher',
        type: 'teacher',
        email: 'john.smith@school.edu',
        phone: '+1234567890',
        subjects: ['Mathematics', 'Statistics'],
        officeHours: 'Mon-Fri 2:00 PM - 4:00 PM',
        isPrimaryContact: true,
      },
    ];
  }

  async getCommunicationPreferences(studentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    // TODO: Implement preferences storage and retrieval
    // For now, return default preferences
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationTypes: {
        assignments: true,
        grades: true,
        attendance: true,
        events: true,
        announcements: true,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
    };
  }

  async updateCommunicationPreferences(studentId: string, preferences: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    // TODO: Implement preferences update
    // For now, just return success
    return {
      success: true,
      updatedAt: new Date(),
      preferences,
    };
  }
}