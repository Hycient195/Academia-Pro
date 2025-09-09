import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { SecurityService } from '../services/security.service';
import { AuditAction, AuditSeverity } from '../types/audit.types';
import { SYSTEM_USER_ID } from '../entities/audit-log.entity';
import { MissingUserIdException, InvalidUserIdFormatException } from '../../common/exceptions/user-id.exception';

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  roles: string[];
  schoolId?: string;
  sessionId?: string;
  mfaVerified?: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private securityService: SecurityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload): Promise<any> {
    try {
      this.logger.debug(`Validating JWT token for user: ${payload.sub}`);

      // Validate payload structure
      if (!payload.sub || !payload.userId || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Validate userId format
      this.validateUserId(payload.userId);

      // Check token expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token has expired');
      }

      // Validate user exists and is active (mock implementation)
      const user = await this.validateUser(payload);
      if (!user) {
        await this.logInvalidUser(request, payload);
        throw new UnauthorizedException('User not found or inactive');
      }

      // Validate user roles
      if (!payload.roles || !Array.isArray(payload.roles) || payload.roles.length === 0) {
        await this.logInvalidRoles(request, payload);
        throw new UnauthorizedException('No valid roles found');
      }

      // Validate school access if specified
      if (payload.schoolId && !await this.validateSchoolAccess(payload)) {
        await this.logInvalidSchoolAccess(request, payload);
        throw new UnauthorizedException('Invalid school access');
      }

      // Log successful validation
      await this.logSuccessfulValidation(request, payload);

      // Return user object with additional metadata
      return {
        id: payload.sub,
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles,
        schoolId: payload.schoolId,
        sessionId: payload.sessionId,
        mfaVerified: payload.mfaVerified || false,
        permissions: await this.getUserPermissions(payload),
        lastLogin: user.lastLogin,
        profileComplete: user.profileComplete,
      };

    } catch (error) {
      await this.logValidationError(request, payload, error.message);
      throw error;
    }
  }

  private async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'roles', 'schoolId', 'status', 'lastLoginAt', 'isEmailVerified'],
    });

    if (!user) {
      return null;
    }

    // Check if user is active
    if (user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      schoolId: user.schoolId,
      isActive: user.status === 'active',
      lastLogin: user.lastLoginAt,
      profileComplete: user.isEmailVerified, // Simple check for profile completeness
    };
  }

  private async validateSchoolAccess(payload: JwtPayload): Promise<boolean> {
    // Mock school access validation
    const mockSchoolAccess = {
      'school-001': ['user-001', 'user-002', 'user-003'],
      'school-002': ['user-004', 'user-005'],
    };

    return payload.schoolId && mockSchoolAccess[payload.schoolId]?.includes(payload.sub);
  }

  private async getUserPermissions(payload: JwtPayload): Promise<string[]> {
    // Mock permission mapping based on roles
    const rolePermissions = {
      'super-admin': [
        'users:*',
        'schools:*',
        'academic:*',
        'reports:*',
        'security:*',
        'system:*',
      ],
      'school-admin': [
        'users:read',
        'users:write',
        'schools:read',
        'academic:*',
        'reports:*',
        'students:*',
      ],
      'teacher': [
        'academic:read',
        'academic:write',
        'students:read',
        'reports:read',
        'attendance:*',
      ],
      'student': [
        'academic:read',
        'reports:read',
        'profile:read',
        'profile:write',
      ],
      'parent': [
        'children:read',
        'academic:read',
        'reports:read',
        'communication:read',
        'communication:write',
      ],
    };

    const permissions: string[] = [];
    if (payload.roles && Array.isArray(payload.roles)) {
      payload.roles.forEach(role => {
        if (rolePermissions[role]) {
          permissions.push(...rolePermissions[role]);
        }
      });
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  private async logSuccessfulValidation(request: any, payload: JwtPayload): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.DATA_ACCESSED,
        payload.sub,
        AuditSeverity.LOW,
        'JWT token validation successful',
        {
          tokenValidation: true,
          roles: payload.roles,
          schoolId: payload.schoolId,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log successful validation', error);
    }
  }

  private async logInvalidUser(request: any, payload: JwtPayload): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        payload.sub,
        AuditSeverity.MEDIUM,
        'JWT validation failed: User not found or inactive',
        {
          validationFailure: 'user_not_found',
          attemptedUserId: payload.sub,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log invalid user', error);
    }
  }

  private async logInvalidRoles(request: any, payload: JwtPayload): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHORIZATION_FAILED,
        payload.sub,
        AuditSeverity.MEDIUM,
        'JWT validation failed: No valid roles',
        {
          validationFailure: 'no_valid_roles',
          providedRoles: payload.roles,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log invalid roles', error);
    }
  }

  private async logInvalidSchoolAccess(request: any, payload: JwtPayload): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHORIZATION_FAILED,
        payload.sub,
        AuditSeverity.HIGH,
        'JWT validation failed: Invalid school access',
        {
          validationFailure: 'invalid_school_access',
          attemptedSchoolId: payload.schoolId,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log invalid school access', error);
    }
  }

  private async logValidationError(request: any, payload: JwtPayload, error: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        payload?.sub,
        AuditSeverity.MEDIUM,
        `JWT validation error: ${error}`,
        {
          validationFailure: 'validation_error',
          error: error,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (logError) {
      this.logger.error('Failed to log validation error', logError);
    }
  }

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new MissingUserIdException();
    }

    // Allow system user IDs for authentication endpoints
    if (userId === 'auth-system' || userId === SYSTEM_USER_ID) {
      return;
    }

    // Skip validation for system user IDs
    if (userId === '00000000-0000-0000-0000-000000000000' || userId === SYSTEM_USER_ID) {
      return;
    }


    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new InvalidUserIdFormatException(userId);
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