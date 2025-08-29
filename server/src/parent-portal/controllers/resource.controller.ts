import { Controller, Get, Param, Query, Post, Body, Put, Delete, UseGuards, Request, Logger, HttpCode, HttpStatus, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ParentPortalResourceService } from '../services/resource.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';
import {
  ResourceResponseDto,
  ResourceListResponseDto,
  ResourceCategoryResponseDto,
  ResourceDownloadResponseDto,
  ResourceAccessLogResponseDto,
  EducationalMaterialResponseDto,
  DocumentResponseDto,
  ResourceSearchResponseDto,
  ResourceBookmarkResponseDto,
  ResourceShareRequestDto,
  ResourceShareResponseDto,
  ResourceUploadRequestDto,
  ResourceUploadResponseDto,
  ResourceUpdateRequestDto,
  ResourceUpdateResponseDto,
  ResourceDeleteResponseDto,
  ResourceStatisticsResponseDto,
  ResourceType,
  ResourceCategory,
  AccessLevel,
  ResourceStatus,
} from '../dtos/resource.dto';

@ApiTags('Parent Portal - Educational Resources')
@Controller('parent-portal/resources')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalResourceController {
  private readonly logger = new Logger(ParentPortalResourceController.name);

  constructor(
    private readonly resourceService: ParentPortalResourceService,
  ) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Get resource categories',
    description: 'Retrieve all available resource categories and subcategories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource categories retrieved successfully',
    type: [ResourceCategoryResponseDto],
  })
  async getResourceCategories(@Request() req: any): Promise<ResourceCategoryResponseDto[]> {
    this.logger.log(`Getting resource categories for parent: ${req.user.userId}`);

    const result = await this.resourceService.getResourceCategories(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Resource categories retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search educational resources',
    description: 'Search for educational resources by keywords, category, or filters.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query string',
    example: 'mathematics algebra',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Resource category filter',
    enum: ResourceCategory,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Resource type filter',
    enum: ResourceType,
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: 'Grade level filter',
    example: '9',
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: 'Subject filter',
    example: 'mathematics',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of results to skip',
    type: 'number',
    minimum: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Resources searched successfully',
    type: ResourceSearchResponseDto,
  })
  async searchResources(
    @Query() query: {
      query?: string;
      category?: ResourceCategory;
      type?: ResourceType;
      grade?: string;
      subject?: string;
      limit?: number;
      offset?: number;
    },
    @Request() req: any,
  ): Promise<ResourceSearchResponseDto> {
    this.logger.log(`Searching resources for parent: ${req.user.userId}, query: ${query.query}`);

    const result = await this.resourceService.searchResources(
      req.user.parentPortalAccessId,
      query,
    );

    this.logger.log(`Resource search completed for parent: ${req.user.userId}, found: ${result.total} resources`);

    return result;
  }

  @Get('recommended')
  @ApiOperation({
    summary: 'Get recommended resources',
    description: 'Get personalized resource recommendations based on student performance and interests.',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Student ID for personalized recommendations',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recommendations to return',
    type: 'number',
    minimum: 1,
    maximum: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Recommended resources retrieved successfully',
    type: ResourceListResponseDto,
  })
  async getRecommendedResources(
    @Query() query: { studentId?: string; limit?: number },
    @Request() req: any,
  ): Promise<ResourceListResponseDto> {
    this.logger.log(`Getting recommended resources for parent: ${req.user.userId}, student: ${query.studentId}`);

    const result = await this.resourceService.getRecommendedResources(
      req.user.parentPortalAccessId,
      query.studentId,
      query.limit || 20,
    );

    this.logger.log(`Recommended resources retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('bookmarks')
  @ApiOperation({
    summary: 'Get bookmarked resources',
    description: 'Retrieve all resources bookmarked by the parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookmarked resources retrieved successfully',
    type: [ResourceBookmarkResponseDto],
  })
  async getBookmarkedResources(@Request() req: any): Promise<ResourceBookmarkResponseDto[]> {
    this.logger.log(`Getting bookmarked resources for parent: ${req.user.userId}`);

    const result = await this.resourceService.getBookmarkedResources(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Bookmarked resources retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get(':resourceId')
  @ApiOperation({
    summary: 'Get resource details',
    description: 'Retrieve detailed information about a specific educational resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to retrieve',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource details retrieved successfully',
    type: ResourceResponseDto,
  })
  async getResourceDetails(
    @Param('resourceId') resourceId: string,
    @Request() req: any,
  ): Promise<ResourceResponseDto> {
    this.logger.log(`Getting resource details for resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.getResourceDetails(
      req.user.parentPortalAccessId,
      resourceId,
    );

    this.logger.log(`Resource details retrieved for resource: ${resourceId}`);

    return result;
  }

  @Get(':resourceId/download')
  @ApiOperation({
    summary: 'Download resource file',
    description: 'Download the actual resource file (PDF, document, video, etc.).',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to download',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource file downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadResource(
    @Param('resourceId') resourceId: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    this.logger.log(`Downloading resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.downloadResource(
      req.user.parentPortalAccessId,
      resourceId,
    );

    // Set appropriate headers
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'Content-Length': result.fileSize.toString(),
    });

    this.logger.log(`Resource downloaded: ${resourceId}`);

    return result.fileStream;
  }

  @Post(':resourceId/bookmark')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bookmark a resource',
    description: 'Add a resource to the parent\'s bookmarks for quick access.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to bookmark',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Resource bookmarked successfully',
    type: ResourceBookmarkResponseDto,
  })
  async bookmarkResource(
    @Param('resourceId') resourceId: string,
    @Request() req: any,
  ): Promise<ResourceBookmarkResponseDto> {
    this.logger.log(`Bookmarking resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.bookmarkResource(
      req.user.parentPortalAccessId,
      resourceId,
    );

    this.logger.log(`Resource bookmarked: ${resourceId}`);

    return result;
  }

  @Delete(':resourceId/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove resource bookmark',
    description: 'Remove a resource from the parent\'s bookmarks.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to remove from bookmarks',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource bookmark removed successfully',
  })
  async removeBookmark(
    @Param('resourceId') resourceId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    this.logger.log(`Removing bookmark for resource: ${resourceId}, parent: ${req.user.userId}`);

    await this.resourceService.removeBookmark(
      req.user.parentPortalAccessId,
      resourceId,
    );

    this.logger.log(`Resource bookmark removed: ${resourceId}`);

    return { message: 'Resource bookmark removed successfully' };
  }

  @Post(':resourceId/share')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Share resource with others',
    description: 'Share a resource with other parents or family members.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to share',
    type: 'string',
  })
  @ApiBody({
    type: ResourceShareRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Resource shared successfully',
    type: ResourceShareResponseDto,
  })
  async shareResource(
    @Param('resourceId') resourceId: string,
    @Body() shareData: ResourceShareRequestDto,
    @Request() req: any,
  ): Promise<ResourceShareResponseDto> {
    this.logger.log(`Sharing resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.shareResource(
      req.user.parentPortalAccessId,
      resourceId,
      shareData,
    );

    this.logger.log(`Resource shared: ${resourceId}`);

    return result;
  }

  @Get('access-log/:resourceId')
  @ApiOperation({
    summary: 'Get resource access log',
    description: 'Retrieve access history for a specific resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to get access log for',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of log entries to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Resource access log retrieved successfully',
    type: [ResourceAccessLogResponseDto],
  })
  async getResourceAccessLog(
    @Param('resourceId') resourceId: string,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ): Promise<ResourceAccessLogResponseDto[]> {
    this.logger.log(`Getting access log for resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.getResourceAccessLog(
      req.user.parentPortalAccessId,
      resourceId,
      limit,
    );

    this.logger.log(`Resource access log retrieved for resource: ${resourceId}`);

    return result;
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get resource usage statistics',
    description: 'Retrieve overall statistics about resource usage and engagement.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range for statistics',
    enum: ['week', 'month', 'quarter', 'year'],
    example: 'month',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource statistics retrieved successfully',
    type: ResourceStatisticsResponseDto,
  })
  async getResourceStatistics(
    @Query('timeRange') timeRange: string = 'month',
    @Request() req: any,
  ): Promise<ResourceStatisticsResponseDto> {
    this.logger.log(`Getting resource statistics for parent: ${req.user.userId}, timeRange: ${timeRange}`);

    const result = await this.resourceService.getResourceStatistics(
      req.user.parentPortalAccessId,
      timeRange as any,
    );

    this.logger.log(`Resource statistics retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('educational-materials')
  @ApiOperation({
    summary: 'Get educational materials',
    description: 'Retrieve educational materials organized by subject and grade.',
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: 'Subject filter',
    example: 'mathematics',
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: 'Grade level filter',
    example: '9',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of materials to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Educational materials retrieved successfully',
    type: [EducationalMaterialResponseDto],
  })
  async getEducationalMaterials(
    @Query() query: { subject?: string; grade?: string; limit?: number },
    @Request() req: any,
  ): Promise<EducationalMaterialResponseDto[]> {
    this.logger.log(`Getting educational materials for parent: ${req.user.userId}, subject: ${query.subject}, grade: ${query.grade}`);

    const result = await this.resourceService.getEducationalMaterials(
      req.user.parentPortalAccessId,
      query.subject,
      query.grade,
      query.limit || 50,
    );

    this.logger.log(`Educational materials retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('documents')
  @ApiOperation({
    summary: 'Get school documents',
    description: 'Retrieve important school documents, policies, and forms.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Document category filter',
    example: 'policies',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of documents to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'School documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getSchoolDocuments(
    @Query() query: { category?: string; limit?: number },
    @Request() req: any,
  ): Promise<DocumentResponseDto[]> {
    this.logger.log(`Getting school documents for parent: ${req.user.userId}, category: ${query.category}`);

    const result = await this.resourceService.getSchoolDocuments(
      req.user.parentPortalAccessId,
      query.category,
      query.limit || 50,
    );

    this.logger.log(`School documents retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a resource',
    description: 'Upload a new educational resource or document.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: ResourceUploadRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Resource uploaded successfully',
    type: ResourceUploadResponseDto,
  })
  async uploadResource(
    @Body() uploadData: ResourceUploadRequestDto,
    @Request() req: any,
  ): Promise<ResourceUploadResponseDto> {
    this.logger.log(`Uploading resource for parent: ${req.user.userId}`);

    const result = await this.resourceService.uploadResource(
      req.user.parentPortalAccessId,
      uploadData,
    );

    this.logger.log(`Resource uploaded successfully: ${result.resourceId}`);

    return result;
  }

  @Put(':resourceId')
  @ApiOperation({
    summary: 'Update resource metadata',
    description: 'Update metadata for an existing resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to update',
    type: 'string',
  })
  @ApiBody({
    type: ResourceUpdateRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Resource updated successfully',
    type: ResourceUpdateResponseDto,
  })
  async updateResource(
    @Param('resourceId') resourceId: string,
    @Body() updateData: ResourceUpdateRequestDto,
    @Request() req: any,
  ): Promise<ResourceUpdateResponseDto> {
    this.logger.log(`Updating resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.updateResource(
      req.user.parentPortalAccessId,
      resourceId,
      updateData,
    );

    this.logger.log(`Resource updated: ${resourceId}`);

    return result;
  }

  @Delete(':resourceId')
  @ApiOperation({
    summary: 'Delete resource',
    description: 'Delete a resource (only if uploaded by the parent).',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource deleted successfully',
    type: ResourceDeleteResponseDto,
  })
  async deleteResource(
    @Param('resourceId') resourceId: string,
    @Request() req: any,
  ): Promise<ResourceDeleteResponseDto> {
    this.logger.log(`Deleting resource: ${resourceId}, parent: ${req.user.userId}`);

    const result = await this.resourceService.deleteResource(
      req.user.parentPortalAccessId,
      resourceId,
    );

    this.logger.log(`Resource deleted: ${resourceId}`);

    return result;
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Get recent resource activity',
    description: 'Retrieve recent resource access, downloads, and interactions.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
    type: 'number',
    minimum: 1,
    maximum: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              activityId: { type: 'string' },
              activityType: { type: 'string', enum: ['viewed', 'downloaded', 'bookmarked', 'shared', 'uploaded'] },
              resourceId: { type: 'string' },
              resourceTitle: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              studentId: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async getRecentActivity(
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ): Promise<{
    activities: Array<{
      activityId: string;
      activityType: 'viewed' | 'downloaded' | 'bookmarked' | 'shared' | 'uploaded';
      resourceId: string;
      resourceTitle: string;
      timestamp: Date;
      studentId?: string;
    }>;
    total: number;
  }> {
    this.logger.log(`Getting recent activity for parent: ${req.user.userId}`);

    const result = await this.resourceService.getRecentActivity(
      req.user.parentPortalAccessId,
      limit,
    );

    this.logger.log(`Recent activity retrieved for parent: ${req.user.userId}`);

    return result;
  }
}