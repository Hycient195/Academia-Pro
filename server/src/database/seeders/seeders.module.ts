import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { SuperAdminSeeder } from './super-admin.seeder';
import { SeedCommand } from './seed.command';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SuperAdminSeeder, SeedCommand],
  exports: [SuperAdminSeeder, SeedCommand],
})
export class SeedersModule {}