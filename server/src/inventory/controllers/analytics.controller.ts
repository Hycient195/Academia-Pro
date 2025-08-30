// Academia Pro - Inventory Analytics Controller
// Controller for inventory analytics and comprehensive reporting

import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService, InventoryDashboard, MaintenanceReport, DepreciationReport, AllocationReport, InventoryReport } from '../services/analytics.service';

@ApiTags('Inventory - Analytics')
@Controller('inventory/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard/:schoolId')
  @ApiOperation({
    summary: 'Get inventory dashboard',
    description: 'Returns a comprehensive dashboard with key inventory metrics and alerts.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory dashboard retrieved successfully',
  })
  async getInventoryDashboard(@Param('schoolId') schoolId: string): Promise<InventoryDashboard> {
    return this.analyticsService.getInventoryDashboard(schoolId);
  }

  @Get('maintenance/:schoolId')
  @ApiOperation({
    summary: 'Get maintenance report',
    description: 'Returns detailed maintenance analytics and reporting.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for the report (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for the report (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance report retrieved successfully',
  })
  async getMaintenanceReport(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<MaintenanceReport> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getMaintenanceReport(schoolId, start, end);
  }

  @Get('depreciation/:schoolId')
  @ApiOperation({
    summary: 'Get depreciation report',
    description: 'Returns comprehensive depreciation analytics and reporting.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Depreciation report retrieved successfully',
  })
  async getDepreciationReport(@Param('schoolId') schoolId: string): Promise<DepreciationReport> {
    return this.analyticsService.getDepreciationReport(schoolId);
  }

  @Get('allocation/:schoolId')
  @ApiOperation({
    summary: 'Get allocation report',
    description: 'Returns detailed asset allocation analytics and reporting.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for the report (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for the report (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Allocation report retrieved successfully',
  })
  async getAllocationReport(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AllocationReport> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getAllocationReport(schoolId, start, end);
  }

  @Get('comprehensive/:schoolId')
  @ApiOperation({
    summary: 'Get comprehensive inventory report',
    description: 'Returns a complete inventory report with all analytics, reports, and recommendations.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for the report (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for the report (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive inventory report retrieved successfully',
  })
  async getComprehensiveReport(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InventoryReport> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.generateComprehensiveReport(schoolId, start, end);
  }

  @Get('alerts/:schoolId')
  @ApiOperation({
    summary: 'Get inventory alerts',
    description: 'Returns current alerts and notifications for inventory management.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory alerts retrieved successfully',
  })
  async getInventoryAlerts(@Param('schoolId') schoolId: string) {
    const dashboard = await this.analyticsService.getInventoryDashboard(schoolId);
    return {
      alerts: dashboard.alerts,
      recommendations: [
        dashboard.alerts.maintenanceDue > 0
          ? `${dashboard.alerts.maintenanceDue} assets due for maintenance`
          : null,
        dashboard.alerts.warrantyExpiring > 0
          ? `${dashboard.alerts.warrantyExpiring} warranties expiring soon`
          : null,
        dashboard.alerts.overdueAllocations > 0
          ? `${dashboard.alerts.overdueAllocations} overdue asset returns`
          : null,
      ].filter(Boolean),
    };
  }

  @Get('trends/:schoolId')
  @ApiOperation({
    summary: 'Get inventory trends',
    description: 'Returns trend analysis for inventory metrics over time.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (month, quarter, year)', example: 'month' })
  @ApiResponse({
    status: 200,
    description: 'Inventory trends retrieved successfully',
  })
  async getInventoryTrends(
    @Param('schoolId') schoolId: string,
    @Query('period') period: string = 'month',
  ) {
    const dashboard = await this.analyticsService.getInventoryDashboard(schoolId);
    const allocationReport = await this.analyticsService.getAllocationReport(schoolId);

    return {
      period,
      trends: {
        assetTrends: dashboard.trends,
        allocationTrends: allocationReport.allocationTrends,
        utilizationTrend: {
          current: dashboard.overview.utilizationRate,
          target: 75, // Example target
          status: dashboard.overview.utilizationRate >= 75 ? 'good' : 'needs_improvement',
        },
      },
    };
  }

  @Get('utilization/:schoolId')
  @ApiOperation({
    summary: 'Get asset utilization report',
    description: 'Returns detailed asset utilization analytics.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset utilization report retrieved successfully',
  })
  async getAssetUtilization(@Param('schoolId') schoolId: string) {
    const dashboard = await this.analyticsService.getInventoryDashboard(schoolId);
    const allocationReport = await this.analyticsService.getAllocationReport(schoolId);

    return {
      overallUtilization: dashboard.overview.utilizationRate,
      activeAllocations: allocationReport.activeAllocations,
      totalAssets: dashboard.overview.totalAssets,
      utilizationByDepartment: allocationReport.allocationByDepartment,
      utilizationByLocation: allocationReport.allocationByLocation,
      topUtilizedAssets: allocationReport.topAllocatedAssets,
      recommendations: [
        dashboard.overview.utilizationRate < 50
          ? 'Low utilization detected. Consider optimizing asset allocation.'
          : 'Asset utilization is within acceptable range.',
        allocationReport.overdueReturns > 0
          ? `Address ${allocationReport.overdueReturns} overdue returns to improve utilization.`
          : null,
      ].filter(Boolean),
    };
  }

  @Get('cost-analysis/:schoolId')
  @ApiOperation({
    summary: 'Get cost analysis report',
    description: 'Returns detailed cost analysis for inventory management.',
  })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({
    status: 200,
    description: 'Cost analysis report retrieved successfully',
  })
  async getCostAnalysis(@Param('schoolId') schoolId: string) {
    const dashboard = await this.analyticsService.getInventoryDashboard(schoolId);
    const maintenanceReport = await this.analyticsService.getMaintenanceReport(schoolId);
    const depreciationReport = await this.analyticsService.getDepreciationReport(schoolId);

    return {
      totalAssetValue: dashboard.overview.totalValue,
      depreciatedValue: dashboard.overview.depreciatedValue,
      totalDepreciationExpense: depreciationReport.totalDepreciationExpense,
      totalMaintenanceCost: maintenanceReport.totalMaintenanceCost,
      averageDepreciationRate: depreciationReport.averageDepreciationRate,
      costBreakdown: {
        maintenanceByType: maintenanceReport.maintenanceByType,
        depreciationByCategory: depreciationReport.depreciationByCategory,
        maintenanceCostByCategory: maintenanceReport.maintenanceCostByCategory,
      },
      costEfficiency: {
        maintenanceCostPerAsset: dashboard.overview.totalAssets > 0
          ? maintenanceReport.totalMaintenanceCost / dashboard.overview.totalAssets
          : 0,
        depreciationPercentage: dashboard.overview.totalValue > 0
          ? (depreciationReport.totalDepreciationExpense / dashboard.overview.totalValue) * 100
          : 0,
      },
    };
  }
}