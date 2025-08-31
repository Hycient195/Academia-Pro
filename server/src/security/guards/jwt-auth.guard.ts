import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { SecurityEvent, SecurityEventType, SecurityEventSeverity } from '../entities/security-event.entity';
import { AuditService, AuditSeverity } from '../services/audit.service';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  schoolId?: string;
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload & {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: Date;
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(SecurityEvent)
    private securityEventRepository: Repository<SecurityEvent>,
    private auditService: AuditService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse();

    try {
      // Check if route is public
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      // Extract token from header
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT token
      const payload = await this.verifyToken(token);

      // Validate session
      const session = await this.validateSession(payload);
      if (!session) {
        await this.logSecurityEvent(SecurityEventType.SESSION_INVALID, payload.sub, request);
        throw new UnauthorizedException('Invalid session');
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.logSecurityEvent(SecurityEventType.SESSION_EXPIRED, payload.sub, request);
        throw new UnauthorizedException('Session expired');
      }

      // Check if user is blocked or suspended
      if (session.isBlocked) {
        await this.logSecurityEvent(SecurityEventType.USER_BLOCKED, payload.sub, request);
        throw new UnauthorizedException('User account is blocked');
      }

      // Update session activity
      await this.updateSessionActivity(session, request);

      // Attach user to request
      request.user = {
        ...payload,
        sessionId: session.id,
        ipAddress: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        lastActivity: new Date(),
      };

      // Log successful authentication
      await this.auditService.logActivity({
        userId: payload.sub,
        action: 'AUTHENTICATION_SUCCESS',
        resource: 'authentication',
        resourceId: payload.sub,
        details: {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
          ipAddress: this.getClientIp(request),
        },
        ipAddress: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        severity: AuditSeverity.LOW,
      });

      return true;

    } catch (error) {
      // Log authentication failure
      const token = this.extractTokenFromHeader(request);
      let userId = 'unknown';

      if (token) {
        try {
          const payload = this.jwtService.decode(token) as JwtPayload;
          userId = payload?.sub || 'unknown';
        } catch (decodeError) {
          // Token is malformed
        }
      }

      await this.logSecurityEvent(SecurityEventType.AUTHENTICATION_FAILED, userId, request);

      await this.auditService.logActivity({
        userId,
        action: 'AUTHENTICATION_FAILED',
        resource: 'authentication',
        resourceId: userId,
        details: {
          error: error.message,
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
          ipAddress: this.getClientIp(request),
        },
        ipAddress: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
        severity: AuditSeverity.MEDIUM,
      });

      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        issuer: this.configService.get<string>('JWT_ISSUER'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
      });

      // Check token expiration
      if (payload.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  private async validateSession(payload: JwtPayload): Promise<UserSession | null> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          isActive: true,
        },
        relations: ['user'],
      });

      return session;
    } catch (error) {
      this.logger.error(`Session validation error: ${error.message}`);
      return null;
    }
  }

  private async updateSessionActivity(session: UserSession, request: Request): Promise<void> {
    try {
      session.lastActivity = new Date();
      session.ipAddress = this.getClientIp(request);
      session.userAgent = request.headers['user-agent'] || 'Unknown';
      await this.userSessionRepository.save(session);
    } catch (error) {
      this.logger.error(`Session update error: ${error.message}`);
    }
  }

  private async logSecurityEvent(
    eventType: SecurityEventType,
    userId: string,
    request: Request,
  ): Promise<void> {
    try {
      const securityEvent = new SecurityEvent();
      securityEvent.eventType = eventType;
      securityEvent.userId = userId;
      securityEvent.ipAddress = this.getClientIp(request);
      securityEvent.userAgent = request.headers['user-agent'] || 'Unknown';
      securityEvent.details = {
        url: request.url,
        method: request.method,
        headers: this.sanitizeHeaders(request.headers),
        timestamp: new Date(),
      };
      securityEvent.severity = (eventType.includes('failed') || eventType.includes('invalid')) ? SecurityEventSeverity.HIGH : SecurityEventSeverity.MEDIUM;

      await this.securityEventRepository.save(securityEvent);
    } catch (error) {
      this.logger.error(`Security event logging error: ${error.message}`);
    }
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const clientIp = request.headers['x-client-ip'];

    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }

    return (forwarded as string) ||
           (realIp as string) ||
           (clientIp as string) ||
           (request as any).ip ||
           (request as any).connection?.remoteAddress ||
           'unknown';
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}