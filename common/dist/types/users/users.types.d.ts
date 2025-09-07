export declare enum EUserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending",
    DELETED = "deleted"
}
export declare enum EUserRole {
    SUPER_ADMIN = "super-admin",
    DELEGATED_SUPER_ADMIN = "delegated-super-admin",
    SCHOOL_ADMIN = "school-admin",
    TEACHER = "teacher",
    STUDENT = "student",
    PARENT = "parent"
}
export declare enum TUserGender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare enum TUserTheme {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto"
}
export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    role: EUserRole;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    schoolId?: string;
    address?: IUserAddress;
    status: EUserStatus;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}
export interface IUserAddress {
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
export interface IUserProfile extends IUser {
    profile?: IUserProfileDetails;
    academic?: IUserAcademicInfo;
    preferences?: IUserPreferences;
    account?: IUserAccountInfo;
    permissions?: string[];
}
export interface IUserProfileDetails {
    avatar?: string;
    bio?: string;
    emergencyContact?: IUserEmergencyContact;
}
export interface IUserEmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
}
export interface IUserAcademicInfo {
    studentId?: string;
    grade?: string;
    section?: string;
    enrollmentDate?: string;
    graduationYear?: number;
    gpa?: number;
    subjects?: string[];
}
export interface IUserPreferences {
    theme: TUserTheme;
    language: string;
    timezone: string;
    notifications: IUserNotificationSettings;
    privacy: IUserPrivacySettings;
}
export interface IUserNotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
}
export interface IUserPrivacySettings {
    profileVisibility: 'public' | 'school' | 'private';
    showGrades: boolean;
    showActivities: boolean;
}
export interface IUserAccountInfo {
    status: EUserStatus;
    emailVerified: boolean;
    mfaEnabled: boolean;
    lastLogin: Date;
    accountCreated: Date;
    passwordLastChanged: Date;
}
export interface IUserPermissionRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    assignedAt: Date;
    assignedBy: string;
}
export interface IUserActivity {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    ipAddress?: string;
    device?: string;
    location?: string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
}
export interface IUserNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'unread' | 'read' | 'archived';
    actionUrl?: string;
    actionText?: string;
    expiresAt?: Date;
}
export interface ICreateUserRequest {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    role?: EUserRole;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    schoolId?: string;
    address?: IUserAddress;
    status?: EUserStatus;
}
export interface IUpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: Partial<IUserAddress>;
    status?: EUserStatus;
}
export interface IUpdateUserProfileRequest {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: TUserGender;
    address?: Partial<IUserAddress>;
    bio?: string;
    emergencyContact?: IUserEmergencyContact;
}
export interface IUpdateUserPreferencesRequest {
    theme?: TUserTheme;
    language?: string;
    timezone?: string;
    notifications?: Partial<IUserNotificationSettings>;
    privacy?: Partial<IUserPrivacySettings>;
}
export interface IMarkNotificationReadRequest {
    notificationId: string;
}
export interface IUpdatePrivacySettingsRequest {
    profileVisibility?: 'public' | 'school' | 'private';
    gradeVisibility?: 'parents_teachers' | 'teachers_only' | 'private';
    activityVisibility?: 'public' | 'school' | 'private';
    contactVisibility?: 'public' | 'school' | 'private';
    dataSharing?: {
        analytics?: boolean;
        research?: boolean;
        thirdParty?: boolean;
        marketing?: boolean;
    };
    dataRetention?: {
        deleteAfterGraduation?: boolean;
        anonymizeData?: boolean;
        exportData?: boolean;
    };
}
export interface IRequestDataActionRequest {
    type: 'data_export' | 'data_deletion' | 'data_anonymization';
    reason?: string;
}
export interface IDeactivateAccountRequest {
    reason?: string;
    confirmDeactivation: boolean;
}
export interface IUserResponse extends Omit<IUser, 'createdAt' | 'updatedAt'> {
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserProfileResponse extends IUserResponse {
    profile?: IUserProfileDetails;
    academic?: IUserAcademicInfo;
    preferences?: IUserPreferences;
    account?: IUserAccountInfo;
    permissions?: string[];
}
export interface IUsersListResponse {
    users: IUserResponse[];
    total: number;
    page: number;
    limit: number;
    summary?: {
        activeUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalStaff: number;
    };
}
export interface IUserRolesResponse {
    userId: string;
    primaryRole: string;
    roles: IUserPermissionRole[];
    effectivePermissions: string[];
    restrictions?: string[];
}
export interface IUserActivityResponse {
    userId: string;
    dateRange: {
        start: string;
        end: string;
    };
    totalActivities: number;
    activities: IUserActivity[];
    summary: {
        loginCount: number;
        contentViews: number;
        assignmentsSubmitted: number;
        quizzesCompleted: number;
        discussionsParticipated: number;
        totalTimeSpent: string;
        averageSessionDuration: string;
        mostActiveDay: string;
        mostActiveHour: string;
    };
    engagement: {
        overallScore: number;
        consistency: number;
        participation: number;
        improvement: number;
        streak: {
            current: number;
            longest: number;
            lastBreak?: Date;
        };
    };
}
export interface IUserNotificationsResponse {
    userId: string;
    totalNotifications: number;
    unreadCount: number;
    notifications: IUserNotification[];
    settings: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        quietHours?: {
            enabled: boolean;
            startTime: string;
            endTime: string;
        };
        categories: Record<string, {
            enabled: boolean;
            priority: string;
        }>;
    };
}
export interface IUserPrivacySettingsResponse {
    userId: string;
    privacySettings: {
        profileVisibility: {
            current: string;
            options: string[];
            description: string;
        };
        gradeVisibility: {
            current: string;
            options: string[];
            description: string;
        };
        activityVisibility: {
            current: string;
            options: string[];
            description: string;
        };
        contactVisibility: {
            current: string;
            options: string[];
            description: string;
        };
        dataSharing: {
            analytics: boolean;
            research: boolean;
            thirdParty: boolean;
            marketing: boolean;
        };
        dataRetention: {
            deleteAfterGraduation: boolean;
            anonymizeData: boolean;
            exportData: boolean;
        };
    };
    dataRequests: Array<{
        id: string;
        type: string;
        status: string;
        requestedAt: Date;
        completedAt?: Date;
        downloadUrl?: string;
        estimatedCompletion?: string;
    }>;
    consentHistory: Array<{
        id: string;
        type: string;
        version: string;
        consentedAt: Date;
        ipAddress: string;
        userAgent: string;
    }>;
}
export interface IUserSecuritySettingsResponse {
    userId: string;
    securitySettings: {
        password: {
            lastChanged: Date;
            strength: string;
            requiresChange: boolean;
            changeFrequency: string;
        };
        twoFactorAuth: {
            enabled: boolean;
            method: string;
            configuredAt: Date;
            lastUsed: Date;
            backupCodesRemaining: number;
        };
        loginAlerts: {
            newDevice: boolean;
            newLocation: boolean;
            suspiciousActivity: boolean;
            failedAttempts: boolean;
        };
        sessionManagement: {
            autoLogout: boolean;
            maxSessionDuration: string;
            concurrentSessions: number;
            rememberDevice: boolean;
        };
        trustedDevices: Array<{
            id: string;
            name: string;
            type: string;
            browser: string;
            os: string;
            lastUsed: Date;
            trusted: boolean;
        }>;
        securityQuestions: {
            configured: boolean;
            questionsCount: number;
            lastUpdated: Date;
        };
        accountRecovery: {
            emailRecovery: boolean;
            phoneRecovery: boolean;
            securityQuestions: boolean;
            backupCodes: boolean;
        };
    };
    securityScore: {
        overall: number;
        factors: Record<string, number>;
        recommendations: string[];
    };
}
export interface IMarkNotificationReadResponse {
    notificationId: string;
    readAt: Date;
    message: string;
}
export interface IMarkAllNotificationsReadResponse {
    markedCount: number;
    markedAt: Date;
    message: string;
}
export interface IUpdatePrivacySettingsResponse {
    userId: string;
    updatedSettings: IUpdatePrivacySettingsRequest;
    updatedAt: Date;
    message: string;
}
export interface IRequestDataActionResponse {
    requestId: string;
    type: string;
    status: string;
    submittedAt: Date;
    estimatedCompletion: string;
    message: string;
}
export interface IDeactivateAccountResponse {
    userId: string;
    deactivationRequested: boolean;
    requestedAt: Date;
    effectiveDate: Date;
    status: string;
    message: string;
}
export interface IDeleteAccountResponse {
    userId: string;
    deletedAt: Date;
    status: string;
    message: string;
}
export interface IUserFiltersQuery {
    schoolId?: string;
    role?: IUserPermissionRole;
    status?: EUserStatus;
    emailVerified?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
    search?: string;
    grade?: string;
    section?: string;
}
export interface IUserActivityFiltersQuery {
    limit?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    resource?: string;
}
export interface IUserNotificationFiltersQuery {
    status?: 'unread' | 'read' | 'archived';
    type?: string;
    limit?: number;
    priority?: 'low' | 'medium' | 'high';
}
export interface IUsersStatisticsResponse {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<EUserRole, number>;
    usersByStatus: Record<EUserStatus, number>;
    usersByGender: Record<TUserGender, number>;
    registrationTrends: Array<{
        date: Date;
        registrations: number;
    }>;
    loginTrends: Array<{
        date: Date;
        logins: number;
    }>;
    topSchools: Array<{
        schoolId: string;
        schoolName: string;
        userCount: number;
    }>;
}
