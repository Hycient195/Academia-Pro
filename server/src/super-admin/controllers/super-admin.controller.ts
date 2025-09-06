// Academia Pro - Super Admin Users Controller
// Handles multi-school user administration and cross-school user operations

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateUserDto, UpdateUserDto } from '../../users/dtos';
import { PaginatedResponse } from '@academia-pro/types/shared';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

@ApiTags('Super Admin - Multi-School User Management')
@Controller('super-admin')
@UseGuards(RolesGuard)
@Roles(EUserRole.SUPER_ADMIN)
export class SuperAdminUsersController {
  private readonly logger = new Logger(SuperAdminUsersController.name);

  constructor(
    private readonly usersService: UsersService,
  ) {}

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
    name: 'role',
    required: false,
    enum: ['super-admin', 'school-admin', 'teacher', 'student', 'parent'],
    description: 'Filter by user role',
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
    @Query('role') role?: EUserRole,
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
      role,
      status,
      schoolId,
      search,
    }) as unknown as PaginatedResponse<User>;

    // Format users for client
    const formattedUsers = result.data.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      role: user.role,
      status: user.status,
      schoolId: user.schoolId,
      schoolName: user.schoolId ? 'School Name' : null, // TODO: Get school name from school service
      phone: user.phone,
      lastLogin: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

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
      required: ['firstName', 'lastName', 'email', 'role'],
      properties: {
        firstName: { type: 'string', description: 'User first name' },
        lastName: { type: 'string', description: 'User last name' },
        middleName: { type: 'string', description: 'User middle name (optional)' },
        email: { type: 'string', description: 'User email' },
        role: {
          type: 'string',
          enum: ['super-admin', 'school-admin', 'teacher', 'student', 'parent'],
          description: 'User role'
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

    const createdUser = await this.usersService.create(userData);

    // Format the response
    return {
      id: createdUser.id,
      name: `${createdUser.firstName} ${createdUser.middleName ? createdUser.middleName + ' ' : ''}${createdUser.lastName}`,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      middleName: createdUser.middleName,
      email: createdUser.email,
      role: createdUser.role,
      status: createdUser.status,
      schoolId: createdUser.schoolId,
      phone: createdUser.phone,
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
      role: user.role,
      status: user.status,
      schoolId: user.schoolId,
      schoolName: user.schoolId ? 'School Name' : null, // TODO: Get school name
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
        role: {
          type: 'string',
          enum: ['super-admin', 'school-admin', 'teacher', 'student', 'parent'],
          description: 'User role'
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
      role: updatedUser.role,
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
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    this.logger.log(`Deleting user: ${userId}`);

    await this.usersService.remove(userId);
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
  ): Promise<any> {
    this.logger.log(`Performing bulk ${bulkData.operation} on ${bulkData.userIds.length} users`);

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