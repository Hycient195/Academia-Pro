// Academia Pro - Authentication Module
// Handles user authentication, authorization, and session management

import { Module, OnModuleInit } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthJwtModule } from './auth-jwt.module';

// Controllers
import { AuthController } from './auth.controller';
import { SuperAdminAuthController } from './controllers/super-admin-auth.controller';
import { IamController } from '../iam/controllers/iam.controller';
import { MfaController } from './controllers/mfa.controller';
import { SessionController } from './controllers/session.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { SsoController } from './controllers/sso.controller';

// Services
import { AuthService } from './auth.service';
import { IamService } from '../iam/services/iam.service';
import { PermissionSeederService } from '../iam/services/permission-seeder.service';
import { MfaService } from './services/mfa.service';
import { SessionService } from './services/session.service';
import { SSOService } from './services/sso.service';
import { UserManagementService } from './services/user-management.service';

// Entities
import { User } from '../users/user.entity';
import { DelegatedAccount } from '../iam/entities/delegated-account.entity';
import { Permission } from '../iam/entities/permission.entity';
import { Role } from '../iam/entities/role.entity';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DelegatedAccount, Permission, Role]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthJwtModule,
  ],
  controllers: [
    AuthController,
    SuperAdminAuthController,
    IamController,
    MfaController,
    SessionController,
    UserManagementController,
    SsoController,
  ],
  providers: [
    AuthService,
    IamService,
    PermissionSeederService,
    MfaService,
    SessionService,
    SSOService,
    UserManagementService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    UsersService,
  ],
  exports: [
    AuthService,
    IamService,
    PermissionSeederService,
    MfaService,
    SessionService,
    SSOService,
    UserManagementService,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly permissionSeeder: PermissionSeederService) {}

  async onModuleInit() {
    // Seed default permissions on module initialization
    await this.permissionSeeder.seedDefaultPermissions();
  }
}