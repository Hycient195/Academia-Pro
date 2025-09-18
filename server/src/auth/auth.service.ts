// Academia Pro - Authentication Service
// Handles user authentication, JWT token management, and security operations

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { UserSession } from '../security/entities/user-session.entity';
import { RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dtos';
import { IAuthTokens } from '@academia-pro/types/auth';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { Auditable, AuditAuth, AuditSecurity } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';
import { AuditService } from '../security/services/audit.service';
import { SYSTEM_USER_ID } from '../security/entities/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
      @InjectRepository(UserSession)
      private userSessionRepository: Repository<UserSession>,
      private jwtService: JwtService,
      private auditService: AuditService,
    ) {}

  /**
    * Validate super admin credentials
    */
   @AuditAuth(true)
   @Auditable({
     resource: 'super_admin_auth',
     severity: AuditSeverity.HIGH,
     excludeFields: ['password'],
     metadata: { authType: 'super_admin' }
   })
   async validateSuperAdmin(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'roles', 'status', 'isEmailVerified'],
    });

    if (!user || !user.roles.includes(EUserRole.SUPER_ADMIN)) {
      throw new UnauthorizedException('Super admin account not found');
    }

    if (!user) {
      throw new UnauthorizedException('Super admin account not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Super admin account is not active');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Super admin email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid super admin credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
    * Validate delegated admin credentials
    */
   @AuditAuth(true)
   @Auditable({
     resource: 'delegated_admin_auth',
     severity: AuditSeverity.HIGH,
     excludeFields: ['password'],
     metadata: { authType: 'delegated_admin' }
   })
   async validateDelegatedAdmin(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'roles', 'status', 'isEmailVerified'],
    });

    if (!user || !user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN as any)) {
      throw new UnauthorizedException('Delegated admin account not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Delegated admin account is not active');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Delegated admin email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid delegated admin credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
    * Validate user credentials
    */
   @AuditAuth(true)
   @Auditable({
     resource: 'user_auth',
     severity: AuditSeverity.MEDIUM,
     excludeFields: ['password'],
     metadata: { authType: 'user' }
   })
   async validateUser(email: string, password: string): Promise<Partial<User>> {
    //  console.log('[AuthService] validateUser start', { email });
 
     const user = await this.usersRepository.findOne({
       where: { email },
       select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'roles', 'status', 'schoolId', 'isEmailVerified', 'isFirstLogin'],
     });
 
     if (!user) {
       console.warn('[AuthService] validateUser: user not found');
       throw new UnauthorizedException('Invalid credentials');
     }
 
     // Only allow INACTIVE status for first-time login; otherwise block
     if (user.status === EUserStatus.INACTIVE) {
       if (!user.isFirstLogin) {
         console.warn('[AuthService] validateUser: account inactive and not first login');
         throw new UnauthorizedException('Account is inactive');
       }
     } else if (user.status !== EUserStatus.ACTIVE) {
       console.warn('[AuthService] validateUser: account not active');
       throw new UnauthorizedException('Account is not active');
     }
 
     if (!user.isEmailVerified) {
       console.warn('[AuthService] validateUser: email not verified');
       throw new UnauthorizedException('Please verify your email before logging in');
     }
 
     // Guard against invalid passwordHash types to avoid bcrypt "Illegal arguments" errors
     // If passwordHash is missing/invalid but this is a first-time login (inactive), allow email-as-password fallback
     if (!user.passwordHash || typeof user.passwordHash !== 'string') {
       console.warn('[AuthService] validateUser: missing/invalid passwordHash', { type: typeof user.passwordHash, isFirstLogin: user.isFirstLogin, status: user.status });
       if (user.isFirstLogin && user.status === EUserStatus.INACTIVE) {
         const candidate = (password || '').trim().toLowerCase();
         const emailNormalized = (user.email || '').trim().toLowerCase();
         if (candidate && candidate === emailNormalized) {
           console.warn('[AuthService] validateUser: fallback accepted for first-time login with missing passwordHash');
           // proceed without throwing; treat as valid and continue to reset attempts
         } else {
           await this.incrementLoginAttempts(user.id);
           throw new UnauthorizedException('Invalid credentials');
         }
       } else {
         throw new UnauthorizedException('Invalid credentials');
       }
     }
     if (typeof password !== 'string' || !password) {
       console.error('[AuthService] validateUser: invalid password input', { type: typeof password });
       throw new UnauthorizedException('Invalid credentials');
     }
 
     let isPasswordValid = false;
     try {
       // Only attempt bcrypt compare if we actually have a hash
       if (user.passwordHash && typeof user.passwordHash === 'string') {
         isPasswordValid = await bcrypt.compare(password, user.passwordHash);
       }
     } catch (err: any) {
       console.error('[AuthService] validateUser: bcrypt.compare error', { message: err?.message });
       // Increment login attempts
       await this.incrementLoginAttempts(user.id);
       throw new UnauthorizedException('Invalid credentials');
     }

     // First-time login fallback: accept email-as-password ignoring case/whitespace
     if (!isPasswordValid && user.isFirstLogin && user.status === EUserStatus.INACTIVE) {
       const candidate = (password || '').trim().toLowerCase();
       const emailNormalized = (user.email || '').trim().toLowerCase();
       if (candidate === emailNormalized) {
         console.warn('[AuthService] validateUser: first-time login fallback matched email-as-password');
         isPasswordValid = true;
       }
     }

     if (!isPasswordValid) {
       // Increment login attempts
       await this.incrementLoginAttempts(user.id);
       throw new UnauthorizedException('Invalid credentials');
     }
 
     // Reset login attempts on successful login
     await this.resetLoginAttempts(user.id);
 
     const { passwordHash, ...result } = user as any;
     return result;
   }

 /**
  * Login user and generate tokens
  */
 @Auditable({
   action: AuditAction.LOGIN,
   resource: 'user_session',
   severity: AuditSeverity.MEDIUM,
   metadata: { sessionType: 'login' }
 })
 async login(user: any): Promise<IAuthTokens & { requiresPasswordReset?: boolean }> {
  //  console.log('[AuthService] login: creating session', { userId: user?.id });

   // Create user session
   const sessionId = this.generateSessionId();
   const session = await this.userSessionRepository.save({
     userId: user.id,
     sessionToken: this.generateSessionId(),
     ipAddress: '127.0.0.1', // This should be passed from request
     userAgent: 'Unknown', // This should be passed from request
     lastActivityAt: new Date(),
     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
     createdAt: new Date(),
     loginAt: new Date(),
     isActive: true,
   });
  //  console.log('[AuthService] login: session created', { sessionId: session?.id });

   const payload = {
     email: user.email,
     sub: user.id,
     userId: user.id, // Ensure userId is included in payload
     roles: user.roles,
     schoolId: user.schoolId,
     sessionId: session.id,
   };

   let accessToken: string;
   let refreshToken: string;
   try {
     accessToken = this.jwtService.sign(payload);
     refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
   } catch (err: any) {
     console.error('[AuthService] login: jwt sign error', { message: err?.message });
     throw err;
   }

   // Store refresh token in database
   await this.usersRepository.update(user.id, {
     refreshToken: await bcrypt.hash(refreshToken, 10),
     refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
     lastLoginAt: new Date(),
   });

   const result: IAuthTokens & { requiresPasswordReset?: boolean } = {
     accessToken,
     refreshToken,
     expiresIn: 86400, // 24 hours in seconds
     tokenType: 'Bearer',
     issuedAt: new Date(),
   };
  //  console.log('[AuthService] login: tokens generated');

   // Check if user needs to reset password (first-time login)
   if (user.isFirstLogin) {
     result.requiresPasswordReset = true;
   }

   return result;
 }

  /**
   * Login user and set authentication cookies
   */
  async loginWithCookies(
    user: any,
    res: Response
  ): Promise<{ user: any; tokens: IAuthTokens; requiresPasswordReset?: boolean }> {
    const tokensWithFlag = await this.login(user);

    // Set authentication cookies (pass user for role-based cookie naming)
    this.setAuthCookies(res, tokensWithFlag.accessToken, tokensWithFlag.refreshToken, user);

    // Remove sensitive information from response
    const { passwordHash, ...userResponse } = user;

    // Ensure response also contains tokens for clients expecting them in body
    const tokens: IAuthTokens = {
      accessToken: tokensWithFlag.accessToken,
      refreshToken: tokensWithFlag.refreshToken,
      expiresIn: tokensWithFlag.expiresIn,
      tokenType: tokensWithFlag.tokenType,
      issuedAt: tokensWithFlag.issuedAt,
    };

    const result: { user: any; tokens: IAuthTokens; requiresPasswordReset?: boolean } = {
      user: userResponse,
      tokens,
    };

    // Include password reset requirement if needed
    if ((tokensWithFlag as any).requiresPasswordReset) {
      result.requiresPasswordReset = true;
    }

    return result;
  }

  /**
   * Set authentication cookies on response
   */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string, user?: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = isProduction ? 'strict' as const : 'lax' as const;

    const baseCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      path: '/',
    } as const;

    // Determine cookie names based on user role
    const isSuperAdmin = user?.roles?.includes(EUserRole.SUPER_ADMIN);
    const accessTokenKey = isSuperAdmin ? 'superAdminAccessToken' : 'accessToken';
    const refreshTokenKey = isSuperAdmin ? 'superAdminRefreshToken' : 'refreshToken';
    const csrfTokenKey = isSuperAdmin ? 'superAdminCsrfToken' : 'csrfToken';

    try {
      res.cookie(accessTokenKey, accessToken, {
        ...baseCookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.cookie(refreshTokenKey, refreshToken, {
        ...baseCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Generate and set CSRF token
      const csrfToken = this.generateCSRFToken();
      res.cookie(csrfTokenKey, csrfToken, {
        ...baseCookieOptions,
        httpOnly: false, // Allow client-side access for CSRF token
        sameSite,
        maxAge: 60 * 60 * 1000, // 1 hour
      });
    } catch (err: any) {
      console.error('[AuthService] setAuthCookies error', { message: err?.message });
      throw err;
    }
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res: Response, user?: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' as const : 'lax' as const,
    };

    // Determine cookie names based on user role
    const isSuperAdmin = user?.roles?.includes(EUserRole.SUPER_ADMIN);
    const accessTokenKey = isSuperAdmin ? 'superAdminAccessToken' : 'accessToken';
    const refreshTokenKey = isSuperAdmin ? 'superAdminRefreshToken' : 'refreshToken';
    const csrfTokenKey = isSuperAdmin ? 'superAdminCsrfToken' : 'csrfToken';

    res.clearCookie(accessTokenKey, cookieOptions);
    res.clearCookie(refreshTokenKey, cookieOptions);
    res.clearCookie(csrfTokenKey, { ...cookieOptions, httpOnly: false, sameSite: isProduction ? 'strict' as const : 'lax' as const });
  }

  /**
   * Generate CSRF token
   */
  private generateCSRFToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
    * Register new user
    */
   @Auditable({
     action: AuditAction.USER_CREATED,
     resource: 'user_registration',
     severity: AuditSeverity.MEDIUM,
     excludeFields: ['password'],
     metadata: { registrationType: 'user' }
   })
   async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = this.generateEmailVerificationToken();

    // Create user
    const userDataToSave = {
      ...userData,
      email,
      passwordHash,
      emailVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: EUserStatus.PENDING,
      isEmailVerified: false,
    };

    const newUser = await this.usersRepository.save(userDataToSave as any);

    return newUser;
  }

 /**
  * Refresh access token
  */
 @Auditable({
   action: AuditAction.AUTHENTICATION_SUCCESS,
   resource: 'token_refresh',
   severity: AuditSeverity.LOW,
   excludeFields: ['refreshToken'],
   metadata: { tokenOperation: 'refresh' }
 })
 async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<IAuthTokens> {
   try {
     const { refreshToken } = refreshTokenDto;

     // Verify refresh token
     const payload = this.jwtService.verify(refreshToken);
     const user = await this.usersRepository.findOne({
       where: { id: payload.sub },
       select: ['id', 'email', 'refreshToken', 'refreshTokenExpires', 'roles', 'schoolId'],
     });

     if (!user || !user.refreshToken) {
       throw new UnauthorizedException('Invalid refresh token');
     }

     // Check if refresh token is expired
     if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
       throw new UnauthorizedException('Refresh token expired');
     }

     // Verify stored refresh token
     const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
     if (!isRefreshTokenValid) {
       throw new UnauthorizedException('Invalid refresh token');
     }

     // Generate new tokens
     const newPayload = {
       email: user.email,
       sub: user.id,
       userId: user.id, // Ensure userId is included in payload
       roles: user.roles,
       schoolId: user.schoolId,
     };

     const newAccessToken = this.jwtService.sign(newPayload);
     const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

     // Update stored refresh token
     await this.usersRepository.update(user.id, {
       refreshToken: await bcrypt.hash(newRefreshToken, 10),
       refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
     });

     return {
       accessToken: newAccessToken,
       refreshToken: newRefreshToken,
       expiresIn: 86400,
       tokenType: 'Bearer',
       issuedAt: new Date(),
     };
   } catch (error) {
     throw new UnauthorizedException('Invalid refresh token');
   }
 }

  /**
   * Change user password
   */
  @Auditable({
    action: AuditAction.PASSWORD_CHANGED,
    resource: 'user_password',
    resourceId: 'userId',
    severity: AuditSeverity.HIGH,
    excludeFields: ['currentPassword', 'newPassword'],
    metadata: { passwordChangeType: 'user_initiated' }
  })
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash', 'schoolId', 'isFirstLogin', 'status', 'email'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // For first-time login users, skip current password verification
    // since they logged in with email as password and don't have a proper password hash
    if (!(user as any).isFirstLogin) {
      // Verify current password for non-first-time users
      if (!user.passwordHash) {
        throw new BadRequestException('Current password is required');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    } else {
      // For first-time login users, verify that the "current password" matches their email
      // This provides an additional security check
      const normalizedCurrentPassword = (currentPassword || '').trim().toLowerCase();
      const normalizedEmail = (user.email || '').trim().toLowerCase();

      if (normalizedCurrentPassword !== normalizedEmail) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Build update payload
    const updatePayload: Partial<User> = {
      passwordHash: newPasswordHash,
    };

    // If this was a first-time login, clear the flag and activate the account
    if ((user as any).isFirstLogin) {
      (updatePayload as any).isFirstLogin = false;
      (updatePayload as any).status = EUserStatus.ACTIVE as any;
    }

    await this.usersRepository.update(userId, updatePayload);
  }

  /**
    * Verify email address
    */
   @Auditable({
     action: AuditAction.USER_UPDATED,
     resource: 'user_email_verification',
     severity: AuditSeverity.MEDIUM,
     excludeFields: ['token'],
     metadata: { verificationType: 'email' }
   })
   async verifyEmail(token: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      status: EUserStatus.ACTIVE,
    });
  }

  /**
    * Request password reset
    */
   @Auditable({
     action: AuditAction.PASSWORD_RESET,
     resource: 'password_reset_request',
     severity: AuditSeverity.MEDIUM,
     metadata: { resetType: 'request' }
   })
   async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetToken = this.generatePasswordResetToken();

    await this.usersRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
    * Reset password with token
    */
   @Auditable({
     action: AuditAction.PASSWORD_RESET,
     resource: 'password_reset_completion',
     severity: AuditSeverity.HIGH,
     excludeFields: ['token', 'newPassword'],
     metadata: { resetType: 'completion' }
   })
   async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.usersRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

 /**
  * Logout user (invalidate refresh token)
  */
 @Auditable({
   action: AuditAction.LOGOUT,
   resource: 'user_session',
   severity: AuditSeverity.LOW,
   metadata: { sessionType: 'logout' }
 })
 async logout(userId: string): Promise<void> {
   // Get user details for audit context
   const user = await this.usersRepository.findOne({
     where: { id: userId },
     select: ['id', 'schoolId'],
   });

   if (user) {
      // Audit context is handled by the interceptor
    }

   await this.usersRepository.update(userId, {
     refreshToken: null,
     refreshTokenExpires: null,
   });
 }

 /**
  * Get user profile for JWT strategy
  */
 async getUserProfile(userId: string): Promise<any> {
   const user = await this.usersRepository.findOne({
     where: { id: userId },
     select: ['id', 'email', 'firstName', 'lastName', 'roles', 'status', 'schoolId', 'isEmailVerified'],
   });

   if (!user) {
     throw new UnauthorizedException('User not found');
   }

   return user;
 }

 /**
  * Get user from refresh token (for determining cookie names)
  */
 async getUserFromRefreshToken(refreshToken: string): Promise<any> {
   try {
     const payload = this.jwtService.verify(refreshToken);
     return await this.getUserProfile(payload.sub);
   } catch (error) {
     throw new UnauthorizedException('Invalid refresh token');
   }
 }

  // Custom audit methods for auth-specific events
  private async logAccountLockout(userId: string, attempts: number): Promise<void> {
    await this.auditService.logActivity({
      userId,
      action: AuditAction.SECURITY_ALERT,
      resource: 'account_security',
      resourceId: userId,
      details: {
        eventType: 'account_lockout',
        attempts,
        lockoutDuration: '2_hours'
      },
      severity: AuditSeverity.HIGH,
    });
  }

  private async logBruteForceAttempt(email: string, ipAddress?: string): Promise<void> {
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: AuditAction.SECURITY_ALERT,
      resource: 'authentication_security',
      details: {
        eventType: 'brute_force_attempt',
        targetEmail: email,
        ipAddress,
        timestamp: new Date().toISOString()
      },
      severity: AuditSeverity.CRITICAL,
    });
  }

  private async logSuspiciousLogin(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID,
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      resource: 'login_security',
      details: {
        eventType: 'suspicious_login_attempt',
        targetEmail: email,
        ipAddress,
        userAgent,
        reason: 'geographic_anomaly_or_unusual_pattern'
      },
      severity: AuditSeverity.HIGH,
    });
  }

  private async logMfaEvent(userId: string, eventType: string, success: boolean): Promise<void> {
    await this.auditService.logActivity({
      userId,
      action: success ? AuditAction.AUTHENTICATION_SUCCESS : AuditAction.AUTHENTICATION_FAILED,
      resource: 'mfa_security',
      resourceId: userId,
      details: {
        eventType,
        success,
        timestamp: new Date().toISOString()
      },
      severity: success ? AuditSeverity.LOW : AuditSeverity.HIGH,
    });
  }

  private async logTokenCompromise(userId: string, tokenType: string): Promise<void> {
    await this.auditService.logActivity({
      userId,
      action: AuditAction.SECURITY_ALERT,
      resource: 'token_security',
      resourceId: userId,
      details: {
        eventType: 'token_compromise_detected',
        tokenType,
        timestamp: new Date().toISOString()
      },
      severity: AuditSeverity.CRITICAL,
    });
  }

  // Private helper methods
   @AuditSecurity('failed_login_attempt')
   private async incrementLoginAttempts(userId: string): Promise<void> {
     const user = await this.usersRepository.findOne({
       where: { id: userId },
       select: ['id', 'loginAttempts', 'lockoutUntil', 'email'],
     });

     if (!user) return;

     const attempts = (user.loginAttempts || 0) + 1;

     if (attempts >= 5) {
       // Lock account for 2 hours
       await this.usersRepository.update(userId, {
         loginAttempts: attempts,
         lockoutUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
       });

       // Log account lockout
       await this.logAccountLockout(userId, attempts);

       // Log brute force attempt if this is the 5th attempt
       if (attempts === 5) {
         await this.logBruteForceAttempt(user.email);
       }
     } else {
       await this.usersRepository.update(userId, {
         loginAttempts: attempts,
       });
     }
   }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      loginAttempts: 0,
      lockoutUntil: null,
    });
  }

  private generateEmailVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private generatePasswordResetToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private generateCorrelationId(): string {
    return `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}