// Academia Pro - JWT Strategy
// Passport JWT authentication strategy

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../../users/user.entity';
import { Auditable } from '../../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

export interface JwtPayload {
   sub: string;      // User ID
   email: string;    // User email
   roles: string[];  // User roles
   schoolId?: string; // School ID (optional)
   sessionId?: string; // Session ID (optional for compatibility)
   iat?: number;     // Issued at
   exp?: number;     // Expiration time
}

/**
 * JWT extractor that only reads from Authorization header
 * No cookie fallback - frontend must send tokens in headers
 */
const headerExtractor = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: headerExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  /**
    * Validate JWT payload and return user information
    * This method is called automatically by Passport after JWT verification
    */
   @Auditable({
     action: AuditAction.AUTHENTICATION_SUCCESS,
     resource: 'jwt_token_validation',
     severity: AuditSeverity.LOW,
     metadata: { strategy: 'jwt', validationType: 'token' }
   })
   async validate(payload: JwtPayload): Promise<any> {
    const { sub: userId, email, roles, schoolId } = payload;

    // Fetch user from database to ensure they still exist and are active
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'roles',
        'status',
        'schoolId',
        'isEmailVerified',
        'lastLoginAt',
        'isFirstLogin',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Allow INACTIVE users only when they're on their first login (to enable password change)
    if (user.status !== 'active') {
      const isFirstTimeFlow = user.status === 'inactive' && user.isFirstLogin === true;
      if (!isFirstTimeFlow) {
        throw new UnauthorizedException('Account is not active');
      }
      // Otherwise, continue - this enables first-time users to access guarded endpoints like change-password
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before accessing the system');
    }

    // Update last login time (optional - can be done in a separate service)
    // await this.usersRepository.update(userId, { lastLoginAt: new Date() });

    // Return user object that will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
      schoolId: user.schoolId,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      isFirstLogin: user.isFirstLogin,
    };
  }
}