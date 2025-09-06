// Academia Pro - Staff Controller
// REST API endpoints for staff and HR management

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, StaffResponseDto, StaffListResponseDto, StaffStatisticsResponseDto } from './dtos/index';
import { IStaffFilters } from '@academia-pro/types/staff';

@ApiTags('Staff Management')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Staff member with this employee ID or email already exists' })
  async create(@Body() createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff members with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Staff members retrieved successfully',
    type: StaffListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'position', required: false, type: String })
  @ApiQuery({ name: 'employmentType', required: false, type: String })
  @ApiQuery({ name: 'employmentStatus', required: false, type: String })
  @ApiQuery({ name: 'managerId', required: false, type: String })
  @ApiQuery({ name: 'hireDateFrom', required: false, type: Date })
  @ApiQuery({ name: 'hireDateTo', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('schoolId') schoolId?: string,
    @Query('department') department?: string,
    @Query('position') position?: string,
    @Query('employmentType') employmentType?: string,
    @Query('employmentStatus') employmentStatus?: string,
    @Query('managerId') managerId?: string,
    @Query('hireDateFrom') hireDateFrom?: Date,
    @Query('hireDateTo') hireDateTo?: Date,
    @Query('search') search?: string,
  ): Promise<StaffListResponseDto> {
    const filters: IStaffFilters = {
      schoolId,
      department: department as any,
      position: position as any,
      employmentType: employmentType as any,
      employmentStatus: employmentStatus as any,
      managerId,
      hireDateFrom,
      hireDateTo,
      search,
    };

    return this.staffService.findAll({ page, limit, filters });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get staff statistics' })
  @ApiResponse({
    status: 200,
    description: 'Staff statistics retrieved successfully',
    type: StaffStatisticsResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getStatistics(@Query('schoolId') schoolId: string): Promise<StaffStatisticsResponseDto> {
    return this.staffService.getStatistics(schoolId);
  }

  @Get('hr-statistics')
  @ApiOperation({ summary: 'Get comprehensive HR statistics' })
  @ApiResponse({
    status: 200,
    description: 'HR statistics retrieved successfully',
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getHRStatistics(@Query('schoolId') schoolId: string) {
    return this.staffService.getHRStatistics(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member retrieved successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<StaffResponseDto> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiResponse({ status: 409, description: 'Staff member with this employee ID or email already exists' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: String })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete staff member with subordinates' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.staffService.remove(id);
  }
}