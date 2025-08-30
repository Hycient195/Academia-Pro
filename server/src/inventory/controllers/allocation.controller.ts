// Academia Pro - Asset Allocation Controller
// Controller for managing asset allocations, assignments, and returns

import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AllocationService, AllocationRequest, AllocationAnalytics } from '../services/allocation.service';
import { MovementStatus } from '../entities/asset-movement.entity';

@ApiTags('Inventory - Allocation')
@Controller('inventory/allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post('request')
  @ApiOperation({
    summary: 'Request asset allocation',
    description: 'Creates a request for asset allocation.',
  })
  @ApiBody({
    description: 'Allocation request data',
    schema: {
      type: 'object',
      required: ['assetId', 'requestedBy', 'purpose', 'priority'],
      properties: {
        assetId: { type: 'string' },
        requestedBy: { type: 'string' },
        requestedFor: { type: 'string' },
        department: { type: 'string' },
        locationId: { type: 'string' },
        purpose: { type: 'string' },
        expectedReturnDate: { type: 'string', format: 'date-time' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        specialRequirements: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Allocation request created successfully',
  })
  async requestAllocation(@Body() request: AllocationRequest) {
    return this.allocationService.requestAllocation(request);
  }

  @Put('approve/:requestId')
  @ApiOperation({
    summary: 'Approve allocation request',
    description: 'Approves a pending allocation request.',
  })
  @ApiParam({ name: 'requestId', description: 'Allocation request ID' })
  @ApiBody({
    description: 'Approval data',
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Allocation request approved successfully',
  })
  async approveAllocation(
    @Param('requestId') requestId: string,
    @Body() approvalData: { approvedBy: string },
  ) {
    return this.allocationService.approveAllocation(requestId, approvalData.approvedBy);
  }

  @Put('allocate/:requestId')
  @ApiOperation({
    summary: 'Allocate asset',
    description: 'Allocates an approved asset to the requester.',
  })
  @ApiParam({ name: 'requestId', description: 'Allocation request ID' })
  @ApiBody({
    description: 'Allocation data',
    schema: {
      type: 'object',
      properties: {
        carriedBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Asset allocated successfully',
  })
  async allocateAsset(
    @Param('requestId') requestId: string,
    @Body() allocationData: { carriedBy?: string },
  ) {
    return this.allocationService.allocateAsset(requestId, allocationData.carriedBy);
  }

  @Put('return/:assetId')
  @ApiOperation({
    summary: 'Return asset',
    description: 'Processes the return of an allocated asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiBody({
    description: 'Return data',
    schema: {
      type: 'object',
      required: ['returnedBy'],
      properties: {
        returnedBy: { type: 'string' },
        condition: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Asset returned successfully',
  })
  async returnAsset(
    @Param('assetId') assetId: string,
    @Body() returnData: { returnedBy: string; condition?: string; notes?: string },
  ) {
    return this.allocationService.returnAsset(
      assetId,
      returnData.returnedBy,
      returnData.condition,
      returnData.notes,
    );
  }

  @Get('requests/:schoolId')
  @ApiOperation({
    summary: 'Get allocation requests',
    description: 'Returns allocation requests for a school.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(MovementStatus) })
  @ApiResponse({
    status: 200,
    description: 'Allocation requests retrieved successfully',
  })
  async getAllocationRequests(
    @Param('schoolId') schoolId: string,
    @Query('status') status?: MovementStatus,
  ) {
    return this.allocationService.getAllocationRequests(schoolId, status);
  }

  @Get('active/:schoolId')
  @ApiOperation({
    summary: 'Get active allocations',
    description: 'Returns currently active asset allocations.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Active allocations retrieved successfully',
  })
  async getActiveAllocations(@Param('schoolId') schoolId: string) {
    return this.allocationService.getActiveAllocations(schoolId);
  }

  @Get('overdue/:schoolId')
  @ApiOperation({
    summary: 'Get overdue allocations',
    description: 'Returns allocations that are overdue for return.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Overdue allocations retrieved successfully',
  })
  async getOverdueAllocations(@Param('schoolId') schoolId: string) {
    return this.allocationService.getOverdueAllocations(schoolId);
  }

  @Put('extend/:requestId')
  @ApiOperation({
    summary: 'Extend allocation',
    description: 'Extends the return date for an active allocation.',
  })
  @ApiParam({ name: 'requestId', description: 'Allocation request ID' })
  @ApiBody({
    description: 'Extension data',
    schema: {
      type: 'object',
      required: ['newReturnDate', 'reason'],
      properties: {
        newReturnDate: { type: 'string', format: 'date-time' },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Allocation extended successfully',
  })
  async extendAllocation(
    @Param('requestId') requestId: string,
    @Body() extensionData: { newReturnDate: Date; reason: string },
  ) {
    return this.allocationService.extendAllocation(
      requestId,
      extensionData.newReturnDate,
      extensionData.reason,
    );
  }

  @Get('history/:assetId')
  @ApiOperation({
    summary: 'Get allocation history',
    description: 'Returns the allocation history for a specific asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Allocation history retrieved successfully',
  })
  async getAllocationHistory(@Param('assetId') assetId: string) {
    return this.allocationService.getAllocationHistory(assetId);
  }

  @Get('analytics/:schoolId')
  @ApiOperation({
    summary: 'Get allocation analytics',
    description: 'Returns comprehensive analytics for asset allocations.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Allocation analytics retrieved successfully',
  })
  async getAllocationAnalytics(@Param('schoolId') schoolId: string): Promise<AllocationAnalytics> {
    return this.allocationService.getAllocationAnalytics(schoolId);
  }

  @Put('cancel/:requestId')
  @ApiOperation({
    summary: 'Cancel allocation',
    description: 'Cancels a pending or active allocation request.',
  })
  @ApiParam({ name: 'requestId', description: 'Allocation request ID' })
  @ApiBody({
    description: 'Cancellation data',
    schema: {
      type: 'object',
      required: ['cancelledBy', 'reason'],
      properties: {
        cancelledBy: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Allocation cancelled successfully',
  })
  async cancelAllocation(
    @Param('requestId') requestId: string,
    @Body() cancellationData: { cancelledBy: string; reason: string },
  ) {
    return this.allocationService.cancelAllocation(
      requestId,
      cancellationData.cancelledBy,
      cancellationData.reason,
    );
  }
}