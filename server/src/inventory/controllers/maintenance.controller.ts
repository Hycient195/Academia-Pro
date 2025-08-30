// Academia Pro - Asset Maintenance Controller
// Controller for managing asset maintenance records and schedules

import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MaintenanceService, MaintenanceFilter, MaintenanceAnalytics } from '../services/maintenance.service';
import { AssetMaintenance, MaintenanceType, MaintenanceStatus, MaintenancePriority } from '../entities/asset-maintenance.entity';

@ApiTags('Inventory - Maintenance')
@Controller('inventory/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({
    summary: 'Create maintenance record',
    description: 'Creates a new maintenance record for an asset.',
  })
  @ApiBody({
    description: 'Maintenance data',
    schema: {
      type: 'object',
      required: ['schoolId', 'assetId', 'maintenanceType', 'maintenanceTitle', 'scheduledDate'],
      properties: {
        schoolId: { type: 'string' },
        assetId: { type: 'string' },
        maintenanceType: { type: 'string', enum: Object.values(MaintenanceType) },
        maintenanceTitle: { type: 'string' },
        maintenanceDescription: { type: 'string' },
        scheduledDate: { type: 'string', format: 'date-time' },
        estimatedCost: { type: 'number' },
        priority: { type: 'string', enum: Object.values(MaintenancePriority) },
        checklist: { type: 'array', items: { type: 'string' } },
        assignedToUserId: { type: 'string' },
        vendorName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Maintenance record created successfully',
  })
  async createMaintenance(@Body() maintenanceData: Partial<AssetMaintenance>) {
    return this.maintenanceService.createMaintenanceRecord(maintenanceData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get maintenance records',
    description: 'Returns maintenance records for a school with optional filters.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(MaintenanceStatus) })
  @ApiQuery({ name: 'priority', required: false, enum: Object.values(MaintenancePriority) })
  @ApiQuery({ name: 'maintenanceType', required: false, enum: Object.values(MaintenanceType) })
  @ApiQuery({ name: 'assetId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Maintenance records retrieved successfully',
  })
  async getMaintenanceRecords(
    @Query('schoolId') schoolId: string,
    @Query() filters: MaintenanceFilter,
  ) {
    return this.maintenanceService.getMaintenanceRecords(schoolId, filters);
  }

  @Get(':maintenanceId')
  @ApiOperation({
    summary: 'Get maintenance record by ID',
    description: 'Returns detailed information for a specific maintenance record.',
  })
  @ApiParam({ name: 'maintenanceId', description: 'Maintenance record ID' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance record retrieved successfully',
  })
  async getMaintenance(@Param('maintenanceId') maintenanceId: string) {
    return this.maintenanceService.getMaintenanceById(maintenanceId);
  }

  @Put(':maintenanceId')
  @ApiOperation({
    summary: 'Update maintenance record',
    description: 'Updates an existing maintenance record with new information.',
  })
  @ApiParam({ name: 'maintenanceId', description: 'Maintenance record ID' })
  @ApiBody({
    description: 'Maintenance update data',
    schema: {
      type: 'object',
      properties: {
        maintenanceTitle: { type: 'string' },
        maintenanceDescription: { type: 'string' },
        status: { type: 'string', enum: Object.values(MaintenanceStatus) },
        priority: { type: 'string', enum: Object.values(MaintenancePriority) },
        scheduledDate: { type: 'string', format: 'date-time' },
        estimatedCost: { type: 'number' },
        actualCost: { type: 'number' },
        workPerformed: { type: 'string' },
        findings: { type: 'string' },
        recommendations: { type: 'string' },
        assignedToUserId: { type: 'string' },
        vendorName: { type: 'string' },
        checklist: { type: 'array', items: { type: 'object' } },
        partsUsed: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance record updated successfully',
  })
  async updateMaintenance(
    @Param('maintenanceId') maintenanceId: string,
    @Body() updateData: Partial<AssetMaintenance>,
  ) {
    return this.maintenanceService.updateMaintenanceRecord(maintenanceId, updateData);
  }

  @Delete(':maintenanceId')
  @ApiOperation({
    summary: 'Delete maintenance record',
    description: 'Deletes a maintenance record from the system.',
  })
  @ApiParam({ name: 'maintenanceId', description: 'Maintenance record ID' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance record deleted successfully',
  })
  async deleteMaintenance(@Param('maintenanceId') maintenanceId: string) {
    await this.maintenanceService.deleteMaintenanceRecord(maintenanceId);
    return { message: 'Maintenance record deleted successfully' };
  }

  @Post('schedule')
  @ApiOperation({
    summary: 'Schedule maintenance',
    description: 'Schedules maintenance for an asset.',
  })
  @ApiBody({
    description: 'Maintenance schedule data',
    schema: {
      type: 'object',
      required: ['assetId', 'maintenanceType', 'title', 'scheduledDate'],
      properties: {
        assetId: { type: 'string' },
        maintenanceType: { type: 'string', enum: Object.values(MaintenanceType) },
        title: { type: 'string' },
        description: { type: 'string' },
        scheduledDate: { type: 'string', format: 'date-time' },
        estimatedCost: { type: 'number' },
        priority: { type: 'string', enum: Object.values(MaintenancePriority) },
        checklist: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Maintenance scheduled successfully',
  })
  async scheduleMaintenance(
    @Body() scheduleData: {
      assetId: string;
      maintenanceType: MaintenanceType;
      title: string;
      description?: string;
      scheduledDate: Date;
      estimatedCost?: number;
      priority?: MaintenancePriority;
      checklist?: string[];
    },
  ) {
    return this.maintenanceService.scheduleMaintenance(
      scheduleData.assetId,
      scheduleData,
    );
  }

  @Put(':maintenanceId/start')
  @ApiOperation({
    summary: 'Start maintenance',
    description: 'Marks a maintenance record as in progress.',
  })
  @ApiParam({ name: 'maintenanceId', description: 'Maintenance record ID' })
  @ApiBody({
    description: 'Start maintenance data',
    schema: {
      type: 'object',
      required: ['startedBy'],
      properties: {
        startedBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance started successfully',
  })
  async startMaintenance(
    @Param('maintenanceId') maintenanceId: string,
    @Body() startData: { startedBy: string },
  ) {
    return this.maintenanceService.startMaintenance(maintenanceId, startData.startedBy);
  }

  @Put(':maintenanceId/complete')
  @ApiOperation({
    summary: 'Complete maintenance',
    description: 'Marks a maintenance record as completed with completion details.',
  })
  @ApiParam({ name: 'maintenanceId', description: 'Maintenance record ID' })
  @ApiBody({
    description: 'Maintenance completion data',
    schema: {
      type: 'object',
      required: ['workPerformed'],
      properties: {
        workPerformed: { type: 'string' },
        findings: { type: 'string' },
        recommendations: { type: 'string' },
        actualCost: { type: 'number' },
        partsUsed: { type: 'array', items: { type: 'object' } },
        checklist: { type: 'array', items: { type: 'object' } },
        nextDueDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance completed successfully',
  })
  async completeMaintenance(
    @Param('maintenanceId') maintenanceId: string,
    @Body() completionData: {
      workPerformed: string;
      findings?: string;
      recommendations?: string;
      actualCost?: number;
      partsUsed?: Array<{
        partName: string;
        partNumber: string;
        quantity: number;
        cost: number;
        supplier?: string;
      }>;
      checklist?: Array<{
        item: string;
        completed: boolean;
        notes?: string;
      }>;
      nextDueDate?: Date;
    },
  ) {
    return this.maintenanceService.completeMaintenance(maintenanceId, completionData);
  }

  @Get('overdue/:schoolId')
  @ApiOperation({
    summary: 'Get overdue maintenance',
    description: 'Returns maintenance records that are overdue.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Overdue maintenance records retrieved successfully',
  })
  async getOverdueMaintenance(@Param('schoolId') schoolId: string) {
    return this.maintenanceService.getOverdueMaintenance(schoolId);
  }

  @Get('upcoming/:schoolId')
  @ApiOperation({
    summary: 'Get upcoming maintenance',
    description: 'Returns maintenance records scheduled for the next specified days.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Number of days ahead (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming maintenance records retrieved successfully',
  })
  async getUpcomingMaintenance(
    @Param('schoolId') schoolId: string,
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.maintenanceService.getUpcomingMaintenance(schoolId, daysAhead);
  }

  @Get('analytics/:schoolId')
  @ApiOperation({
    summary: 'Get maintenance analytics',
    description: 'Returns comprehensive analytics for maintenance records.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance analytics retrieved successfully',
  })
  async getMaintenanceAnalytics(@Param('schoolId') schoolId: string): Promise<MaintenanceAnalytics> {
    return this.maintenanceService.getMaintenanceAnalytics(schoolId);
  }
}