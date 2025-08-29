import { Controller, Get, Post, Put, Delete, Body, Query, Param, Headers, Request, Response, HttpCode, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiQuery, ApiParam, ApiBody, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { ParentPortalApiGatewayService } from '../services/api-gateway.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';
import {
  ApiResponseDto,
  ApiRequestDto,
  ApiEndpointDto,
  ApiMetricsDto,
  ApiRateLimitDto,
  ApiVersionDto,
  ApiDocumentationDto,
  WebhookDto,
  WebhookEventDto,
  IntegrationDto,
  IntegrationStatusDto,
  NotificationDto,
  NotificationSettingsDto,
  PushTokenDto,
  ApiKeyDto,
  ApiLogDto,
  ServiceHealthDto,
  ApiAnalyticsDto,
} from '../dtos/api-gateway.dto';

@ApiTags('Parent Portal - API Gateway & Integrations')
@Controller('parent-portal/api')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalApiGatewayController {
  private readonly logger = new Logger(ParentPortalApiGatewayController.name);

  constructor(
    private readonly apiGatewayService: ParentPortalApiGatewayService,
  ) {}

  @Get('endpoints')
  @ApiOperation({
    summary: 'Get available API endpoints',
    description: 'Retrieve all available API endpoints with their specifications.',
  })
  @ApiQuery({
    name: 'version',
    required: false,
    description: 'API version to filter endpoints',
    example: 'v1',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Endpoint category filter',
    enum: ['academic', 'communication', 'fee', 'transportation', 'resource'],
  })
  @ApiResponse({
    status: 200,
    description: 'API endpoints retrieved successfully',
    type: [ApiEndpointDto],
  })
  async getApiEndpoints(
    @Query() query: { version?: string; category?: string },
    @Request() req: any,
  ): Promise<ApiEndpointDto[]> {
    this.logger.log(`Getting API endpoints for parent: ${req.user.userId}, version: ${query.version}`);

    const result = await this.apiGatewayService.getApiEndpoints(
      req.user.parentPortalAccessId,
      query.version,
      query.category,
    );

    this.logger.log(`API endpoints retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('versions')
  @ApiOperation({
    summary: 'Get API versions',
    description: 'Retrieve all available API versions and their status.',
  })
  @ApiResponse({
    status: 200,
    description: 'API versions retrieved successfully',
    type: [ApiVersionDto],
  })
  async getApiVersions(@Request() req: any): Promise<ApiVersionDto[]> {
    this.logger.log(`Getting API versions for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getApiVersions(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`API versions retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('documentation/:version')
  @ApiOperation({
    summary: 'Get API documentation',
    description: 'Retrieve comprehensive API documentation for a specific version.',
  })
  @ApiParam({
    name: 'version',
    description: 'API version for documentation',
    example: 'v1',
  })
  @ApiResponse({
    status: 200,
    description: 'API documentation retrieved successfully',
    type: ApiDocumentationDto,
  })
  async getApiDocumentation(
    @Param('version') version: string,
    @Request() req: any,
  ): Promise<ApiDocumentationDto> {
    this.logger.log(`Getting API documentation for version: ${version}, parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getApiDocumentation(
      req.user.parentPortalAccessId,
      version,
    );

    this.logger.log(`API documentation retrieved for version: ${version}`);

    return result;
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get API usage metrics',
    description: 'Retrieve API usage metrics and performance statistics.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range for metrics',
    enum: ['hour', 'day', 'week', 'month'],
    example: 'day',
  })
  @ApiQuery({
    name: 'endpoint',
    required: false,
    description: 'Specific endpoint to get metrics for',
    example: '/api/academic/grades',
  })
  @ApiResponse({
    status: 200,
    description: 'API metrics retrieved successfully',
    type: ApiMetricsDto,
  })
  async getApiMetrics(
    @Query() query: { timeRange?: string; endpoint?: string },
    @Request() req: any,
  ): Promise<ApiMetricsDto> {
    this.logger.log(`Getting API metrics for parent: ${req.user.userId}, timeRange: ${query.timeRange}`);

    const result = await this.apiGatewayService.getApiMetrics(
      req.user.parentPortalAccessId,
      query.timeRange as any,
      query.endpoint,
    );

    this.logger.log(`API metrics retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('rate-limits')
  @ApiOperation({
    summary: 'Get rate limit status',
    description: 'Retrieve current rate limit status and remaining requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit status retrieved successfully',
    type: ApiRateLimitDto,
  })
  async getRateLimits(@Request() req: any): Promise<ApiRateLimitDto> {
    this.logger.log(`Getting rate limits for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getRateLimits(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Rate limits retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register webhook',
    description: 'Register a webhook endpoint for receiving real-time notifications.',
  })
  @ApiBody({
    type: WebhookDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook registered successfully',
    type: WebhookDto,
  })
  async registerWebhook(
    @Body() webhookData: WebhookDto,
    @Request() req: any,
  ): Promise<WebhookDto> {
    this.logger.log(`Registering webhook for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.registerWebhook(
      req.user.parentPortalAccessId,
      webhookData,
    );

    this.logger.log(`Webhook registered for parent: ${req.user.userId}`);

    return result;
  }

  @Get('webhooks')
  @ApiOperation({
    summary: 'Get registered webhooks',
    description: 'Retrieve all registered webhooks for the parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhooks retrieved successfully',
    type: [WebhookDto],
  })
  async getWebhooks(@Request() req: any): Promise<WebhookDto[]> {
    this.logger.log(`Getting webhooks for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getWebhooks(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Webhooks retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Delete('webhooks/:webhookId')
  @ApiOperation({
    summary: 'Delete webhook',
    description: 'Remove a registered webhook.',
  })
  @ApiParam({
    name: 'webhookId',
    description: 'Webhook ID to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook deleted successfully',
  })
  async deleteWebhook(
    @Param('webhookId') webhookId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting webhook: ${webhookId}, parent: ${req.user.userId}`);

    await this.apiGatewayService.deleteWebhook(
      req.user.parentPortalAccessId,
      webhookId,
    );

    this.logger.log(`Webhook deleted: ${webhookId}`);

    return { message: 'Webhook deleted successfully' };
  }

  @Get('webhooks/events')
  @ApiOperation({
    summary: 'Get webhook events',
    description: 'Retrieve recent webhook events and delivery status.',
  })
  @ApiQuery({
    name: 'webhookId',
    required: false,
    description: 'Specific webhook to get events for',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of events to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook events retrieved successfully',
    type: [WebhookEventDto],
  })
  async getWebhookEvents(
    @Query() query: { webhookId?: string; limit?: number },
    @Request() req: any,
  ): Promise<WebhookEventDto[]> {
    this.logger.log(`Getting webhook events for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getWebhookEvents(
      req.user.parentPortalAccessId,
      query.webhookId,
      query.limit || 50,
    );

    this.logger.log(`Webhook events retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('integrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create integration',
    description: 'Create a new third-party integration.',
  })
  @ApiBody({
    type: IntegrationDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Integration created successfully',
    type: IntegrationDto,
  })
  async createIntegration(
    @Body() integrationData: IntegrationDto,
    @Request() req: any,
  ): Promise<IntegrationDto> {
    this.logger.log(`Creating integration for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.createIntegration(
      req.user.parentPortalAccessId,
      integrationData,
    );

    this.logger.log(`Integration created for parent: ${req.user.userId}`);

    return result;
  }

  @Get('integrations')
  @ApiOperation({
    summary: 'Get integrations',
    description: 'Retrieve all configured integrations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Integrations retrieved successfully',
    type: [IntegrationDto],
  })
  async getIntegrations(@Request() req: any): Promise<IntegrationDto[]> {
    this.logger.log(`Getting integrations for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getIntegrations(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Integrations retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('integrations/:integrationId/status')
  @ApiOperation({
    summary: 'Get integration status',
    description: 'Retrieve the current status of a specific integration.',
  })
  @ApiParam({
    name: 'integrationId',
    description: 'Integration ID to check status for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration status retrieved successfully',
    type: IntegrationStatusDto,
  })
  async getIntegrationStatus(
    @Param('integrationId') integrationId: string,
    @Request() req: any,
  ): Promise<IntegrationStatusDto> {
    this.logger.log(`Getting integration status: ${integrationId}, parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getIntegrationStatus(
      req.user.parentPortalAccessId,
      integrationId,
    );

    this.logger.log(`Integration status retrieved: ${integrationId}`);

    return result;
  }

  @Post('notifications/push-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register push notification token',
    description: 'Register a device token for push notifications.',
  })
  @ApiBody({
    type: PushTokenDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Push token registered successfully',
    type: PushTokenDto,
  })
  async registerPushToken(
    @Body() tokenData: PushTokenDto,
    @Request() req: any,
  ): Promise<PushTokenDto> {
    this.logger.log(`Registering push token for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.registerPushToken(
      req.user.parentPortalAccessId,
      tokenData,
    );

    this.logger.log(`Push token registered for parent: ${req.user.userId}`);

    return result;
  }

  @Get('notifications/settings')
  @ApiOperation({
    summary: 'Get notification settings',
    description: 'Retrieve current notification preferences and settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
    type: NotificationSettingsDto,
  })
  async getNotificationSettings(@Request() req: any): Promise<NotificationSettingsDto> {
    this.logger.log(`Getting notification settings for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getNotificationSettings(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Notification settings retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Put('notifications/settings')
  @ApiOperation({
    summary: 'Update notification settings',
    description: 'Update notification preferences and settings.',
  })
  @ApiBody({
    type: NotificationSettingsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
    type: NotificationSettingsDto,
  })
  async updateNotificationSettings(
    @Body() settingsData: NotificationSettingsDto,
    @Request() req: any,
  ): Promise<NotificationSettingsDto> {
    this.logger.log(`Updating notification settings for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.updateNotificationSettings(
      req.user.parentPortalAccessId,
      settingsData,
    );

    this.logger.log(`Notification settings updated for parent: ${req.user.userId}`);

    return result;
  }

  @Post('notifications/send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send notification',
    description: 'Send a custom notification to the parent.',
  })
  @ApiBody({
    type: NotificationDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    type: NotificationDto,
  })
  async sendNotification(
    @Body() notificationData: NotificationDto,
    @Request() req: any,
  ): Promise<NotificationDto> {
    this.logger.log(`Sending notification for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.sendNotification(
      req.user.parentPortalAccessId,
      notificationData,
    );

    this.logger.log(`Notification sent for parent: ${req.user.userId}`);

    return result;
  }

  @Get('notifications/history')
  @ApiOperation({
    summary: 'Get notification history',
    description: 'Retrieve notification history and delivery status.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of notifications to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by delivery status',
    enum: ['sent', 'delivered', 'failed'],
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully',
    type: [NotificationDto],
  })
  async getNotificationHistory(
    @Query() query: { limit?: number; status?: string },
    @Request() req: any,
  ): Promise<NotificationDto[]> {
    this.logger.log(`Getting notification history for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getNotificationHistory(
      req.user.parentPortalAccessId,
      query.limit || 50,
      query.status as any,
    );

    this.logger.log(`Notification history retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate API key',
    description: 'Generate a new API key for third-party integrations.',
  })
  @ApiBody({
    type: ApiKeyDto,
  })
  @ApiResponse({
    status: 201,
    description: 'API key generated successfully',
    type: ApiKeyDto,
  })
  async generateApiKey(
    @Body() keyData: ApiKeyDto,
    @Request() req: any,
  ): Promise<ApiKeyDto> {
    this.logger.log(`Generating API key for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.generateApiKey(
      req.user.parentPortalAccessId,
      keyData,
    );

    this.logger.log(`API key generated for parent: ${req.user.userId}`);

    return result;
  }

  @Get('api-keys')
  @ApiOperation({
    summary: 'Get API keys',
    description: 'Retrieve all API keys for the parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    type: [ApiKeyDto],
  })
  async getApiKeys(@Request() req: any): Promise<ApiKeyDto[]> {
    this.logger.log(`Getting API keys for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getApiKeys(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`API keys retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Delete('api-keys/:keyId')
  @ApiOperation({
    summary: 'Revoke API key',
    description: 'Revoke an API key to disable third-party access.',
  })
  @ApiParam({
    name: 'keyId',
    description: 'API key ID to revoke',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
  })
  async revokeApiKey(
    @Param('keyId') keyId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    this.logger.log(`Revoking API key: ${keyId}, parent: ${req.user.userId}`);

    await this.apiGatewayService.revokeApiKey(
      req.user.parentPortalAccessId,
      keyId,
    );

    this.logger.log(`API key revoked: ${keyId}`);

    return { message: 'API key revoked successfully' };
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get API logs',
    description: 'Retrieve API usage logs and request history.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of log entries to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @ApiQuery({
    name: 'endpoint',
    required: false,
    description: 'Filter by specific endpoint',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by HTTP status code',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'API logs retrieved successfully',
    type: [ApiLogDto],
  })
  async getApiLogs(
    @Query() query: { limit?: number; endpoint?: string; status?: number },
    @Request() req: any,
  ): Promise<ApiLogDto[]> {
    this.logger.log(`Getting API logs for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getApiLogs(
      req.user.parentPortalAccessId,
      query.limit || 50,
      query.endpoint,
      query.status,
    );

    this.logger.log(`API logs retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('health')
  @ApiOperation({
    summary: 'Get service health',
    description: 'Retrieve health status of all integrated services.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health retrieved successfully',
    type: [ServiceHealthDto],
  })
  async getServiceHealth(@Request() req: any): Promise<ServiceHealthDto[]> {
    this.logger.log(`Getting service health for parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.getServiceHealth(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Service health retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get API analytics',
    description: 'Retrieve comprehensive API usage analytics and insights.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range for analytics',
    enum: ['day', 'week', 'month', 'quarter'],
    example: 'month',
  })
  @ApiResponse({
    status: 200,
    description: 'API analytics retrieved successfully',
    type: ApiAnalyticsDto,
  })
  async getApiAnalytics(
    @Query('timeRange') timeRange: string = 'month',
    @Request() req: any,
  ): Promise<ApiAnalyticsDto> {
    this.logger.log(`Getting API analytics for parent: ${req.user.userId}, timeRange: ${timeRange}`);

    const result = await this.apiGatewayService.getApiAnalytics(
      req.user.parentPortalAccessId,
      timeRange as any,
    );

    this.logger.log(`API analytics retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('proxy/:service')
  @ApiOperation({
    summary: 'Proxy request to external service',
    description: 'Proxy API requests to integrated third-party services.',
  })
  @ApiParam({
    name: 'service',
    description: 'External service to proxy request to',
    example: 'payment-gateway',
  })
  @ApiHeader({
    name: 'X-Target-Endpoint',
    description: 'Target endpoint on the external service',
    example: '/api/payments',
  })
  @ApiBody({
    description: 'Request body to forward to external service',
  })
  @ApiResponse({
    status: 200,
    description: 'Request proxied successfully',
    type: ApiResponseDto,
  })
  async proxyRequest(
    @Param('service') service: string,
    @Headers('x-target-endpoint') targetEndpoint: string,
    @Body() requestBody: any,
    @Request() req: any,
  ): Promise<ApiResponseDto> {
    this.logger.log(`Proxying request to service: ${service}, endpoint: ${targetEndpoint}, parent: ${req.user.userId}`);

    const result = await this.apiGatewayService.proxyRequest(
      req.user.parentPortalAccessId,
      service,
      targetEndpoint,
      requestBody,
      req.headers,
    );

    this.logger.log(`Request proxied to service: ${service}`);

    return result;
  }
}