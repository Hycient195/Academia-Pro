// Academia Pro - Fee Module
// Comprehensive fee management module for schools

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditSharedModule } from '../common/audit/audit.shared.module';

// Controllers
import { FeeController } from './controllers/fee.controller';

// Services
import { FeeService } from './services/fee.service';

// Entities
import { FeeStructure } from './entities/fee-structure.entity';
import { FeePayment } from './entities/fee-payment.entity';
import { FeeDiscount } from './entities/fee-discount.entity';
import { InstallmentPlan, InstallmentSchedule } from './entities/installment-plan.entity';

// Guards
import { FeeManagementGuard } from './guards/fee-management.guard';

// Interceptors
import { FeeInterceptor } from './interceptors/fee.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeStructure,
      FeePayment,
      FeeDiscount,
      InstallmentPlan,
      InstallmentSchedule,
    ]),
    AuditSharedModule,
  ],
  controllers: [FeeController],
  providers: [
    FeeService,
    FeeManagementGuard,
    FeeInterceptor,
  ],
  exports: [
    FeeService,
    FeeManagementGuard,
    FeeInterceptor,
    TypeOrmModule,
  ],
})
export class FeeModule {}