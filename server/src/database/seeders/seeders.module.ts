import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Department } from '../../staff/entities/department.entity';
import { SuperAdminSeeder } from './super-admin.seeder';
import { DepartmentSeeder } from './department.seeder';
import { SeedCommand } from './seed.command';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department])],
  providers: [SuperAdminSeeder, DepartmentSeeder, SeedCommand],
  exports: [SuperAdminSeeder, DepartmentSeeder, SeedCommand],
})
export class SeedersModule {}