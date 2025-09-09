import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity, AuditLogData } from '../../security/types/audit.types';

export interface SubscriptionFilter {
  eventTypes?: string[];
  severities?: string[];
  resources?: string[];
  users?: string[];
  minSeverity?: string;
  schoolIds?: string[];
  excludeUsers?: string[];
  excludeResources?: string[];
}

export interface ClientSubscription {
  id: string;
  clientId: string;
  userId: string;
  filters: SubscriptionFilter;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  messageCount: number;
  preferences: {
    batchSize?: number;
    throttleMs?: number;
    priority?: 'low' | 'medium' | 'high';
  };
}

@Injectable()
export class AuditSubscriptionService {
  private readonly logger = new Logger(AuditSubscriptionService.name);
  private readonly subscriptions = new Map<string, ClientSubscription>();
  private readonly clientSubscriptions = new Map<string, Set<string>>();
  private readonly userSubscriptions = new Map<string, Set<string>>();

  constructor(private readonly auditService: AuditService) {}

  /**
   * Create a new subscription for a client
   */
  createSubscription(
    clientId: string,
    userId: string,
    filters: SubscriptionFilter,
    preferences: ClientSubscription['preferences'] = {},
  ): ClientSubscription {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const subscription: ClientSubscription = {
      id: subscriptionId,
      clientId,
      userId,
      filters: {
        eventTypes: filters.eventTypes || ['*'],
        severities: filters.severities || ['*'],
        resources: filters.resources || ['*'],
        users: filters.users || ['*'],
        minSeverity: filters.minSeverity || 'low',
        schoolIds: filters.schoolIds || ['*'],
        excludeUsers: filters.excludeUsers || [],
        excludeResources: filters.excludeResources || [],
      },
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      messageCount: 0,
      preferences: {
        batchSize: preferences.batchSize || 10,
        throttleMs: preferences.throttleMs || 100,
        priority: preferences.priority || 'medium',
      },
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Index by client
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(subscriptionId);

    // Index by user
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set());
    }
    this.userSubscriptions.get(userId)!.add(subscriptionId);

    this.logger.log(`Created subscription ${subscriptionId} for client ${clientId} (user: ${userId})`);

    // Audit the subscription creation
    this.auditService.logActivity({
      userId,
      action: AuditAction.DATA_ACCESSED,
      resource: 'websocket_subscription',
      resourceId: subscriptionId,
      details: {
        eventType: 'subscription_created',
        clientId,
        filters: subscription.filters,
      },
      severity: AuditSeverity.LOW,
    });

    return subscription;
  }

  /**
   * Update an existing subscription
   */
  updateSubscription(subscriptionId: string, updates: Partial<SubscriptionFilter>): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.isActive) {
      return false;
    }

    subscription.filters = { ...subscription.filters, ...updates };
    subscription.lastActivity = new Date();

    this.logger.log(`Updated subscription ${subscriptionId} with filters: ${JSON.stringify(updates)}`);

    // Audit the subscription update
    this.auditService.logActivity({
      userId: subscription.userId,
      action: AuditAction.DATA_UPDATED,
      resource: 'websocket_subscription',
      resourceId: subscriptionId,
      details: {
        eventType: 'subscription_updated',
        updates,
      },
      severity: AuditSeverity.LOW,
    });

    return true;
  }

  /**
   * Remove a subscription
   */
  removeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    subscription.isActive = false;

    // Remove from indexes
    this.clientSubscriptions.get(subscription.clientId)?.delete(subscriptionId);
    this.userSubscriptions.get(subscription.userId)?.delete(subscriptionId);

    this.logger.log(`Removed subscription ${subscriptionId} for client ${subscription.clientId}`);

    // Audit the subscription removal
    this.auditService.logActivity({
      userId: subscription.userId,
      action: AuditAction.DATA_DELETED,
      resource: 'websocket_subscription',
      resourceId: subscriptionId,
      details: {
        eventType: 'subscription_removed',
        clientId: subscription.clientId,
        messageCount: subscription.messageCount,
      },
      severity: AuditSeverity.LOW,
    });

    return true;
  }

  /**
   * Get subscriptions for a client
   */
  getClientSubscriptions(clientId: string): ClientSubscription[] {
    const subscriptionIds = this.clientSubscriptions.get(clientId);
    if (!subscriptionIds) return [];

    return Array.from(subscriptionIds)
      .map(id => this.subscriptions.get(id))
      .filter(sub => sub && sub.isActive) as ClientSubscription[];
  }

  /**
   * Get subscriptions for a user
   */
  getUserSubscriptions(userId: string): ClientSubscription[] {
    const subscriptionIds = this.userSubscriptions.get(userId);
    if (!subscriptionIds) return [];

    return Array.from(subscriptionIds)
      .map(id => this.subscriptions.get(id))
      .filter(sub => sub && sub.isActive) as ClientSubscription[];
  }

  /**
   * Check if an event matches a subscription's filters
   */
  matchesSubscription(event: AuditLogData, subscription: ClientSubscription): boolean {
    const { filters } = subscription;

    // Check event types
    if (filters.eventTypes && filters.eventTypes.length > 0 && !filters.eventTypes.includes('*')) {
      const eventType = this.getEventType(event);
      if (!filters.eventTypes.includes(eventType)) {
        return false;
      }
    }

    // Check severities
    if (filters.severities && filters.severities.length > 0 && !filters.severities.includes('*')) {
      if (!filters.severities.includes(event.severity || 'medium')) {
        return false;
      }
    }

    // Check minimum severity
    if (filters.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const eventLevel = severityLevels[event.severity || 'medium'];
      const minLevel = severityLevels[filters.minSeverity as keyof typeof severityLevels];
      if (eventLevel < minLevel) {
        return false;
      }
    }

    // Check resources
    if (filters.resources && filters.resources.length > 0 && !filters.resources.includes('*')) {
      if (!filters.resources.includes(event.resource)) {
        return false;
      }
    }

    // Check excluded resources
    if (filters.excludeResources && filters.excludeResources.includes(event.resource)) {
      return false;
    }

    // Check users
    if (filters.users && filters.users.length > 0 && !filters.users.includes('*')) {
      if (!filters.users.includes(event.userId)) {
        return false;
      }
    }

    // Check excluded users
    if (filters.excludeUsers && filters.excludeUsers.includes(event.userId)) {
      return false;
    }

    // Check school IDs
    if (filters.schoolIds && filters.schoolIds.length > 0 && !filters.schoolIds.includes('*')) {
      if (!filters.schoolIds.includes(event.schoolId || 'system')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all active subscriptions that match an event
   */
  getMatchingSubscriptions(event: AuditLogData): ClientSubscription[] {
    const matchingSubscriptions: ClientSubscription[] = [];

    for (const subscription of this.subscriptions.values()) {
      if (subscription.isActive && this.matchesSubscription(event, subscription)) {
        matchingSubscriptions.push(subscription);
      }
    }

    return matchingSubscriptions;
  }

  /**
   * Update subscription activity
   */
  updateSubscriptionActivity(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.lastActivity = new Date();
      subscription.messageCount++;
    }
  }

  /**
   * Clean up inactive subscriptions
   */
  cleanupInactiveSubscriptions(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (!subscription.isActive || (now - subscription.lastActivity.getTime()) > maxAge) {
        this.removeSubscription(subscriptionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} inactive subscriptions`);
    }

    return cleanedCount;
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats() {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
    const totalClients = this.clientSubscriptions.size;
    const totalUsers = this.userSubscriptions.size;

    return {
      totalSubscriptions: activeSubscriptions.length,
      totalClients,
      totalUsers,
      averageSubscriptionsPerClient: totalClients > 0 ? activeSubscriptions.length / totalClients : 0,
      subscriptionsByPriority: activeSubscriptions.reduce((acc, sub) => {
        acc[sub.preferences.priority] = (acc[sub.preferences.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Extract event type from audit event
   */
  private getEventType(event: AuditLogData): string {
    if (event.details?.eventType) {
      return event.details.eventType;
    }

    // Map action to event type
    const actionToType: Record<string, string> = {
      [AuditAction.LOGIN]: 'authentication',
      [AuditAction.LOGOUT]: 'authentication',
      [AuditAction.USER_CREATED]: 'user_management',
      [AuditAction.USER_UPDATED]: 'user_management',
      [AuditAction.USER_DELETED]: 'user_management',
      [AuditAction.DATA_CREATED]: 'data_operation',
      [AuditAction.DATA_UPDATED]: 'data_operation',
      [AuditAction.DATA_DELETED]: 'data_operation',
      [AuditAction.SECURITY_ALERT]: 'security',
      [AuditAction.SYSTEM_CONFIG_CHANGED]: 'system',
    };

    return actionToType[event.action as string] || 'general';
  }
}