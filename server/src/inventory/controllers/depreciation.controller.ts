// Academia Pro - Asset Depreciation Controller
// Controller for managing asset depreciation calculations and schedules

import { Controller, Get, Post, Put, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DepreciationService, DepreciationCalculation, DepreciationSchedule, DepreciationAnalytics } from '../services/depreciation.service';
import { DepreciationMethod } from '../entities/asset.entity';

@ApiTags('Inventory - Depreciation')
@Controller('inventory/depreciation')
export class DepreciationController {
  constructor(private readonly depreciationService: DepreciationService) {}

  @Post('calculate/:assetId')
  @ApiOperation({
    summary: 'Calculate depreciation',
    description: 'Calculates the current depreciation for a specific asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation calculated successfully',
  })
  async calculateDepreciation(@Param('assetId') assetId: string): Promise<DepreciationCalculation> {
    return this.depreciationService.calculateDepreciation(assetId);
  }

  @Post('apply/:assetId')
  @ApiOperation({
    summary: 'Apply depreciation',
    description: 'Applies the calculated depreciation to an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation applied successfully',
  })
  async applyDepreciation(@Param('assetId') assetId: string) {
    return this.depreciationService.applyDepreciation(assetId);
  }

  @Post('bulk-calculate/:schoolId')
  @ApiOperation({
    summary: 'Bulk calculate depreciation',
    description: 'Calculates depreciation for all assets in a school.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Bulk depreciation calculation completed successfully',
  })
  async bulkCalculateDepreciation(@Param('schoolId') schoolId: string): Promise<DepreciationCalculation[]> {
    return this.depreciationService.bulkCalculateDepreciation(schoolId);
  }

  @Post('bulk-apply/:schoolId')
  @ApiOperation({
    summary: 'Bulk apply depreciation',
    description: 'Applies depreciation to all assets in a school.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Bulk depreciation applied successfully',
  })
  async bulkApplyDepreciation(@Param('schoolId') schoolId: string) {
    return this.depreciationService.bulkApplyDepreciation(schoolId);
  }

  @Get('schedule/:assetId')
  @ApiOperation({
    summary: 'Get depreciation schedule',
    description: 'Returns the complete depreciation schedule for an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation schedule retrieved successfully',
  })
  async getDepreciationSchedule(@Param('assetId') assetId: string): Promise<DepreciationSchedule> {
    return this.depreciationService.getDepreciationSchedule(assetId);
  }

  @Get('due/:schoolId')
  @ApiOperation({
    summary: 'Get assets due for depreciation',
    description: 'Returns assets that are due for depreciation calculation.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Assets due for depreciation retrieved successfully',
  })
  async getAssetsDueForDepreciation(@Param('schoolId') schoolId: string) {
    return this.depreciationService.getAssetsDueForDepreciation(schoolId);
  }

  @Get('analytics/:schoolId')
  @ApiOperation({
    summary: 'Get depreciation analytics',
    description: 'Returns comprehensive depreciation analytics for a school.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation analytics retrieved successfully',
  })
  async getDepreciationAnalytics(@Param('schoolId') schoolId: string): Promise<DepreciationAnalytics> {
    return this.depreciationService.getDepreciationAnalytics(schoolId);
  }

  @Post('reset/:assetId')
  @ApiOperation({
    summary: 'Reset depreciation',
    description: 'Resets the depreciation calculation for an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation reset successfully',
  })
  async resetDepreciation(@Param('assetId') assetId: string) {
    return this.depreciationService.resetDepreciation(assetId);
  }

  @Put('method/:assetId')
  @ApiOperation({
    summary: 'Update depreciation method',
    description: 'Updates the depreciation method and useful life for an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiQuery({ name: 'method', required: true, enum: Object.values(DepreciationMethod) })
  @ApiQuery({ name: 'usefulLifeYears', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Depreciation method updated successfully',
  })
  async updateDepreciationMethod(
    @Param('assetId') assetId: string,
    @Query('method') method: DepreciationMethod,
    @Query('usefulLifeYears') usefulLifeYears?: number,
  ) {
    return this.depreciationService.updateDepreciationMethod(assetId, method, usefulLifeYears);
  }
}