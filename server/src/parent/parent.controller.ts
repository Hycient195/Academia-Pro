// Academia Pro - Parent Controller
// REST API endpoints for parent portal management

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ParentService } from './parent.service';
import { CreateParentDto, UpdateParentDto, ParentResponseDto, ParentListResponseDto, ParentStatisticsResponseDto } from './dtos/index';
import { IParentFilters } from '@academia-pro/types/parent/parent.types';

@ApiTags('Parent Portal')
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new parent profile' })
  @ApiResponse({
    status: 201,
    description: 'Parent profile created successfully',
    type: ParentResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Parent profile already exists for this user' })
  async createParent(@Body() createParentDto: CreateParentDto): Promise<ParentResponseDto> {
    return this.parentService.create(createParentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parents with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Parents retrieved successfully',
    type: ParentListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'relationship', required: false, type: String })
  @ApiQuery({ name: 'accessLevel', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPrimaryContact', required: false, type: Boolean })
  @ApiQuery({ name: 'hasChildren', required: false, type: Boolean })
  @ApiQuery({ name: 'lastLoginAfter', required: false, type: Date })
  @ApiQuery({ name: 'lastLoginBefore', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllParents(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('schoolId') schoolId?: string,
    @Query('relationship') relationship?: string,
    @Query('accessLevel') accessLevel?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isPrimaryContact') isPrimaryContact?: boolean,
    @Query('hasChildren') hasChildren?: boolean,
    @Query('lastLoginAfter') lastLoginAfter?: Date,
    @Query('lastLoginBefore') lastLoginBefore?: Date,
    @Query('search') search?: string,
  ): Promise<ParentListResponseDto> {
    const filters: IParentFilters = {
      schoolId,
      relationship: relationship as any,
      accessLevel: accessLevel as any,
      isActive,
      isPrimaryContact,
      hasChildren,
      lastLoginAfter,
      lastLoginBefore,
      search,
    };

    return this.parentService.findAll({ page, limit, filters });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get parent statistics' })
  @ApiResponse({
    status: 200,
    description: 'Parent statistics retrieved successfully',
    type: ParentStatisticsResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getParentStatistics(@Query('schoolId') schoolId: string): Promise<ParentStatisticsResponseDto> {
    return this.parentService.getStatistics(schoolId);
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Get inactive parents' })
  @ApiResponse({
    status: 200,
    description: 'Inactive parents retrieved successfully',
    type: [ParentResponseDto],
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  @ApiQuery({ name: 'daysInactive', required: false, type: Number })
  async getInactiveParents(
    @Query('schoolId') schoolId: string,
    @Query('daysInactive') daysInactive: number = 90,
  ): Promise<ParentResponseDto[]> {
    return this.parentService.getInactiveParents(schoolId, daysInactive);
  }

  @Get('by-student/:studentId')
  @ApiOperation({ summary: 'Get parents by student ID' })
  @ApiResponse({
    status: 200,
    description: 'Parents retrieved successfully',
    type: [ParentResponseDto],
  })
  @ApiParam({ name: 'studentId', description: 'Student ID', type: String })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getParentsByStudentId(
    @Param('studentId') studentId: string,
    @Query('schoolId') schoolId: string,
  ): Promise<ParentResponseDto[]> {
    return this.parentService.getParentsByStudentId(studentId, schoolId);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get parent by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Parent retrieved successfully',
    type: ParentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Parent profile not found' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getParentByUserId(
    @Param('userId') userId: string,
    @Query('schoolId') schoolId: string,
  ): Promise<ParentResponseDto> {
    return this.parentService.findByUserId(userId, schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parent by ID' })
  @ApiResponse({
    status: 200,
    description: 'Parent retrieved successfully',
    type: ParentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async findParentById(@Param('id', ParseUUIDPipe) id: string): Promise<ParentResponseDto> {
    return this.parentService.findOne(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get parent dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async getParentDashboard(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.parentService.getDashboard(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update parent profile' })
  @ApiResponse({
    status: 200,
    description: 'Parent updated successfully',
    type: ParentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async updateParent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateParentDto: UpdateParentDto,
  ): Promise<ParentResponseDto> {
    return this.parentService.update(id, updateParentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete parent profile' })
  @ApiResponse({
    status: 200,
    description: 'Parent deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async removeParent(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.parentService.remove(id);
  }

  @Post(':id/children')
  @ApiOperation({ summary: 'Add child to parent' })
  @ApiResponse({
    status: 200,
    description: 'Child added successfully',
    type: ParentResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async addChild(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() childData: {
      studentId: string;
      relationship: string;
      isPrimaryGuardian: boolean;
      emergencyContact: boolean;
      accessPermissions: any;
    },
  ): Promise<ParentResponseDto> {
    return this.parentService.addChild(id, childData as any);
  }

  @Delete(':id/children/:studentId')
  @ApiOperation({ summary: 'Remove child from parent' })
  @ApiResponse({
    status: 200,
    description: 'Child removed successfully',
    type: ParentResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  @ApiParam({ name: 'studentId', description: 'Student ID', type: String })
  async removeChild(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId') studentId: string,
  ): Promise<ParentResponseDto> {
    return this.parentService.removeChild(id, studentId);
  }

  @Patch(':id/children/:studentId/permissions')
  @ApiOperation({ summary: 'Update child permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
    type: ParentResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  @ApiParam({ name: 'studentId', description: 'Student ID', type: String })
  async updateChildPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId') studentId: string,
    @Body() permissions: any,
  ): Promise<ParentResponseDto> {
    return this.parentService.updateChildPermissions(id, studentId, permissions);
  }

  @Post(':id/record-login')
  @ApiOperation({ summary: 'Record parent login' })
  @ApiResponse({
    status: 200,
    description: 'Login recorded successfully',
  })
  @ApiParam({ name: 'id', description: 'Parent ID', type: String })
  async recordLogin(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    // This would typically be called automatically on login
    // For now, manual endpoint for testing
    const parent = await this.parentService.findOne(id);
    return this.parentService.recordLogin(parent.userId, parent.schoolId);
  }

  @Post('bulk-update-access')
  @ApiOperation({ summary: 'Bulk update parent access levels' })
  @ApiResponse({
    status: 200,
    description: 'Access levels updated successfully',
  })
  async bulkUpdateAccessLevel(
    @Body() updateData: { parentIds: string[]; accessLevel: string },
  ): Promise<void> {
    return this.parentService.bulkUpdateAccessLevel(updateData.parentIds, updateData.accessLevel as any);
  }

  @Post('bulk-notification')
  @ApiOperation({ summary: 'Send bulk notification to parents' })
  @ApiResponse({
    status: 200,
    description: 'Notifications sent successfully',
  })
  async sendBulkNotification(
    @Body() notificationData: { parentIds: string[]; message: string; type: string },
  ): Promise<void> {
    return this.parentService.sendBulkNotification(
      notificationData.parentIds,
      notificationData.message,
      notificationData.type,
    );
  }

  @Post('validate-access')
  @ApiOperation({ summary: 'Validate parent access to student feature' })
  @ApiResponse({
    status: 200,
    description: 'Access validation result',
  })
  async validateAccess(
    @Body() validationData: { parentId: string; studentId: string; feature: string },
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.parentService.validateAccess(
      validationData.parentId,
      validationData.studentId,
      validationData.feature,
    );
    return { hasAccess };
  }
}