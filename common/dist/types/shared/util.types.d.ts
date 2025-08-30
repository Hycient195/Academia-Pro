import { BaseEntity, UserRole, UserStatus, UserPreferences, Address } from './types';
import { z } from 'zod';
export interface User extends BaseEntity {
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
    passwordHash?: string;
}
export interface Teacher extends User {
    role: 'teacher';
    employeeId: string;
    department?: string;
    subjects: string[];
    qualifications: Qualification[];
    experience: number;
    specializations: string[];
    classTeacherOf?: string[];
}
export interface Student extends User {
    role: 'student';
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
    role: 'parent';
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
    address?: Address;
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
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
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
    name: UserRole;
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
    role: UserRole;
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
    role?: UserRole;
    status?: UserStatus;
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
export interface UserProfileResponse extends User {
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
    tokens: AuthTokens;
    requiresMFA?: boolean;
    requiresPasswordChange?: boolean;
}
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["super-admin", "school-admin", "teacher", "student", "parent"]>;
    phone: z.ZodOptional<z.ZodString>;
    schoolId: z.ZodOptional<z.ZodString>;
    sendWelcomeEmail: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: "super-admin" | "school-admin" | "teacher" | "student" | "parent";
    sendWelcomeEmail: boolean;
    phone?: string | undefined;
    schoolId?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    role: "super-admin" | "school-admin" | "teacher" | "student" | "parent";
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
export type { UserRole, UserStatus, UserPreferences, Address } from './types';
//# sourceMappingURL=util.types.d.ts.map