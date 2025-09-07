// Academia Pro - Auth Types
// Shared type definitions for authentication module

import { EUserRole } from "../users";

// Enums
export enum TAuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export enum TMFAType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum TSessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum TLoginAttemptStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}


export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  issuedAt: Date;
}

// Interfaces
export interface IAuthUser {
   id: string;
   email: string;
   firstName: string;
   lastName: string;
   roles: EUserRole[];
   schoolId?: string;
   isEmailVerified: boolean;
   mfaEnabled: boolean;
   lastLoginAt?: Date;
}

export interface IRefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
}

export interface ISession {
  id: string;
  userId: string;
  token: string;
  status: TSessionStatus;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: IDeviceInfo;
  location?: ILocationInfo;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface IDeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  isTrusted: boolean;
}

export interface ILocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ILoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  status: TLoginAttemptStatus;
  attemptedAt: Date;
  failureReason?: string;
  location?: ILocationInfo;
}

export interface IMFAConfig {
  id: string;
  userId: string;
  type: TMFAType;
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  email?: string;
  configuredAt: Date;
  lastUsedAt?: Date;
}

export interface ISSOConfig {
  id: string;
  provider: TAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scopes: string[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: TAuthProvider;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Request Interfaces
export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: IDeviceInfo;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: EUserRole;
  phone?: string;
  dateOfBirth?: string;
  schoolId?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordRequest {
  email: string;
}

export interface IVerifyEmailRequest {
  token: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface ILogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface ISetupMFARequest {
  type: TMFAType;
  phoneNumber?: string;
  email?: string;
}

export interface IVerifyMFARequest {
  code: string;
  type: TMFAType;
}

export interface IVerifyMFASetupRequest {
  code: string;
  secret: string;
  type: TMFAType;
}

export interface IRevokeMFASetupRequest {
  type: TMFAType;
  reason?: string;
}

export interface IOAuthLoginRequest {
  provider: TAuthProvider;
  code: string;
  state?: string;
  redirectUrl: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordWithTokenRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IVerifyResetTokenRequest {
  token: string;
}

export interface IResendVerificationRequest {
  email: string;
}

export interface IChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface IVerifyEmailChangeRequest {
  token: string;
}

// Response Interfaces
export interface ILoginResponse {
  user: IAuthUser;
  tokens: IAuthTokens;
  session: ISession;
  requiresMFA?: boolean;
  mfaType?: TMFAType;
  requiresPasswordReset?: boolean;
}

export interface IRegisterResponse {
  user: IAuthUser;
  message: string;
  emailVerificationRequired: boolean;
  emailVerificationSent: boolean;
}

export interface IRefreshTokenResponse {
  tokens: IAuthTokens;
  session: ISession;
}

export interface ILogoutResponse {
  message: string;
  loggedOutAt: Date;
  sessionsRevoked: number;
}

export interface IChangePasswordResponse {
  message: string;
  changedAt: Date;
  requiresRelogin: boolean;
}

export interface IResetPasswordResponse {
  message: string;
  emailSent: boolean;
}

export interface IVerifyEmailResponse {
  message: string;
  emailVerified: boolean;
  user: IAuthUser;
}

export interface ISetupMFAResponse {
  type: TMFAType;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  message: string;
}

export interface IVerifyMFAResponse {
  verified: boolean;
  tokens?: IAuthTokens;
  session?: ISession;
  message: string;
}

export interface IVerifyMFASetupResponse {
  configured: boolean;
  backupCodes: string[];
  message: string;
}

export interface IRevokeMFASetupResponse {
  revoked: boolean;
  message: string;
}

export interface IOAuthLoginResponse {
  user: IAuthUser;
  tokens: IAuthTokens;
  session: ISession;
  isNewUser: boolean;
  profile: IOAuthProfile;
  requiresPasswordReset?: boolean;
}

export interface IForgotPasswordResponse {
  message: string;
  emailSent: boolean;
  resetTokenExpiresAt: Date;
}

export interface IResetPasswordWithTokenResponse {
  message: string;
  passwordReset: boolean;
}

export interface IVerifyResetTokenResponse {
  valid: boolean;
  expiresAt?: Date;
  user?: {
    id: string;
    email: string;
  };
}

export interface IResendVerificationResponse {
  message: string;
  emailSent: boolean;
}

export interface IChangeEmailResponse {
  message: string;
  verificationEmailSent: boolean;
  newEmail: string;
}

export interface IVerifyEmailChangeResponse {
  message: string;
  emailChanged: boolean;
  oldEmail: string;
  newEmail: string;
}

export interface ISessionsResponse {
  sessions: ISession[];
  currentSessionId: string;
  totalActive: number;
}

export interface ILoginHistoryResponse {
  attempts: ILoginAttempt[];
  total: number;
  page: number;
  limit: number;
  summary: {
    successfulLogins: number;
    failedAttempts: number;
    blockedAttempts: number;
    lastSuccessfulLogin?: Date;
    lastFailedAttempt?: Date;
  };
}

export interface IMFAStatusResponse {
  enabled: boolean;
  configuredTypes: TMFAType[];
  defaultType?: TMFAType;
  lastUsedAt?: Date;
  backupCodesRemaining?: number;
}

export interface IAuthSettingsResponse {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: boolean;
    maxAge: number; // days
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number; // minutes
    rememberMeDuration: number; // days
    requireMFA: boolean;
  };
  loginPolicy: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    allowRememberMe: boolean;
    allowMultipleDevices: boolean;
  };
}

// Filter and Query Interfaces
export interface IAuthFiltersQuery {
  userId?: string;
  status?: TSessionStatus | TLoginAttemptStatus;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  deviceType?: string;
  provider?: TAuthProvider;
}

export interface ISessionsFiltersQuery extends IAuthFiltersQuery {
  includeExpired?: boolean;
  includeRevoked?: boolean;
}

export interface ILoginHistoryFiltersQuery extends IAuthFiltersQuery {
  includeFailed?: boolean;
  includeBlocked?: boolean;
}

// Statistics Interfaces
export interface IAuthStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalLoginAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  blockedLogins: number;
  mfaEnabledUsers: number;
  usersByProvider: Record<TAuthProvider, number>;
  loginTrends: Array<{
    date: Date;
    successful: number;
    failed: number;
  }>;
  sessionTrends: Array<{
    date: Date;
    active: number;
    created: number;
  }>;
  topLoginLocations: Array<{
    location: string;
    count: number;
  }>;
  topLoginDevices: Array<{
    device: string;
    count: number;
  }>;
}

// All types are exported above with their declarations