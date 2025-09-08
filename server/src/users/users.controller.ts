// Academia Pro - Users Controller
// REST API endpoints for user management

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators';
import { User } from './user.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { AuditInterceptor } from '../common/audit/audit.interceptor';
import { Auditable, AuditCreate, AuditUpdate, AuditDelete, AuditRead, AuditSecurity } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @AuditCreate('user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: EUserRole })
  @ApiQuery({ name: 'status', required: false, enum: EUserStatus })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @Auditable({
    action: AuditAction.DATA_ACCESSED,
    resource: 'user',
    severity: AuditSeverity.LOW,
    samplingRate: 0.1, // Sample 10% of user list requests for performance
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: EUserRole,
    @Query('status') status?: EUserStatus,
    @Query('schoolId') schoolId?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page,
      limit,
      role,
      status,
      schoolId,
      search,
    });
  }

  @Get('search')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'role', required: false, enum: EUserRole })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  search(
    @Query('query') query: string,
    @Query('role') role?: EUserRole,
    @Query('schoolId') schoolId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.search(query, { role, schoolId, limit });
  }

  @Get('by-role/:role')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  getUsersByRole(@Param('role') role: EUserRole) {
    return this.usersService.getUsersByRole(role);
  }

  @Get('by-school/:schoolId')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users by school' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  getUsersBySchool(@Param('schoolId') schoolId: string) {
    return this.usersService.getUsersBySchool(schoolId);
  }

  @Get('statistics')
  @Roles(EUserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @AuditRead('user', 'id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @AuditUpdate('user', 'id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/activate')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
  })
  @ApiResponse({ status: 400, description: 'User is already active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  @ApiResponse({ status: 400, description: 'User is already inactive' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/suspend')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
  })
  @ApiResponse({ status: 400, description: 'User is already suspended' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @AuditSecurity('user_suspension')
  suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Patch(':id/preferences')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updatePreferences(@Param('id') id: string, @Body() preferences: User['preferences']) {
    return this.usersService.updatePreferences(id, preferences);
  }

  @Patch(':id/change-password')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password (admin function)' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  changePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.changePassword(id, currentPassword, newPassword);
  }

  @Patch(':id/reset-password')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password (admin function)' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Patch(':id/verify-email')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user email (admin function)' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  verifyEmail(@Param('id') id: string) {
    return this.usersService.verifyEmail(id);
  }

  @Delete(':id')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @AuditDelete('user', 'id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}