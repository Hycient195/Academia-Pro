// Academia Pro - Hostel Controller
// REST API endpoints for managing hostels and dormitory operations

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HostelService } from '../services/hostel.service';
import { CreateHostelDto, UpdateHostelDto } from '../dtos';
import { HostelType, HostelStatus, FacilityType } from '../entities/hostel.entity';

@ApiTags('Hostel Management')
@ApiBearerAuth()
@Controller('hostels')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new hostel',
    description: 'Add a new hostel/dormitory to the system',
  })
  @ApiResponse({
    status: 201,
    description: 'Hostel created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Hostel with this code already exists',
  })
  async createHostel(
    @Body() dto: CreateHostelDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.hostelService.createHostel(dto, createdBy);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get hostel by ID',
    description: 'Retrieve a specific hostel with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Hostel not found',
  })
  async getHostelById(@Param('id', ParseUUIDPipe) hostelId: string) {
    return this.hostelService.getHostelById(hostelId);
  }

  @Get('code/:schoolId/:hostelCode')
  @ApiOperation({
    summary: 'Get hostel by code',
    description: 'Retrieve a hostel using its code and school ID',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiParam({
    name: 'hostelCode',
    description: 'Hostel code',
    example: 'HOSTEL-A',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Hostel not found',
  })
  async getHostelByCode(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('hostelCode') hostelCode: string,
  ) {
    return this.hostelService.getHostelByCode(schoolId, hostelCode);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update hostel',
    description: 'Update an existing hostel\'s information',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel updated successfully',
  })
  async updateHostel(
    @Param('id', ParseUUIDPipe) hostelId: string,
    @Body() dto: UpdateHostelDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.hostelService.updateHostel(hostelId, dto, updatedBy);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete hostel',
    description: 'Remove a hostel from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete hostel with active allocations',
  })
  async deleteHostel(@Param('id', ParseUUIDPipe) hostelId: string) {
    await this.hostelService.deleteHostel(hostelId);
    return { message: 'Hostel deleted successfully' };
  }

  @Get('schools/:schoolId')
  @ApiOperation({
    summary: 'Get hostels by school',
    description: 'Retrieve all hostels for a specific school',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by hostel type',
    enum: HostelType,
    example: HostelType.BOYS,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by hostel status',
    enum: HostelStatus,
    example: HostelStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Hostels retrieved successfully',
  })
  async getHostelsBySchool(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      type: query.type,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.hostelService.getHostelsBySchool(schoolId, options);
  }

  @Get('schools/:schoolId/available')
  @ApiOperation({
    summary: 'Get available hostels',
    description: 'Retrieve hostels with available beds for allocation',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by hostel type',
    enum: HostelType,
  })
  @ApiQuery({
    name: 'minAvailableBeds',
    required: false,
    description: 'Minimum available beds required',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Available hostels retrieved successfully',
  })
  async getAvailableHostels(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      type: query.type,
      minAvailableBeds: query.minAvailableBeds ? parseInt(query.minAvailableBeds) : undefined,
    };

    return this.hostelService.getAvailableHostels(schoolId, options);
  }

  @Get('schools/:schoolId/types/:type')
  @ApiOperation({
    summary: 'Get hostels by type',
    description: 'Retrieve all hostels of a specific type',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiParam({
    name: 'type',
    description: 'Hostel type',
    enum: HostelType,
    example: HostelType.BOYS,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: HostelStatus,
    example: HostelStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Hostels retrieved successfully',
  })
  async getHostelsByType(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('type') type: HostelType,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.hostelService.getHostelsByType(schoolId, type, options);
  }

  @Get('schools/:schoolId/search')
  @ApiOperation({
    summary: 'Search hostels',
    description: 'Search hostels by name, code, description, or warden',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'query',
    description: 'Search query',
    example: 'boys hostel',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by type',
    enum: HostelType,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: HostelStatus,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchHostels(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      type: query.type,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.hostelService.searchHostels(schoolId, query.query, options);
  }

  @Get('schools/:schoolId/statistics')
  @ApiOperation({
    summary: 'Get hostel statistics',
    description: 'Retrieve comprehensive hostel statistics and analytics',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel statistics retrieved successfully',
  })
  async getHostelStatistics(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.hostelService.getHostelStatistics(schoolId);
  }

  @Get('schools/:schoolId/dashboard')
  @ApiOperation({
    summary: 'Get hostel dashboard',
    description: 'Retrieve dashboard overview for hostel management',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel dashboard retrieved successfully',
  })
  async getHostelDashboard(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.hostelService.getHostelDashboard(schoolId);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update hostel status',
    description: 'Update the operational status of a hostel',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    description: 'New status',
    enum: HostelStatus,
    example: HostelStatus.ACTIVE,
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel status updated successfully',
  })
  async updateHostelStatus(
    @Param('id', ParseUUIDPipe) hostelId: string,
    @Query('status') status: HostelStatus,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.hostelService.updateHostelStatus(hostelId, status, updatedBy);
  }

  @Post(':id/facilities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add facility to hostel',
    description: 'Add a new facility to an existing hostel',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Facility added successfully',
  })
  async addFacilityToHostel(
    @Param('id', ParseUUIDPipe) hostelId: string,
    @Body() body: { facility: any },
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.hostelService.addFacilityToHostel(hostelId, body.facility, updatedBy);
  }

  @Delete(':id/facilities/:facilityType')
  @ApiOperation({
    summary: 'Remove facility from hostel',
    description: 'Remove a facility from an existing hostel',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiParam({
    name: 'facilityType',
    description: 'Facility type to remove',
    enum: FacilityType,
    example: FacilityType.WIFI,
  })
  @ApiResponse({
    status: 200,
    description: 'Facility removed successfully',
  })
  async removeFacilityFromHostel(
    @Param('id', ParseUUIDPipe) hostelId: string,
    @Param('facilityType') facilityType: FacilityType,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.hostelService.removeFacilityFromHostel(hostelId, facilityType, updatedBy);
  }

  @Put(':id/occupancy')
  @ApiOperation({
    summary: 'Update hostel occupancy',
    description: 'Recalculate and update hostel occupancy statistics',
  })
  @ApiParam({
    name: 'id',
    description: 'Hostel ID',
    example: 'hostel-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel occupancy updated successfully',
  })
  async updateHostelOccupancy(@Param('id', ParseUUIDPipe) hostelId: string) {
    return this.hostelService.updateHostelOccupancy(hostelId);
  }

  @Post('bulk-update-facilities/:schoolId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update hostel facilities',
    description: 'Update facilities for multiple hostels at once',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Hostel facilities updated successfully',
  })
  async bulkUpdateFacilities(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Body() body: { updates: Array<{ hostelId: string; facilities: any[] }> },
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.hostelService.bulkUpdateFacilities(schoolId, body.updates, updatedBy);
  }

  @Get('schools/:schoolId/reports/utilization')
  @ApiOperation({
    summary: 'Get hostel utilization report',
    description: 'Generate comprehensive hostel utilization report',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for report',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for report',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilization report generated successfully',
  })
  async getHostelUtilizationReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: {
      startDate?: string;
      endDate?: string;
    },
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.hostelService.getHostelUtilizationReport(schoolId, startDate, endDate);
  }

  @Get('schools/:schoolId/reports/occupancy-trends')
  @ApiOperation({
    summary: 'Get occupancy trends',
    description: 'Retrieve occupancy trends and patterns over time',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    description: 'Number of months to look back',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Occupancy trends retrieved successfully',
  })
  async getOccupancyTrends(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('months') months: number = 12,
  ) {
    // This would typically query historical data
    // For now, return current statistics
    const statistics = await this.hostelService.getHostelStatistics(schoolId);

    return {
      current: statistics,
      trends: {
        period: `${months} months`,
        direction: 'stable', // Would be calculated from historical data
        averageOccupancy: statistics.occupancyRate,
        peakOccupancy: statistics.occupancyRate,
        lowOccupancy: statistics.occupancyRate,
      },
      recommendations: [
        'Consider increasing capacity for high-demand periods',
        'Review pricing strategy for low-occupancy hostels',
        'Implement dynamic pricing based on demand',
      ],
    };
  }

  @Get('schools/:schoolId/reports/maintenance')
  @ApiOperation({
    summary: 'Get maintenance report',
    description: 'Retrieve maintenance activities and schedules',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by maintenance status',
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance report retrieved successfully',
  })
  async getMaintenanceReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('status') status?: string,
  ) {
    // This would typically query maintenance records
    // For now, return placeholder data
    const hostels = await this.hostelService.getHostelsBySchool(schoolId);

    return {
      summary: {
        totalHostels: hostels.length,
        underMaintenance: hostels.filter(h => h.status === HostelStatus.UNDER_MAINTENANCE).length,
        maintenanceRequired: 0, // Would be calculated from maintenance records
      },
      upcomingMaintenance: [], // Would be populated from maintenance schedules
      recentMaintenance: [], // Would be populated from maintenance history
      recommendations: [
        'Schedule regular maintenance for all hostels',
        'Implement preventive maintenance program',
        'Track maintenance costs and efficiency',
      ],
    };
  }

  @Get('schools/:schoolId/reports/revenue')
  @ApiOperation({
    summary: 'Get revenue report',
    description: 'Retrieve hostel revenue and financial analytics',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for report',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for report',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue report retrieved successfully',
  })
  async getRevenueReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: {
      startDate?: string;
      endDate?: string;
    },
  ) {
    const utilization = await this.hostelService.getHostelUtilizationReport(
      schoolId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );

    return {
      summary: {
        totalRevenue: utilization.summary.totalRevenue,
        averageRevenuePerHostel: utilization.hostels.length > 0
          ? Math.round(utilization.summary.totalRevenue / utilization.hostels.length * 100) / 100
          : 0,
        occupancyRate: utilization.summary.overallOccupancyRate,
        potentialRevenue: utilization.summary.totalCapacity * 500, // Assuming $500 average rent
      },
      byHostel: utilization.hostels.map(h => ({
        id: h.id,
        name: h.name,
        revenue: h.revenue,
        occupancyRate: h.occupancyRate,
        efficiency: h.capacity > 0 ? Math.round((h.occupied / h.capacity) * 100 * 100) / 100 : 0,
      })),
      trends: {
        period: {
          startDate: query.startDate || 'All time',
          endDate: query.endDate || 'Present',
        },
        growth: 'stable', // Would be calculated from historical data
        projections: {
          nextMonth: Math.round(utilization.summary.totalRevenue * 1.05 * 100) / 100,
          nextQuarter: Math.round(utilization.summary.totalRevenue * 1.15 * 100) / 100,
        },
      },
      recommendations: [
        'Optimize pricing based on demand and occupancy',
        'Implement loyalty programs for long-term residents',
        'Consider value-added services to increase revenue',
        'Monitor and reduce vacancy periods',
      ],
    };
  }
}