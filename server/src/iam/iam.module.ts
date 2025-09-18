import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamController } from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { DelegatedSchoolAdminService } from './services/delegated-school-admin.service';
import { PermissionSeederService } from './services/permission-seeder.service';
import { PermissionGuard } from './guards/permission.guard';
import { SuperAdminPermissionGuard } from './guards/super-admin-permission.guard';
import { DelegatedAccount } from './entities/delegated-account.entity';
import { DelegatedSchoolAdmin } from './entities/delegated-school-admin.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from '../users/user.entity';
import { School } from '../schools/school.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DelegatedAccount, DelegatedSchoolAdmin, Permission, Role, User, School]),
  ],
  controllers: [IamController],
  providers: [IamService, DelegatedSchoolAdminService, PermissionSeederService, PermissionGuard, SuperAdminPermissionGuard],
  exports: [IamService, DelegatedSchoolAdminService, PermissionGuard, SuperAdminPermissionGuard],
})
export class IamModule implements OnModuleInit {
  constructor(private readonly permissionSeeder: PermissionSeederService) {}

  async onModuleInit() {
    // TODO: Seed default permissions on module initialization
    // await this.permissionSeeder.seedDefaultPermissions();
  }
}