// Academia Pro - JWT Strategy
// Passport JWT authentication strategy

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

export interface JwtPayload {
  sub: string;      // User ID
  email: string;    // User email
  role: string;     // User role
  schoolId?: string; // School ID (optional)
  iat?: number;     // Issued at
  exp?: number;     // Expiration time
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  /**
   * Validate JWT payload and return user information
   * This method is called automatically by Passport after JWT verification
   */
  async validate(payload: JwtPayload): Promise<any> {
    const { sub: userId, email, role, schoolId } = payload;

    // Fetch user from database to ensure they still exist and are active
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'status',
        'schoolId',
        'isEmailVerified',
        'lastLoginAt',
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
      role: user.role,
      status: user.status,
      schoolId: user.schoolId,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };
  }
}