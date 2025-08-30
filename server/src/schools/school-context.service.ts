// Academia Pro - School Context Service
// Handles multi-school architecture, automatic school context detection, and data isolation

import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './school.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

export interface SchoolContext {
  schoolId: string;
  school: School;
  userRole: string;
  permissions: string[];
  isSuperAdmin: boolean;
  isSchoolAdmin: boolean;
}

@Injectable()
export class SchoolContextService {
  private readonly logger = new Logger(SchoolContextService.name);

  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Extract school context from request
   */
  async getSchoolContext(userId: string, schoolId?: string): Promise<SchoolContext | null> {
    try {
      // Get user with school relation
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['school'],
      });

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      // Determine school context
      let contextSchoolId: string;
      let contextSchool: School;

      if (schoolId) {
        // Explicit school ID provided (for super admins or cross-school access)
        contextSchool = await this.schoolRepository.findOne({
          where: { id: schoolId },
        });

        if (!contextSchool) {
          this.logger.warn(`School not found: ${schoolId}`);
          return null;
        }

        contextSchoolId = schoolId;
      } else if (user.schoolId) {
        // User belongs to a specific school
        contextSchool = user.school;
        contextSchoolId = user.schoolId;
      } else {
        // Super admin or system user without school affiliation
        this.logger.debug(`User ${userId} has no school affiliation`);
        return null;
      }

      // Determine permissions based on role
      const permissions = this.getPermissionsForRole(user.role, contextSchoolId);
      const isSuperAdmin = user.role === 'super-admin';
      const isSchoolAdmin = user.role === 'school-admin' && user.schoolId === contextSchoolId;

      return {
        schoolId: contextSchoolId,
        school: contextSchool,
        userRole: user.role,
        permissions,
        isSuperAdmin,
        isSchoolAdmin,
      };
    } catch (error) {
      this.logger.error(`Error getting school context for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Validate if user has access to a specific school
   */
  async validateSchoolAccess(userId: string, schoolId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      // Super admins have access to all schools
      if (user.role === 'super-admin') {
        return true;
      }

      // School admins only have access to their own school
      if (user.role === 'school-admin') {
        return user.schoolId === schoolId;
      }

      // Regular users only have access to their own school
      return user.schoolId === schoolId;
    } catch (error) {
      this.logger.error(`Error validating school access for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all schools (for super admin)
   */
  async getAllSchools(): Promise<School[]> {
    return this.schoolRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get schools accessible to a user
   */
  async getAccessibleSchools(userId: string): Promise<School[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return [];
      }

      if (user.role === 'super-admin') {
        // Super admin can access all schools
        return this.getAllSchools();
      } else if (user.schoolId) {
        // Regular users can only access their own school
        const school = await this.schoolRepository.findOne({
          where: { id: user.schoolId },
        });
        return school ? [school] : [];
      }

      return [];
    } catch (error) {
      this.logger.error(`Error getting accessible schools for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create school context for new school
   */
  async createSchoolContext(schoolData: Partial<School>, createdBy: string): Promise<School> {
    try {
      const school = this.schoolRepository.create({
        ...schoolData,
        createdBy,
        code: schoolData.code || this.generateSchoolCode(schoolData.name || 'School'),
      });

      return await this.schoolRepository.save(school);
    } catch (error) {
      this.logger.error('Error creating school context:', error);
      throw error;
    }
  }

  /**
   * Update school context
   */
  async updateSchoolContext(schoolId: string, updates: Partial<School>, updatedBy: string): Promise<School> {
    try {
      await this.schoolRepository.update(schoolId, {
        ...updates,
        updatedBy,
      });

      return await this.schoolRepository.findOne({
        where: { id: schoolId },
      });
    } catch (error) {
      this.logger.error(`Error updating school context ${schoolId}:`, error);
      throw error;
    }
  }

  /**
   * Get school statistics
   */
  async getSchoolStatistics(schoolId: string): Promise<any> {
    try {
      const [userCount] = await this.userRepository.findAndCount({
        where: { schoolId },
      });

      const [studentCount] = await this.studentRepository.findAndCount({
        where: { schoolId },
      });

      const school = await this.schoolRepository.findOne({
        where: { id: schoolId },
      });

      return {
        schoolId,
        schoolName: school?.name,
        userCount,
        studentCount,
        occupancyRate: school?.occupancyRate || 0,
        subscriptionStatus: school?.isSubscriptionActive ? 'active' : 'inactive',
        daysUntilExpiry: school?.daysUntilSubscriptionExpiry || 0,
      };
    } catch (error) {
      this.logger.error(`Error getting statistics for school ${schoolId}:`, error);
      throw error;
    }
  }

  /**
   * Generate unique school code
   */
  private generateSchoolCode(name: string): string {
    const baseCode = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();

    const timestamp = Date.now().toString().slice(-4);
    return `${baseCode}${timestamp}`;
  }

  /**
   * Get permissions for user role
   */
  private getPermissionsForRole(role: string, schoolId: string): string[] {
    const basePermissions = {
      'super-admin': [
        'schools:*',
        'users:*',
        'students:*',
        'staff:*',
        'reports:*',
        'settings:*',
      ],
      'school-admin': [
        `schools:read:${schoolId}`,
        `schools:update:${schoolId}`,
        `users:read:${schoolId}`,
        `users:create:${schoolId}`,
        `users:update:${schoolId}`,
        `students:read:${schoolId}`,
        `students:create:${schoolId}`,
        `students:update:${schoolId}`,
        `staff:read:${schoolId}`,
        `staff:create:${schoolId}`,
        `staff:update:${schoolId}`,
        `reports:read:${schoolId}`,
        `settings:read:${schoolId}`,
        `settings:update:${schoolId}`,
      ],
      'teacher': [
        `students:read:${schoolId}`,
        `students:update:${schoolId}`,
        `attendance:read:${schoolId}`,
        `attendance:create:${schoolId}`,
        `attendance:update:${schoolId}`,
        `grades:read:${schoolId}`,
        `grades:create:${schoolId}`,
        `grades:update:${schoolId}`,
        `reports:read:${schoolId}`,
      ],
      'student': [
        `profile:read:${schoolId}`,
        `profile:update:${schoolId}`,
        `grades:read:${schoolId}`,
        `attendance:read:${schoolId}`,
        `timetable:read:${schoolId}`,
      ],
      'parent': [
        `students:read:${schoolId}`,
        `grades:read:${schoolId}`,
        `attendance:read:${schoolId}`,
        `fees:read:${schoolId}`,
        `communication:read:${schoolId}`,
      ],
    };

    return basePermissions[role] || [];
  }
}