// Academia Pro - Communication Interceptor
// Response transformation and logging interceptor for communication operations

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CommunicationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, user } = request;
    const startTime = Date.now();

    this.logger.log(
      `Communication Request: ${method} ${url} by user ${user?.id || 'anonymous'}`,
    );

    return next.handle().pipe(
      map((data) => {
        const processingTime = Date.now() - startTime;

        // Log successful operations
        this.logger.log(
          `Communication Response: ${method} ${url} - ${processingTime}ms`,
        );

        // Transform response based on operation type
        if (this.isMessageOperation(url)) {
          return this.transformMessageResponse(data);
        }

        if (this.isNotificationOperation(url)) {
          return this.transformNotificationResponse(data);
        }

        if (this.isNoticeOperation(url)) {
          return this.transformNoticeResponse(data);
        }

        if (this.isAnalyticsOperation(url)) {
          return this.transformAnalyticsResponse(data);
        }

        // Add metadata to all responses
        return this.addResponseMetadata(data, processingTime);
      }),
    );
  }

  private isMessageOperation(url: string): boolean {
    return url.includes('/messages');
  }

  private isNotificationOperation(url: string): boolean {
    return url.includes('/notifications');
  }

  private isNoticeOperation(url: string): boolean {
    return url.includes('/notices');
  }

  private isAnalyticsOperation(url: string): boolean {
    return url.includes('/analytics');
  }

  private transformMessageResponse(data: any): any {
    if (Array.isArray(data)) {
      return {
        messages: data.map(message => this.sanitizeMessage(message)),
        count: data.length,
        ...this.addResponseMetadata({}, 0),
      };
    }

    return {
      message: this.sanitizeMessage(data),
      ...this.addResponseMetadata({}, 0),
    };
  }

  private transformNotificationResponse(data: any): any {
    if (Array.isArray(data)) {
      return {
        notifications: data.map(notification => this.sanitizeNotification(notification)),
        count: data.length,
        ...this.addResponseMetadata({}, 0),
      };
    }

    return {
      notification: this.sanitizeNotification(data),
      ...this.addResponseMetadata({}, 0),
    };
  }

  private transformNoticeResponse(data: any): any {
    if (Array.isArray(data)) {
      return {
        notices: data.map(notice => this.sanitizeNotice(notice)),
        count: data.length,
        ...this.addResponseMetadata({}, 0),
      };
    }

    return {
      notice: this.sanitizeNotice(data),
      ...this.addResponseMetadata({}, 0),
    };
  }

  private transformAnalyticsResponse(data: any): any {
    return {
      analytics: data,
      generatedAt: new Date().toISOString(),
      ...this.addResponseMetadata({}, 0),
    };
  }

  private sanitizeMessage(message: any): any {
    if (!message) return message;

    // Remove sensitive internal fields
    const { internalNotes, ...sanitizedMessage } = message;

    // Add computed fields
    return {
      ...sanitizedMessage,
      isRead: message.status === 'read',
      isUrgent: message.priority === 'urgent',
      hasAttachments: message.attachments && message.attachments.length > 0,
      formattedDate: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : null,
    };
  }

  private sanitizeNotification(notification: any): any {
    if (!notification) return notification;

    // Remove sensitive internal fields
    const { internalNotes, ...sanitizedNotification } = notification;

    // Add computed fields
    return {
      ...sanitizedNotification,
      isDelivered: notification.status === 'delivered',
      isUrgent: notification.priority === 'urgent',
      channel: notification.notificationType,
      formattedDate: notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : null,
    };
  }

  private sanitizeNotice(notice: any): any {
    if (!notice) return notice;

    // Remove sensitive internal fields
    const { internalNotes, ...sanitizedNotice } = notice;

    // Add computed fields
    return {
      ...sanitizedNotice,
      isPublished: notice.status === 'published',
      isUrgent: notice.priority === 'urgent',
      hasAttachments: notice.attachments && notice.attachments.length > 0,
      canComment: notice.allowComments,
      engagement: {
        views: notice.viewCount || 0,
        likes: notice.likeCount || 0,
        comments: notice.commentCount || 0,
        shares: notice.shareCount || 0,
      },
      formattedPublishDate: notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString() : null,
    };
  }

  private addResponseMetadata(data: any, processingTime: number): any {
    return {
      ...data,
      _metadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        apiVersion: 'v1',
        service: 'communication',
      },
    };
  }
}