// Academia Pro - Reports Controller
// REST API endpoints for reports and analytics management

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto, ReportResponseDto, ReportListResponseDto, ReportGenerationResponseDto, ReportsStatisticsResponseDto, IReportFiltersQuery, IGenerateReportRequest } from './dtos/index';

@ApiTags('Reports & Analytics')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
  async createReport(@Body() createReportDto: CreateReportDto): Promise<ReportResponseDto> {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
    type: ReportListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, type: String })
  @ApiQuery({ name: 'frequency', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'createdBy', required: false, type: String })
  @ApiQuery({ name: 'createdAfter', required: false, type: Date })
  @ApiQuery({ name: 'createdBefore', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('schoolId') schoolId?: string,
    @Query('type') type?: string,
    @Query('format') format?: string,
    @Query('frequency') frequency?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isPublic') isPublic?: boolean,
    @Query('createdBy') createdBy?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('search') search?: string,
  ): Promise<ReportListResponseDto> {
    const filters: IReportFiltersQuery = {
      schoolId,
      type: type as any,
      format: format as any,
      frequency: frequency as any,
      isActive,
      isPublic,
      createdBy,
      createdAfter,
      createdBefore,
      search,
    };

    return this.reportsService.findAll({ page, limit, filters });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get reports statistics' })
  @ApiResponse({
    status: 200,
    description: 'Reports statistics retrieved successfully',
    type: ReportsStatisticsResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getReportsStatistics(@Query('schoolId') schoolId: string): Promise<ReportsStatisticsResponseDto> {
    return this.reportsService.getStatistics(schoolId);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get reports due for generation' })
  @ApiResponse({
    status: 200,
    description: 'Due reports retrieved successfully',
    type: [ReportResponseDto],
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getDueReports(@Query('schoolId') schoolId: string): Promise<ReportResponseDto[]> {
    return this.reportsService.getDueReports(schoolId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get reports by type' })
  @ApiResponse({
    status: 200,
    description: 'Reports by type retrieved successfully',
    type: [ReportResponseDto],
  })
  @ApiParam({ name: 'type', description: 'Report type', type: String })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async getReportsByType(
    @Param('type') type: string,
    @Query('schoolId') schoolId: string,
  ): Promise<ReportResponseDto[]> {
    return this.reportsService.getReportsByType(schoolId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiParam({ name: 'id', description: 'Report ID', type: String })
  async findReportById(@Param('id', ParseUUIDPipe) id: string): Promise<ReportResponseDto> {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiParam({ name: 'id', description: 'Report ID', type: String })
  async updateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiParam({ name: 'id', description: 'Report ID', type: String })
  async removeReport(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reportsService.remove(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a report' })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    type: ReportGenerationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async generateReport(@Body() generateRequest: IGenerateReportRequest): Promise<ReportGenerationResponseDto> {
    return this.reportsService.generateReport(generateRequest);
  }

  @Post('process-scheduled')
  @ApiOperation({ summary: 'Process scheduled reports (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled reports processed successfully',
  })
  async processScheduledReports(): Promise<void> {
    return this.reportsService.processScheduledReports();
  }

  @Post('export')
  @ApiOperation({ summary: 'Export reports configuration' })
  @ApiResponse({
    status: 200,
    description: 'Reports exported successfully',
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  async exportReports(
    @Query('schoolId') schoolId: string,
    @Body() exportRequest: { reportIds: string[] },
  ): Promise<string> {
    return this.reportsService.exportReports(schoolId, exportRequest.reportIds);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import reports configuration' })
  @ApiResponse({
    status: 200,
    description: 'Reports imported successfully',
  })
  @ApiQuery({ name: 'schoolId', required: true, type: String })
  @ApiQuery({ name: 'overwriteExisting', required: false, type: Boolean })
  async importReports(
    @Query('schoolId') schoolId: string,
    @Query('overwriteExisting') overwriteExisting: boolean,
    @Body() importRequest: { data: string },
  ): Promise<void> {
    return this.reportsService.importReports(schoolId, importRequest.data, overwriteExisting);
  }
}