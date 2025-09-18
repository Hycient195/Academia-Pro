// Academia Pro - Users Service
// Business logic for user management and operations

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { PaginatedResponse } from '@academia-pro/types/shared';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { AuditService } from '../security/services/audit.service';
import { AuditSeverity } from '../security/types/audit.types';
import { AuditConfigService } from '../common/audit/audit.config';
import { SYSTEM_USER_ID } from '../security/entities/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto, isSuperAdminCreated: boolean = false): Promise<User> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // For super admin created users, set password as email and status as INACTIVE
    let passwordHash: string | undefined;
    let userStatus: EUserStatus;
    let isFirstLogin: boolean;

    if (isSuperAdminCreated) {
      // Hash the email as password for super admin created users
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(email, saltRounds);
      userStatus = EUserStatus.INACTIVE;
      isFirstLogin = true;
    } else {
      // Hash password if provided for regular user registration
      if (password) {
        const saltRounds = 12;
        passwordHash = await bcrypt.hash(password, saltRounds);
        userStatus = EUserStatus.ACTIVE;
      } else {
        userStatus = EUserStatus.PENDING;
      }
      isFirstLogin = false;
    }

    // Prepare user data with correct types
    const userDataPrepared = {
      ...userData,
      roles: userData.roles && userData.roles.length > 0 ? userData.roles : ['student' as EUserRole],
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
    };

    // Create user
    const user = this.usersRepository.create({
      ...userDataPrepared,
      email,
      passwordHash,
      status: userStatus,
      isEmailVerified: isSuperAdminCreated ? true : false, // Auto-verify for super admin created users
      isFirstLogin,
    });

    const savedUser = await this.usersRepository.save(user);

    // Audit logging for user creation
    await this.auditService.logUserCreated(
      isSuperAdminCreated ? SYSTEM_USER_ID : null, // userId - system for super admin created users, null for anonymous
      savedUser.id,
      '127.0.0.1', // ipAddress - placeholder, should be passed from controller
      'system', // userAgent - placeholder
      {
        createdBySuperAdmin: isSuperAdminCreated,
        userRole: savedUser.roles[0],
        schoolId: savedUser.schoolId,
        emailVerified: savedUser.isEmailVerified,
      }
    );

    return savedUser;
  }

  /**
   * Get all users with pagination and filtering
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    roles?: EUserRole[];
    status?: EUserStatus;
    schoolId?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, roles, status, schoolId, search } = options || {};

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply filters
    if (roles && roles.length > 0) {
      queryBuilder.andWhere('user.roles && ARRAY[:roles]', { roles });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (schoolId) {
      queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Get user by ID with specific fields (for middleware)
   */
  async findOneForAuth(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'roles', 'status', 'schoolId', 'isEmailVerified'],
    });
  }

  /**
   * Get user by ID with refresh token fields (for middleware)
   */
  async findOneForRefreshToken(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'refreshToken', 'refreshTokenExpires', 'roles', 'schoolId'],
    });
  }

  /**
   * Update user refresh token (for middleware)
   */
  async updateRefreshToken(id: string, refreshToken: string, refreshTokenExpires: Date): Promise<void> {
    await this.usersRepository.update(id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpires,
    });
  }

  /**
   * Update user information
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for unique constraints if updating email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      const saltRounds = 12;
      user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Prepare update data, excluding password
    const { password, ...updateData } = updateUserDto;

    // Handle dateOfBirth conversion if provided
    const updateDataPrepared: any = {
      ...updateData,
    };

    if (updateData.roles !== undefined) {
      updateDataPrepared.roles = updateData.roles;
    }

    if (updateData.dateOfBirth !== undefined) {
      updateDataPrepared.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null;
    }

    // Update user
    Object.assign(user, updateDataPrepared);

    const updatedUser = await this.usersRepository.save(user);

    // Audit logging for user update
    await this.auditService.logUserUpdated(
      SYSTEM_USER_ID, // userId - should be passed from controller context
      updatedUser.id,
      updateDataPrepared, // changes
      '127.0.0.1', // ipAddress - placeholder
      'system', // userAgent - placeholder
    );

    return updatedUser;
  }

  /**
   * Delete user (soft delete by changing status)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Instead of hard delete, change status to suspended (marked as deleted)
    user.status = EUserStatus.SUSPENDED;

    await this.usersRepository.save(user);

    // Audit logging for user deletion
    await this.auditService.logUserDeleted(
      SYSTEM_USER_ID, // userId - should be passed from controller context
      id,
      '127.0.0.1', // ipAddress - placeholder
      'system', // userAgent - placeholder
    );
  }

  /**
   * Activate user account
   */
  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === EUserStatus.ACTIVE) {
      throw new BadRequestException('User is already active');
    }

    const oldStatus = user.status;
    user.status = EUserStatus.ACTIVE;

    const updatedUser = await this.usersRepository.save(user);

    // Audit logging for user activation
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID, // should be passed from controller context
      action: 'USER_STATUS_CHANGED',
      resource: 'user',
      resourceId: id,
      details: {
        eventType: 'user_activated',
        oldStatus,
        newStatus: EUserStatus.ACTIVE,
        userRole: updatedUser.roles[0],
      },
      ipAddress: '127.0.0.1', // placeholder
      userAgent: 'system', // placeholder
      severity: AuditSeverity.MEDIUM,
    });

    return updatedUser;
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === EUserStatus.INACTIVE) {
      throw new BadRequestException('User is already inactive');
    }

    const oldStatus = user.status;
    user.status = EUserStatus.INACTIVE;

    const updatedUser = await this.usersRepository.save(user);

    // Audit logging for user deactivation
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: 'USER_STATUS_CHANGED',
      resource: 'user',
      resourceId: id,
      details: {
        eventType: 'user_deactivated',
        oldStatus,
        newStatus: EUserStatus.INACTIVE,
        userRole: updatedUser.roles[0],
      },
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      severity: AuditSeverity.MEDIUM,
    });

    return updatedUser;
  }

  /**
   * Suspend user account
   */
  async suspend(id: string, reason?: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === EUserStatus.SUSPENDED) {
      throw new BadRequestException('User is already suspended');
    }

    const oldStatus = user.status;
    user.status = EUserStatus.SUSPENDED;

    const updatedUser = await this.usersRepository.save(user);

    // Audit logging for user suspension
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: 'USER_STATUS_CHANGED',
      resource: 'user',
      resourceId: id,
      details: {
        eventType: 'user_suspended',
        oldStatus,
        newStatus: EUserStatus.SUSPENDED,
        userRole: updatedUser.roles[0],
        reason,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      severity: AuditSeverity.HIGH, // Suspension is a high-severity event
    });

    return updatedUser;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(id: string, preferences: any): Promise<User> {
    const user = await this.findOne(id);

    // Merge new preferences with existing ones
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };

    return this.usersRepository.save(user);
  }

  /**
   * Change user password
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'passwordHash'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('User does not have a password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersRepository.update(id, {
      passwordHash: newPasswordHash,
    });

    // Audit logging for password change
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID, // should be the user who initiated the change
      action: 'PASSWORD_CHANGED',
      resource: 'user',
      resourceId: id,
      details: {
        eventType: 'password_changed',
        method: 'admin_reset', // or 'user_change' depending on context
      },
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      severity: AuditSeverity.HIGH, // Password changes are high severity
    });
  }

  /**
   * Reset user password (admin function)
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersRepository.update(id, {
      passwordHash,
    });

    // Audit logging for password reset
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: 'PASSWORD_RESET',
      resource: 'user',
      resourceId: id,
      details: {
        eventType: 'password_reset_admin',
        method: 'admin_reset',
      },
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      severity: AuditSeverity.HIGH,
    });
  }

  /**
   * Reset password for first-time login users
   */
  async resetFirstTimePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user.isFirstLogin) {
      throw new BadRequestException('This user has already completed first-time login');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password, set first login to false, and activate account
    await this.usersRepository.update(id, {
      passwordHash,
      isFirstLogin: false,
      status: EUserStatus.ACTIVE,
    });

    return this.findOne(id);
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.status = EUserStatus.ACTIVE;

    return this.usersRepository.save(user);
  }

  /**
   * Get users by roles
   */
  async getUsersByRoles(roles: EUserRole[]): Promise<User[]> {
    if (!roles || roles.length === 0) {
      return [];
    }

    return this.usersRepository.createQueryBuilder('user')
      .where('user.roles && ARRAY[:roles]', { roles })
      .andWhere('user.status = :status', { status: EUserStatus.ACTIVE })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get users by school
   */
  async getUsersBySchool(schoolId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { schoolId, status: EUserStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Search users
   */
  async search(query: string, options?: {
    roles?: EUserRole[];
    schoolId?: string;
    limit?: number;
  }): Promise<User[]> {
    const { roles, schoolId, limit = 20 } = options || {};

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Search in multiple fields
    queryBuilder.where(
      '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query)',
      { query: `%${query}%` },
    );

    if (roles && roles.length > 0) {
      queryBuilder.andWhere('user.roles && ARRAY[:roles]', { roles });
    }

    if (schoolId) {
      queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId });
    }

    queryBuilder
      .andWhere('user.status = :status', { status: EUserStatus.ACTIVE })
      .orderBy('user.firstName', 'ASC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  /**
   * Data sanitization and sampling utilities
   */
  private sanitizeUserData(userData: any): any {
    if (!userData) return userData;

    const sanitized = { ...userData };

    // Remove sensitive fields
    const sensitiveFields = ['passwordHash', 'refreshToken', 'mfaSecret', 'emailVerificationToken', 'passwordResetToken'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    if (sanitized.preferences) {
      // Keep preferences but sanitize any sensitive data within
      sanitized.preferences = this.auditConfig.sanitizeDetails(sanitized.preferences);
    }

    if (sanitized.address) {
      // Address might contain sensitive location data, sanitize coordinates
      if (sanitized.address.coordinates) {
        sanitized.address.coordinates = '[LOCATION_DATA_REDACTED]';
      }
    }

    return sanitized;
  }

  private shouldSampleAudit(operation: string, userCount?: number): boolean {
    // Sample high-volume operations
    if (operation === 'findAll' && (!userCount || userCount > 100)) {
      return Math.random() > 0.1; // Sample 10% of large user lists
    }

    if (operation === 'search') {
      return Math.random() > 0.2; // Sample 20% of search operations
    }

    if (operation === 'getStatistics') {
      return Math.random() > 0.5; // Sample 50% of statistics requests
    }

    return false; // Don't sample by default
  }

  /**
   * Custom audit methods for user-specific events
   */
  private async logUserRoleChange(userId: string, targetUserId: string, oldRoles: EUserRole[], newRoles: EUserRole[], ipAddress: string, userAgent: string): Promise<void> {
    await this.auditService.logActivity({
      userId,
      action: 'USER_ROLE_CHANGED',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        eventType: 'user_role_changed',
        oldRoles,
        newRoles,
        roleChange: true,
      },
      ipAddress,
      userAgent,
      severity: AuditSeverity.HIGH, // Role changes are high severity
    });
  }

  private async logUserBulkOperation(userId: string, operation: string, count: number, ipAddress: string, userAgent: string, details?: any): Promise<void> {
    await this.auditService.logActivity({
      userId,
      action: 'BULK_USER_OPERATION',
      resource: 'user',
      details: {
        eventType: 'bulk_user_operation',
        operation,
        count,
        ...details,
      },
      ipAddress,
      userAgent,
      severity: AuditSeverity.MEDIUM,
    });
  }

  private async logUserDataAccess(userId: string, targetUserId: string, accessType: 'read' | 'search' | 'export', ipAddress: string, userAgent: string, details?: any): Promise<void> {
    const auditAction = accessType === 'search' ? 'read' : accessType;
    await this.auditService.logDataAccess(
      userId,
      auditAction as 'read' | 'export' | 'create' | 'update' | 'delete',
      'user',
      targetUserId,
      ipAddress,
      userAgent,
      {
        eventType: 'user_data_access',
        originalAccessType: accessType,
        ...details,
      }
    );
  }

  private async logUserSecurityEvent(userId: string, eventType: string, targetUserId: string, severity: AuditSeverity, ipAddress: string, userAgent: string, details?: any): Promise<void> {
    await this.auditService.logSecurityEvent(
      userId,
      eventType,
      severity,
      ipAddress,
      userAgent,
      {
        targetUserId,
        eventType: 'user_security_event',
        ...details,
      }
    );
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<EUserRole, number>;
    recentRegistrations: number;
  }> {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { status: EUserStatus.ACTIVE },
    });

    // Count users by role
    const usersByRole: Record<EUserRole, number> = {
      'super-admin': 0,
      'school-admin': 0,
      'delegated-super-admin': 0,
      'delegated-school-admin': 0,
      'staff': 0,
      'student': 0,
      'parent': 0,
    };

    for (const role of Object.keys(usersByRole) as EUserRole[]) {
      usersByRole[role] = await this.usersRepository.createQueryBuilder('user')
        .where('user.roles @> ARRAY[:role]', { role })
        .andWhere('user.status = :status', { status: EUserStatus.ACTIVE })
        .getCount();
    }

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await this.usersRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      recentRegistrations,
    };
  }
}