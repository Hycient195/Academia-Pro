import { z } from 'zod';
import { EUserRole, EUserStatus, IUserPermissionRole } from '../users';
import { IAuthTokens } from '../auth';
export interface IDocument {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
    isVerified: boolean;
    verificationDate?: Date;
    verifiedBy?: string;
}
export interface IEmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    priority: number;
    address: string;
}
export interface IDepreciationEntry {
    period: string;
    depreciationAmount: number;
    accumulatedDepreciation: number;
    currentValue: number;
    calculationDate: Date;
}
export declare enum TCommunicationType {
    ANNOUNCEMENT = "announcement",
    ASSIGNMENT = "assignment",
    GRADE = "grade",
    ATTENDANCE = "attendance",
    EVENT = "event",
    EMERGENCY = "emergency",
    GENERAL = "general"
}
export declare enum TCommunicationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app",
    CALL = "call"
}
export interface IAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    acknowledgedAt?: Date;
    actionRequired: boolean;
    actionUrl?: string;
}
export interface INotification {
    id: string;
    type: TCommunicationType;
    communicationChannel: TCommunicationChannel;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: TMessagePriority;
    studentId?: string;
    studentName?: string;
    actionUrl?: string;
    expiresAt?: Date;
}
export declare enum TDepreciationMethod {
    STRAIGHT_LINE = "straight_line",
    DECLINING_BALANCE = "declining_balance",
    UNITS_OF_PRODUCTION = "units_of_production"
}
export interface IInsuranceInfo {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
    startDate: Date;
    endDate: Date;
    deductible: number;
}
export interface IFinancialInfo {
    purchasePrice: number;
    salvageValue: number;
    usefulLife: number;
    depreciationMethod: TDepreciationMethod;
    accumulatedDepreciation: number;
    currentValue: number;
    depreciationSchedule: IDepreciationEntry[];
    insurance?: IInsuranceInfo;
}
export interface ISchoolFilters {
    type?: TSchoolType;
    status?: TSchoolStatus;
    city?: string;
    state?: string;
    country?: string;
    establishedAfter?: string;
    establishedBefore?: string;
    minStudents?: number;
    maxStudents?: number;
    hasFacilities?: string[];
    search?: string;
}
export declare enum TBloodGroup {
    A_POSITIVE = "A+",
    A_NEGATIVE = "A-",
    B_POSITIVE = "B+",
    B_NEGATIVE = "B-",
    AB_POSITIVE = "AB+",
    AB_NEGATIVE = "AB-",
    O_POSITIVE = "O+",
    O_NEGATIVE = "O-"
}
export interface IAddress {
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
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    roles: EUserRole[];
    status: EUserStatus;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    address?: IAddress;
    schoolId?: string;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    preferences: UserPreferences;
    passwordHash?: string;
}
export interface Teacher extends User {
    roles: EUserRole[];
    employeeId: string;
    department?: string;
    subjects: string[];
    qualifications: Qualification[];
    experience: number;
    specializations: string[];
    classTeacherOf?: string[];
}
export interface Student extends User {
    roles: EUserRole[];
    studentId: string;
    gradeId: string;
    sectionId: string;
    enrollmentDate: Date;
    parentIds: string[];
    emergencyContacts: EmergencyContact[];
    medicalInfo?: MedicalInfo;
    academicInfo: AcademicInfo;
}
export interface Parent extends User {
    roles: EUserRole[];
    childrenIds: string[];
    relationship: 'father' | 'mother' | 'guardian' | 'other';
    occupation?: string;
    workplace?: string;
    emergencyContact: boolean;
}
export interface Qualification {
    id: string;
    degree: string;
    institution: string;
    year: number;
    grade?: string;
    specialization?: string;
}
export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: IAddress;
    isPrimary: boolean;
}
export interface MedicalInfo {
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    doctorName?: string;
    doctorPhone?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
}
export interface AcademicInfo {
    previousSchool?: string;
    transferCertificate?: string;
    achievements?: string[];
    specialNeeds?: string[];
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    languageProficiency?: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
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
export type SchoolStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export declare enum TSchoolType {
    PRESCHOOL = "preschool",
    ELEMENTARY = "elementary",
    MIDDLE_SCHOOL = "middle_school",
    HIGH_SCHOOL = "high_school",
    SENIOR_SECONDARY = "senior_secondary",
    UNIVERSITY = "university",
    COLLEGE = "college",
    INSTITUTE = "institute",
    TRAINING_CENTER = "training_center",
    PRIMARY = "primary",
    SECONDARY = "secondary",
    MIXED = "mixed"
}
export declare enum TSchoolStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    CLOSED = "closed"
}
export interface School {
    id: string;
    name: string;
    code: string;
    description?: string;
    address: IAddress;
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
export interface ISchoolSettings {
    schoolId: string;
    generalSettings: {
        timezone: string;
        currency: string;
        language: string;
        dateFormat: string;
        timeFormat: string;
    };
    academicSettings: {
        academicYearFormat: string;
        gradingScale: Array<{
            grade: string;
            minScore: number;
            maxScore: number;
            description: string;
        }>;
        attendanceThreshold: number;
        promotionCriteria: {
            minimumAttendance: number;
            minimumGrade: string;
            requiredSubjects: string[];
        };
    };
    communicationSettings: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        parentPortalEnabled: boolean;
        studentPortalEnabled: boolean;
        emergencyAlertsEnabled: boolean;
    };
    securitySettings: {
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
        };
        sessionTimeout: number;
        maxLoginAttempts: number;
        twoFactorEnabled: boolean;
    };
}
export declare enum TGradeLevel {
    NURSERY = "nursery",
    LKG = "lkg",
    UKG = "ukg",
    GRADE_1 = "grade_1",
    GRADE_2 = "grade_2",
    GRADE_3 = "grade_3",
    GRADE_4 = "grade_4",
    GRADE_5 = "grade_5",
    GRADE_6 = "grade_6",
    GRADE_7 = "grade_7",
    GRADE_8 = "grade_8",
    GRADE_9 = "grade_9",
    GRADE_10 = "grade_10",
    GRADE_11 = "grade_11",
    GRADE_12 = "grade_12"
}
export declare enum TSubjectType {
    CORE = "core",
    ELECTIVE = "elective",
    PRACTICAL = "practical",
    LANGUAGE = "language",
    ARTS = "arts",
    SPORTS = "sports"
}
export interface IClassSubject {
    subjectId: string;
    subject: ISubject;
    teacherId: string;
    schedule: ISubjectSchedule[];
}
export interface ISubjectSchedule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
}
export interface ISubject {
    id: string;
    code: string;
    name: string;
    type: TSubjectType;
    description?: string;
    grade: string;
    teacherId?: string;
    credits?: number;
    prerequisites?: string[];
    gradeLevels: TGradeLevel[];
    isActive: boolean;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IClass {
    id: string;
    name: string;
    gradeLevel: TGradeLevel;
    section: string;
    capacity: number;
    currentEnrollment: number;
    classTeacherId?: string;
    academicYear: string;
    subjects: IClassSubject[];
    isActive: boolean;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export type Status = 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export declare enum TMessagePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}
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
    userRole: IUserPermissionRole;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export declare enum TNotificationType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';
export interface Notification {
    id: string;
    type: TNotificationType;
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
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}, {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dateRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    query?: string | undefined;
    filters?: Record<string, any> | undefined;
    dateRange?: {
        start: Date;
        end: Date;
    } | undefined;
}, {
    query?: string | undefined;
    filters?: Record<string, any> | undefined;
    dateRange?: {
        start: Date;
        end: Date;
    } | undefined;
}>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type AnyEntity = User | School | Grade | Section | ISubject;
export type AnyStatus = Status | EUserStatus | SchoolStatus | ApprovalStatus;
export type AnyRole = IUserPermissionRole;
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
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: EUserRole[];
    status: EUserStatus;
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
    userRole: IUserPermissionRole;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface PasswordResetRequest {
    email: string;
}
export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    address?: Address;
    avatar?: any;
    preferences?: Partial<UserPreferences>;
}
export interface UpdateTeacherProfileRequest extends UpdateProfileRequest {
    department?: string;
    qualifications?: Qualification[];
    specializations?: string[];
    experience?: number;
}
export interface UpdateStudentProfileRequest extends UpdateProfileRequest {
    emergencyContacts?: EmergencyContact[];
    medicalInfo?: MedicalInfo;
}
export interface UpdateParentProfileRequest extends UpdateProfileRequest {
    occupation?: string;
    workplace?: string;
}
export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    module: string;
}
export interface Role {
    id: string;
    name: IUserPermissionRole;
    displayName: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    schoolId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface RoleAssignment {
    userId: string;
    roleId: string;
    assignedBy: string;
    assignedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
}
export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    roles: EUserRole[];
    phone?: string;
    schoolId?: string;
    sendWelcomeEmail?: boolean;
}
export interface BulkUserOperation {
    operation: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
    users: string[];
    data?: Record<string, any>;
}
export interface UserSearchFilters {
    roles?: EUserRole[];
    status?: EUserStatus;
    schoolId?: string;
    gradeId?: string;
    sectionId?: string;
    searchQuery?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
export interface UserActivity {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    schoolId?: string;
}
export interface LoginAttempt {
    id: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    failureReason?: string;
    timestamp: Date;
}
export interface SecuritySettings {
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        preventReuse: number;
    };
    sessionPolicy: {
        maxConcurrentSessions: number;
        sessionTimeout: number;
        extendOnActivity: boolean;
    };
    loginPolicy: {
        maxFailedAttempts: number;
        lockoutDuration: number;
        requireMFA: boolean;
    };
}
export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}
export interface UserProfileResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userRoles: EUserRole[];
    status: EUserStatus;
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
    roles: Role[];
    permissions: Permission[];
    recentActivity: UserActivity[];
    stats: {
        loginCount: number;
        lastLoginAt?: Date;
        accountAge: number;
    };
}
export interface AuthResponse {
    user: User;
    tokens: IAuthTokens;
    requiresMFA?: boolean;
    requiresPasswordChange?: boolean;
}
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    roles: z.ZodArray<z.ZodEnum<["super-admin", "delegated-super-admin", "school-admin", "teacher", "student", "parent"]>, "many">;
    phone: z.ZodOptional<z.ZodString>;
    schoolId: z.ZodOptional<z.ZodString>;
    sendWelcomeEmail: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    roles: ("super-admin" | "delegated-super-admin" | "school-admin" | "teacher" | "student" | "parent")[];
    sendWelcomeEmail: boolean;
    phone?: string | undefined;
    schoolId?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    roles: ("super-admin" | "delegated-super-admin" | "school-admin" | "teacher" | "student" | "parent")[];
    phone?: string | undefined;
    schoolId?: string | undefined;
    sendWelcomeEmail?: boolean | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodDate>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | "other" | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    } | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | "other" | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    } | undefined;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
