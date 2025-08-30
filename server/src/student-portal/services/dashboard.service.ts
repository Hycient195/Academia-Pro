import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentActivityLog } from '../entities/student-activity-log.entity';
import { StudentCommunicationRecord } from '../entities/student-communication-record.entity';
import { StudentResourceAccess } from '../entities/student-resource-access.entity';
import { StudentWellnessRecord } from '../entities/student-wellness-record.entity';

export interface DashboardOverviewDto {
  studentInfo: {
    name: string;
    grade: string;
    section: string;
    rollNumber: string;
  };
  academicSummary: {
    currentGPA: number;
    totalSubjects: number;
    completedAssignments: number;
    pendingAssignments: number;
  };
  attendanceSummary: {
    presentDays: number;
    absentDays: number;
    attendancePercentage: number;
  };
  wellnessStatus: {
    overallStatus: string;
    lastCheckDate: Date;
  };
  notificationsCount: number;
  upcomingEventsCount: number;
}

export interface UpcomingEventsDto {
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate: Date;
    priority: string;
  }>;
  exams: Array<{
    id: string;
    title: string;
    subject: string;
    date: Date;
    time: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    date: Date;
    type: string;
  }>;
}

export interface RecentActivityDto {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    resource?: string;
  }>;
}

@Injectable()
export class StudentPortalDashboardService {
  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
    @InjectRepository(StudentActivityLog)
    private activityLogRepository: Repository<StudentActivityLog>,
    @InjectRepository(StudentCommunicationRecord)
    private communicationRepository: Repository<StudentCommunicationRecord>,
    @InjectRepository(StudentResourceAccess)
    private resourceAccessRepository: Repository<StudentResourceAccess>,
    @InjectRepository(StudentWellnessRecord)
    private wellnessRepository: Repository<StudentWellnessRecord>,
    private dataSource: DataSource,
  ) {}

  async getDashboardOverview(studentId: string, schoolId: string): Promise<DashboardOverviewDto> {
    // Get portal access info
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId, schoolId },
      relations: ['student'],
    });

    if (!portalAccess) {
      throw new Error('Student portal access not found');
    }

    // Get recent activity count
    const recentActivityCount = await this.activityLogRepository.count({
      where: {
        studentPortalAccessId: portalAccess.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    });

    // Get unread notifications count
    const unreadNotificationsCount = await this.communicationRepository.count({
      where: {
        studentPortalAccessId: portalAccess.id,
        isRead: false,
      },
    });

    // Get latest wellness record
    const latestWellness = await this.wellnessRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'DESC' },
    });

    return {
      studentInfo: {
        name: `${portalAccess.student?.firstName} ${portalAccess.student?.lastName}`,
        grade: portalAccess.gradeLevel,
        section: portalAccess.section || '',
        rollNumber: portalAccess.rollNumber || '',
      },
      academicSummary: {
        currentGPA: 0, // TODO: Calculate from academic records
        totalSubjects: 0, // TODO: Get from curriculum
        completedAssignments: 0, // TODO: Get from assignments
        pendingAssignments: 0, // TODO: Get from assignments
      },
      attendanceSummary: {
        presentDays: 0, // TODO: Calculate from attendance records
        absentDays: 0, // TODO: Calculate from attendance records
        attendancePercentage: 0, // TODO: Calculate percentage
      },
      wellnessStatus: {
        overallStatus: latestWellness?.overallStatus || 'unknown',
        lastCheckDate: latestWellness?.createdAt || new Date(),
      },
      notificationsCount: unreadNotificationsCount,
      upcomingEventsCount: 0, // TODO: Calculate from events
    };
  }

  async getUpcomingEvents(studentId: string, schoolId: string, limit: number = 10): Promise<UpcomingEventsDto> {
    // TODO: Implement logic to fetch upcoming assignments, exams, and events
    // This would integrate with academic management module

    return {
      assignments: [],
      exams: [],
      events: [],
    };
  }

  async getRecentActivity(studentId: string, limit: number = 20): Promise<RecentActivityDto> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return { activities: [] };
    }

    // Get recent activity logs
    const activities = await this.activityLogRepository.find({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      activities: activities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        description: activity.activityDescription,
        timestamp: activity.createdAt,
        resource: activity.resourceId,
      })),
    };
  }

  async getQuickStats(studentId: string, schoolId: string): Promise<any> {
    // TODO: Implement quick statistics calculation
    return {
      totalLogins: 0,
      studyHours: 0,
      completedTasks: 0,
      averageGrade: 0,
    };
  }

  async getNotifications(studentId: string, limit: number = 10): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return { notifications: [] };
    }

    // Get recent unread notifications
    const notifications = await this.communicationRepository.find({
      where: {
        studentPortalAccessId: portalAccess.id,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.communicationType,
        title: notification.subject,
        message: notification.messageContent,
        sender: notification.senderName,
        timestamp: notification.createdAt,
        priority: notification.priorityLevel,
      })),
    };
  }

  async getAcademicSummary(studentId: string, schoolId: string): Promise<any> {
    // TODO: Implement academic summary calculation
    // This would integrate with academic records
    return {
      currentTerm: '',
      gpa: 0,
      totalCredits: 0,
      completedSubjects: 0,
      inProgressSubjects: 0,
      gradeDistribution: {},
    };
  }

  async getWellnessSummary(studentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return { wellnessStatus: 'unknown' };
    }

    // Get latest wellness record
    const latestWellness = await this.wellnessRepository.findOne({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'DESC' },
    });

    if (!latestWellness) {
      return { wellnessStatus: 'not_assessed' };
    }

    return {
      overallStatus: latestWellness.overallStatus,
      moodLevel: latestWellness.moodLevel,
      stressLevel: latestWellness.stressLevel,
      sleepQuality: latestWellness.sleepQuality,
      energyLevel: latestWellness.energyLevel,
      lastAssessmentDate: latestWellness.createdAt,
      recommendations: [], // TODO: Generate based on wellness data
    };
  }
}