// Academia Pro - Authentication Service
// Handles user authentication, JWT token management, and security operations

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dtos';
import { IAuthTokens } from '@academia-pro/types/auth';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { Auditable, AuditAuth, AuditSecurity } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';
import { AuditService } from '../security/services/audit.service';

@Injectable()
export class AuthService {
  constructor(
     @InjectRepository(User)
     private usersRepository: Repository<User>,
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
   async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'roles', 'status', 'schoolId', 'isEmailVerified', 'isFirstLogin'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Allow login for INACTIVE users who are doing first-time login
    if (user.status !== 'active' && user.status !== 'inactive') {
      throw new UnauthorizedException('Account is not active');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);

    const { passwordHash, ...result } = user;
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
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

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

    // Check if user needs to reset password (first-time login)
    if (user.isFirstLogin) {
      result.requiresPasswordReset = true;
    }

    return result;
  }

  /**
   * Login user and set authentication cookies
   */
  async loginWithCookies(user: any, res: Response): Promise<{ user: any; requiresPasswordReset?: boolean }> {
    const tokens = await this.login(user);

    // Set authentication cookies
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Remove sensitive information from response
    const { passwordHash, ...userResponse } = user;

    const result: { user: any; requiresPasswordReset?: boolean } = { user: userResponse };

    // Include password reset requirement if needed
    if (tokens.requiresPasswordReset) {
      result.requiresPasswordReset = true;
    }

    return result;
  }

  /**
   * Set authentication cookies on response
   */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Generate and set CSRF token
    const csrfToken = this.generateCSRFToken();
    res.cookie('csrfToken', csrfToken, {
      ...cookieOptions,
      httpOnly: false, // Allow client-side access for CSRF token
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('csrfToken', { ...cookieOptions, httpOnly: false });
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

    return this.usersRepository.save(userDataToSave as any);
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
      select: ['id', 'passwordHash'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
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
      userId: 'system',
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
      userId: 'system',
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
}