// Academia Pro - Authentication Module
// Handles user authentication, authorization, and session management

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AuthController } from './auth.controller';
import { MfaController } from './controllers/mfa.controller';
import { SessionController } from './controllers/session.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { SsoController } from './controllers/sso.controller';

// Services
import { AuthService } from './auth.service';
import { MfaService } from './services/mfa.service';
import { SessionService } from './services/session.service';
import { SSOService } from './services/sso.service';
import { UserManagementService } from './services/user-management.service';

// Entities
import { User } from '../users/user.entity';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    MfaController,
    SessionController,
    UserManagementController,
    SsoController,
  ],
  providers: [
    AuthService,
    MfaService,
    SessionService,
    SSOService,
    UserManagementService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    MfaService,
    SessionService,
    SSOService,
    UserManagementService,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
  ],
})
export class AuthModule {}