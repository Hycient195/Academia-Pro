import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../services/security.service';
import { AuditAction, AuditSeverity } from '../types/audit.types';

@Injectable()
export class MfaGuard implements CanActivate {
  private readonly logger = new Logger(MfaGuard.name);

  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Check if MFA is required for this route
      const requiresMfa = this.reflector.getAllAndOverride<boolean>('requiresMfa', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiresMfa) {
        return true; // MFA not required for this route
      }

      // Check if user has MFA enabled
      if (!user.mfaEnabled) {
        await this.logMfaRequired(request, user, 'MFA not enabled for user');
        throw new UnauthorizedException('Multi-factor authentication is required but not enabled');
      }

      // Check if MFA has been verified in this session
      if (!user.mfaVerified) {
        await this.logMfaRequired(request, user, 'MFA verification required');
        throw new UnauthorizedException('Multi-factor authentication verification required');
      }

      // Check if MFA verification is still valid (not expired)
      if (user.mfaVerifiedAt && this.isMfaExpired(user.mfaVerifiedAt)) {
        await this.logMfaExpired(request, user);
        // Reset MFA verification status
        user.mfaVerified = false;
        user.mfaVerifiedAt = null;
        throw new UnauthorizedException('Multi-factor authentication has expired, please verify again');
      }

      // Log successful MFA check
      await this.logMfaSuccess(request, user);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`MFA guard error for user ${user.id}: ${error.message}`, error.stack);
      await this.logMfaError(request, user, error.message);
      throw new UnauthorizedException('Multi-factor authentication check failed');
    }
  }

  private isMfaExpired(verifiedAt: Date): boolean {
    const now = new Date();
    const expirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    return (now.getTime() - verifiedAt.getTime()) > expirationTime;
  }

  private async logMfaRequired(request: any, user: any, reason: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        user.id,
        AuditSeverity.MEDIUM,
        `MFA verification required: ${reason}`,
        {
          mfaRequired: true,
          reason,
          route: request.route?.path,
          method: request.method,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log MFA requirement', error);
    }
  }

  private async logMfaExpired(request: any, user: any): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        user.id,
        AuditSeverity.MEDIUM,
        'MFA verification expired',
        {
          mfaExpired: true,
          route: request.route?.path,
          method: request.method,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log MFA expiration', error);
    }
  }

  private async logMfaSuccess(request: any, user: any): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.SECURITY_ALERT,
        user.id,
        AuditSeverity.LOW,
        'MFA verification successful',
        {
          mfaVerified: true,
          route: request.route?.path,
          method: request.method,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log MFA success', error);
    }
  }

  private async logMfaError(request: any, user: any, error: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHENTICATION_FAILED,
        user.id,
        AuditSeverity.HIGH,
        `MFA verification error: ${error}`,
        {
          mfaError: true,
          error,
          route: request.route?.path,
          method: request.method,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (logError) {
      this.logger.error('Failed to log MFA error', logError);
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