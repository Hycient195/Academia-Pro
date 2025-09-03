import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamController } from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { PermissionSeederService } from './services/permission-seeder.service';
import { PermissionGuard } from './guards/permission.guard';
import { DelegatedAccount } from './entities/delegated-account.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DelegatedAccount, Permission, Role, User]),
  ],
  controllers: [IamController],
  providers: [IamService, PermissionSeederService, PermissionGuard],
  exports: [IamService, PermissionGuard],
})
export class IamModule implements OnModuleInit {
  constructor(private readonly permissionSeeder: PermissionSeederService) {}

  async onModuleInit() {
    // TODO: Seed default permissions on module initialization
    // await this.permissionSeeder.seedDefaultPermissions();
  }
}