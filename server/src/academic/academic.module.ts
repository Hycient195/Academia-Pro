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
import { CurriculumStandard } from './entities/curriculum-standard.entity';
import { StudentClass } from './entities/student-class.entity';
import { SubstituteTeacher } from './entities/substitute-teacher.entity';
import { TeacherWorkload } from './entities/teacher-workload.entity';
import { Syllabus } from './entities/syllabus.entity';
import { SectionAssignment } from './entities/section-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      Curriculum,
      Class,
      LearningObjective,
      CurriculumSubject,
      ClassSubject,
      CurriculumStandard,
      StudentClass,
      SubstituteTeacher,
      TeacherWorkload,
      Syllabus,
      SectionAssignment,
    ]),
  ],
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}