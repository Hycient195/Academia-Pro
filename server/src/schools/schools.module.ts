// Academia Pro - Schools Module
// Manages school entities and multi-school architecture

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { SchoolsController } from './schools.controller';

// Services
import { SchoolsService } from './schools.service';

// Entities
import { School } from './school.entity';

// Guards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([School]),
  ],
  controllers: [SchoolsController],
  providers: [
    SchoolsService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [SchoolsService],
})
export class SchoolsModule {}