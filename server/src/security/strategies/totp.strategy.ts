import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as speakeasy from 'speakeasy';
import { SecurityService } from '../services/security.service';
import { AuditAction, AuditSeverity } from '../types/audit.types';

export interface TotpPayload {
  userId: string;
  token: string;
  type: 'totp' | 'sms' | 'email';
  challengeId?: string;
}

@Injectable()
export class TotpStrategy extends PassportStrategy(Strategy, 'totp') {
  private readonly logger = new Logger(TotpStrategy.name);

  constructor(private securityService: SecurityService) {
    super();
  }

  async validate(request: any): Promise<any> {
    const { userId, token, type, challengeId } = request.body;

    if (!userId || !token || !type) {
      throw new UnauthorizedException('Missing required MFA parameters');
    }

    try {
      this.logger.debug(`Validating TOTP token for user: ${userId}, type: ${type}`);

      // Validate user exists and has MFA enabled
      const user = await this.validateUser(userId);
      if (!user) {
        await this.logInvalidUser(request, userId);
        throw new UnauthorizedException('User not found');
      }

      if (!user.mfaEnabled) {
        await this.logMfaNotEnabled(request, userId);
        throw new UnauthorizedException('MFA not enabled for user');
      }

      // Validate MFA token based on type
      const isValid = await this.validateMfaToken(user, token, type, challengeId);

      if (!isValid) {
        await this.logInvalidToken(request, userId, type);
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Log successful MFA verification
      await this.logSuccessfulVerification(request, userId, type);

      // Return user with MFA verification status
      return {
        id: user.id,
        userId: user.id,
        email: user.email,
        roles: user.roles,
        schoolId: user.schoolId,
        mfaVerified: true,
        mfaVerifiedAt: new Date(),
        mfaMethod: type,
      };

    } catch (error) {
      await this.logVerificationError(request, userId, type, error.message);
      throw error;
    }
  }

  private async validateUser(userId: string): Promise<any> {
    // Mock user validation - in real implementation, this would query the database
    const mockUsers = {
      'user-001': {
        id: 'user-001',
        email: 'admin@school.com',
        roles: ['super-admin', 'school-admin'],
        schoolId: 'school-001',
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP', // Mock TOTP secret
        phoneNumber: '+1234567890',
        backupCodes: ['12345678', '87654321'],
      },
      'user-002': {
        id: 'user-002',
        email: 'teacher@school.com',
        roles: ['teacher'],
        schoolId: 'school-001',
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXQ',
        phoneNumber: '+1234567891',
        backupCodes: ['11111111', '22222222'],
      },
    };

    return mockUsers[userId] || null;
  }

  private async validateMfaToken(
    user: any,
    token: string,
    type: string,
    challengeId?: string,
  ): Promise<boolean> {
    switch (type) {
      case 'totp':
        return this.validateTotpToken(user.mfaSecret, token);

      case 'sms':
        return this.validateSmsToken(user.phoneNumber, token, challengeId);

      case 'email':
        return this.validateEmailToken(user.email, token, challengeId);

      default:
        return false;
    }
  }

  private validateTotpToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow 2 time windows (30 seconds each)
      });

      return verified;
    } catch (error) {
      this.logger.error('TOTP token validation error', error);
      return false;
    }
  }

  private async validateSmsToken(phoneNumber: string, token: string, challengeId?: string): Promise<boolean> {
    // Mock SMS token validation
    // In real implementation, this would verify against a stored challenge
    const mockChallenges = {
      'challenge-001': { phoneNumber: '+1234567890', token: '123456', expiresAt: new Date(Date.now() + 300000) },
      'challenge-002': { phoneNumber: '+1234567891', token: '654321', expiresAt: new Date(Date.now() + 300000) },
    };

    if (!challengeId || !mockChallenges[challengeId]) {
      return false;
    }

    const challenge = mockChallenges[challengeId];

    if (challenge.phoneNumber !== phoneNumber) {
      return false;
    }

    if (challenge.token !== token) {
      return false;
    }

    if (new Date() > challenge.expiresAt) {
      return false;
    }

    return true;
  }

  private async validateEmailToken(email: string, token: string, challengeId?: string): Promise<boolean> {
    // Mock email token validation
    // In real implementation, this would verify against a stored challenge
    const mockChallenges = {
      'email-challenge-001': { email: 'admin@school.com', token: '789012', expiresAt: new Date(Date.now() + 600000) },
      'email-challenge-002': { email: 'teacher@school.com', token: '210987', expiresAt: new Date(Date.now() + 600000) },
    };

    if (!challengeId || !mockChallenges[challengeId]) {
      return false;
    }

    const challenge = mockChallenges[challengeId];

    if (challenge.email !== email) {
      return false;
    }

    if (challenge.token !== token) {
      return false;
    }

    if (new Date() > challenge.expiresAt) {
      return false;
    }

    return true;
  }

  // TOTP Token Generation Methods
  generateTotpSecret(): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: 'Academia Pro',
      issuer: 'Academia Pro',
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  generateTotpToken(secret: string): string {
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });
  }

  generateSmsToken(phoneNumber: string): { token: string; challengeId: string } {
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
    const challengeId = `sms-challenge-${Date.now()}`;

    // Mock SMS sending - in real implementation, integrate with SMS service
    this.logger.log(`Mock SMS sent to ${phoneNumber}: ${token}`);

    // Store challenge (in real implementation, save to database/cache)
    // await this.cacheManager.set(`mfa:sms:${challengeId}`, {
    //   phoneNumber,
    //   token,
    //   expiresAt: new Date(Date.now() + 300000), // 5 minutes
    // }, 300000);

    return { token, challengeId };
  }

  generateEmailToken(email: string): { token: string; challengeId: string } {
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
    const challengeId = `email-challenge-${Date.now()}`;

    // Mock email sending - in real implementation, integrate with email service
    this.logger.log(`Mock email sent to ${email}: ${token}`);

    // Store challenge (in real implementation, save to database/cache)
    // await this.cacheManager.set(`mfa:email:${challengeId}`, {
    //   email,
    //   token,
    //   expiresAt: new Date(Date.now() + 600000), // 10 minutes
    // }, 600000);

    return { token, challengeId };
  }

  // Logging methods
  private async logSuccessfulVerification(request: any, userId: string, type: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_SUCCESS,
        userId,
        AuditSeverity.LOW,
        `MFA verification successful: ${type}`,
        {
          mfaType: type,
          verificationSuccess: true,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log successful MFA verification', error);
    }
  }

  private async logInvalidUser(request: any, userId: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        userId,
        AuditSeverity.MEDIUM,
        'MFA verification failed: User not found',
        {
          mfaFailure: 'user_not_found',
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log invalid user', error);
    }
  }

  private async logMfaNotEnabled(request: any, userId: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        userId,
        AuditSeverity.MEDIUM,
        'MFA verification failed: MFA not enabled',
        {
          mfaFailure: 'mfa_not_enabled',
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log MFA not enabled', error);
    }
  }

  private async logInvalidToken(request: any, userId: string, type: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        userId,
        AuditSeverity.HIGH,
        `MFA verification failed: Invalid ${type} token`,
        {
          mfaFailure: 'invalid_token',
          mfaType: type,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log invalid token', error);
    }
  }

  private async logVerificationError(request: any, userId: string, type: string, error: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        userId,
        AuditSeverity.HIGH,
        `MFA verification error: ${type} - ${error}`,
        {
          mfaFailure: 'verification_error',
          mfaType: type,
          error,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (logError) {
      this.logger.error('Failed to log verification error', logError);
    }
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    return request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           request.connection?.socket?.remoteAddress ||
           'unknown';
  }
}