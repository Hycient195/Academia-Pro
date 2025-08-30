// Academia Pro - Asset Controller
// Controller for managing school assets and equipment

import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AssetService, AssetFilter, AssetAnalytics } from '../services/asset.service';
import { Asset, AssetStatus, AssetCondition, AssetType } from '../entities/asset.entity';

@ApiTags('Inventory - Assets')
@Controller('inventory/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new asset',
    description: 'Creates a new asset in the inventory system.',
  })
  @ApiBody({
    description: 'Asset data',
    schema: {
      type: 'object',
      required: ['schoolId', 'assetName', 'assetType'],
      properties: {
        schoolId: { type: 'string' },
        assetName: { type: 'string' },
        assetDescription: { type: 'string' },
        assetType: { type: 'string', enum: Object.values(AssetType) },
        categoryId: { type: 'string' },
        locationId: { type: 'string' },
        purchaseDate: { type: 'string', format: 'date' },
        purchaseCost: { type: 'number' },
        supplierName: { type: 'string' },
        serialNumber: { type: 'string' },
        modelNumber: { type: 'string' },
        usefulLifeYears: { type: 'number' },
        specifications: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully',
  })
  async createAsset(@Body() assetData: Partial<Asset>) {
    return this.assetService.createAsset(assetData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get assets by school',
    description: 'Returns assets for a specific school with optional filters.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(AssetStatus) })
  @ApiQuery({ name: 'condition', required: false, enum: Object.values(AssetCondition) })
  @ApiQuery({ name: 'assetType', required: false, enum: Object.values(AssetType) })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'assignedToUserId', required: false })
  @ApiQuery({ name: 'assignedToDepartment', required: false })
  @ApiResponse({
    status: 200,
    description: 'Assets retrieved successfully',
  })
  async getAssets(
    @Query('schoolId') schoolId: string,
    @Query() filters: AssetFilter,
  ) {
    return this.assetService.getAssetsBySchool(schoolId, filters);
  }

  @Get(':assetId')
  @ApiOperation({
    summary: 'Get asset by ID',
    description: 'Returns detailed information for a specific asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset retrieved successfully',
  })
  async getAsset(@Param('assetId') assetId: string) {
    return this.assetService.getAssetById(assetId);
  }

  @Put(':assetId')
  @ApiOperation({
    summary: 'Update asset',
    description: 'Updates an existing asset with new information.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiBody({
    description: 'Asset update data',
    schema: {
      type: 'object',
      properties: {
        assetName: { type: 'string' },
        assetDescription: { type: 'string' },
        locationId: { type: 'string' },
        condition: { type: 'string', enum: Object.values(AssetCondition) },
        notes: { type: 'string' },
        customFields: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Asset updated successfully',
  })
  async updateAsset(
    @Param('assetId') assetId: string,
    @Body() updateData: Partial<Asset>,
  ) {
    return this.assetService.updateAsset(assetId, updateData);
  }

  @Delete(':assetId')
  @ApiOperation({
    summary: 'Delete asset',
    description: 'Deletes an asset from the inventory system.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset deleted successfully',
  })
  async deleteAsset(@Param('assetId') assetId: string) {
    await this.assetService.deleteAsset(assetId);
    return { message: 'Asset deleted successfully' };
  }

  @Put(':assetId/assign')
  @ApiOperation({
    summary: 'Assign asset',
    description: 'Assigns an asset to a user, department, or location.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiBody({
    description: 'Assignment data',
    schema: {
      type: 'object',
      properties: {
        assignedToUserId: { type: 'string' },
        assignedToDepartment: { type: 'string' },
        locationId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Asset assigned successfully',
  })
  async assignAsset(
    @Param('assetId') assetId: string,
    @Body() assignmentData: {
      assignedToUserId?: string;
      assignedToDepartment?: string;
      locationId?: string;
    },
  ) {
    return this.assetService.assignAsset(assetId, assignmentData);
  }

  @Put(':assetId/condition')
  @ApiOperation({
    summary: 'Update asset condition',
    description: 'Updates the condition of an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiBody({
    description: 'Condition update data',
    schema: {
      type: 'object',
      required: ['condition'],
      properties: {
        condition: { type: 'string', enum: Object.values(AssetCondition) },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Asset condition updated successfully',
  })
  async updateAssetCondition(
    @Param('assetId') assetId: string,
    @Body() conditionData: { condition: AssetCondition; notes?: string },
  ) {
    return this.assetService.updateAssetCondition(
      assetId,
      conditionData.condition,
      conditionData.notes,
    );
  }

  @Post(':assetId/depreciation')
  @ApiOperation({
    summary: 'Calculate depreciation',
    description: 'Calculates and updates the depreciation for an asset.',
  })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation calculated successfully',
  })
  async calculateDepreciation(@Param('assetId') assetId: string) {
    return this.assetService.calculateDepreciation(assetId);
  }

  @Get('maintenance/due')
  @ApiOperation({
    summary: 'Get assets due for maintenance',
    description: 'Returns assets that are due for maintenance within the next 30 days.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Assets due for maintenance retrieved successfully',
  })
  async getAssetsDueForMaintenance(@Query('schoolId') schoolId: string) {
    return this.assetService.getAssetsDueForMaintenance(schoolId);
  }

  @Get('warranty/expiring')
  @ApiOperation({
    summary: 'Get assets with expiring warranty',
    description: 'Returns assets whose warranty is expiring within the next 90 days.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Assets with expiring warranty retrieved successfully',
  })
  async getAssetsExpiringWarranty(@Query('schoolId') schoolId: string) {
    return this.assetService.getAssetsExpiringWarranty(schoolId);
  }

  @Get('analytics/school/:schoolId')
  @ApiOperation({
    summary: 'Get asset analytics',
    description: 'Returns comprehensive analytics for assets in a school.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset analytics retrieved successfully',
  })
  async getAssetAnalytics(@Param('schoolId') schoolId: string): Promise<AssetAnalytics> {
    return this.assetService.getAssetAnalytics(schoolId);
  }

  @Put('bulk-update')
  @ApiOperation({
    summary: 'Bulk update assets',
    description: 'Updates multiple assets with the same data.',
  })
  @ApiBody({
    description: 'Bulk update data',
    schema: {
      type: 'object',
      required: ['assetIds', 'updateData'],
      properties: {
        assetIds: { type: 'array', items: { type: 'string' } },
        updateData: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assets updated successfully',
  })
  async bulkUpdateAssets(
    @Body() bulkData: { assetIds: string[]; updateData: Partial<Asset> },
  ) {
    return this.assetService.bulkUpdateAssets(bulkData.assetIds, bulkData.updateData);
  }

  @Get('search/:schoolId')
  @ApiOperation({
    summary: 'Search assets',
    description: 'Searches assets by name, code, or serial number.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Assets search completed successfully',
  })
  async searchAssets(
    @Param('schoolId') schoolId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.assetService.searchAssets(schoolId, searchTerm);
  }
}