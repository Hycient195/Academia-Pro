export declare enum TMessageType {
    DIRECT = "direct",
    GROUP = "group",
    ANNOUNCEMENT = "announcement",
    EMERGENCY = "emergency",
    SYSTEM = "system"
}
export declare enum TMessagePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TMessageStatus {
    DRAFT = "draft",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
    ARCHIVED = "archived"
}
export declare enum TRecipientType {
    STUDENT = "student",
    PARENT = "parent",
    TEACHER = "teacher",
    ADMIN = "admin",
    STAFF = "staff",
    ALL = "all",
    GROUP = "group"
}
export declare enum TNotificationType {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum TNotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    READ = "read"
}
export declare enum TNoticeType {
    GENERAL = "general",
    ACADEMIC = "academic",
    ADMINISTRATIVE = "administrative",
    EMERGENCY = "emergency",
    EVENT = "event"
}
export declare enum TTemplateType {
    MESSAGE = "message",
    NOTICE = "notice",
    NOTIFICATION = "notification",
    EMAIL = "email"
}
export interface IMessage {
    id: string;
    schoolId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    messageType: TMessageType;
    priority: TMessagePriority;
    status: TMessageStatus;
    subject: string;
    content: string;
    recipientId?: string;
    recipientName?: string;
    recipientRole?: string;
    recipientType?: TRecipientType;
    groupId?: string;
    groupName?: string;
    recipientsList: Array<{
        id: string;
        name: string;
        role: string;
        type: TRecipientType;
    }>;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedAt: Date;
    }>;
    parentMessageId?: string;
    threadId?: string;
    isReply: boolean;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    readBy: Array<{
        userId: string;
        userName: string;
        readAt: Date;
    }>;
    deliveryFailures: Array<{
        recipientId: string;
        recipientName: string;
        failureReason: string;
        failedAt: Date;
    }>;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
    scheduledSendAt?: Date;
    isScheduled: boolean;
    templateId?: string;
    templateName?: string;
    tags: string[];
    metadata?: {
        category?: string;
        urgency?: string;
        requiresResponse?: boolean;
        followUpRequired?: boolean;
        relatedRecords?: string[];
    };
    internalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    createdByName: string;
    updatedBy?: string;
    updatedByName?: string;
}
export interface INotice {
    id: string;
    schoolId: string;
    title: string;
    content: string;
    type: TNoticeType;
    priority: TMessagePriority;
    status: TMessageStatus;
    targetAudience: {
        allUsers: boolean;
        userTypes?: TRecipientType[];
        gradeLevels?: string[];
        sections?: string[];
        specificUsers?: string[];
    };
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    publishDate: Date;
    expiryDate?: Date;
    isPublished: boolean;
    publishedBy: string;
    publishedByName: string;
    viewCount: number;
    acknowledgementRequired: boolean;
    acknowledgements: Array<{
        userId: string;
        userName: string;
        acknowledgedAt: Date;
    }>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
export interface ICommunicationNotification {
    id: string;
    schoolId: string;
    userId: string;
    title: string;
    message: string;
    type: TNotificationType;
    status: TNotificationStatus;
    priority: TMessagePriority;
    data?: Record<string, any>;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    actionUrl?: string;
    actionText?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMessageTemplate {
    id: string;
    schoolId: string;
    name: string;
    type: TTemplateType;
    subject?: string;
    content: string;
    variables: string[];
    isActive: boolean;
    category?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
export interface ICreateMessageRequest {
    subject: string;
    content: string;
    messageType?: TMessageType;
    priority?: TMessagePriority;
    recipientId?: string;
    recipientName?: string;
    recipientRole?: string;
    recipientType?: TRecipientType;
    groupId?: string;
    groupName?: string;
    recipientsList?: Array<{
        id: string;
        name: string;
        role: string;
        type: TRecipientType;
    }>;
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    sendNotifications?: boolean;
    scheduledSendAt?: Date;
    templateId?: string;
    metadata?: Record<string, any>;
}
export interface IUpdateMessageRequest {
    subject?: string;
    content?: string;
    priority?: TMessagePriority;
    status?: TMessageStatus;
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    scheduledSendAt?: Date;
    metadata?: Record<string, any>;
}
export interface ICreateNoticeRequest {
    schoolId: string;
    noticeType: TNoticeType;
    priority?: TMessagePriority;
    title: string;
    content: string;
    summary?: string;
    visibilityLevel?: string;
    targetAudience?: {
        allUsers?: boolean;
        specificRoles?: string[];
        specificGrades?: string[];
        specificSections?: string[];
        specificUsers?: string[];
    };
    allowComments?: boolean;
    moderateComments?: boolean;
    sendNotifications?: boolean;
    expiresAt?: Date;
    tags?: string[];
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    publishImmediately?: boolean;
    metadata?: Record<string, any>;
}
export interface IUpdateNoticeRequest {
    title?: string;
    content?: string;
    type?: TNoticeType;
    priority?: TMessagePriority;
    targetAudience?: {
        allUsers: boolean;
        userTypes?: TRecipientType[];
        gradeLevels?: string[];
        sections?: string[];
        specificUsers?: string[];
    };
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    publishDate?: Date;
    expiryDate?: Date;
    acknowledgementRequired?: boolean;
    tags?: string[];
}
export interface ICreateNotificationRequest {
    schoolId: string;
    notificationType: TNotificationType;
    category: string;
    priority?: TMessagePriority;
    subject: string;
    message: string;
    recipientId?: string;
    recipientName?: string;
    email?: string;
    phoneNumber?: string;
    deviceToken?: string;
    whatsappNumber?: string;
    telegramChatId?: string;
    userPreferences?: {
        emailEnabled?: boolean;
        smsEnabled?: boolean;
        pushEnabled?: boolean;
        whatsappEnabled?: boolean;
        telegramEnabled?: boolean;
    };
    isScheduled?: boolean;
    scheduledSendAt?: Date;
    templateId?: string;
    metadata?: Record<string, any>;
}
export interface ICreateTemplateRequest {
    schoolId: string;
    name: string;
    description: string;
    templateType: TTemplateType;
    category?: string;
    subjectTemplate: string;
    contentTemplate: string;
    shortContentTemplate?: string;
    htmlTemplate?: string;
    variables?: Array<{
        name: string;
        type: 'string' | 'number' | 'date' | 'boolean';
        description: string;
        required: boolean;
        defaultValue?: any;
    }>;
    isActive?: boolean;
    tags?: string[];
    previewData?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface IUpdateTemplateRequest {
    name?: string;
    subject?: string;
    content?: string;
    variables?: string[];
    isActive?: boolean;
    category?: string;
    tags?: string[];
}
export interface IMessageResponse extends IMessage {
    replies?: IMessageResponse[];
    parentMessage?: IMessageResponse;
    deliveryStats: {
        totalRecipients: number;
        delivered: number;
        read: number;
        failed: number;
    };
}
export interface INoticeResponse extends INotice {
    acknowledgementStats: {
        totalRequired: number;
        acknowledged: number;
        pending: number;
    };
}
export interface ICommunicationNotificationResponse extends ICommunicationNotification {
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
export interface IMessageTemplateResponse extends IMessageTemplate {
    usageCount: number;
    lastUsed?: Date;
}
export interface IMessageListResponse {
    messages: IMessageResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
}
export interface INoticeListResponse {
    notices: INoticeResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ICommunicationNotificationListResponse {
    notifications: ICommunicationNotificationResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
}
export interface IMessageFilters {
    messageType?: TMessageType;
    priority?: TMessagePriority;
    status?: TMessageStatus;
    senderId?: string;
    recipientId?: string;
    groupId?: string;
    dateFrom?: string;
    dateTo?: string;
    hasAttachments?: boolean;
    isReply?: boolean;
    schoolId: string;
}
export interface INoticeFilters {
    type?: TNoticeType;
    priority?: TMessagePriority;
    status?: TMessageStatus;
    isPublished?: boolean;
    acknowledgementRequired?: boolean;
    dateFrom?: string;
    dateTo?: string;
    schoolId: string;
}
export interface INotificationFilters {
    type?: TNotificationType;
    status?: TNotificationStatus;
    priority?: TMessagePriority;
    userId?: string;
    isRead?: boolean;
    dateFrom?: string;
    dateTo?: string;
    schoolId: string;
}
export interface IMessageTemplateFilters {
    type?: TTemplateType;
    isActive?: boolean;
    category?: string;
    schoolId: string;
}
export interface ICommunicationStatistics {
    totalMessages: number;
    totalNotices: number;
    totalNotifications: number;
    messagesByType: Record<TMessageType, number>;
    messagesByPriority: Record<TMessagePriority, number>;
    messagesByStatus: Record<TMessageStatus, number>;
    noticesByType: Record<TNoticeType, number>;
    notificationsByType: Record<TNotificationType, number>;
    notificationsByStatus: Record<TNotificationStatus, number>;
    deliveryRates: {
        messages: number;
        notifications: number;
    };
    responseRates: {
        notices: number;
        messages: number;
    };
}
export interface IBulkMessageRequest {
    messages: ICreateMessageRequest[];
    sendImmediately?: boolean;
}
export interface IBulkNotificationRequest {
    notifications: ICreateNotificationRequest[];
    sendImmediately?: boolean;
}
export interface ICommunicationSettings {
    defaultMessagePriority: TMessagePriority;
    allowScheduledMessages: boolean;
    maxAttachmentSize: number;
    allowedFileTypes: string[];
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    autoArchiveAfter: number;
    retentionPeriod: number;
}
