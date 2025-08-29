
import { Injectable, Logger, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Entities
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { PortalActivityLog } from '../entities/portal-activity-log.entity';
import { Webhook } from '../entities/webhook.entity';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { Integration } from '../entities/integration.entity';
import { PushToken } from '../entities/push-token.entity';
import { ApiKey } from '../entities/api-key.entity';
import { ApiLog } from '../entities/api-log.entity';

// DTOs
import {
  ApiEndpointDto,
  ApiVersionDto,
  ApiDocumentationDto,
  ApiMetricsDto,
  ApiRateLimitDto,
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
  ApiResponseDto,
  ApiVersion,
  HttpMethod,
  IntegrationType,
  IntegrationStatus,
  NotificationType,
  NotificationPriority,
  WebhookEventType,
  ServiceHealthStatus,
  PortalActivityType,
  PortalActivitySeverity,
} from '../dtos/api-gateway.dto';

@Injectable()
export class ParentPortalApiGatewayService {
  private readonly logger = new Logger(ParentPortalApiGatewayService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private readonly parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(PortalActivityLog)
    private readonly portalActivityLogRepository: Repository<PortalActivityLog>,
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
    @InjectRepository(PushToken)
    private readonly pushTokenRepository: Repository<PushToken>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get available API endpoints
   */
  async getApiEndpoints(
    parentPortalAccessId: string,
    version?: string,
    category?: string,
  ): Promise<ApiEndpointDto[]> {
    this.logger.log(`Getting API endpoints for parent: ${parentPortalAccessId}`);

    // Get parent portal access to verify permissions
    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    // Mock API endpoints - in production, this would be dynamically generated
    const allEndpoints: ApiEndpointDto[] = [
      {
        endpointId: 'academic-grades',
        version: ApiVersion.V1,
        method: HttpMethod.GET,
        path: '/api/academic/grades',
        category: 'academic',
        description: 'Retrieve student grades and performance data',
        parameters: {
          query: [
            { name: 'studentId', type: 'string', required: false, description: 'Filter by student ID' },
            { name: 'subject', type: 'string', required: false, description: 'Filter by subject' },
            { name: 'timeRange', type: 'string', required: false, description: 'Time range for grades' },
          ],
        },
        responses: {
          '200': { description: 'Grades retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
        authentication: { required: true, scopes: ['academic:read'] },
        rateLimit: { requests: 100, period: '1 hour' },
        caching: { enabled: true, ttl: 300 },
        tags: ['academic', 'grades'],
        lastUpdated: new Date(),
        isActive: true,
      },
      {
        endpointId: 'communication-messages',
        version: ApiVersion.V1,
        method: HttpMethod.GET,
        path: '/api/communication/messages',
        category: 'communication',
        description: 'Retrieve communication messages and announcements',
        parameters: {
          query: [
            { name: 'type', type: 'string', required: false, description: 'Message type filter' },
            { name: 'limit', type: 'number', required: false, description: 'Number of messages to return' },
          ],
        },
        responses: {
          '200': { description: 'Messages retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
        authentication: { required: true, scopes: ['communication:read'] },
        rateLimit: { requests: 50, period: '1 hour' },
        caching: { enabled: true, ttl: 60 },
        tags: ['communication', 'messages'],
        lastUpdated: new Date(),
        isActive: true,
      },
      {
        endpointId: 'fee-payments',
        version: ApiVersion.V1,
        method: HttpMethod.GET,
        path: '/api/fee/payments',
        category: 'fee',
        description: 'Retrieve fee payment information and history',
        parameters: {
          query: [
            { name: 'status', type: 'string', required: false, description: 'Payment status filter' },
            { name: 'limit', type: 'number', required: false, description: 'Number of payments to return' },
          ],
        },
        responses: {
          '200': { description: 'Payments retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
        authentication: { required: true, scopes: ['fee:read'] },
        rateLimit: { requests: 30, period: '1 hour' },
        caching: { enabled: true, ttl: 600 },
        tags: ['fee', 'payments'],
        lastUpdated: new Date(),
        isActive: true,
      },
      {
        endpointId: 'transportation-schedule',
        version: ApiVersion.V1,
        method: HttpMethod.GET,
        path: '/api/transportation/schedule',
        category: 'transportation',
        description: 'Retrieve transportation schedule and routes',
        parameters: {
          query: [
            { name: 'date', type: 'string', required: false, description: 'Date for schedule' },
            { name: 'route', type: 'string', required: false, description: 'Route filter' },
          ],
        },
        responses: {
          '200': { description: 'Schedule retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
        authentication: { required: true, scopes: ['transportation:read'] },
        rateLimit: { requests: 20, period: '1 hour' },
        caching: { enabled: true, ttl: 1800 },
        tags: ['transportation', 'schedule'],
        lastUpdated: new Date(),
        isActive: true,
      },
      {
        endpointId: 'resource-materials',
        version: ApiVersion.V1,
        method: HttpMethod.GET,
        path: '/api/resource/materials',
        category: 'resource',
        description: 'Retrieve educational materials and resources',
        parameters: {
          query: [
            { name: 'category', type: 'string', required: false, description: 'Resource category' },
            { name: 'subject', type: 'string', required: false, description: 'Subject filter' },
            { name: 'grade', type: 'string', required: false, description: 'Grade level filter' },
          ],
        },
        responses: {
          '200': { description: 'Resources retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
        authentication: { required: true, scopes: ['resource:read'] },
        rateLimit: { requests: 100, period: '1 hour' },
        caching: { enabled: true, ttl: 3600 },
        tags: ['resource', 'materials'],
        lastUpdated: new Date(),
        isActive: true,
      },
    ];

    // Filter by version if specified
    let filteredEndpoints = allEndpoints;
    if (version) {
      filteredEndpoints = filteredEndpoints.filter(endpoint => endpoint.version === version);
    }

    // Filter by category if specified
    if (category) {
      filteredEndpoints = filteredEndpoints.filter(endpoint => endpoint.category === category);
    }

    this.logger.log(`Retrieved ${filteredEndpoints.length} API endpoints`);

    return filteredEndpoints;
  }

  /**
   * Get API versions
   */
  async getApiVersions(parentPortalAccessId: string): Promise<ApiVersionDto[]> {
    this.logger.log(`Getting API versions for parent: ${parentPortalAccessId}`);

    const versions: ApiVersionDto[] = [
      {
        version: ApiVersion.V1,
        name: 'Version 1.0',
        description: 'Stable production release with core functionality',
        releaseDate: new Date('2024-01-15'),
        status: 'active',
        baseUrl: 'https://api.parentportal.com/v1',
        endpointCount: 25,
        isDefault: true,
        changelog: [
          {
            version: '1.0.0',
            date: new Date('2024-01-15'),
            changes: ['Initial release', 'Core API endpoints', 'Authentication system'],
            breaking: false,
          },
        ],
      },
      {
        version: ApiVersion.V2,
        name: 'Version 2.0',
        description: 'Enhanced release with advanced features',
        releaseDate: new Date('2024-06-01'),
        status: 'active',
        baseUrl: 'https://api.parentportal.com/v2',
        endpointCount: 35,
        isDefault: false,
        changelog: [
          {
            version: '2.0.0',
            date: new Date('2024-06-01'),
            changes: ['Enhanced analytics', 'Real-time notifications', 'Advanced filtering'],
            breaking: false,
          },
        ],
      },
    ];

    this.logger.log(`Retrieved ${versions.length} API versions`);

    return versions;
  }

  /**
   * Get API documentation
   */
  async getApiDocumentation(
    parentPortalAccessId: string,
    version: string,
  ): Promise<ApiDocumentationDto> {
    this.logger.log(`Getting API documentation for version: ${version}`);

    const endpoints = await this.getApiEndpoints(parentPortalAccessId, version);

    const documentation: ApiDocumentationDto = {
      version: version as ApiVersion,
      title: `Parent Portal API ${version} Documentation`,
      description: `Complete API documentation for Parent Portal version ${version}`,
      baseUrl: `https://api.parentportal.com/${version}`,
      authentication: {
        type: 'Bearer Token',
        description: 'JWT-based authentication with Bearer token',
        scopes: [
          { name: 'academic:read', description: 'Read academic information' },
          { name: 'academic:write', description: 'Write academic information' },
          { name: 'communication:read', description: 'Read communication data' },
          { name: 'communication:write', description: 'Send messages and communications' },
          { name: 'fee:read', description: 'Read fee and payment information' },
          { name: 'fee:write', description: 'Make payments and manage fees' },
          { name: 'transportation:read', description: 'Read transportation information' },
          { name: 'resource:read', description: 'Read educational resources' },
          { name: 'resource:write', description: 'Upload and manage resources' },
        ],
      },
      endpoints: endpoints.reduce((acc, endpoint) => {
        if (!acc[endpoint.category]) {
          acc[endpoint.category] = [];
        }
        acc[endpoint.category].push(endpoint);
        return acc;
      }, {} as Record<string, ApiEndpointDto[]>),
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
      errors: {
        '400': { description: 'Bad Request - Invalid input parameters' },
        '401': { description: 'Unauthorized - Invalid or missing authentication' },
        '403': { description: 'Forbidden - Insufficient permissions' },
        '404': { description: 'Not Found - Resource not found' },
        '429': { description: 'Too Many Requests - Rate limit exceeded' },
        '500': { description: 'Internal Server Error - Server error' },
      },
      rateLimiting: {
        global: { requests: 1000, period: '1 hour' },
        endpoints: {
          '/api/academic/*': { requests: 100, period: '1 hour' },
          '/api/communication/*': { requests: 50, period: '1 hour' },
          '/api/fee/*': { requests: 30, period: '1 hour' },
          '/api/transportation/*': { requests: 20, period: '1 hour' },
          '/api/resource/*': { requests: 100, period: '1 hour' },
        },
      },
      sdks: [
        {
          language: 'JavaScript/TypeScript',
          repository: 'https://github.com/academia/parent-portal-js-sdk',
          documentation: 'https://docs.parentportal.com/js-sdk',
          version: '2.1.0',
        },
        {
          language: 'Python',
          repository: 'https://github.com/academia/parent-portal-python-sdk',
          documentation: 'https://docs.parentportal.com/python-sdk',
          version: '2.0.5',
        },
        {
          language: 'Java',
          repository: 'https://github.com/academia/parent-portal-java-sdk',
          documentation: 'https://docs.parentportal.com/java-sdk',
          version: '1.8.3',
        },
      ],
      lastUpdated: new Date(),
      contact: {
        name: 'Parent Portal API Support',
        email: 'api-support@parentportal.com',
        url: 'https://docs.parentportal.com/support',
      },
    };

    this.logger.log(`API documentation generated for version: ${version}`);

    return documentation;
  }

  /**
   * Get API usage metrics
   */
  async getApiMetrics(
    parentPortalAccessId: string,
    timeRange: string = 'day',
    endpoint?: string,
  ): Promise<ApiMetricsDto> {
    this.logger.log(`Getting API metrics for parent: ${parentPortalAccessId}, timeRange: ${timeRange}`);

    // Mock metrics - in production, this would aggregate from actual logs
    const metrics: ApiMetricsDto = {
      timeRange,
      totalRequests: 1250,
      successfulRequests: 1200,
      failedRequests: 50,
      averageResponseTime: 150,
      requestsByMethod: {
        GET: 850,
        POST: 250,
        PUT: 100,
        DELETE: 50,
      },
      requestsByEndpoint: {
        '/api/academic/grades': 300,
        '/api/communication/messages': 200,
        '/api/fee/payments': 150,
        '/api/transportation/schedule': 100,
        '/api/resource/materials': 500,
      },
      requestsByStatus: {
        '200': 1200,
        '201': 30,
        '400': 15,
        '401': 3,
        '403': 2,
        '500': 0,
      },
      topEndpoints: [
        { endpoint: '/api/resource/materials', requests: 500, averageResponseTime: 120 },
        { endpoint: '/api/academic/grades', requests: 300, averageResponseTime: 180 },
        { endpoint: '/api/communication/messages', requests: 200, averageResponseTime: 140 },
        { endpoint: '/api/fee/payments', requests: 150, averageResponseTime: 200 },
        { endpoint: '/api/transportation/schedule', requests: 100, averageResponseTime: 160 },
      ],
      errorRates: [
        { endpoint: '/api/academic/grades', errorCount: 5, totalRequests: 300, errorRate: 0.017 },
        { endpoint: '/api/communication/messages', errorCount: 3, totalRequests: 200, errorRate: 0.015 },
        { endpoint: '/api/fee/payments', errorCount: 2, totalRequests: 150, errorRate: 0.013 },
      ],
      responseTimePercentiles: {
        p50: 120,
        p90: 250,
        p95: 350,
        p99: 500,
      },
      rateLimitHits: 25,
      cacheHitRate: 0.85,
      dataTransfer: 5242880, // 5MB
    };

    this.logger.log(`API metrics retrieved for parent: ${parentPortalAccessId}`);

    return metrics;
  }

  /**
   * Get rate limit status
   */
  async getRateLimits(parentPortalAccessId: string): Promise<ApiRateLimitDto> {
    this.logger.log(`Getting rate limits for parent: ${parentPortalAccessId}`);

    // Mock rate limit data - in production, this would come from Redis or similar
    const rateLimits: ApiRateLimitDto = {
      global: {
        limit: 1000,
        remaining: 850,
        resetTime: new Date(Date.now() + 3600000), // 1 hour from now
        resetInSeconds: 3600,
      },
      endpoints: {
        '/api/academic/grades': {
          limit: 100,
          remaining: 75,
          resetTime: new Date(Date.now() + 3600000),
          resetInSeconds: 3600,
        },
        '/api/communication/messages': {
          limit: 50,
          remaining: 35,
          resetTime: new Date(Date.now() + 3600000),
          resetInSeconds: 3600,
        },
        '/api/fee/payments': {
          limit: 30,
          remaining: 25,
          resetTime: new Date(Date.now() + 3600000),
          resetInSeconds: 3600,
        },
        '/api/transportation/schedule': {
          limit: 20,
          remaining: 18,
          resetTime: new Date(Date.now() + 3600000),
          resetInSeconds: 3600,
        },
        '/api/resource/materials': {
          limit: 100,
          remaining: 60,
          resetTime: new Date(Date.now() + 3600000),
          resetInSeconds: 3600,
        },
      },
      status: 'normal',
      nextReset: new Date(Date.now() + 3600000),
      policy: {
        burstLimit: 50,
        sustainedLimit: 1000,
        burstDuration: 60, // 1 minute
        sustainedDuration: 3600, // 1 hour
      },
    };

    this.logger.log(`Rate limits retrieved for parent: ${parentPortalAccessId}`);

    return rateLimits;
  }

  /**
   * Register webhook
   */
  async registerWebhook(
    parentPortalAccessId: string,
    webhookData: WebhookDto,
  ): Promise<WebhookDto> {
    this.logger.log(`Registering webhook for parent: ${parentPortalAccessId}`);

    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    const webhook = this.webhookRepository.create({
      parentPortalAccessId,
      schoolId: parentAccess.schoolId,
      name: webhookData.name,
      url: webhookData.url,
      description: webhookData.description,
      events: webhookData.events,
      secret: webhookData.secret,
      isActive: webhookData.isActive,
      retryConfig: webhookData.retryConfig,
      filters: webhookData.filters,
    });

    const savedWebhook = await this.webhookRepository.save(webhook);

    this.logger.log(`Webhook registered: ${savedWebhook.id}`);

    return {
      webhookId: savedWebhook.id,
      name: savedWebhook.name,
      url: savedWebhook.url,
      description: savedWebhook.description,
      events: savedWebhook.events,
      secret: savedWebhook.secret,
      isActive: savedWebhook.isActive,
      retryConfig: savedWebhook.retryConfig,
      filters: savedWebhook.filters,
      createdAt: savedWebhook.createdAt,
      lastTriggered: savedWebhook.lastTriggered,
      successRate: savedWebhook.successRate,
      totalDeliveries: savedWebhook.totalDeliveries,
      failedDeliveries: savedWebhook.failedDeliveries,
    };
  }

  /**
   * Get registered webhooks
   */
  async getWebhooks(parentPortalAccessId: string): Promise<WebhookDto[]> {
    this.logger.log(`Getting webhooks for parent: ${parentPortalAccessId}`);

    const webhooks = await this.webhookRepository.find({
      where: { parentPortalAccessId },
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Retrieved ${webhooks.length} webhooks`);

    return webhooks.map(webhook => ({
      webhookId: webhook.id,
      name: webhook.name,
      url: webhook.url,
      description: webhook.description,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive,
      retryConfig: webhook.retryConfig,
      filters: webhook.filters,
      createdAt: webhook.createdAt,
      lastTriggered: webhook.lastTriggered,
      successRate: webhook.successRate,
      totalDeliveries: webhook.totalDeliveries,
      failedDeliveries: webhook.failedDeliveries,
    }));
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(
    parentPortalAccessId: string,
    webhookId: string,
  ): Promise<void> {
    this.logger.log(`Deleting webhook: ${webhookId}`);

    const webhook = await this.webhookRepository.findOne({
      where: { id: webhookId, parentPortalAccessId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.webhookRepository.remove(webhook);

    this.logger.log(`Webhook deleted: ${webhookId}`);
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(
    parentPortalAccessId: string,
    webhookId?: string,
    limit: number = 50,
  ): Promise<WebhookEventDto[]> {
    this.logger.log(`Getting webhook events for parent: ${parentPortalAccessId}`);

    const where: any = { parentPortalAccessId };
    if (webhookId) {
      where.webhookId = webhookId;
    }

    const events = await this.webhookEventRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: limit,
    });

    this.logger.log(`Retrieved ${events.length} webhook events`);

    return events.map(event => ({
      eventId: event.id,
      webhookId: event.webhookId,
      eventType: event.eventType,
      data: event.data,
      timestamp: event.timestamp,
      deliveryAttempts: event.deliveryAttempts,
      status: event.status,
      responseStatus: event.responseStatus,
      responseBody: event.responseBody,
      processingTime: event.processingTime,
    }));
  }

  /**
   * Create integration
   */
  async createIntegration(
    parentPortalAccessId: string,
    integrationData: IntegrationDto,
  ): Promise<IntegrationDto> {
    this.logger.log(`Creating integration for parent: ${parentPortalAccessId}`);

    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    const integration = this.integrationRepository.create({
      parentPortalAccessId,
      schoolId: parentAccess.schoolId,
      name: integrationData.name,
      type: integrationData.type,
      description: integrationData.description,
      provider: integrationData.provider,
      config: integrationData.config,
      status: IntegrationStatus.CONFIGURING,
      features: integrationData.features,
      rateLimits: integrationData.rateLimits,
      healthCheckUrl: integrationData.healthCheckUrl,
    });

    const savedIntegration = await this.integrationRepository.save(integration);

    this.logger.log(`Integration created: ${savedIntegration.id}`);

    return {
      integrationId: savedIntegration.id,
      name: savedIntegration.name,
      type: savedIntegration.type,
      description: savedIntegration.description,
      provider: savedIntegration.provider,
      config: savedIntegration.config,
      status: savedIntegration.status,
      features: savedIntegration.features,
      rateLimits: savedIntegration.rateLimits,
      healthCheckUrl: savedIntegration.healthCheckUrl,
      createdAt: savedIntegration.createdAt,
      lastTested: savedIntegration.lastTested,
      testResults: savedIntegration.testResults,
      usageStats: savedIntegration.usageStats,
    };
  }

  /**
   * Get integrations
   */
  async getIntegrations(parentPortalAccessId: string): Promise<IntegrationDto[]> {
    this.logger.log(`Getting integrations for parent: ${parentPortalAccessId}`);

    const integrations = await this.integrationRepository.find({
      where: { parentPortalAccessId },
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Retrieved ${integrations.length} integrations`);

    return integrations.map(integration => ({
      integrationId: integration.id,
      name: integration.name,
      type: integration.type,
      description: integration.description,
      provider: integration.provider,
      config: integration.config,
      status: integration.status,
      features: integration.features,
      rateLimits: integration.rateLimits,
      healthCheckUrl: integration.healthCheckUrl,
      createdAt: integration.createdAt,
      lastTested: integration.lastTested,
      testResults: integration.testResults,
      usageStats: integration.usageStats,
    }));
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(
    parentPortalAccessId: string,
    integrationId: string,
  ): Promise<IntegrationStatusDto> {
    this.logger.log(`Getting integration status: ${integrationId}`);

    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, parentPortalAccessId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Mock health check - in production, this would actually test the integration
    const healthMetrics = {
      uptime: 99.5,
      averageResponseTime: 150,
      errorRate: 0.01,
      lastError: null,
    };

    const status: IntegrationStatusDto = {
      integrationId: integration.id,
      status: integration.status,
      message: integration.status === IntegrationStatus.ACTIVE
        ? 'Integration is working correctly'
        : `Integration status: ${integration.status}`,
      lastChecked: new Date(),
      responseTime: 150,
      error: integration.status === IntegrationStatus.ERROR ? {
        code: 'CONNECTION_ERROR',
        message: 'Unable to connect to external service',
        details: { timestamp: new Date() },
      } : undefined,
      healthMetrics,
      configStatus: 'valid',
      recommendedActions: integration.status !== IntegrationStatus.ACTIVE
        ? ['Check configuration', 'Verify API credentials', 'Test connection']
        : [],
    };

    this.logger.log(`Integration status retrieved: ${integrationId}`);

    return status;
  }

  /**
   * Register push notification token
   */
  async registerPushToken(
    parentPortalAccessId: string,
    tokenData: PushTokenDto,
  ): Promise<PushTokenDto> {
    this.logger.log(`Registering push token for parent: ${parentPortalAccessId}`);

    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    // Check if token already exists
    const existingToken = await this.pushTokenRepository.findOne({
      where: {
        parentPortalAccessId,
        deviceToken: tokenData.deviceToken,
      },
    });

    if (existingToken) {
      // Update existing token
      existingToken.deviceName = tokenData.deviceName;
      existingToken.deviceModel = tokenData.deviceModel;
      existingToken.osVersion = tokenData.osVersion;
      existingToken.appVersion = tokenData.appVersion;
      existingToken.isActive = true;
      existingToken.lastUsed = new Date();

      const updatedToken = await this.pushTokenRepository.save(existingToken);

      this.logger.log(`Push token updated: ${updatedToken.id}`);

      return {
        tokenId: updatedToken.id,
        deviceToken: updatedToken.deviceToken,
        deviceType: updatedToken.deviceType,
        deviceName: updatedToken.deviceName,
        deviceModel: updatedToken.deviceModel,
        osVersion: updatedToken.osVersion,
        appVersion: updatedToken.appVersion,
        isActive: updatedToken.isActive,
        lastUsed: updatedToken.lastUsed,
        registeredAt: updatedToken.registeredAt,
        expiresAt: updatedToken.expiresAt,
      };
    }

    // Create new token
    const pushToken = this.pushTokenRepository.create({
      parentPortalAccessId,
      schoolId: parentAccess.schoolId,
      deviceToken: tokenData.deviceToken,
      deviceType: tokenData.deviceType,
      deviceName: tokenData.deviceName,
      deviceModel: tokenData.deviceModel,
      osVersion: tokenData.osVersion,
      appVersion: tokenData.appVersion,
      isActive: true,
      registeredAt: new Date(),
    });

    const savedToken = await this.pushTokenRepository.save(pushToken);

    this.logger.log(`Push token registered: ${savedToken.id}`);

    return {
      tokenId: savedToken.id,
      deviceToken: savedToken.deviceToken,
      deviceType: savedToken.deviceType,
      deviceName: savedToken.deviceName,
      deviceModel: savedToken.deviceModel,
      osVersion: savedToken.osVersion,
      appVersion: savedToken.appVersion,
      isActive: savedToken.isActive,
      lastUsed: savedToken.lastUsed,
      registeredAt: savedToken.registeredAt,
      expiresAt: savedToken.expiresAt,
    };
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(parentPortalAccessId: string): Promise<NotificationSettingsDto> {
    this.logger.log(`Getting notification settings for parent: ${parentPortalAccessId}`);

    // Mock notification settings - in production, this would be stored in database
    const settings: NotificationSettingsDto = {
      settingsId: 'settings-001',
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      categoryPreferences: {
        academic: {
          enabled: true,
          priority: NotificationPriority.HIGH,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
          },
        },
        attendance: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
          },
        },
        fees: {
          enabled: true,
          priority: NotificationPriority.URGENT,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00',
          },
        },
        transportation: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
          },
        },
        general: {
          enabled: true,
          priority: NotificationPriority.LOW,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
          },
        },
      },
      deliveryPreferences: {
        batchNotifications: true,
        batchInterval: 15, // minutes
        maxNotificationsPerHour: 10,
        preferredLanguage: 'en',
        timezone: 'UTC',
      },
      devicePreferences: {
        allowedDevices: ['ios', 'android', 'web'],
        primaryDevice: 'ios',
        notificationSounds: true,
        vibrationEnabled: true,
      },
      lastUpdated: new Date(),
    };

    this.logger.log(`Notification settings retrieved for parent: ${parentPortalAccessId}`);

    return settings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    parentPortalAccessId: string,
    settingsData: NotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    this.logger.log(`Updating notification settings for parent: ${parentPortalAccessId}`);

    // In production, this would update the database
    const updatedSettings: NotificationSettingsDto = {
      ...settingsData,
      lastUpdated: new Date(),
    };

    this.logger.log(`Notification settings updated for parent: ${parentPortalAccessId}`);

    return updatedSettings;
  }

  /**
   * Send notification
   */
  async sendNotification(
    parentPortalAccessId: string,
    notificationData: NotificationDto,
  ): Promise<NotificationDto> {
    this.logger.log(`Sending notification for parent: ${parentPortalAccessId}`);

    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    // Mock notification sending - in production, this would integrate with notification services
    const notification: NotificationDto = {
      notificationId: `notification-${Date.now()}`,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      data: notificationData.data,
      recipients: notificationData.recipients,
      channels: notificationData.channels,
      scheduledAt: notificationData.scheduledAt,
      expiresAt: notificationData.expiresAt,
      createdAt: new Date(),
      deliveryStatus: {
        email: {
          status: 'sent',
          sentAt: new Date(),
          deliveredAt: new Date(),
          retryCount: 0,
        },
        push: {
          status: 'sent',
          sentAt: new Date(),
          deliveredAt: new Date(),
          retryCount: 0,
        },
      },
      metadata: {
        category: 'custom',
        source: 'api',
        correlationId: `corr-${Date.now()}`,
        studentId: notificationData.metadata?.studentId,
        gradeId: notificationData.metadata?.gradeId,
      },
      isRead: false,
    };

    this.logger.log(`Notification sent: ${notification.notificationId}`);

    return notification;
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(
    parentPortalAccessId: string,
    limit: number = 50,
    status?: string,
  ): Promise<NotificationDto[]> {
    this.logger.log(`Getting notification history for parent: ${parentPortalAccessId}`);

    // Mock notification history - in production, this would come from database
    const notifications: NotificationDto[] = [
      {
        notificationId: 'notification-001',
        type: NotificationType.PUSH,
        title: 'Grade Updated',
        message: 'Your child\'s mathematics grade has been updated to A+',
        priority: NotificationPriority.HIGH,
        recipients: [parentPortalAccessId],
        channels: [NotificationType.PUSH, NotificationType.EMAIL],
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        deliveryStatus: {
          push: {
            status: 'delivered',
            sentAt: new Date(Date.now() - 3600000),
            deliveredAt: new Date(Date.now() - 3540000),
            retryCount: 0,
          },
          email: {
            status: 'delivered',
            sentAt: new Date(Date.now() - 3600000),
            deliveredAt: new Date(Date.now() - 3500000),
            retryCount: 0,
          },
        },
        metadata: {
          category: 'academic',
          source: 'system',
          correlationId: 'corr-001',
          studentId: 'student-001',
        },
        isRead: true,
        readAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        notificationId: 'notification-002',
        type: NotificationType.EMAIL,
        title: 'Fee Payment Due',
        message: 'School fee payment of $500 is due on March 15th',
        priority: NotificationPriority.URGENT,
        recipients: [parentPortalAccessId],
        channels: [NotificationType.EMAIL],
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        deliveryStatus: {
          email: {
            status: 'delivered',
            sentAt: new Date(Date.now() - 7200000),
            deliveredAt: new Date(Date.now() - 7140000),
            retryCount: 0,
          },
        },
        metadata: {
          category: 'fee',
          source: 'system',
          correlationId: 'corr-002',
        },
        isRead: false,
      },
    ];

    // Filter by status if specified
    let filteredNotifications = notifications;
    if (status) {
      filteredNotifications = notifications.filter(notification => {
        return Object.values(notification.deliveryStatus).some(channel =>
          channel.status === status
        );
      });
    }

    // Apply limit
    filteredNotifications = filteredNotifications.slice(0, limit);

    this.logger.log(`Retrieved ${filteredNotifications.length} notifications`);

    return filteredNotifications;
  }

  /**
   * Generate API key
   */
  async generateApiKey(
    parentPortalAccessId: string,
    keyData: ApiKeyDto,
  ): Promise<ApiKeyDto> {
    this.logger.log(`Generating API key for parent: ${parentPortalAccessId}`);

    const parentAccess = await this.parentPortalAccessRepository.findOne({
      where: { id: parentPortalAccessId },
    });

    if (!parentAccess) {
      throw new NotFoundException('Parent portal access not found');
    }

    // Generate a secure API key
    const apiKey = `pp_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const newApiKey = this.apiKeyRepository.create({
      parentPortalAccessId,
      schoolId: parentAccess.schoolId,
      name: keyData.name,
      description: keyData.description,
      prefix: 'pp_live_',
      maskedKey: `pp_live_****${apiKey.slice(-4)}`,
      permissions: keyData.permissions,
      rateLimits: keyData.rateLimits,
      allowedIPs: keyData.allowedIPs,
      expiresAt: keyData.expiresAt,
      isActive: true,
      createdAt: new Date(),
    });

    const savedApiKey = await this.apiKeyRepository.save(newApiKey);

    this.logger.log(`API key generated: ${savedApiKey.id}`);

    return {
      keyId: savedApiKey.id,
      name: savedApiKey.name,
      description: savedApiKey.description,
      prefix: savedApiKey.prefix,
      maskedKey: savedApiKey.maskedKey,
      permissions: savedApiKey.permissions,
      rateLimits: savedApiKey.rateLimits,
      allowedIPs: savedApiKey.allowedIPs,
      expiresAt: savedApiKey.expiresAt,
      lastUsed: savedApiKey.lastUsed,
      usageCount: savedApiKey.usageCount,
      isActive: savedApiKey.isActive,
      createdAt: savedApiKey.createdAt,
    };
  }

  /**
   * Get API keys
   */
  async getApiKeys(parentPortalAccessId: string): Promise<ApiKeyDto[]> {
    this.logger.log(`Getting API keys for parent: ${parentPortalAccessId}`);

    const apiKeys = await this.apiKeyRepository.find({
      where: { parentPortalAccessId },
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Retrieved ${apiKeys.length} API keys`);

    return apiKeys.map(apiKey => ({
      keyId: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      prefix: apiKey.prefix,
      maskedKey: apiKey.maskedKey,
      permissions: apiKey.permissions,
      rateLimits: apiKey.rateLimits,
      allowedIPs: apiKey.allowedIPs,
      expiresAt: apiKey.expiresAt,
      lastUsed: apiKey.lastUsed,
      usageCount: apiKey.usageCount,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
    }));
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(
    parentPortalAccessId: string,
    keyId: string,
  ): Promise<void> {
    this.logger.log(`Revoking API key: ${keyId}`);

    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: keyId, parentPortalAccessId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);

    this.logger.log(`API key revoked: ${keyId}`);
  }

  /**
   * Get API logs
   */
  async getApiLogs(
    parentPortalAccessId: string,
    limit: number = 50,
    endpoint?: string,
    status?: number,
  ): Promise<ApiLogDto[]> {
    this.logger.log(`Getting API logs for parent: ${parentPortalAccessId}`);

    const where: any = { parentPortalAccessId };
    if (endpoint) {
      where.endpoint = endpoint;
    }
    if (status) {
      where.statusCode = status;
    }

    const logs = await this.apiLogRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: limit,
    });

    this.logger.log(`Retrieved ${logs.length} API logs`);

    return logs.map(log => ({
      logId: log.id,
      timestamp: log.timestamp,
      method: log.method,
      endpoint: log.endpoint,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      requestSize: log.requestSize,
      responseSize: log.responseSize,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      version: log.version,
      requestId: log.requestId,
      errorMessage: log.errorMessage,
      rateLimit: log.rateLimit,
      geolocation: log.geolocation,
    }));
  }

  /**
   * Get service health
   */
  async getServiceHealth(parentPortalAccessId: string): Promise<ServiceHealthDto[]> {
    this.logger.log(`Getting service health for parent: ${parentPortalAccessId}`);

    // Mock service health data
    const services: ServiceHealthDto[] = [
      {
        serviceName: 'academic-service',
        displayName: 'Academic Service',
        status: ServiceHealthStatus.HEALTHY,
        message: 'Academic service is operating normally',
        lastChecked: new Date(),
        responseTime: 120,
        uptime: 99.9,
        errorRate: 0.001,
        version: '2.1.3',
        endpoint: 'https://api.parentportal.com/academic',
        healthCheck: {
          url: 'https://api.parentportal.com/academic/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
        },
        recentIncidents: [],
      },
      {
        serviceName: 'communication-service',
        displayName: 'Communication Service',
        status: ServiceHealthStatus.HEALTHY,
        message: 'Communication service is operating normally',
        lastChecked: new Date(),
        responseTime: 85,
        uptime: 99.8,
        errorRate: 0.002,
        version: '1.9.2',
        endpoint: 'https://api.parentportal.com/communication',
        healthCheck: {
          url: 'https://api.parentportal.com/communication/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
        },
        recentIncidents: [],
      },
      {
        serviceName: 'payment-gateway',
        displayName: 'Payment Gateway',
        status: ServiceHealthStatus.DEGRADED,
        message: 'Payment gateway experiencing higher latency',
        lastChecked: new Date(),
        responseTime: 350,
        uptime: 99.5,
        errorRate: 0.005,
        version: '3.2.1',
        endpoint: 'https://api.stripe.com',
        healthCheck: {
          url: 'https://api.stripe.com/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000,
        },
        recentIncidents: [
          {
            incidentId: 'incident-001',
            type: 'latency',
            message: 'Increased response times detected',
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            resolved: false,
          },
        ],
      },
    ];

    this.logger.log(`Retrieved health status for ${services.length} services`);

    return services;
  }

  /**
   * Get API analytics
   */
  async getApiAnalytics(
    parentPortalAccessId: string,
    timeRange: string = 'month',
  ): Promise<ApiAnalyticsDto> {
    this.logger.log(`Getting API analytics for parent: ${parentPortalAccessId}, timeRange: ${timeRange}`);

    // Mock analytics data
    const analytics: ApiAnalyticsDto = {
      timeRange,
      overview: {
        totalRequests: 2500,
        uniqueUsers: 1,
        averageRequestsPerUser: 2500,
        peakRequestsPerHour: 150,
        totalDataTransfer: 10485760, // 10MB
      },
     