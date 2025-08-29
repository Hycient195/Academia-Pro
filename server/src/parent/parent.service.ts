// Academia Pro - Parent Service
// Business logic for parent portal management

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Parent } from './parent.entity';
import {
  CreateParentDto,
  UpdateParentDto,
  ParentResponseDto,
  ParentListResponseDto,
  ParentStatisticsResponseDto,
} from './dtos/index';
import {
  TParentRelationship,
  TPortalAccessLevel,
  IParentFilters,
  IParentStatisticsResponse,
} from '../../../common/src/types/parent/parent.types';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    private dataSource: DataSource,
  ) {}

  private generateId(): string {
    return `parent_child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new parent profile
   */
  async create(createParentDto: CreateParentDto): Promise<ParentResponseDto> {
    const { userId, schoolId, ...parentData } = createParentDto;

    // Check if parent already exists for this user
    const existingParent = await this.parentRepository.findOne({
      where: { userId, schoolId },
    });

    if (existingParent) {
      throw new ConflictException('Parent profile already exists for this user in this school');
    }

    // Create parent entity
    const parent = this.parentRepository.create({
      ...parentData,
      userId,
      schoolId,
      isActive: true,
    });

    const savedParent = await this.parentRepository.save(parent);
    return ParentResponseDto.fromEntity(savedParent);
  }

  /**
   * Get all parents with filtering and pagination
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    filters?: IParentFilters;
  }): Promise<ParentListResponseDto> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.parentRepository.createQueryBuilder('parent');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('parent.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.relationship) {
      queryBuilder.andWhere('parent.relationship = :relationship', { relationship: filters.relationship });
    }

    if (filters?.accessLevel) {
      queryBuilder.andWhere('parent.portalAccessLevel = :accessLevel', { accessLevel: filters.accessLevel });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('parent.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isPrimaryContact !== undefined) {
      queryBuilder.andWhere('parent.isPrimaryContact = :isPrimaryContact', { isPrimaryContact: filters.isPrimaryContact });
    }

    if (filters?.hasChildren !== undefined) {
      if (filters.hasChildren) {
        queryBuilder.andWhere('JSONB_ARRAY_LENGTH(parent.children) > 0');
      } else {
        queryBuilder.andWhere('JSONB_ARRAY_LENGTH(parent.children) = 0');
      }
    }

    if (filters?.lastLoginAfter) {
      queryBuilder.andWhere('parent.lastLoginAt >= :lastLoginAfter', { lastLoginAfter: filters.lastLoginAfter });
    }

    if (filters?.lastLoginBefore) {
      queryBuilder.andWhere('parent.lastLoginAt <= :lastLoginBefore', { lastLoginBefore: filters.lastLoginBefore });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(parent.profile->>\'firstName\' ILIKE :search OR parent.profile->>\'lastName\' ILIKE :search OR parent.contactInformation->>\'primaryEmail\' ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('parent.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [parents, total] = await queryBuilder.getManyAndCount();

    const parentResponseDtos = parents.map(parent => ParentResponseDto.fromEntity(parent));

    // Calculate summary
    const summary = {
      activeParents: parents.filter(p => p.isActive).length,
      primaryContacts: parents.filter(p => p.isPrimaryContact).length,
      totalChildren: parents.reduce((sum, p) => sum + p.childrenCount, 0),
      averageChildrenPerParent: total > 0 ? Math.round((parents.reduce((sum, p) => sum + p.childrenCount, 0) / total) * 100) / 100 : 0,
    };

    return new ParentListResponseDto({
      parents: parentResponseDtos,
      total,
      page,
      limit,
      summary,
    });
  }

  /**
   * Get parent by ID
   */
  async findOne(id: string): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return ParentResponseDto.fromEntity(parent);
  }

  /**
   * Get parent by user ID
   */
  async findByUserId(userId: string, schoolId: string): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { userId, schoolId },
    });

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    return ParentResponseDto.fromEntity(parent);
  }

  /**
   * Update parent
   */
  async update(id: string, updateParentDto: UpdateParentDto): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    Object.assign(parent, updateParentDto);

    const updatedParent = await this.parentRepository.save(parent);
    return ParentResponseDto.fromEntity(updatedParent);
  }

  /**
   * Delete parent
   */
  async remove(id: string): Promise<void> {
    const parent = await this.parentRepository.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    await this.parentRepository.remove(parent);
  }

  /**
   * Add child to parent
   */
  async addChild(parentId: string, child: {
    studentId: string;
    relationship: TParentRelationship;
    isPrimaryGuardian: boolean;
    emergencyContact: boolean;
    accessPermissions: any;
  }): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    parent.addChild({
      id: this.generateId(),
      ...child,
      studentName: 'Student Name', // Would be populated from student service
      grade: 'Grade', // Would be populated from student service
      class: 'Class', // Would be populated from student service
      addedAt: new Date(),
    });

    const updatedParent = await this.parentRepository.save(parent);
    return ParentResponseDto.fromEntity(updatedParent);
  }

  /**
   * Remove child from parent
   */
  async removeChild(parentId: string, studentId: string): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    parent.removeChild(studentId);

    const updatedParent = await this.parentRepository.save(parent);
    return ParentResponseDto.fromEntity(updatedParent);
  }

  /**
   * Update child permissions
   */
  async updateChildPermissions(parentId: string, studentId: string, permissions: any): Promise<ParentResponseDto> {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    parent.updateChildPermissions(studentId, permissions);

    const updatedParent = await this.parentRepository.save(parent);
    return ParentResponseDto.fromEntity(updatedParent);
  }

  /**
   * Record parent login
   */
  async recordLogin(userId: string, schoolId: string): Promise<void> {
    const parent = await this.parentRepository.findOne({
      where: { userId, schoolId },
    });

    if (parent) {
      parent.recordLogin();
      await this.parentRepository.save(parent);
    }
  }

  /**
   * Get parents by student ID
   */
  async getParentsByStudentId(studentId: string, schoolId: string): Promise<ParentResponseDto[]> {
    const parents = await this.parentRepository
      .createQueryBuilder('parent')
      .where('parent.schoolId = :schoolId', { schoolId })
      .andWhere('parent.children @> :studentFilter', {
        studentFilter: [{ studentId }],
      })
      .getMany();

    return parents.map(parent => ParentResponseDto.fromEntity(parent));
  }

  /**
   * Get parents statistics
   */
  async getStatistics(schoolId: string): Promise<ParentStatisticsResponseDto> {
    const [
      totalParents,
      activeParents,
      parentsByRelationship,
      parentsByAccessLevel,
    ] = await Promise.all([
      // Total parents count
      this.parentRepository.count({ where: { schoolId } }),

      // Active parents count
      this.parentRepository.count({ where: { schoolId, isActive: true } }),

      // Parents by relationship
      this.parentRepository
        .createQueryBuilder('parent')
        .select('parent.relationship', 'relationship')
        .addSelect('COUNT(*)', 'count')
        .where('parent.schoolId = :schoolId', { schoolId })
        .groupBy('parent.relationship')
        .getRawMany(),

      // Parents by access level
      this.parentRepository
        .createQueryBuilder('parent')
        .select('parent.portalAccessLevel', 'accessLevel')
        .addSelect('COUNT(*)', 'count')
        .where('parent.schoolId = :schoolId', { schoolId })
        .groupBy('parent.portalAccessLevel')
        .getRawMany(),
    ]);

    // Helper function to convert array to record
    const convertToRecord = (data: any[], keyField: string): Record<string, number> => {
      const result: Record<string, number> = {};
      data.forEach(item => {
        result[item[keyField]] = parseInt(item.count) || 0;
      });
      return result;
    };

    // Mock data for demonstration (would be calculated from actual data)
    const communicationStats = {
      totalCommunications: 1250,
      unreadCommunications: 45,
      averageResponseTime: 2.5, // hours
      communicationsByType: {
        announcement: 500,
        assignment: 300,
        grade: 250,
        attendance: 150,
        event: 50,
      },
    };

    const appointmentStats = {
      totalAppointments: 320,
      upcomingAppointments: 45,
      completedAppointments: 275,
      averageWaitTime: 3.2, // days
    };

    const engagementStats = {
      averageLoginsPerWeek: 3.5,
      mostActiveTime: '19:00-21:00',
      topFeaturesUsed: ['grades', 'attendance', 'communications'],
      parentSatisfactionScore: 4.2,
    };

    const childrenStats = {
      totalChildren: 280,
      averageChildrenPerParent: 1.9,
      childrenByGrade: {
        'Grade 1': 25,
        'Grade 2': 30,
        'Grade 3': 28,
        'Grade 4': 32,
        'Grade 5': 35,
      },
      childrenByClass: {
        '1A': 15,
        '1B': 10,
        '2A': 20,
        '2B': 10,
      },
    };

    return new ParentStatisticsResponseDto({
      totalParents,
      activeParents,
      parentsByRelationship: convertToRecord(parentsByRelationship, 'relationship'),
      parentsByAccessLevel: convertToRecord(parentsByAccessLevel, 'accessLevel'),
      communicationStats,
      appointmentStats,
      engagementStats,
      childrenStats,
    });
  }

  /**
   * Validate parent access to student feature
   */
  async validateAccess(parentId: string, studentId: string, feature: string): Promise<boolean> {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      return false;
    }

    return parent.canAccessStudentFeature(studentId, feature as any);
  }

  /**
   * Get parent dashboard data
   */
  async getDashboard(parentId: string): Promise<any> {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Mock dashboard data (would be populated from various services)
    return {
      parent: {
        id: parent.id,
        name: parent.fullName,
        email: parent.primaryEmail,
      },
      children: parent.children.map(child => ({
        studentId: child.studentId,
        studentName: child.studentName,
        grade: child.grade,
        class: child.class,
        profilePicture: child.studentId + '.jpg', // Mock
        todaySchedule: [], // Would be populated from timetable service
        recentGrades: [], // Would be populated from assessment service
        attendance: {
          today: true, // Mock
          thisWeek: 5, // Mock
          thisMonth: 20, // Mock
        },
        pendingAssignments: 3, // Mock
        upcomingEvents: [], // Would be populated from calendar service
        unreadMessages: 2, // Mock
      })),
      recentCommunications: [], // Would be populated from communication service
      upcomingAppointments: [], // Would be populated from appointment service
      notifications: [], // Would be populated from notification service
      alerts: [], // Would be populated from alert service
      quickActions: [
        {
          id: 'view_grades',
          title: 'View Grades',
          description: 'Check your child\'s latest grades',
          icon: 'grade',
          action: 'navigate',
          url: '/grades',
          isEnabled: parent.canViewGrades,
          order: 1,
        },
        {
          id: 'view_attendance',
          title: 'View Attendance',
          description: 'Check attendance records',
          icon: 'calendar',
          action: 'navigate',
          url: '/attendance',
          isEnabled: parent.canViewAttendance,
          order: 2,
        },
        {
          id: 'contact_teacher',
          title: 'Contact Teacher',
          description: 'Send message to teacher',
          icon: 'message',
          action: 'navigate',
          url: '/messages',
          isEnabled: parent.canContactTeachers,
          order: 3,
        },
        {
          id: 'schedule_meeting',
          title: 'Schedule Meeting',
          description: 'Book appointment with teacher',
          icon: 'calendar-plus',
          action: 'navigate',
          url: '/appointments',
          isEnabled: parent.canScheduleMeetings,
          order: 4,
        },
      ],
      lastUpdated: new Date(),
      systemStatus: {
        lastUpdated: new Date(),
        dataFreshness: 'fresh' as const,
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      },
    };
  }

  /**
   * Bulk update parent access levels
   */
  async bulkUpdateAccessLevel(parentIds: string[], accessLevel: TPortalAccessLevel): Promise<void> {
    await this.parentRepository.update(
      { id: { $in: parentIds } } as any,
      { portalAccessLevel: accessLevel },
    );
  }

  /**
   * Get inactive parents
   */
  async getInactiveParents(schoolId: string, daysInactive: number = 90): Promise<ParentResponseDto[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const parents = await this.parentRepository
      .createQueryBuilder('parent')
      .where('parent.schoolId = :schoolId', { schoolId })
      .andWhere('parent.isActive = :isActive', { isActive: true })
      .andWhere('(parent.lastLoginAt IS NULL OR parent.lastLoginAt < :cutoffDate)', { cutoffDate })
      .getMany();

    return parents.map(parent => ParentResponseDto.fromEntity(parent));
  }

  /**
   * Send bulk notifications to parents
   */
  async sendBulkNotification(parentIds: string[], message: string, type: string): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`Sending ${type} notification to ${parentIds.length} parents: ${message}`);
  }
}