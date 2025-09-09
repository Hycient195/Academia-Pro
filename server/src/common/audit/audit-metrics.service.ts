import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../security/services/audit.service';
import { AuditGateway } from './audit.gateway';

export interface RealTimeMetrics {
  totalActivities: number;
  activeUsers: number;
  apiRequests: number;
  securityEvents: number;
  activitiesGrowth?: number;
  usersGrowth?: number;
  apiGrowth?: number;
  securityGrowth?: number;
  recentActivityCount: number;
  criticalEventsCount: number;
  topResources: Array<{ resource: string; count: number }>;
  severityBreakdown: Record<string, number>;
}

export interface MetricsBroadcastOptions {
  priority?: 'low' | 'medium' | 'high';
  throttleMs?: number;
  includeHistorical?: boolean;
  targetClients?: string[];
}

@Injectable()
export class AuditMetricsService {
  private readonly logger = new Logger(AuditMetricsService.name);
  private readonly metricsCache = new Map<string, { data: RealTimeMetrics; timestamp: Date; ttl: number }>();
  private readonly broadcastQueue: Array<{ metrics: RealTimeMetrics; options: MetricsBroadcastOptions }> = [];
  private readonly throttleTimers = new Map<string, NodeJS.Timeout>();
  private isProcessingQueue = false;

  constructor(
    private readonly auditService: AuditService,
    private readonly auditGateway: AuditGateway,
  ) {}

  /**
   * Update and broadcast real-time metrics
   */
  async updateMetrics(metrics: Partial<RealTimeMetrics>, options: MetricsBroadcastOptions = {}): Promise<void> {
    try {
      const fullMetrics = await this.enrichMetrics(metrics);
      const cacheKey = this.generateCacheKey(options);

      // Cache the metrics
      this.metricsCache.set(cacheKey, {
        data: fullMetrics,
        timestamp: new Date(),
        ttl: 300000, // 5 minutes TTL
      });

      // Add to broadcast queue
      this.broadcastQueue.push({ metrics: fullMetrics, options });

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processBroadcastQueue();
      }

      this.logger.debug(`Metrics updated and queued for broadcast: ${Object.keys(fullMetrics).length} metrics`);

    } catch (error) {
      this.logger.error(`Failed to update metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Get cached metrics
   */
  getCachedMetrics(cacheKey?: string): RealTimeMetrics | null {
    const key = cacheKey || 'default';
    const cached = this.metricsCache.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp.getTime() > cached.ttl) {
      this.metricsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Broadcast metrics immediately (bypassing queue)
   */
  async broadcastMetricsImmediately(metrics: RealTimeMetrics, options: MetricsBroadcastOptions = {}): Promise<void> {
    const throttleKey = this.generateThrottleKey(metrics, options);

    // Check throttling
    if (options.throttleMs && this.throttleTimers.has(throttleKey)) {
      this.logger.debug(`Broadcast throttled for key: ${throttleKey}`);
      return;
    }

    try {
      await this.auditGateway.broadcastMetricsUpdate(metrics);

      // Set throttle timer
      if (options.throttleMs) {
        this.throttleTimers.set(throttleKey, setTimeout(() => {
          this.throttleTimers.delete(throttleKey);
        }, options.throttleMs));
      }

      this.logger.debug(`Metrics broadcasted immediately to ${options.targetClients?.length || 'all'} clients`);

    } catch (error) {
      this.logger.error(`Failed to broadcast metrics immediately: ${error.message}`, error.stack);
    }
  }

  /**
   * Get metrics summary for dashboard
   */
  async getMetricsSummary(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<RealTimeMetrics> {
    const cached = this.getCachedMetrics(`summary-${timeRange}`);
    if (cached) return cached;

    // Calculate time range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
    }

    try {
      const stats = await this.auditService.getAuditStatistics({
        startDate,
        endDate,
      });

      const metrics: RealTimeMetrics = {
        totalActivities: stats.totalLogs,
        activeUsers: stats.topUsers.length,
        apiRequests: stats.logsByAction['api_request'] || 0,
        securityEvents: (stats.logsBySeverity['high'] || 0) + (stats.logsBySeverity['critical'] || 0),
        recentActivityCount: stats.recentActivity.length,
        criticalEventsCount: stats.logsBySeverity['critical'] || 0,
        topResources: Object.entries(stats.logsByResource)
          .map(([resource, count]) => ({ resource, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        severityBreakdown: stats.logsBySeverity,
      };

      // Cache the result
      this.metricsCache.set(`summary-${timeRange}`, {
        data: metrics,
        timestamp: new Date(),
        ttl: 60000, // 1 minute TTL for summaries
      });

      return metrics;

    } catch (error) {
      this.logger.error(`Failed to get metrics summary: ${error.message}`, error.stack);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calculate growth metrics
   */
  async calculateGrowthMetrics(current: RealTimeMetrics, previous: RealTimeMetrics): Promise<Partial<RealTimeMetrics>> {
    const growth: Partial<RealTimeMetrics> = {};

    if (previous.totalActivities > 0) {
      growth.activitiesGrowth = ((current.totalActivities - previous.totalActivities) / previous.totalActivities) * 100;
    }

    if (previous.activeUsers > 0) {
      growth.usersGrowth = ((current.activeUsers - previous.activeUsers) / previous.activeUsers) * 100;
    }

    if (previous.apiRequests > 0) {
      growth.apiGrowth = ((current.apiRequests - previous.apiRequests) / previous.apiRequests) * 100;
    }

    if (previous.securityEvents > 0) {
      growth.securityGrowth = ((current.securityEvents - previous.securityEvents) / previous.securityEvents) * 100;
    }

    return growth;
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.metricsCache.entries()) {
      if (now - cached.timestamp.getTime() > cached.ttl) {
        this.metricsCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired metrics cache entries`);
    }

    return cleanedCount;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalEntries: this.metricsCache.size,
      queueLength: this.broadcastQueue.length,
      activeThrottleTimers: this.throttleTimers.size,
      isProcessingQueue: this.isProcessingQueue,
    };
  }

  /**
   * Enrich metrics with additional data
   */
  private async enrichMetrics(metrics: Partial<RealTimeMetrics>): Promise<RealTimeMetrics> {
    const enriched: RealTimeMetrics = {
      totalActivities: metrics.totalActivities || 0,
      activeUsers: metrics.activeUsers || 0,
      apiRequests: metrics.apiRequests || 0,
      securityEvents: metrics.securityEvents || 0,
      activitiesGrowth: metrics.activitiesGrowth,
      usersGrowth: metrics.usersGrowth,
      apiGrowth: metrics.apiGrowth,
      securityGrowth: metrics.securityGrowth,
      recentActivityCount: metrics.recentActivityCount || 0,
      criticalEventsCount: metrics.criticalEventsCount || 0,
      topResources: metrics.topResources || [],
      severityBreakdown: metrics.severityBreakdown || {},
    };

    // Add timestamp-based enrichment if needed
    if (!enriched.recentActivityCount) {
      try {
        const recentStats = await this.auditService.getAuditStatistics({
          startDate: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        });
        enriched.recentActivityCount = recentStats.recentActivity.length;
        enriched.criticalEventsCount = recentStats.logsBySeverity['critical'] || 0;
      } catch (error) {
        this.logger.warn(`Failed to enrich metrics with recent data: ${error.message}`);
      }
    }

    return enriched;
  }

  /**
   * Process broadcast queue
   */
  private async processBroadcastQueue(): Promise<void> {
    if (this.isProcessingQueue || this.broadcastQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      while (this.broadcastQueue.length > 0) {
        const { metrics, options } = this.broadcastQueue.shift()!;

        await this.broadcastMetricsImmediately(metrics, options);

        // Small delay between broadcasts to prevent overwhelming clients
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      this.logger.error(`Error processing broadcast queue: ${error.message}`, error.stack);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(options: MetricsBroadcastOptions): string {
    const parts = [
      options.priority || 'medium',
      options.includeHistorical ? 'historical' : 'current',
      options.targetClients?.join(',') || 'all',
    ];
    return parts.join('-');
  }

  /**
   * Generate throttle key
   */
  private generateThrottleKey(metrics: RealTimeMetrics, options: MetricsBroadcastOptions): string {
    return `${options.priority || 'medium'}-${Object.keys(metrics).sort().join(',')}`;
  }

  /**
   * Get default metrics when calculation fails
   */
  private getDefaultMetrics(): RealTimeMetrics {
    return {
      totalActivities: 0,
      activeUsers: 0,
      apiRequests: 0,
      securityEvents: 0,
      recentActivityCount: 0,
      criticalEventsCount: 0,
      topResources: [],
      severityBreakdown: {},
    };
  }
}