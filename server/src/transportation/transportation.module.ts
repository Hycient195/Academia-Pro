// Academia Pro - Transportation Module
// Main module for transportation management system

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  TransportRoute,
  TransportStop,
  StudentTransport,
  Vehicle,
  Driver,
} from './entities';

// Services
import { RouteService } from './services/route.service';
import { VehicleService } from './services/vehicle.service';
import { DriverService } from './services/driver.service';
import { StudentTransportService } from './services/student-transport.service';

// Controllers
import { RouteController } from './controllers/route.controller';
import { VehicleController } from './controllers/vehicle.controller';
import { DriverController } from './controllers/driver.controller';
import { StudentTransportController } from './controllers/student-transport.controller';
import { TransportationAnalyticsController } from './controllers/transportation-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransportRoute,
      TransportStop,
      StudentTransport,
      Vehicle,
      Driver,
    ]),
  ],
  controllers: [
    RouteController,
    VehicleController,
    DriverController,
    StudentTransportController,
    TransportationAnalyticsController,
  ],
  providers: [
    RouteService,
    VehicleService,
    DriverService,
    StudentTransportService,
  ],
  exports: [
    RouteService,
    VehicleService,
    DriverService,
    StudentTransportService,
  ],
})
export class TransportationModule {}