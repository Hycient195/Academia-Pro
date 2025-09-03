// Academia Pro - User Management Module Types
// Types and interfaces for user management functionality

import { BaseEntity, UserRole, UserStatus, UserPreferences, Address } from './types';
import { User, Teacher, Student, Parent, Qualification, EmergencyContact, MedicalInfo, AcademicInfo } from './shared.types';
import { z } from 'zod';

// Re-export shared types for backward compatibility
export type { User, Teacher, Student, Parent, Qualification, EmergencyContact, MedicalInfo, AcademicInfo };

// Authentication Types
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

// Profile Management Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  avatar?: any; // File upload handled by frontend
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

// Role and Permission Types
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
  schoolId?: string; // For school-specific roles
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

// User Management Operations
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
  users: string[]; // User IDs
  data?: Record<string, any>; // For update operations
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

// Audit and Security Types
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
    preventReuse: number; // Number of previous passwords to prevent
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number; // minutes
    extendOnActivity: boolean;
  };
  loginPolicy: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireMFA: boolean;
  };
}

// API Response Types
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
    accountAge: number; // days
  };
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  requiresMFA?: boolean;
  requiresPasswordChange?: boolean;
}

// Validation Schemas (using Zod)
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['super-admin', 'school-admin', 'teacher', 'student', 'parent']),
  phone: z.string().optional(),
  schoolId: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(true),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Export types for use in other modules
export type { UserRole, UserStatus, UserPreferences, Address } from './types';