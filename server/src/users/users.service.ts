// Academia Pro - Users Service
// Business logic for user management and operations

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // Prepare user data with correct types
    const userDataPrepared = {
      ...userData,
      role: userData.role as UserRole | undefined,
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
    };

    // Create user
    const user = this.usersRepository.create({
      ...userDataPrepared,
      email,
      passwordHash,
      status: password ? UserStatus.ACTIVE : UserStatus.PENDING, // Active if password provided, pending otherwise
      isEmailVerified: false,
    });

    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  /**
   * Get all users with pagination and filtering
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    schoolId?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, role, status, schoolId, search } = options || {};

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
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

    return { users, total, page, limit };
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

    if (updateData.role !== undefined) {
      updateDataPrepared.role = updateData.role as UserRole;
    }

    if (updateData.dateOfBirth !== undefined) {
      updateDataPrepared.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null;
    }

    // Update user
    Object.assign(user, updateDataPrepared);

    return this.usersRepository.save(user);
  }

  /**
   * Delete user (soft delete by changing status)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Instead of hard delete, change status to inactive
    user.status = UserStatus.INACTIVE;

    await this.usersRepository.save(user);
  }

  /**
   * Activate user account
   */
  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('User is already active');
    }

    user.status = UserStatus.ACTIVE;

    return this.usersRepository.save(user);
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException('User is already inactive');
    }

    user.status = UserStatus.INACTIVE;

    return this.usersRepository.save(user);
  }

  /**
   * Suspend user account
   */
  async suspend(id: string, reason?: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestException('User is already suspended');
    }

    user.status = UserStatus.SUSPENDED;

    return this.usersRepository.save(user);
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
    user.status = UserStatus.ACTIVE;

    return this.usersRepository.save(user);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role, status: UserStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get users by school
   */
  async getUsersBySchool(schoolId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { schoolId, status: UserStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Search users
   */
  async search(query: string, options?: {
    role?: UserRole;
    schoolId?: string;
    limit?: number;
  }): Promise<User[]> {
    const { role, schoolId, limit = 20 } = options || {};

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Search in multiple fields
    queryBuilder.where(
      '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query)',
      { query: `%${query}%` },
    );

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (schoolId) {
      queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId });
    }

    queryBuilder
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .orderBy('user.firstName', 'ASC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<UserRole, number>;
    recentRegistrations: number;
  }> {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    // Count users by role
    const usersByRole: Record<UserRole, number> = {
      'super-admin': 0,
      'school-admin': 0,
      'teacher': 0,
      'student': 0,
      'parent': 0,
    };

    for (const role of Object.keys(usersByRole) as UserRole[]) {
      usersByRole[role] = await this.usersRepository.count({
        where: { role, status: UserStatus.ACTIVE },
      });
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