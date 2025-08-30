// Academia Pro - Inventory Module
// Module for managing school assets and inventory

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  Asset,
  AssetCategory,
  AssetLocation,
  AssetMaintenance,
  AssetMovement,
} from './entities';

// Services
import { AssetService } from './services/asset.service';
import { MaintenanceService } from './services/maintenance.service';
import { DepreciationService } from './services/depreciation.service';
import { AllocationService } from './services/allocation.service';
import { AnalyticsService } from './services/analytics.service';

// Controllers
import { AssetController } from './controllers/asset.controller';
import { MaintenanceController } from './controllers/maintenance.controller';
import { DepreciationController } from './controllers/depreciation.controller';
import { AllocationController } from './controllers/allocation.controller';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetCategory,
      AssetLocation,
      AssetMaintenance,
      AssetMovement,
    ]),
  ],
  controllers: [
    AssetController,
    MaintenanceController,
    DepreciationController,
    AllocationController,
    AnalyticsController,
  ],
  providers: [
    AssetService,
    MaintenanceService,
    DepreciationService,
    AllocationService,
    AnalyticsService,
  ],
  exports: [
    AssetService,
    MaintenanceService,
    DepreciationService,
    AllocationService,
    AnalyticsService,
  ],
})
export class InventoryModule {}