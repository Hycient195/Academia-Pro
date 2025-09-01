import { z } from 'zod';
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface SoftDeleteEntity extends BaseEntity {
    deletedAt?: Date;
    deletedBy?: string;
    isDeleted: boolean;
}
export type UserRole = 'super-admin' | 'school-admin' | 'teacher' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    address?: Address;
    schoolId?: string;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserPreferences {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
}
export interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    system: boolean;
}
export interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'school-only';
    contactVisibility: 'public' | 'private' | 'school-only';
    dataSharing: boolean;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export type SchoolStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export interface School {
    id: string;
    name: string;
    code: string;
    description?: string;
    address: Address;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    status: SchoolStatus;
    type: 'primary' | 'secondary' | 'mixed';
    establishedYear?: number;
    accreditation?: string;
    timezone: string;
    currency: string;
    language: string;
    settings: SchoolSettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface SchoolSettings {
    academicYear: {
        startMonth: number;
        endMonth: number;
    };
    workingDays: number[];
    attendance: {
        requiredPercentage: number;
        gracePeriodMinutes: number;
    };
    grading: {
        scale: 'percentage' | 'gpa' | 'letter';
        passingGrade: number;
    };
    communication: {
        primaryLanguage: string;
        supportedLanguages: string[];
    };
}
export interface Grade {
    id: string;
    name: string;
    level: number;
    schoolId: string;
    description?: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Section {
    id: string;
    name: string;
    gradeId: string;
    capacity: number;
    currentEnrollment: number;
    classTeacherId?: string;
    roomNumber?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Subject {
    id: string;
    name: string;
    code: string;
    description?: string;
    category: 'core' | 'elective' | 'practical' | 'language';
    credits: number;
    hoursPerWeek: number;
    isActive: boolean;
    prerequisites?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export type Status = 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface SearchOptions {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
export interface FilterOptions {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startswith';
    value: any;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: ValidationError[];
    meta?: {
        timestamp: Date;
        version: string;
        requestId: string;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}
export interface FileUpload {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedBy: string;
    uploadedAt: Date;
}
export interface FileUploadOptions {
    maxSize?: number;
    allowedTypes?: string[];
    generateThumbnail?: boolean;
    folder?: string;
}
export interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'view' | 'export';
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    userId: string;
    userRole: UserRole;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    channels: NotificationChannel[];
    recipients: string[];
    scheduledAt?: Date;
    sentAt?: Date;
    readAt?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const addressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
    coordinates: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        latitude?: number;
        longitude?: number;
    }, {
        latitude?: number;
        longitude?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
}, {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}, {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dateRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start?: Date;
        end?: Date;
    }, {
        start?: Date;
        end?: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
}, {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
}>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type AnyEntity = User | School | Grade | Section | Subject;
export type AnyStatus = Status | UserStatus | SchoolStatus | ApprovalStatus;
export type AnyRole = UserRole;
