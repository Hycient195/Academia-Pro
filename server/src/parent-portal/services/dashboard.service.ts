import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan } from 'typeorm';
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { ParentStudentLink } from '../entities/parent-student-link.entity';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';
import { CommunicationRecord, CommunicationStatus, CommunicationCategory } from '../entities/communication-record.entity';
import { PaymentRecord, PaymentStatus } from '../entities/payment-record.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

export interface DashboardSummary {
  parentInfo: {
    name: string;
    accessLevel: string;
    lastLogin: Date;
    accountStatus: string;
  };
  children: Array<{
    studentId: string;
    relationship: string;
    authorizationLevel: string;
    isActive: boolean;
  }>;
  quickStats: {
    unreadMessages: number;
    upcomingAppointments: number;
    overduePayments: number;
    recentActivities: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    studentId?: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    type: string;
    title: string;
    date: Date;
    studentId?: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'urgent';
    title: string;
    message: string;
    actionRequired: boolean;
    studentId?: string;
  }>;
}

export interface ChildDashboard {
  studentId: string;
  academicOverview: {
    currentGrade: string;
    attendanceRate: number;
    recentGrades: Array<{
      subject: string;
      grade: string;
      date: Date;
    }>;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date;
  }>;
  upcomingEvents: Array<{
    type: string;
    title: string;
    date: Date;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

@Injectable()
export class ParentPortalDashboardService {
  private readonly logger = new Logger(ParentPortalDashboardService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
    @InjectRepository(PortalActivityLog)
    private portalActivityLogRepository: Repository<PortalActivityLog>,
    @InjectRepository(CommunicationRecord)
    private communicationRecordRepository: Repository<CommunicationRecord>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private dataSource: DataSource,
  ) {}

  async getDashboardSummary(parentPortalAccessId: string): Promise<DashboardSummary> {
    try {
      this.logger.log(`Getting dashboard summary for parent portal access: ${parentPortalAccessId}`);

      // Get parent portal access with parent info
      const parentPortalAccess = await this.parentPortalAccessRepository.findOne({
        where: { id: parentPortalAccessId },
        relations: ['parent'],
      });

      if (!parentPortalAccess) {
        throw new NotFoundException('Parent portal access not found');
      }

      // Get student links
      const studentLinks = await this.parentStudentLinkRepository.find({
        where: {
          parentPortalAccessId,
          isActive: true,
        },
      });

      // Get quick stats
      const quickStats = await this.getQuickStats(parentPortalAccessId, studentLinks);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(parentPortalAccessId, 10);

      // Get upcoming events
      const upcomingEvents = await this.getUpcomingEvents(parentPortalAccessId, studentLinks);

      // Get alerts
      const alerts = await this.getAlerts(parentPortalAccessId, studentLinks);

      return {
        parentInfo: {
          name: parentPortalAccess.parent?.profile?.firstName + ' ' + parentPortalAccess.parent?.profile?.lastName || 'Parent',
          accessLevel: parentPortalAccess.accessLevel,
          lastLogin: parentPortalAccess.lastLoginAt,
          accountStatus: parentPortalAccess.status,
        },
        children: studentLinks.map(link => ({
          studentId: link.studentId,
          relationship: link.relationshipType,
          authorizationLevel: link.authorizationLevel,
          isActive: link.isActive,
        })),
        quickStats,
        recentActivity,
        upcomingEvents,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Dashboard summary error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getChildDashboard(parentPortalAccessId: string, studentId: string): Promise<ChildDashboard> {
    try {
      this.logger.log(`Getting child dashboard for student: ${studentId}`);

      // Verify parent has access to this student
      const studentLink = await this.parentStudentLinkRepository.findOne({
        where: {
          parentPortalAccessId,
          studentId,
          isActive: true,
        },
      });

      if (!studentLink) {
        throw new NotFoundException('Access denied: Parent does not have access to this student');
      }

      // Get academic overview (mock data - would integrate with academic module)
      const academicOverview = await this.getAcademicOverview(studentId);

      // Get recent activity for this student
      const recentActivity = await this.getStudentRecentActivity(studentId, 5);

      // Get upcoming events for this student
      const upcomingEvents = await this.getStudentUpcomingEvents(studentId);

      // Get alerts for this student
      const alerts = await this.getStudentAlerts(studentId);

      return {
        studentId,
        academicOverview,
        recentActivity,
        upcomingEvents,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Child dashboard error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getNotifications(parentPortalAccessId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { unreadOnly = false, limit = 20, offset = 0 } = options || {};

      // Get communications for this parent
      const query = this.communicationRecordRepository.createQueryBuilder('comm')
        .where('comm.parent_portal_access_id = :parentPortalAccessId', { parentPortalAccessId })
        .andWhere('comm.communication_type IN (:...types)', {
          types: ['in_app_message', 'email', 'sms', 'push_notification']
        })
        .orderBy('comm.timestamp', 'DESC');

      if (unreadOnly) {
        query.andWhere('comm.is_read = false');
      }

      const [communications, total] = await query
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Get unread count
      const unreadCount = await this.communicationRecordRepository.count({
        where: {
          parentPortalAccessId,
          isRead: false,
          communicationType: 'in_app_message' as any,
        },
      });

      const notifications = communications.map(comm => ({
        id: comm.id,
        type: comm.communicationType,
        category: comm.category,
        subject: comm.subject,
        message: comm.message,
        isRead: comm.isRead,
        timestamp: comm.timestamp,
        priority: comm.priority,
        senderName: comm.senderName,
        hasAttachments: comm.attachments && comm.attachments.length > 0,
      }));

      return {
        notifications,
        total,
        unreadCount,
      };
    } catch (error) {
      this.logger.error(`Notifications error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markNotificationAsRead(parentPortalAccessId: string, notificationId: string): Promise<void> {
    try {
      const communication = await this.communicationRecordRepository.findOne({
        where: {
          id: notificationId,
          parentPortalAccessId,
        },
      });

      if (!communication) {
        throw new NotFoundException('Notification not found');
      }

      communication.isRead = true;
      communication.readAt = new Date();

      await this.communicationRecordRepository.save(communication);

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.VIEW_MESSAGES,
        `Marked notification as read: ${communication.subject}`,
        null,
      );
    } catch (error) {
      this.logger.error(`Mark notification as read error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async getQuickStats(parentPortalAccessId: string, studentLinks: ParentStudentLink[]): Promise<DashboardSummary['quickStats']> {
    const studentIds = studentLinks.map(link => link.studentId);

    // Count unread messages
    const unreadMessages = await this.communicationRecordRepository.count({
      where: {
        parentPortalAccessId,
        isRead: false,
        communicationType: 'in_app_message' as any,
      },
    });

    // Count upcoming appointments
    const upcomingAppointments = await this.appointmentRepository.count({
      where: {
        parentPortalAccessId,
        appointmentDate: MoreThan(new Date()),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    // Count overdue payments
    const overduePayments = await this.paymentRecordRepository.count({
      where: {
        parentPortalAccessId,
        status: PaymentStatus.PENDING,
        dueDate: new Date(), // Due date <= today
      },
    });

    // Count recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await this.portalActivityLogRepository.count({
      where: {
        parentPortalAccessId,
        timestamp: MoreThan(sevenDaysAgo),
      },
    });

    return {
      unreadMessages,
      upcomingAppointments,
      overduePayments,
      recentActivities,
    };
  }

  private async getRecentActivity(parentPortalAccessId: string, limit: number): Promise<DashboardSummary['recentActivity']> {
    const activities = await this.portalActivityLogRepository.find({
      where: { parentPortalAccessId },
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return activities.map(activity => ({
      id: activity.id,
      type: activity.activityType,
      description: activity.description,
      timestamp: activity.timestamp,
      studentId: activity.studentId,
    }));
  }

  private async getUpcomingEvents(parentPortalAccessId: string, studentLinks: ParentStudentLink[]): Promise<DashboardSummary['upcomingEvents']> {
    const studentIds = studentLinks.map(link => link.studentId);

    // Get upcoming appointments
    const appointments = await this.appointmentRepository.find({
      where: {
        parentPortalAccessId,
        appointmentDate: MoreThan(new Date()),
        status: AppointmentStatus.CONFIRMED,
      },
      order: { appointmentDate: 'ASC' },
      take: 5,
    });

    return appointments.map(appointment => ({
      id: appointment.id,
      type: 'appointment',
      title: appointment.title,
      date: appointment.appointmentDate,
      studentId: appointment.studentId,
    }));
  }

  private async getAlerts(parentPortalAccessId: string, studentLinks: ParentStudentLink[]): Promise<DashboardSummary['alerts']> {
    const alerts: DashboardSummary['alerts'] = [];

    // Check for overdue payments
    const overduePayments = await this.paymentRecordRepository.find({
      where: {
        parentPortalAccessId,
        status: PaymentStatus.PENDING,
        dueDate: new Date(),
      },
      take: 3,
    });

    overduePayments.forEach(payment => {
      alerts.push({
        id: `payment-${payment.id}`,
        type: 'warning',
        title: 'Overdue Payment',
        message: `Payment of ${payment.amount} for ${payment.description} is overdue`,
        actionRequired: true,
        studentId: payment.studentId,
      });
    });

    // Check for unread urgent communications
    const urgentCommunications = await this.communicationRecordRepository.find({
      where: {
        parentPortalAccessId,
        isRead: false,
        priority: 'urgent' as any,
        category: CommunicationCategory.EMERGENCY,
      },
      take: 3,
    });

    urgentCommunications.forEach(comm => {
      alerts.push({
        id: `urgent-${comm.id}`,
        type: 'urgent',
        title: 'Urgent Message',
        message: comm.subject,
        actionRequired: true,
        studentId: comm.studentId,
      });
    });

    return alerts;
  }

  private async getAcademicOverview(studentId: string): Promise<ChildDashboard['academicOverview']> {
    // Mock data - would integrate with academic module
    return {
      currentGrade: 'A-',
      attendanceRate: 95.5,
      recentGrades: [
        { subject: 'Mathematics', grade: 'A', date: new Date() },
        { subject: 'English', grade: 'A-', date: new Date() },
        { subject: 'Science', grade: 'B+', date: new Date() },
      ],
    };
  }

  private async getStudentRecentActivity(studentId: string, limit: number): Promise<ChildDashboard['recentActivity']> {
    const activities = await this.portalActivityLogRepository.find({
      where: { studentId },
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return activities.map(activity => ({
      type: activity.activityType,
      description: activity.description,
      date: activity.timestamp,
    }));
  }

  private async getStudentUpcomingEvents(studentId: string): Promise<ChildDashboard['upcomingEvents']> {
    const appointments = await this.appointmentRepository.find({
      where: {
        studentId,
        appointmentDate: MoreThan(new Date()),
        status: AppointmentStatus.CONFIRMED,
      },
      order: { appointmentDate: 'ASC' },
      take: 3,
    });

    return appointments.map(appointment => ({
      type: 'appointment',
      title: appointment.title,
      date: appointment.appointmentDate,
    }));
  }

  private async getStudentAlerts(studentId: string): Promise<ChildDashboard['alerts']> {
    const alerts: ChildDashboard['alerts'] = [];

    // Check for upcoming assignments, low grades, etc.
    // Mock alerts
    alerts.push({
      type: 'assignment',
      message: 'Mathematics homework due tomorrow',
      priority: 'high',
    });

    return alerts;
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