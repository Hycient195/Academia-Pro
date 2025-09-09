import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { AuditService } from '../../security/services/audit.service';
import { AuditSeverity } from '../../security/types/audit.types';
import { AuditConnectionManagerService } from './audit-connection-manager.service';
import { AuditMetricsService } from './audit-metrics.service';
import { AuditFallbackService } from './audit-fallback.service';

export interface WebSocketMetrics {
  timestamp: Date;
  activeConnections: number;
  totalConnections: number;
  messagesSent: number;
  messagesReceived: number;
  connectionErrors: number;
  averageConnectionDuration: number;
  peakConnections: number;
  reconnectionAttempts: number;
  successfulReconnections: number;
  failedReconnections: number;
  subscriptionCount: number;
  broadcastCount: number;
  averageMessageLatency: number;
  errorRate: number;
  uptime: number;
}

export interface ConnectionHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  healthCheckInterval: number;
  alertThresholds: {
    maxConnectionErrors: number;
    maxReconnectionFailures: number;
    minConnectionHealthScore: number;
    maxAverageLatency: number;
  };
}

@Injectable()
export class AuditMonitoringService implements OnModuleDestroy {
  private readonly logger = new Logger(AuditMonitoringService.name);
  private readonly metricsHistory: WebSocketMetrics[] = [];
  private readonly maxHistorySize = 1000;

  private readonly config: MonitoringConfig = {
    enabled: true,
    metricsInterval: 30000, // 30 seconds
    healthCheckInterval: 60000, // 1 minute
    alertThresholds: {
      maxConnectionErrors: 10,
      maxReconnectionFailures: 5,
      minConnectionHealthScore: 70,
      maxAverageLatency: 5000, // 5 seconds
    },
  };

  private metricsInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();

  constructor(
    private readonly auditService: AuditService,
    private readonly connectionManager: AuditConnectionManagerService,
    private readonly metricsService: AuditMetricsService,
    private readonly fallbackService: AuditFallbackService,
  ) {
    this.startMonitoring();
  }

  /**
   * Start monitoring intervals
   */
  private startMonitoring(): void {
    if (!this.config.enabled) return;

    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    this.logger.log('WebSocket monitoring started');
  }

  /**
   * Collect current metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const connectionStats = this.connectionManager.getConnectionStats();
      const metricsStats = this.metricsService.getCacheStats();
      const fallbackStats = this.fallbackService.getFallbackStats();

      const metrics: WebSocketMetrics = {
        timestamp: new Date(),
        activeConnections: connectionStats.activeConnections,
        totalConnections: connectionStats.totalConnections,
        messagesSent: connectionStats.totalConnections, // Approximate
        messagesReceived: connectionStats.totalConnections, // Approximate
        connectionErrors: 0, // Would need to track this separately
        averageConnectionDuration: this.calculateAverageConnectionDuration(),
        peakConnections: Math.max(...this.metricsHistory.map(m => m.peakConnections), 0),
        reconnectionAttempts: 0, // Would need to track this
        successfulReconnections: 0, // Would need to track this
        failedReconnections: 0, // Would need to track this
        subscriptionCount: connectionStats.connectionsByUser,
        broadcastCount: metricsStats.totalEntries,
        averageMessageLatency: 0, // Would need to measure this
        errorRate: fallbackStats.pendingRetries / Math.max(fallbackStats.queueSize, 1),
        uptime: Date.now() - this.startTime.getTime(),
      };

      this.metricsHistory.push(metrics);

      // Keep history size manageable
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift();
      }

      // Log metrics periodically
      if (this.metricsHistory.length % 10 === 0) {
        this.logger.debug(`WebSocket metrics: ${JSON.stringify(metrics)}`);
      }

    } catch (error) {
      this.logger.error(`Failed to collect metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const health = await this.assessConnectionHealth();

      if (health.status === 'critical') {
        this.logger.error(`Critical WebSocket health issues detected: ${health.issues.join(', ')}`);
        await this.logHealthAlert('critical', health);
      } else if (health.status === 'warning') {
        this.logger.warn(`WebSocket health warnings: ${health.issues.join(', ')}`);
        await this.logHealthAlert('warning', health);
      }

      // Log health score periodically
      this.logger.debug(`WebSocket health score: ${health.score}`);

    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Assess connection health
   */
  private async assessConnectionHealth(): Promise<ConnectionHealth> {
    const connectionStats = this.connectionManager.getConnectionStats();
    const fallbackStats = this.fallbackService.getFallbackStats();
    const recentMetrics = this.getRecentMetrics();

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check connection errors
    if (connectionStats.totalConnections > 0) {
      const errorRate = (fallbackStats.pendingRetries / connectionStats.totalConnections) * 100;
      if (errorRate > 20) {
        issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
        score -= 30;
        recommendations.push('Investigate connection stability issues');
      }
    }

    // Check connection distribution
    if (connectionStats.connectionsByIp > 10) {
      issues.push(`High connections per IP: ${connectionStats.connectionsByIp}`);
      score -= 20;
      recommendations.push('Review connection distribution and rate limiting');
    }

    // Check fallback queue
    if (fallbackStats.queueSize > 100) {
      issues.push(`Large fallback queue: ${fallbackStats.queueSize} messages`);
      score -= 25;
      recommendations.push('Monitor WebSocket server performance');
    }

    // Check average connection duration
    const avgDuration = this.calculateAverageConnectionDuration();
    if (avgDuration < 300000) { // Less than 5 minutes
      issues.push(`Short average connection duration: ${(avgDuration / 1000).toFixed(0)}s`);
      score -= 15;
      recommendations.push('Investigate connection stability');
    }

    // Determine status
    let status: ConnectionHealth['status'];
    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 60) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return {
      status,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Log health alert
   */
  private async logHealthAlert(severity: 'warning' | 'critical', health: ConnectionHealth): Promise<void> {
    await this.auditService.logActivity({
      userId: 'system',
      action: 'websocket_health_alert',
      resource: 'websocket_monitoring',
      resourceId: 'health_check',
      details: {
        eventType: 'websocket_health_alert',
        severity,
        healthScore: health.score,
        issues: health.issues,
        recommendations: health.recommendations,
        timestamp: new Date(),
      },
      severity: severity === 'critical' ? AuditSeverity.CRITICAL : AuditSeverity.HIGH,
    });
  }

  /**
   * Get recent metrics
   */
  private getRecentMetrics(count: number = 5): WebSocketMetrics[] {
    return this.metricsHistory.slice(-count);
  }

  /**
   * Calculate average connection duration
   */
  private calculateAverageConnectionDuration(): number {
    const connectionStats = this.connectionManager.getConnectionStats();
    if (connectionStats.activeConnections === 0) return 0;

    // This is a simplified calculation - in a real implementation,
    // you'd track individual connection durations
    return 600000; // 10 minutes average (placeholder)
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats() {
    const recentMetrics = this.getRecentMetrics(10);
    const connectionStats = this.connectionManager.getConnectionStats();
    const fallbackStats = this.fallbackService.getFallbackStats();

    return {
      enabled: this.config.enabled,
      uptime: Date.now() - this.startTime.getTime(),
      metricsHistorySize: this.metricsHistory.length,
      currentMetrics: recentMetrics[recentMetrics.length - 1],
      averageMetrics: this.calculateAverageMetrics(recentMetrics),
      connectionStats,
      fallbackStats,
      config: this.config,
    };
  }

  /**
   * Calculate average metrics from history
   */
  private calculateAverageMetrics(metrics: WebSocketMetrics[]) {
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => ({
      activeConnections: acc.activeConnections + metric.activeConnections,
      totalConnections: acc.totalConnections + metric.totalConnections,
      messagesSent: acc.messagesSent + metric.messagesSent,
      messagesReceived: acc.messagesReceived + metric.messagesReceived,
      connectionErrors: acc.connectionErrors + metric.connectionErrors,
      averageConnectionDuration: acc.averageConnectionDuration + metric.averageConnectionDuration,
      peakConnections: Math.max(acc.peakConnections, metric.peakConnections),
      reconnectionAttempts: acc.reconnectionAttempts + metric.reconnectionAttempts,
      successfulReconnections: acc.successfulReconnections + metric.successfulReconnections,
      failedReconnections: acc.failedReconnections + metric.failedReconnections,
      subscriptionCount: acc.subscriptionCount + metric.subscriptionCount,
      broadcastCount: acc.broadcastCount + metric.broadcastCount,
      averageMessageLatency: acc.averageMessageLatency + metric.averageMessageLatency,
      errorRate: acc.errorRate + metric.errorRate,
      uptime: acc.uptime + metric.uptime,
    }), {
      activeConnections: 0,
      totalConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      connectionErrors: 0,
      averageConnectionDuration: 0,
      peakConnections: 0,
      reconnectionAttempts: 0,
      successfulReconnections: 0,
      failedReconnections: 0,
      subscriptionCount: 0,
      broadcastCount: 0,
      averageMessageLatency: 0,
      errorRate: 0,
      uptime: 0,
    });

    const count = metrics.length;
    return {
      activeConnections: Math.round(sum.activeConnections / count),
      totalConnections: Math.round(sum.totalConnections / count),
      messagesSent: Math.round(sum.messagesSent / count),
      messagesReceived: Math.round(sum.messagesReceived / count),
      connectionErrors: Math.round(sum.connectionErrors / count),
      averageConnectionDuration: Math.round(sum.averageConnectionDuration / count),
      peakConnections: sum.peakConnections,
      reconnectionAttempts: Math.round(sum.reconnectionAttempts / count),
      successfulReconnections: Math.round(sum.successfulReconnections / count),
      failedReconnections: Math.round(sum.failedReconnections / count),
      subscriptionCount: Math.round(sum.subscriptionCount / count),
      broadcastCount: Math.round(sum.broadcastCount / count),
      averageMessageLatency: Math.round(sum.averageMessageLatency / count),
      errorRate: (sum.errorRate / count * 100).toFixed(2) + '%',
      uptime: Math.round(sum.uptime / count),
    };
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): WebSocketMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Reset monitoring data
   */
  resetMonitoring(): void {
    this.metricsHistory.length = 0;
    this.startTime = new Date();
    this.logger.log('WebSocket monitoring data reset');
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(updates: Partial<MonitoringConfig>): void {
    Object.assign(this.config, updates);
    this.logger.log('Monitoring configuration updated', updates);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.logger.log('WebSocket monitoring service destroyed');
  }
}