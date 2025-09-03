import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from './security.service';
import { AuditAction, AuditSeverity } from '../types/audit.types';
import { TotpStrategy } from '../strategies/totp.strategy';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  roles: string[];
  schoolId?: string;
  sessionId?: string;
  mfaVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface MfaSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private totpStrategy: TotpStrategy,
  ) {}

  async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<any> {
    try {
      this.logger.log(`Login attempt for email: ${credentials.email}`);

      // Validate credentials
      const user = await this.validateCredentials(credentials.email, credentials.password);
      if (!user) {
        await this.logFailedLogin(credentials.email, 'Invalid credentials', ipAddress, userAgent);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logFailedLogin(credentials.email, 'User account inactive', ipAddress, userAgent);
        throw new UnauthorizedException('Account is inactive');
      }

      // Check for suspicious login patterns
      const riskAssessment = await this.assessLoginRisk(user, ipAddress, userAgent);
      if (riskAssessment.isHighRisk) {
        await this.logSuspiciousLogin(user, riskAssessment, ipAddress, userAgent);
        // Could implement additional verification steps here
      }

      // Generate session ID
      const sessionId = `session-${Date.now()}-${user.id}`;

      // Check if MFA is required
      if (user.mfaEnabled) {
        await this.logMfaRequired(user, ipAddress, userAgent);

        return {
          requiresMfa: true,
          userId: user.id,
          sessionId,
          mfaMethods: ['totp', 'sms', 'email'],
          tempToken: await this.generateTempToken(user, sessionId),
        };
      }

      // Generate tokens for non-MFA users
      const tokens = await this.generateTokens(user, sessionId);

      // Log successful login
      await this.logSuccessfulLogin(user, ipAddress, userAgent);

      return {
        requiresMfa: false,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          schoolId: user.schoolId,
        },
        tokens,
        sessionId,
      };

    } catch (error) {
      this.logger.error(`Login error for ${credentials.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyMfa(userId: string, token: string, method: string, tempToken: string): Promise<any> {
    try {
      this.logger.log(`MFA verification for user: ${userId}, method: ${method}`);

      // Validate temp token
      const tempPayload = await this.validateTempToken(tempToken);
      if (tempPayload.sub !== userId) {
        throw new UnauthorizedException('Invalid temporary token');
      }

      // Get user details
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify MFA token
      const isValid = await this.verifyMfaToken(user, token, method);
      if (!isValid) {
        await this.logMfaFailure(user, method, 'Invalid MFA token');
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Generate final tokens
      const tokens = await this.generateTokens(user, tempPayload.sessionId);

      // Log successful MFA verification
      await this.logMfaSuccess(user, method);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          schoolId: user.schoolId,
        },
        tokens,
        sessionId: tempPayload.sessionId,
      };

    } catch (error) {
      this.logger.error(`MFA verification error for ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async setupMfa(userId: string, method: string): Promise<MfaSetup> {
    try {
      this.logger.log(`Setting up MFA for user: ${userId}, method: ${method}`);

      const user = await this.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      let setup: MfaSetup;

      switch (method) {
        case 'totp':
          setup = await this.setupTotpMfa(user);
          break;
        case 'sms':
          setup = await this.setupSmsMfa(user);
          break;
        case 'email':
          setup = await this.setupEmailMfa(user);
          break;
        default:
          throw new BadRequestException('Unsupported MFA method');
      }

      // Log MFA setup
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        userId,
        AuditSeverity.LOW,
        `MFA setup initiated: ${method}`,
        { mfaMethod: method, setupInitiated: true },
      );

      return setup;

    } catch (error) {
      this.logger.error(`MFA setup error for ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async enableMfa(userId: string, method: string, verificationToken: string): Promise<void> {
    try {
      this.logger.log(`Enabling MFA for user: ${userId}, method: ${method}`);

      const user = await this.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify the setup token
      const isValid = await this.verifyMfaSetupToken(user, method, verificationToken);
      if (!isValid) {
        throw new BadRequestException('Invalid verification token');
      }

      // Enable MFA for user
      await this.updateUserMfaStatus(userId, true, method);

      // Log MFA enabled
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        userId,
        AuditSeverity.LOW,
        `MFA enabled successfully: ${method}`,
        { mfaMethod: method, mfaEnabled: true },
      );

    } catch (error) {
      this.logger.error(`MFA enable error for ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async disableMfa(userId: string, verificationToken: string): Promise<void> {
    try {
      this.logger.log(`Disabling MFA for user: ${userId}`);

      const user = await this.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current MFA before disabling
      const isValid = await this.verifyMfaToken(user, verificationToken, user.mfaMethod || 'totp');
      if (!isValid) {
        throw new BadRequestException('Invalid verification token');
      }

      // Disable MFA for user
      await this.updateUserMfaStatus(userId, false);

      // Log MFA disabled
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        userId,
        AuditSeverity.MEDIUM,
        'MFA disabled',
        { mfaDisabled: true },
      );

    } catch (error) {
      this.logger.error(`MFA disable error for ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      this.logger.log('Token refresh attempt');

      // Validate refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Get user
      const user = await this.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user, payload.sessionId);

      // Log token refresh
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_SUCCESS,
        user.id,
        AuditSeverity.LOW,
        'Token refreshed successfully',
        { tokenRefresh: true },
      );

      return tokens;

    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    try {
      this.logger.log(`Logout for user: ${userId}, session: ${sessionId}`);

      // Invalidate session (mock implementation)
      // await this.userSessionRepository.update(
      //   { id: sessionId, userId },
      //   { status: SessionStatus.TERMINATED, terminatedAt: new Date() }
      // );

      // Log logout
      await this.securityService.logSecurityEvent(
        AuditAction.LOGOUT,
        userId,
        AuditSeverity.LOW,
        'User logged out successfully',
        { sessionId, logout: true },
      );

    } catch (error) {
      this.logger.error(`Logout error for ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async validateCredentials(email: string, password: string): Promise<any> {
    // Mock user validation - in real implementation, this would query the database
    const mockUsers = {
      'admin@school.com': {
        id: 'user-001',
        email: 'admin@school.com',
        password: 'hashed_password_123', // In real implementation, use bcrypt
        firstName: 'Admin',
        lastName: 'User',
        roles: ['super-admin', 'school-admin'],
        schoolId: 'school-001',
        isActive: true,
        mfaEnabled: true,
        mfaMethod: 'totp',
        lastLogin: new Date('2024-08-29T10:00:00Z'),
      },
      'teacher@school.com': {
        id: 'user-002',
        email: 'teacher@school.com',
        password: 'hashed_password_456',
        firstName: 'John',
        lastName: 'Teacher',
        roles: ['teacher'],
        schoolId: 'school-001',
        isActive: true,
        mfaEnabled: false,
        lastLogin: new Date('2024-08-29T08:30:00Z'),
      },
    };

    const user = mockUsers[email];
    if (!user) return null;

    // In real implementation, compare hashed passwords
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = password === 'password123'; // Mock validation

    return isValidPassword ? user : null;
  }

  private async getUserById(userId: string): Promise<any> {
    // Mock user lookup
    const mockUsers = {
      'user-001': {
        id: 'user-001',
        email: 'admin@school.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['super-admin', 'school-admin'],
        schoolId: 'school-001',
        isActive: true,
        mfaEnabled: true,
        mfaMethod: 'totp',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      },
      'user-002': {
        id: 'user-002',
        email: 'teacher@school.com',
        firstName: 'John',
        lastName: 'Teacher',
        roles: ['teacher'],
        schoolId: 'school-001',
        isActive: true,
        mfaEnabled: false,
      },
    };

    return mockUsers[userId] || null;
  }

  private async generateTokens(user: any, sessionId: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      roles: user.roles,
      schoolId: user.schoolId,
      sessionId,
      mfaVerified: !user.mfaEnabled, // If MFA not enabled, consider verified
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, sessionId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
    };
  }

  private async generateTempToken(user: any, sessionId: string): Promise<string> {
    const payload = {
      sub: user.id,
      sessionId,
      temp: true,
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_TEMP_SECRET'),
    });
  }

  private async validateTempToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_TEMP_SECRET'),
    });
  }

  private async assessLoginRisk(user: any, ipAddress: string, userAgent: string): Promise<any> {
    // Mock risk assessment
    const riskFactors = {
      unusualLocation: false,
      unusualDevice: false,
      unusualTime: false,
      failedAttempts: 0,
    };

    const riskScore = riskFactors.failedAttempts > 0 ? 0.6 : 0.1;

    return {
      riskScore,
      isHighRisk: riskScore > 0.5,
      factors: riskFactors,
    };
  }

  private async setupTotpMfa(user: any): Promise<MfaSetup> {
    const { secret, otpauthUrl } = this.totpStrategy.generateTotpSecret();

    // Store secret temporarily (in real implementation, save to database)
    // await this.updateUserMfaSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
    };
  }

  private async setupSmsMfa(user: any): Promise<MfaSetup> {
    if (!user.phoneNumber) {
      throw new BadRequestException('Phone number not available for SMS MFA');
    }

    // Generate and send SMS token
    const { token, challengeId } = this.totpStrategy.generateSmsToken(user.phoneNumber);

    return {
      secret: challengeId,
      otpauthUrl: '',
      qrCodeUrl: '',
    };
  }

  private async setupEmailMfa(user: any): Promise<MfaSetup> {
    // Generate and send email token
    const { token, challengeId } = this.totpStrategy.generateEmailToken(user.email);

    return {
      secret: challengeId,
      otpauthUrl: '',
      qrCodeUrl: '',
    };
  }

  private async verifyMfaToken(user: any, token: string, method: string): Promise<boolean> {
    // Mock MFA verification - in real implementation, use the TOTP strategy
    return token === '123456'; // Mock valid token
  }

  private async verifyMfaSetupToken(user: any, method: string, token: string): Promise<boolean> {
    // Mock setup token verification
    return token === '123456'; // Mock valid token
  }

  private async updateUserMfaStatus(userId: string, enabled: boolean, method?: string): Promise<void> {
    // Mock user update - in real implementation, update database
    this.logger.log(`Updated MFA status for user ${userId}: ${enabled}, method: ${method}`);
  }

  // Logging methods
  private async logFailedLogin(email: string, reason: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.AUTHENTICATION_FAILED,
      null,
      AuditSeverity.MEDIUM,
      `Login failed: ${reason}`,
      { email, reason },
      ipAddress,
      userAgent,
    );
  }

  private async logSuccessfulLogin(user: any, ipAddress: string, userAgent: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.AUTHENTICATION_SUCCESS,
      user.id,
      AuditSeverity.LOW,
      'User logged in successfully',
      { loginSuccess: true },
      ipAddress,
      userAgent,
    );
  }

  private async logSuspiciousLogin(user: any, riskAssessment: any, ipAddress: string, userAgent: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.SUSPICIOUS_ACTIVITY,
      user.id,
      AuditSeverity.HIGH,
      'Suspicious login detected',
      { riskAssessment },
      ipAddress,
      userAgent,
    );
  }

  private async logMfaRequired(user: any, ipAddress: string, userAgent: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.SECURITY_ALERT,
      user.id,
      AuditSeverity.LOW,
      'MFA verification required for login',
      { mfaRequired: true },
      ipAddress,
      userAgent,
    );
  }

  private async logMfaSuccess(user: any, method: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.SECURITY_ALERT,
      user.id,
      AuditSeverity.LOW,
      `MFA verification successful: ${method}`,
      { mfaMethod: method, mfaVerified: true },
    );
  }

  private async logMfaFailure(user: any, method: string, reason: string): Promise<void> {
    await this.securityService.logSecurityEvent(
      AuditAction.AUTHENTICATION_FAILED,
      user.id,
      AuditSeverity.HIGH,
      `MFA verification failed: ${method} - ${reason}`,
      { mfaMethod: method, mfaFailure: true, reason },
    );
  }
}