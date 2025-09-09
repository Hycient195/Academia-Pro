// Academia Pro - Super Admin Users Controller
// Handles multi-school user administration and cross-school user operations

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger, Patch, Inject, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { SchoolsService } from '../../schools/schools.service';
import { User } from '../../users/user.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { Permissions } from '../../iam/decorators/permissions.decorator';
import { CreateUserDto, UpdateUserDto } from '../../users/dtos';
import { PaginatedResponse } from '@academia-pro/types/shared';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

@ApiTags('Super Admin - Multi-School User Management')
@Controller('super-admin')
@UseGuards(RolesGuard, PermissionGuard)
@Roles(EUserRole.SUPER_ADMIN, 'delegated-super-admin' as any)
export class SuperAdminUsersController {
  private readonly logger = new Logger(SuperAdminUsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Helper method to get school name by ID
   */
  private async getSchoolName(schoolId: string): Promise<string> {
    try {
      const schoolsService = this.moduleRef.get(SchoolsService, { strict: false });
      const school = await schoolsService.findOne(schoolId);
      return school.name;
    } catch (error) {
      this.logger.warn(`Failed to get school name for ID ${schoolId}: ${error.message}`);
      return 'School Name'; // Fallback to hardcoded value
    }
  }

  /**
   * Helper method to check if user is super admin
   */
  private isSuperAdmin(user: any): boolean {
    return user.roles && Array.isArray(user.roles) && user.roles.includes(EUserRole.SUPER_ADMIN);
  }

  /**
   * Helper method to check if user can perform restricted operations
   */
  private canPerformRestrictedOperation(user: any): boolean {
    // Only super admins can perform certain operations
    return this.isSuperAdmin(user);
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all users in the system with pagination and filtering.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search users by name or email',
  })
  @ApiQuery({
    name: 'roles',
    required: false,
    type: [String],
    enum: ['super-admin', 'school-admin', 'teacher', 'student', 'parent'],
    description: 'Filter by user roles (array)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    description: 'Filter by user status',
  })
  @ApiQuery({
    name: 'schoolId',
    required: false,
    description: 'Filter by school ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of users per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' }
        },
        total: { type: 'number', description: 'Total number of users' },
        page: { type: 'number', description: 'Current page number' },
        limit: { type: 'number', description: 'Number of items per page' },
        totalPages: { type: 'number', description: 'Total number of pages' },
        hasNext: { type: 'boolean', description: 'Whether there is a next page' },
        hasPrev: { type: 'boolean', description: 'Whether there is a previous page' }
      }
    }
  })
  async getAllUsers(
    @Query('search') search?: string,
    @Query('roles') roles?: EUserRole[],
    @Query('status') status?: EUserStatus,
    @Query('schoolId') schoolId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    this.logger.log('Getting all users');

    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    const result = await this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      roles,
      status,
      schoolId,
      search,
    }) as unknown as PaginatedResponse<User>;

    // Format users for client
    const formattedUsers = await Promise.all(result.data.map(async user => ({
      id: user.id,
      name: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      roles: user.roles,
      status: user.status,
      schoolId: user.schoolId,
      schoolName: user.schoolId ? await this.getSchoolName(user.schoolId) : null,
      phone: user.phone,
      lastLogin: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })));

    return {
      data: formattedUsers,
      pagination: result.pagination,
    };
  }

  @Post('users')
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user in the multi-school system.',
  })
  @ApiBody({
    description: 'User creation data',
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'roles'],
      properties: {
        firstName: { type: 'string', description: 'User first name' },
        lastName: { type: 'string', description: 'User last name' },
        middleName: { type: 'string', description: 'User middle name (optional)' },
        email: { type: 'string', description: 'User email' },
        roles: {
          type: 'array',
          items: { type: 'string' },
          enum: ['super-admin', 'delegated-super-admin', 'school-admin', 'teacher', 'student', 'parent'],
          description: 'User roles (array)'
        },
        schoolId: { type: 'string', description: 'School ID (optional)' },
        phone: { type: 'string', description: 'Phone number' },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended', 'pending'],
          description: 'User status'
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async createUser(
    @Body() userData: CreateUserDto,
  ): Promise<any> {
    this.logger.log(`Creating new user: ${userData.email}`);

    const createdUser = await this.usersService.create(userData, true); // true = super admin created

    // Format the response
    return {
      id: createdUser.id,
      name: `${createdUser.firstName} ${createdUser.middleName ? createdUser.middleName + ' ' : ''}${createdUser.lastName}`,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      middleName: createdUser.middleName,
      email: createdUser.email,
      roles: createdUser.roles,
      status: createdUser.status,
      schoolId: createdUser.schoolId,
      phone: createdUser.phone,
      isFirstLogin: createdUser.isFirstLogin,
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    };
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Returns detailed information about a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
  })
  async getUserDetails(@Param('userId') userId: string): Promise<any> {
    this.logger.log(`Getting details for user: ${userId}`);

    const user = await this.usersService.findOne(userId);

    // Format the response
    return {
      id: user.id,
      name: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      roles: user.roles,
      status: user.status,
      schoolId: user.schoolId,
      schoolName: user.schoolId ? await this.getSchoolName(user.schoolId) : null,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      gender: user.gender,
      address: user.address,
      lastLogin: user.lastLoginAt?.toISOString(),
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Patch('users/:userId')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information and settings.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
  })
  @ApiBody({
    description: 'User update data',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'User first name' },
        lastName: { type: 'string', description: 'User last name' },
        middleName: { type: 'string', description: 'User middle name (optional)' },
        email: { type: 'string', description: 'User email' },
        roles: {
          type: 'array',
          items: { type: 'string' },
          enum: ['super-admin', 'delegated-super-admin', 'school-admin', 'teacher', 'student', 'parent'],
          description: 'User roles (array)'
        },
        schoolId: { type: 'string', description: 'School ID' },
        phone: { type: 'string', description: 'Phone number' },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended', 'pending'],
          description: 'User status'
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updates: UpdateUserDto,
  ): Promise<any> {
    this.logger.log(`Updating user: ${userId}`);

    const updatedUser = await this.usersService.update(userId, updates);

    // Format the response
    return {
      id: updatedUser.id,
      name: `${updatedUser.firstName} ${updatedUser.middleName ? updatedUser.middleName + ' ' : ''}${updatedUser.lastName}`,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      middleName: updatedUser.middleName,
      email: updatedUser.email,
      roles: updatedUser.roles,
      status: updatedUser.status,
      schoolId: updatedUser.schoolId,
      phone: updatedUser.phone,
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  @Delete('users/:userId')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently deletes a user and all associated data.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('userId') userId: string, @Req() req: any): Promise<void> {
    this.logger.log(`Deleting user: ${userId}`);

    // Only super admins can delete users
    if (!this.canPerformRestrictedOperation(req.user)) {
      throw new ForbiddenException('Only super administrators can delete users');
    }

    await this.usersService.remove(userId);
  }

  @Post('users/:userId/reactivate')
  @ApiOperation({
    summary: 'Reactivate suspended user',
    description: 'Reactivates a suspended user account.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User reactivated successfully',
  })
  async reactivateUser(@Param('userId') userId: string): Promise<any> {
    this.logger.log(`Reactivating user: ${userId}`);

    const reactivatedUser = await this.usersService.activate(userId);

    // Format the response
    return {
      id: reactivatedUser.id,
      name: `${reactivatedUser.firstName} ${reactivatedUser.middleName ? reactivatedUser.middleName + ' ' : ''}${reactivatedUser.lastName}`,
      firstName: reactivatedUser.firstName,
      lastName: reactivatedUser.lastName,
      middleName: reactivatedUser.middleName,
      email: reactivatedUser.email,
      roles: reactivatedUser.roles,
      status: reactivatedUser.status,
      schoolId: reactivatedUser.schoolId,
      phone: reactivatedUser.phone,
      updatedAt: reactivatedUser.updatedAt.toISOString(),
    };
  }

  // ==================== BULK OPERATIONS ====================

  @Post('users/bulk')
  @ApiOperation({
    summary: 'Bulk user operations',
    description: 'Perform bulk operations on multiple users.',
  })
  @ApiBody({
    description: 'Bulk operation data',
    schema: {
      type: 'object',
      required: ['operation', 'userIds'],
      properties: {
        operation: {
          type: 'string',
          enum: ['activate', 'deactivate', 'suspend', 'delete'],
          description: 'Operation to perform'
        },
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs'
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk operation completed successfully',
  })
  async bulkUserOperation(
    @Body() bulkData: { operation: string; userIds: string[] },
    @Req() req: any,
  ): Promise<any> {
    this.logger.log(`Performing bulk ${bulkData.operation} on ${bulkData.userIds.length} users`);

    // Only super admins can perform bulk operations
    if (!this.canPerformRestrictedOperation(req.user)) {
      throw new ForbiddenException('Only super administrators can perform bulk operations');
    }

    const results = [];
    for (const userId of bulkData.userIds) {
      try {
        switch (bulkData.operation) {
          case 'activate':
            await this.usersService.activate(userId);
            break;
          case 'deactivate':
            await this.usersService.deactivate(userId);
            break;
          case 'suspend':
            await this.usersService.suspend(userId);
            break;
          case 'delete':
            await this.usersService.remove(userId);
            break;
        }
        results.push({ userId, success: true });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return {
      operation: bulkData.operation,
      total: bulkData.userIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}