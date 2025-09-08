import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { SuperAdminUsersController } from '../super-admin/controllers/super-admin.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { IamModule } from '../iam/iam.module';
import { AuditSharedModule } from '../common/audit/audit.shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), IamModule, AuditSharedModule],
  controllers: [UsersController, SuperAdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}