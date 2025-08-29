// Academia Pro - Students Module
// Manages student lifecycle from enrollment to graduation

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { StudentsController } from './students.controller';

// Services
import { StudentsService } from './students.service';

// Entities
import { Student } from './student.entity';

// Guards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
  ],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [StudentsService],
})
export class StudentsModule {}