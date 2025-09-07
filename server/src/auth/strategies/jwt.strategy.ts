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

export interface JwtPayload {
   sub: string;      // User ID
   email: string;    // User email
   roles: string[];  // User roles
   schoolId?: string; // School ID (optional)
   iat?: number;     // Issued at
   exp?: number;     // Expiration time
}

/**
 * Custom JWT extractor from cookies
 */
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  /**
   * Validate JWT payload and return user information
   * This method is called automatically by Passport after JWT verification
   */
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

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
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