// Academia Pro - Examination Module
// Module for managing examinations, assessments, and results

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Exam } from './entities/exam.entity';
import { ExamResult } from './entities/exam-result.entity';

// Controllers
import { ExaminationController } from './controllers/examination.controller';

// Services
import { ExaminationService } from './services/examination.service';

// Guards
import { ExaminationGuard } from './guards/examination.guard';

// Interceptors
import { ExaminationInterceptor } from './interceptors/examination.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, ExamResult]),
  ],
  controllers: [ExaminationController],
  providers: [
    ExaminationService,
    ExaminationGuard,
    ExaminationInterceptor,
  ],
  exports: [
    ExaminationService,
    ExaminationGuard,
  ],
})
export class ExaminationModule {}