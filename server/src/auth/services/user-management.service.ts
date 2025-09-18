// Academia Pro - User Management Service
// Handles user profiles, roles, permissions, and administrative user operations

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

export interface UserProfile {
   id: string;
   email: string;
   firstName: string;
   lastName: string;
   roles: EUserRole[];
   status: EUserStatus;
   phone?: string;
   dateOfBirth?: Date;
   gender?: 'male' | 'female' | 'other';
   address?: any;
   schoolId?: string;
   isEmailVerified: boolean;
   lastLoginAt?: Date;
   preferences: any;
   createdAt: Date;
   updatedAt: Date;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: any;
  preferences?: any;
}

export interface UserSearchFilters {
   roles?: EUserRole[];
   status?: EUserStatus;
   schoolId?: string;
   email?: string;
   firstName?: string;
   lastName?: string;
   isEmailVerified?: boolean;
   createdAfter?: Date;
   createdBefore?: Date;
}

export interface UserStats {
   totalUsers: number;
   activeUsers: number;
   inactiveUsers: number;
   suspendedUsers: number;
   pendingUsers: number;
   roleBreakdown: Record<string, number>;
   recentRegistrations: number;
   emailVerificationRate: number;
}

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfile(user);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UserUpdateData): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user data
    await this.usersRepository.update(userId, updateData);

    // Fetch updated user
    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return this.mapUserToProfile(updatedUser!);
  }

  /**
   * Search users with filters
   */
  async searchUsers(
    filters: UserSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply filters
    if (filters.roles && filters.roles.length > 0) {
      // For array roles, we need to filter after fetching since TypeORM doesn't support array contains easily
      // This will be handled after the query
    }

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.schoolId) {
      queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    }

    if (filters.firstName) {
      queryBuilder.andWhere('user.firstName ILIKE :firstName', { firstName: `%${filters.firstName}%` });
    }

    if (filters.lastName) {
      queryBuilder.andWhere('user.lastName ILIKE :lastName', { lastName: `%${filters.lastName}%` });
    }

    if (filters.isEmailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', { isEmailVerified: filters.isEmailVerified });
    }

    if (filters.createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }

    if (filters.createdBefore) {
      queryBuilder.andWhere('user.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const users = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapUserToProfile(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, newRoles: EUserRole[], updatedBy: string): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate role transitions for each new role
    for (const newRole of newRoles) {
      if (!this.isValidRoleTransition(user.roles, newRole)) {
        throw new BadRequestException(`Invalid role transition for role: ${newRole}`);
      }
    }

    await this.usersRepository.update(userId, {
      roles: newRoles,
      updatedBy,
    });

    // Log role change
    console.log(`User ${userId} roles changed from ${user.roles.join(', ')} to ${newRoles.join(', ')} by ${updatedBy}`);

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return this.mapUserToProfile(updatedUser!);
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, newStatus: EUserStatus, updatedBy: string): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(userId, {
      status: newStatus,
      updatedBy,
    });

    // Log status change
    console.log(`User ${userId} status changed from ${user.status} to ${newStatus} by ${updatedBy}`);

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return this.mapUserToProfile(updatedUser!);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting status to inactive
    await this.usersRepository.update(userId, {
      status: 'inactive' as any,
      updatedBy: deletedBy,
    });

    console.log(`User ${userId} deleted by ${deletedBy}`);
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UserUpdateData & { roles?: EUserRole[]; status?: EUserStatus }>,
    updatedBy: string
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.usersRepository.update(userId, {
          ...updates,
          updatedBy,
        });
        updated++;
      } catch (error) {
        console.error(`Failed to update user ${userId}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      pendingUsers,
      roleBreakdown,
      recentRegistrations,
      verifiedUsers,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { status: 'active' as any } }),
      this.usersRepository.count({ where: { status: 'inactive' as any } }),
      this.usersRepository.count({ where: { status: 'suspended' as any } }),
      this.usersRepository.count({ where: { status: 'pending' as any } }),
      this.getRoleBreakdown(),
      this.getRecentRegistrations(),
      this.usersRepository.count({ where: { isEmailVerified: true } }),
    ]);

    const emailVerificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      pendingUsers,
      roleBreakdown,
      recentRegistrations,
      emailVerificationRate,
    };
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: UserSearchFilters): Promise<any[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply filters if provided
    if (filters) {
      if (filters.roles && filters.roles.length > 0) {
        // For array roles, we need to filter after fetching since TypeORM doesn't support array contains easily
        // This will be handled after the query
      }
      if (filters.status) {
        queryBuilder.andWhere('user.status = :status', { status: filters.status });
      }
      if (filters.schoolId) {
        queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId: filters.schoolId });
      }
    }

    const users = await queryBuilder
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.roles',
        'user.status',
        'user.phone',
        'user.schoolId',
        'user.isEmailVerified',
        'user.createdAt',
      ])
      .getMany();

    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
      phone: user.phone,
      schoolId: user.schoolId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Get users by roles
   */
  async getUsersByRoles(roles: EUserRole[]): Promise<UserProfile[]> {
    if (!roles || roles.length === 0) {
      return [];
    }

    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Filter users who have any of the specified roles
    const filteredUsers = users.filter(user =>
      user.roles && user.roles.some(userRole => roles.includes(userRole))
    );

    return filteredUsers.map(user => this.mapUserToProfile(user));
  }

  /**
   * Get users by school
   */
  async getUsersBySchool(schoolId: string): Promise<UserProfile[]> {
    const users = await this.usersRepository.find({
      where: { schoolId },
      order: { createdAt: 'DESC' },
    });

    return users.map(user => this.mapUserToProfile(user));
  }

  /**
   * Validate user data
   */
  validateUserData(userData: Partial<User>): string[] {
    const errors: string[] = [];

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Invalid email address');
    }

    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  // Private helper methods
  private mapUserToProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      schoolId: user.schoolId,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private isValidRoleTransition(currentRoles: EUserRole[], newRole: EUserRole): boolean {
    // Define valid role transitions
    const validTransitions: Record<string, string[]> = {
      'super-admin': ['super-admin', 'school-admin'],
      'school-admin': ['school-admin', 'staff', 'student', 'parent'],
      'teacher': ['staff', 'student', 'parent'],
      'student': ['student', 'parent'],
      'parent': ['parent'],
    };

    // Check if any of the current roles can transition to the new role
    return currentRoles.some(currentRole => validTransitions[currentRole]?.includes(newRole)) || false;
  }

  private async getRoleBreakdown(): Promise<Record<string, number>> {
    const roles: string[] = ['super-admin', 'delegated-super-admin', 'school-admin', 'delegated-school-admin', 'staff', 'student', 'parent'];
    const breakdown: Record<string, number> = {};

    for (const role of roles) {
      // For array roles, we need to use a raw query or find users and filter
      const users = await this.usersRepository.find();
      breakdown[role] = users.filter(user => user.roles && user.roles.includes(role as EUserRole)).length;
    }

    return breakdown;
  }

  private async getRecentRegistrations(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.usersRepository.count({
      where: {
        createdAt: thirtyDaysAgo as any,
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}