import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity, AuditLogData } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';

export interface FallbackMessage {
  id: string;
  type: 'audit_event' | 'metrics_update';
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
}

export interface FallbackConfig {
  enabled: boolean;
  maxQueueSize: number;
  retryInterval: number;
  maxRetries: number;
  batchSize: number;
  storagePath?: string;
}

@Injectable()
export class AuditFallbackService implements OnModuleDestroy {
  private readonly logger = new Logger(AuditFallbackService.name);
  private readonly messageQueue: FallbackMessage[] = [];
  private readonly processingQueue: Set<string> = new Set();
  private isProcessing = false;
  private retryTimer: NodeJS.Timeout | null = null;

  private readonly config: FallbackConfig = {
    enabled: true,
    maxQueueSize: 10000,
    retryInterval: 30000, // 30 seconds
    maxRetries: 5,
    batchSize: 50,
  };

  constructor(private readonly auditService: AuditService) {
    this.startRetryTimer();
  }

  /**
   * Queue a message for fallback processing
   */
  queueMessage(
    type: FallbackMessage['type'],
    data: any,
    priority: FallbackMessage['priority'] = 'medium',
  ): boolean {
    if (!this.config.enabled) {
      return false;
    }

    // Check queue size limit
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      this.logger.warn(`Fallback queue full (${this.messageQueue.length} messages), dropping message`);
      return false;
    }

    const message: FallbackMessage = {
      id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      priority,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
    };

    // Add to queue with priority ordering
    this.insertWithPriority(message);

    this.logger.debug(`Queued fallback message: ${message.id} (${type})`);

    return true;
  }

  /**
   * Process queued messages
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batchSize = Math.min(this.config.batchSize, this.messageQueue.length);
    const batch = this.messageQueue.splice(0, batchSize);

    try {
      for (const message of batch) {
        if (this.processingQueue.has(message.id)) {
          continue; // Already being processed
        }

        this.processingQueue.add(message.id);

        try {
          await this.processMessage(message);
          this.logger.debug(`Successfully processed fallback message: ${message.id}`);
        } catch (error) {
          this.logger.error(`Failed to process fallback message ${message.id}: ${error.message}`);

          // Handle retry logic
          if (message.retryCount < message.maxRetries) {
            message.retryCount++;
            message.nextRetryAt = new Date(Date.now() + this.config.retryInterval * message.retryCount);
            this.messageQueue.push(message);
            this.logger.debug(`Re-queued message ${message.id} for retry (${message.retryCount}/${message.maxRetries})`);
          } else {
            this.logger.error(`Max retries exceeded for message ${message.id}, discarding`);
          }
        } finally {
          this.processingQueue.delete(message.id);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing fallback batch: ${error.message}`, error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: FallbackMessage): Promise<void> {
    switch (message.type) {
      case 'audit_event':
        await this.processAuditEvent(message.data);
        break;
      case 'metrics_update':
        await this.processMetricsUpdate(message.data);
        break;
      default:
        this.logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Process audit event (store in database for later retrieval)
   */
  private async processAuditEvent(eventData: any): Promise<void> {
    // Store the event in a fallback table or log it
    await this.auditService.logActivity({
      userId: eventData.userId || SYSTEM_USER_ID,
      action: AuditAction.DATA_ACCESSED,
      resource: 'websocket_fallback',
      resourceId: 'audit_event',
      details: {
        eventType: 'websocket_fallback_audit_event',
        originalEvent: eventData,
        fallbackTimestamp: new Date(),
      },
      severity: AuditSeverity.LOW,
    });
  }

  /**
   * Process metrics update (cache for later retrieval)
   */
  private async processMetricsUpdate(metricsData: any): Promise<void> {
    // Store metrics in cache or database
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: AuditAction.DATA_ACCESSED,
      resource: 'websocket_fallback',
      resourceId: 'metrics_update',
      details: {
        eventType: 'websocket_fallback_metrics',
        metrics: metricsData,
        fallbackTimestamp: new Date(),
      },
      severity: AuditSeverity.LOW,
    });
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats() {
    const now = Date.now();
    const pendingRetries = this.messageQueue.filter(msg =>
      msg.nextRetryAt && msg.nextRetryAt.getTime() > now
    );

    return {
      enabled: this.config.enabled,
      queueSize: this.messageQueue.length,
      processingCount: this.processingQueue.size,
      isProcessing: this.isProcessing,
      pendingRetries: pendingRetries.length,
      config: this.config,
      queueBreakdown: {
        audit_events: this.messageQueue.filter(msg => msg.type === 'audit_event').length,
        metrics_updates: this.messageQueue.filter(msg => msg.type === 'metrics_update').length,
      },
      priorityBreakdown: {
        high: this.messageQueue.filter(msg => msg.priority === 'high').length,
        medium: this.messageQueue.filter(msg => msg.priority === 'medium').length,
        low: this.messageQueue.filter(msg => msg.priority === 'low').length,
      },
    };
  }

  /**
   * Clear the fallback queue
   */
  clearQueue(): number {
    const clearedCount = this.messageQueue.length;
    this.messageQueue.length = 0;
    this.processingQueue.clear();
    this.logger.log(`Cleared ${clearedCount} messages from fallback queue`);
    return clearedCount;
  }

  /**
   * Enable or disable fallback processing
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.logger.log(`Fallback processing ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Update fallback configuration
   */
  updateConfig(updates: Partial<FallbackConfig>): void {
    Object.assign(this.config, updates);
    this.logger.log('Fallback configuration updated', updates);
  }

  /**
   * Insert message with priority ordering
   */
  private insertWithPriority(message: FallbackMessage): void {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    let insertIndex = this.messageQueue.length;
    for (let i = 0; i < this.messageQueue.length; i++) {
      if (priorityOrder[message.priority] > priorityOrder[this.messageQueue[i].priority]) {
        insertIndex = i;
        break;
      }
    }

    this.messageQueue.splice(insertIndex, 0, message);
  }

  /**
   * Start retry timer
   */
  private startRetryTimer(): void {
    this.retryTimer = setInterval(() => {
      this.processQueue();
    }, this.config.retryInterval);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }

    // Process remaining messages before shutdown
    await this.processQueue();

    this.logger.log(`Fallback service destroyed - processed remaining ${this.messageQueue.length} messages`);
  }
}