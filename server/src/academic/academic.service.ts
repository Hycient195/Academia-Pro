// Academia Pro - Academic Service
// Business logic for academic management (subjects, curricula, classes, objectives)

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';
import { Class } from './class.entity';
import { LearningObjective } from './learning-objective.entity';
import { CurriculumSubject } from './curriculum-subject.entity';
import { ClassSubject } from './class-subject.entity';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  CreateCurriculumDto,
  CreateClassDto,
  CreateLearningObjectiveDto,
  SubjectResponseDto,
  CurriculumResponseDto,
  ClassResponseDto,
  LearningObjectiveResponseDto,
} from './dtos';
import { TSubjectType, TGradeLevel, TAcademicYearStatus, ISubjectFilters, ICurriculumFilters, IClassFilters, IAcademicStatistics } from '../../../common/src/types/academic/academic.types';

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(Curriculum)
    private curriculaRepository: Repository<Curriculum>,
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(LearningObjective)
    private learningObjectivesRepository: Repository<LearningObjective>,
    @InjectRepository(CurriculumSubject)
    private curriculumSubjectsRepository: Repository<CurriculumSubject>,
    @InjectRepository(ClassSubject)
    private classSubjectsRepository: Repository<ClassSubject>,
    private dataSource: DataSource,
  ) {}

  // Subject Management
  async createSubject(createSubjectDto: CreateSubjectDto): Promise<SubjectResponseDto> {
    const { code, schoolId, ...subjectData } = createSubjectDto;

    // Check if subject code already exists in the school
    const existingSubject = await this.subjectsRepository.findOne({
      where: { code, schoolId },
    });

    if (existingSubject) {
      throw new ConflictException('Subject with this code already exists in this school');
    }

    const subject = this.subjectsRepository.create({
      ...subjectData,
      code,
      schoolId,
      isActive: true,
    });

    return this.subjectsRepository.save(subject);
  }

  async findAllSubjects(options?: {
    page?: number;
    limit?: number;
    filters?: ISubjectFilters;
  }): Promise<{ subjects: Subject[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.subjectsRepository.createQueryBuilder('subject');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('subject.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.type) {
      queryBuilder.andWhere('subject.type = :type', { type: filters.type });
    }

    if (filters?.gradeLevel) {
      queryBuilder.andWhere('subject.gradeLevels LIKE :gradeLevel', {
        gradeLevel: `%${filters.gradeLevel}%`
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('subject.isActive = :isActive', { isActive: filters.isActive });
    }

    // Apply pagination
    queryBuilder
      .orderBy('subject.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [subjects, total] = await queryBuilder.getManyAndCount();

    return { subjects, total, page, limit };
  }

  async findSubjectById(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async updateSubject(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findSubjectById(id);

    // Check for unique constraint if updating code
    if (updateSubjectDto.code && updateSubjectDto.code !== subject.code) {
      const existingSubject = await this.subjectsRepository.findOne({
        where: { code: updateSubjectDto.code, schoolId: subject.schoolId },
      });

      if (existingSubject) {
        throw new ConflictException('Subject with this code already exists in this school');
      }
    }

    Object.assign(subject, updateSubjectDto);
    const savedSubject = await this.subjectsRepository.save(subject);
    return SubjectResponseDto.fromEntity(savedSubject);
  }

  async deleteSubject(id: string): Promise<void> {
    const subject = await this.findSubjectById(id);

    // Check if subject is used in any curriculum or class
    const curriculumCount = await this.curriculumSubjectsRepository.count({
      where: { subjectId: id },
    });

    const classCount = await this.classSubjectsRepository.count({
      where: { subjectId: id },
    });

    if (curriculumCount > 0 || classCount > 0) {
      throw new BadRequestException('Cannot delete subject that is assigned to curricula or classes');
    }

    await this.subjectsRepository.remove(subject);
  }

  // Curriculum Management
  async createCurriculum(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    const { schoolId, ...curriculumData } = createCurriculumDto;

    const curriculum = this.curriculaRepository.create({
      ...curriculumData,
      schoolId,
      status: TAcademicYearStatus.PLANNING,
    });

    return this.curriculaRepository.save(curriculum);
  }

  async findAllCurricula(options?: {
    page?: number;
    limit?: number;
    filters?: ICurriculumFilters;
  }): Promise<{ curricula: Curriculum[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.curriculaRepository.createQueryBuilder('curriculum');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('curriculum.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.gradeLevel) {
      queryBuilder.andWhere('curriculum.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.academicYear) {
      queryBuilder.andWhere('curriculum.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.status) {
      queryBuilder.andWhere('curriculum.status = :status', { status: filters.status });
    }

    // Apply pagination
    queryBuilder
      .orderBy('curriculum.academicYear', 'DESC')
      .addOrderBy('curriculum.gradeLevel', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [curricula, total] = await queryBuilder.getManyAndCount();

    return { curricula, total, page, limit };
  }

  async findCurriculumById(id: string): Promise<Curriculum> {
    const curriculum = await this.curriculaRepository.findOne({
      where: { id },
      relations: ['subjects', 'learningObjectives'],
    });

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    return curriculum;
  }

  // Class Management
  async createClass(createClassDto: CreateClassDto): Promise<Class> {
    const { schoolId, ...classData } = createClassDto;

    const class_ = this.classesRepository.create({
      ...classData,
      schoolId,
      currentEnrollment: 0,
      isActive: true,
    });

    return this.classesRepository.save(class_);
  }

  async findAllClasses(options?: {
    page?: number;
    limit?: number;
    filters?: IClassFilters;
  }): Promise<{ classes: Class[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.classesRepository.createQueryBuilder('class');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('class.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.gradeLevel) {
      queryBuilder.andWhere('class.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.academicYear) {
      queryBuilder.andWhere('class.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('class.isActive = :isActive', { isActive: filters.isActive });
    }

    // Apply pagination
    queryBuilder
      .orderBy('class.gradeLevel', 'ASC')
      .addOrderBy('class.section', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [classes, total] = await queryBuilder.getManyAndCount();

    return { classes, total, page, limit };
  }

  async findClassById(id: string): Promise<Class> {
    const class_ = await this.classesRepository.findOne({
      where: { id },
      relations: ['classSubjects'],
    });

    if (!class_) {
      throw new NotFoundException('Class not found');
    }

    return class_;
  }

  // Learning Objectives Management
  async createLearningObjective(createLearningObjectiveDto: CreateLearningObjectiveDto): Promise<LearningObjective> {
    const objective = this.learningObjectivesRepository.create({
      ...createLearningObjectiveDto,
      isActive: true,
    });

    return this.learningObjectivesRepository.save(objective);
  }

  async findAllLearningObjectives(options?: {
    page?: number;
    limit?: number;
    filters?: any;
  }): Promise<{ objectives: LearningObjective[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.learningObjectivesRepository.createQueryBuilder('objective')
      .leftJoinAndSelect('objective.subject', 'subject');

    // Apply filters
    if (filters?.gradeLevel) {
      queryBuilder.andWhere('objective.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.subjectId) {
      queryBuilder.andWhere('objective.subjectId = :subjectId', { subjectId: filters.subjectId });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('objective.isActive = :isActive', { isActive: filters.isActive });
    }

    // Apply pagination
    queryBuilder
      .orderBy('objective.gradeLevel', 'ASC')
      .addOrderBy('objective.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [objectives, total] = await queryBuilder.getManyAndCount();

    return { objectives, total, page, limit };
  }

  // Statistics and Analytics
  async getAcademicStatistics(schoolId: string): Promise<IAcademicStatistics> {
    const [
      totalSubjects,
      totalCurricula,
      totalClasses,
      totalObjectives,
      subjectsByType,
      classesByGrade,
      curriculaByStatus,
      objectivesByType,
    ] = await Promise.all([
      this.subjectsRepository.count({ where: { schoolId } }),
      this.curriculaRepository.count({ where: { schoolId } }),
      this.classesRepository.count({ where: { schoolId } }),
      this.learningObjectivesRepository.count({ where: { curriculum: { schoolId } } }),

      // Subjects by type
      this.subjectsRepository
        .createQueryBuilder('subject')
        .select('subject.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('subject.schoolId = :schoolId', { schoolId })
        .groupBy('subject.type')
        .getRawMany(),

      // Classes by grade
      this.classesRepository
        .createQueryBuilder('class')
        .select('class.gradeLevel', 'gradeLevel')
        .addSelect('COUNT(*)', 'count')
        .where('class.schoolId = :schoolId', { schoolId })
        .groupBy('class.gradeLevel')
        .getRawMany(),

      // Curricula by status
      this.curriculaRepository
        .createQueryBuilder('curriculum')
        .select('curriculum.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('curriculum.schoolId = :schoolId', { schoolId })
        .groupBy('curriculum.status')
        .getRawMany(),

      // Objectives by type
      this.learningObjectivesRepository
        .createQueryBuilder('objective')
        .select('objective.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('objective.curriculum.schoolId = :schoolId', { schoolId })
        .groupBy('objective.type')
        .getRawMany(),
    ]);

    return {
      totalSubjects,
      totalCurricula,
      totalClasses,
      totalObjectives,
      subjectsByType: this.convertToRecord(subjectsByType, 'type'),
      classesByGrade: this.convertToRecord(classesByGrade, 'gradeLevel'),
      curriculaByStatus: this.convertToRecord(curriculaByStatus, 'status'),
      objectivesByType: this.convertToRecord(objectivesByType, 'type'),
    };
  }

  // Helper method to convert array of objects to record
  private convertToRecord<T extends Record<string, any>>(
    data: any[],
    keyField: string
  ): Record<string, number> {
    const result: Record<string, number> = {};
    data.forEach(item => {
      result[item[keyField]] = parseInt(item.count);
    });
    return result;
  }

  // Curriculum-Subject Management
  async addSubjectToCurriculum(curriculumId: string, subjectId: string, hoursPerWeek: number, assessmentWeight: number, isCompulsory: boolean = true): Promise<CurriculumSubject> {
    const curriculum = await this.findCurriculumById(curriculumId);
    const subject = await this.findSubjectById(subjectId);

    // Check if subject is already in curriculum
    const existing = await this.curriculumSubjectsRepository.findOne({
      where: { curriculumId, subjectId },
    });

    if (existing) {
      throw new ConflictException('Subject is already assigned to this curriculum');
    }

    const curriculumSubject = this.curriculumSubjectsRepository.create({
      curriculumId,
      subjectId,
      hoursPerWeek,
      totalHours: hoursPerWeek * 36, // Assuming 36 weeks per year
      assessmentWeight,
      isCompulsory,
    });

    return this.curriculumSubjectsRepository.save(curriculumSubject);
  }

  // Class-Subject-Teacher Assignment
  async assignSubjectToClass(classId: string, subjectId: string, teacherId: string, schedule: any[]): Promise<ClassSubject> {
    const class_ = await this.findClassById(classId);
    const subject = await this.findSubjectById(subjectId);

    // Check if subject is already assigned to class
    const existing = await this.classSubjectsRepository.findOne({
      where: { classId, subjectId },
    });

    if (existing) {
      throw new ConflictException('Subject is already assigned to this class');
    }

    const classSubject = this.classSubjectsRepository.create({
      classId,
      subjectId,
      teacherId,
      schedule,
    });

    return this.classSubjectsRepository.save(classSubject);
  }
}