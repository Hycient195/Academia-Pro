// Academia Pro - Academic Module
// NestJS module configuration for academic management

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';
import { Class } from './class.entity';
import { LearningObjective } from './learning-objective.entity';
import { CurriculumSubject } from './curriculum-subject.entity';
import { ClassSubject } from './class-subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      Curriculum,
      Class,
      LearningObjective,
      CurriculumSubject,
      ClassSubject,
    ]),
  ],
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}