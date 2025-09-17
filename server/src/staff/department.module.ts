import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentController } from './controllers/department.controller';
import { DepartmentService } from './services/department.service';
import { Department } from './entities/department.entity';
import { Staff } from './entities/staff.entity';
import { AuditSharedModule } from '../common/audit/audit.shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Staff]),
    AuditSharedModule,
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}