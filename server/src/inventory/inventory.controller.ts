// Academia Pro - Inventory Controller
// REST API endpoints for inventory and asset management

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto, AssetListResponseDto, AssetStatisticsResponseDto } from './dtos/index';
import { IAssetFilters } from '../../../common/src/types/inventory/inventory.types';

@ApiTags('Inventory & Asset Management')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('assets')
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Asset with this code already exists' })
  async createAsset(@Body() createAssetDto: CreateAssetDto): Promise<AssetResponseDto> {
    return this.inventoryService.create(createAssetDto);
  }

  @Get('assets')
  @ApiOperation({ summary: 'Get all assets with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Assets retrieved successfully',
    type: AssetListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'building', required: false, type: String })
  @ApiQuery({ name: 'custodian', required: false, type: String })
  @ApiQuery({ name: 'procurementStatus', required: false, type: String })
  @ApiQuery({ name: 'minValue', required: false, type: Number })
  @ApiQuery({ name: 'maxValue', required: false, type: Number })
  @ApiQuery({ name: 'purchaseDateFrom', required: false, type: Date })
  @ApiQuery({ name: 'purchaseDateTo', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllAssets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('schoolId') schoolId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('building') building?: string,
    @Query('custodian') custodian?: string,
    @Query('procurementStatus') procurementStatus?: string,
    @Query('minValue') minValue?: number,
    @Query('maxValue') maxValue?: number,
    @Query('purchaseDateFrom') purchaseDateFrom?: Date,
    @Query('purchaseDateTo') purchaseDateTo?: Date,
    @Query('search') search?: string,
  ): Promise<AssetListResponseDto> {
    const filters: IAssetFilters = {
      schoolId,
      category: category as any,
      status: status as any,
      department,
      building,
      custodian,
      procurementStatus: procurementStatus as any,
      minValue,
      maxValue,
      purchaseDateFrom,
      purchaseDateTo,
      search,
    };

    return this.inventoryService.findAll({ page, limit, filters });
  }

  @Get('assets/statistics')
  @ApiOperation({ summary: 'Get asset statistics' })
  @ApiResponse({
    status: 200,
    description: 'Asset statistics retrieved successfully',
    type: AssetStatisticsResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getAssetStatistics(@Query('schoolId') schoolId: string): Promise<AssetStatisticsResponseDto> {
    return this.inventoryService.getStatistics(schoolId);
  }

  @Get('assets/maintenance-due')
  @ApiOperation({ summary: 'Get assets due for maintenance' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance due assets retrieved successfully',
    type: [AssetResponseDto],
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getMaintenanceDueAssets(@Query('schoolId') schoolId: string): Promise<AssetResponseDto[]> {
    return this.inventoryService.getMaintenanceDueAssets(schoolId);
  }

  @Get('assets/category/:category')
  @ApiOperation({ summary: 'Get assets by category' })
  @ApiResponse({
    status: 200,
    description: 'Assets by category retrieved successfully',
    type: [AssetResponseDto],
  })
  @ApiParam({ name: 'category', description: 'Asset category', type: String })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getAssetsByCategory(
    @Param('category') category: string,
    @Query('schoolId') schoolId: string,
  ): Promise<AssetResponseDto[]> {
    return this.inventoryService.getAssetsByCategory(schoolId, category);
  }

  @Get('assets/:id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset retrieved successfully',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: String })
  async findAssetById(@Param('id', ParseUUIDPipe) id: string): Promise<AssetResponseDto> {
    return this.inventoryService.findOne(id);
  }

  @Patch('assets/:id')
  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({
    status: 200,
    description: 'Asset updated successfully',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 409, description: 'Asset with this code already exists' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: String })
  async updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.inventoryService.update(id, updateAssetDto);
  }

  @Delete('assets/:id')
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({
    status: 200,
    description: 'Asset deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete asset that is currently assigned' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: String })
  async removeAsset(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.inventoryService.remove(id);
  }

  @Post('assets/:id/assign')
  @ApiOperation({ summary: 'Assign asset to user' })
  @ApiResponse({
    status: 200,
    description: 'Asset assigned successfully',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 400, description: 'Asset is already assigned' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: String })
  async assignAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignmentData: {
      assignedTo: string;
      assignedBy: string;
      expectedReturnDate: Date;
      purpose: string;
      notes?: string;
    },
  ): Promise<AssetResponseDto> {
    return this.inventoryService.assignAsset(id, assignmentData);
  }

  @Post('assets/:id/return')
  @ApiOperation({ summary: 'Return asset from user' })
  @ApiResponse({
    status: 200,
    description: 'Asset returned successfully',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 400, description: 'Asset is not currently assigned' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: String })
  async returnAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() returnData: {
      returnCondition: string;
      notes?: string;
    },
  ): Promise<AssetResponseDto> {
    return this.inventoryService.returnAsset(id, returnData.returnCondition, returnData.notes);
  }

  @Post('assets/calculate-depreciation')
  @ApiOperation({ summary: 'Calculate depreciation for all assets' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation calculated successfully',
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async calculateDepreciation(@Query('schoolId') schoolId: string): Promise<void> {
    return this.inventoryService.calculateAllDepreciation(schoolId);
  }
}