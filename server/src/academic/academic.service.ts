// Academia Pro - Academic Service
// Business logic for academic management (subjects, curricula, classes, objectives)

import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';
import { Class } from './class.entity';
import { LearningObjective } from './learning-objective.entity';
import { CurriculumSubject } from './curriculum-subject.entity';
import { ClassSubject } from './class-subject.entity';
import { CurriculumStandard } from './entities/curriculum-standard.entity';
import { StudentClass, EnrollmentStatus } from './entities/student-class.entity';
import { SubstituteTeacher, SubstituteRequestStatus } from './entities/substitute-teacher.entity';
import { TeacherWorkload, WorkloadStatus } from './entities/teacher-workload.entity';
import { Syllabus, SyllabusStatus } from './entities/syllabus.entity';
import { SectionAssignment } from './entities/section-assignment.entity';
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
import { TSubjectType, TGradeLevel, TAcademicYearStatus, ISubjectFilters, ICurriculumFilters, IClassFilters, IAcademicStatistics } from '@academia-pro/types/academic';

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
    @InjectRepository(CurriculumStandard)
    private curriculumStandardsRepository: Repository<CurriculumStandard>,
    @InjectRepository(StudentClass)
    private studentClassRepository: Repository<StudentClass>,
    @InjectRepository(SubstituteTeacher)
    private substituteTeacherRepository: Repository<SubstituteTeacher>,
    @InjectRepository(TeacherWorkload)
    private teacherWorkloadRepository: Repository<TeacherWorkload>,
    @InjectRepository(Syllabus)
    private syllabusRepository: Repository<Syllabus>,
    @InjectRepository(SectionAssignment)
    private sectionAssignmentRepository: Repository<SectionAssignment>,
    private dataSource: DataSource,
  ) {}

  // Subject Management
  async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const { code, schoolId, ...subjectData } = createSubjectDto;

    // Check if subject code already exists in the school
    const existingSubject = await this.subjectsRepository.findOne({
      where: { code, schoolId },
    });

    if (existingSubject) {
      throw new HttpException('Subject with this code already exists in this school', HttpStatus.CONFLICT);
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
        throw new HttpException('Subject with this code already exists in this school', HttpStatus.CONFLICT);
      }
    }

    Object.assign(subject, updateSubjectDto);
    return this.subjectsRepository.save(subject);
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
      throw new HttpException('Subject is already assigned to this curriculum', HttpStatus.CONFLICT);
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
      throw new HttpException('Subject is already assigned to this class', HttpStatus.CONFLICT);
    }

    const classSubject = this.classSubjectsRepository.create({
      classId,
      subjectId,
      teacherId,
      schedule,
    });

    return this.classSubjectsRepository.save(classSubject);
  }

  // ==================== CURRICULUM STANDARDS MANAGEMENT ====================

  async createCurriculumStandard(createStandardDto: any): Promise<CurriculumStandard> {
    const standard = this.curriculumStandardsRepository.create({
      ...createStandardDto,
      isActive: true,
    });

    const savedStandard = await this.curriculumStandardsRepository.save(standard);
    return Array.isArray(savedStandard) ? savedStandard[0] : savedStandard;
  }

  async findCurriculumStandards(options?: {
    curriculumId?: string;
    subjectId?: string;
    gradeLevel?: string;
    standardType?: string;
    level?: string;
    isActive?: boolean;
    search?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryBuilder = this.curriculumStandardsRepository.createQueryBuilder('standard')
      .leftJoinAndSelect('standard.subject', 'subject')
      .leftJoinAndSelect('standard.curriculum', 'curriculum');

    if (options?.curriculumId) {
      queryBuilder.andWhere('standard.curriculumId = :curriculumId', { curriculumId: options.curriculumId });
    }

    if (options?.subjectId) {
      queryBuilder.andWhere('standard.subjectId = :subjectId', { subjectId: options.subjectId });
    }

    if (options?.gradeLevel) {
      queryBuilder.andWhere('standard.gradeLevel = :gradeLevel', { gradeLevel: options.gradeLevel });
    }

    if (options?.standardType) {
      queryBuilder.andWhere('standard.standardType = :standardType', { standardType: options.standardType });
    }

    if (options?.level) {
      queryBuilder.andWhere('standard.level = :level', { level: options.level });
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('standard.isActive = :isActive', { isActive: options.isActive });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(standard.code ILIKE :search OR standard.title ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.schoolId) {
      queryBuilder.andWhere('standard.schoolId = :schoolId', { schoolId: options.schoolId });
    }

    const [standards, total] = await queryBuilder
      .orderBy('standard.gradeLevel', 'ASC')
      .addOrderBy('standard.sequenceOrder', 'ASC')
      .skip((options?.page - 1 || 0) * (options?.limit || 10))
      .take(options?.limit || 10)
      .getManyAndCount();

    return {
      standards,
      total,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  }

  async findCurriculumStandardById(id: string): Promise<any> {
    return this.curriculumStandardsRepository.findOne({
      where: { id },
      relations: ['subject', 'curriculum'],
    });
  }

  async updateCurriculumStandard(id: string, updateDto: any): Promise<any> {
    await this.curriculumStandardsRepository.update(id, {
      ...updateDto,
      updatedAt: new Date(),
    });
    return this.findCurriculumStandardById(id);
  }

  // ==================== STUDENT-CLASS MANAGEMENT ====================

  async enrollStudentInClass(enrollmentDto: any): Promise<any> {
    const enrollment = this.studentClassRepository.create({
      ...enrollmentDto,
      rollNumber: enrollmentDto.rollNumber?.toString(),
      enrollmentStatus: EnrollmentStatus.ENROLLED,
      enrollmentDate: new Date(),
    });
    return this.studentClassRepository.save(enrollment);
  }

  async findStudentEnrollments(options: any): Promise<any> {
    if (typeof options === 'string') {
      // Find by student ID
      const enrollments = await this.studentClassRepository.find({
        where: { studentId: options },
        relations: ['class'],
        order: { enrollmentDate: 'DESC' },
      });
      return enrollments;
    }

    // Find with filters
    const queryBuilder = this.studentClassRepository.createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.class', 'class');

    if (options?.studentId) {
      queryBuilder.andWhere('enrollment.studentId = :studentId', { studentId: options.studentId });
    }

    if (options?.classId) {
      queryBuilder.andWhere('enrollment.classId = :classId', { classId: options.classId });
    }

    if (options?.academicYear) {
      queryBuilder.andWhere('enrollment.academicYear = :academicYear', { academicYear: options.academicYear });
    }

    if (options?.enrollmentStatus) {
      queryBuilder.andWhere('enrollment.enrollmentStatus = :enrollmentStatus', { enrollmentStatus: options.enrollmentStatus });
    }

    if (options?.enrollmentType) {
      queryBuilder.andWhere('enrollment.enrollmentType = :enrollmentType', { enrollmentType: options.enrollmentType });
    }

    if (options?.gradeLevel) {
      queryBuilder.andWhere('class.gradeLevel = :gradeLevel', { gradeLevel: options.gradeLevel });
    }

    if (options?.schoolId) {
      queryBuilder.andWhere('enrollment.schoolId = :schoolId', { schoolId: options.schoolId });
    }

    const [enrollments, total] = await queryBuilder
      .orderBy('enrollment.enrollmentDate', 'DESC')
      .skip((options?.page - 1 || 0) * (options?.limit || 10))
      .take(options?.limit || 10)
      .getManyAndCount();

    return {
      enrollments,
      total,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  }

  async updateStudentEnrollment(studentId: string, classId: string, updateDto: any): Promise<any> {
    await this.studentClassRepository.update(
      { studentId, classId },
      {
        ...updateDto,
        rollNumber: updateDto.rollNumber?.toString(),
        updatedAt: new Date(),
      },
    );
    return this.studentClassRepository.findOne({
      where: { studentId, classId },
      relations: ['class'],
    });
  }

  async withdrawStudentFromClass(studentId: string, classId: string, withdrawDto: any): Promise<any> {
    await this.studentClassRepository.update(
      { studentId, classId },
      {
        enrollmentStatus: EnrollmentStatus.WITHDRAWN,
        withdrawalReason: withdrawDto.reason,
        withdrawalDate: withdrawDto.withdrawalDate || new Date(),
        finalGrade: withdrawDto.finalGrade,
        exitNotes: withdrawDto.exitNotes,
        updatedAt: new Date(),
      },
    );
    return { message: 'Student withdrawn successfully' };
  }

  async bulkEnrollStudents(bulkDto: any): Promise<any> {
    const results = { successful: [], failed: [] };

    for (const enrollment of bulkDto.enrollments) {
      try {
        const result = await this.enrollStudentInClass(enrollment);
        results.successful.push(result);
      } catch (error) {
        results.failed.push({
          enrollment,
          error: error.message,
        });
      }
    }

    return {
      successful: results.successful,
      failed: results.failed,
      totalProcessed: bulkDto.enrollments.length,
      successfulCount: results.successful.length,
      failedCount: results.failed.length,
    };
  }

  async findClassEnrollments(classId: string, academicYear?: string): Promise<StudentClass[]> {
    const queryBuilder = this.studentClassRepository.createQueryBuilder('enrollment')
      .where('enrollment.classId = :classId', { classId });

    if (academicYear) {
      queryBuilder.andWhere('enrollment.academicYear = :academicYear', { academicYear });
    }

    return queryBuilder.getMany();
  }


  // ==================== SUBSTITUTE TEACHER MANAGEMENT ====================

  async createSubstituteRequest(requestData: {
    classSubjectId: string;
    originalTeacherId: string;
    schoolId: string;
    date: Date;
    startTime: string;
    endTime: string;
    requestedBy: string;
    reason?: any;
    priority?: any;
  }): Promise<SubstituteTeacher> {
    const request = SubstituteTeacher.createRequest(
      requestData.classSubjectId,
      requestData.originalTeacherId,
      requestData.schoolId,
      requestData.date,
      requestData.startTime,
      requestData.endTime,
      requestData.requestedBy,
      requestData.reason,
      requestData.priority,
    );

    return this.substituteTeacherRepository.save(request);
  }

  async findSubstituteRequests(options?: {
    originalTeacherId?: string;
    substituteTeacherId?: string;
    date?: Date;
    status?: string;
    priority?: string;
    reason?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryBuilder = this.substituteTeacherRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.classSubject', 'classSubject')
      .leftJoinAndSelect('classSubject.class', 'class')
      .leftJoinAndSelect('classSubject.subject', 'subject');

    if (options?.originalTeacherId) {
      queryBuilder.andWhere('request.originalTeacherId = :originalTeacherId', { originalTeacherId: options.originalTeacherId });
    }

    if (options?.substituteTeacherId) {
      queryBuilder.andWhere('request.substituteTeacherId = :substituteTeacherId', { substituteTeacherId: options.substituteTeacherId });
    }

    if (options?.date) {
      queryBuilder.andWhere('request.date = :date', { date: options.date });
    }

    if (options?.status) {
      queryBuilder.andWhere('request.status = :status', { status: options.status });
    }

    if (options?.priority) {
      queryBuilder.andWhere('request.priority = :priority', { priority: options.priority });
    }

    if (options?.reason) {
      queryBuilder.andWhere('request.reason = :reason', { reason: options.reason });
    }

    if (options?.schoolId) {
      queryBuilder.andWhere('request.schoolId = :schoolId', { schoolId: options.schoolId });
    }

    const [requests, total] = await queryBuilder
      .orderBy('request.date', 'DESC')
      .addOrderBy('request.priority', 'DESC')
      .skip((options?.page - 1 || 0) * (options?.limit || 10))
      .take(options?.limit || 10)
      .getManyAndCount();

    return {
      requests,
      total,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  }

  async updateSubstituteRequest(id: string, updateDto: any): Promise<any> {
    await this.substituteTeacherRepository.update(id, {
      ...updateDto,
      updatedAt: new Date(),
    });
    return this.substituteTeacherRepository.findOne({
      where: { id },
      relations: ['classSubject'],
    });
  }

  async assignSubstituteTeacher(id: string, assignDto: any): Promise<any> {
    await this.substituteTeacherRepository.update(id, {
      substituteTeacherId: assignDto.substituteTeacherId,
      status: SubstituteRequestStatus.APPROVED,
      assignedBy: assignDto.assignedBy,
      assignedAt: new Date(),
      adminNotes: assignDto.assignmentNotes,
      updatedAt: new Date(),
    });
    return this.substituteTeacherRepository.findOne({
      where: { id },
      relations: ['classSubject'],
    });
  }

  async submitSubstituteFeedback(id: string, feedbackDto: any): Promise<any> {
    await this.substituteTeacherRepository.update(id, {
      substituteFeedback: feedbackDto,
      status: SubstituteRequestStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
    return { message: 'Feedback submitted successfully' };
  }


  async approveSubstituteRequest(requestId: string, approvedBy: string): Promise<SubstituteTeacher> {
    const request = await this.substituteTeacherRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Substitute request not found');
    }

    request.approve(approvedBy);
    return this.substituteTeacherRepository.save(request);
  }

  // ==================== TEACHER WORKLOAD MANAGEMENT ====================

  async createTeacherWorkload(workloadData: {
    teacherId: string;
    schoolId: string;
    academicYear: string;
    contractedHours?: number;
  }): Promise<TeacherWorkload> {
    const workload = TeacherWorkload.createWorkload(
      workloadData.teacherId,
      workloadData.schoolId,
      workloadData.academicYear,
      workloadData.contractedHours,
    );

    return this.teacherWorkloadRepository.save(workload);
  }

  async findTeacherWorkload(teacherId: string, academicYear: string): Promise<TeacherWorkload | null> {
    return this.teacherWorkloadRepository.findOne({
      where: { teacherId, academicYear },
    });
  }

  async updateTeacherWorkloadHours(
    teacherId: string,
    academicYear: string,
    updates: {
      teachingHours?: number;
      preparationHours?: number;
      assessmentHours?: number;
      administrativeHours?: number;
      extracurricularHours?: number;
    },
  ): Promise<TeacherWorkload> {
    const workload = await this.findTeacherWorkload(teacherId, academicYear);
    if (!workload) {
      throw new NotFoundException('Teacher workload not found');
    }

    Object.assign(workload, updates);
    workload.totalWorkloadHours =
      (workload.totalTeachingHours || 0) +
      (workload.totalPreparationHours || 0) +
      (workload.totalAssessmentHours || 0) +
      (workload.totalAdministrativeHours || 0) +
      (workload.totalExtracurricularHours || 0);

    workload.updateWorkloadStatus();
    return this.teacherWorkloadRepository.save(workload);
  }

  async findTeacherWorkloads(options?: {
    teacherId?: string;
    academicYear?: string;
    workloadStatus?: string;
    minUtilizationRate?: number;
    maxUtilizationRate?: number;
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryBuilder = this.teacherWorkloadRepository.createQueryBuilder('workload');

    if (options?.teacherId) {
      queryBuilder.andWhere('workload.teacherId = :teacherId', { teacherId: options.teacherId });
    }

    if (options?.academicYear) {
      queryBuilder.andWhere('workload.academicYear = :academicYear', { academicYear: options.academicYear });
    }

    if (options?.workloadStatus) {
      queryBuilder.andWhere('workload.workloadStatus = :workloadStatus', { workloadStatus: options.workloadStatus });
    }

    if (options?.minUtilizationRate) {
      queryBuilder.andWhere('workload.utilizationRate >= :minUtilizationRate', { minUtilizationRate: options.minUtilizationRate });
    }

    if (options?.maxUtilizationRate) {
      queryBuilder.andWhere('workload.utilizationRate <= :maxUtilizationRate', { maxUtilizationRate: options.maxUtilizationRate });
    }

    if (options?.schoolId) {
      queryBuilder.andWhere('workload.schoolId = :schoolId', { schoolId: options.schoolId });
    }

    const [workloads, total] = await queryBuilder
      .orderBy('workload.utilizationRate', 'DESC')
      .skip((options?.page - 1 || 0) * (options?.limit || 10))
      .take(options?.limit || 10)
      .getManyAndCount();

    return {
      workloads,
      total,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  }

  async updateTeacherWorkload(teacherId: string, academicYear: string, updateDto: any): Promise<any> {
    const workload = await this.findTeacherWorkload(teacherId, academicYear);
    if (!workload) {
      throw new NotFoundException('Teacher workload not found');
    }

    Object.assign(workload, updateDto);
    this.calculateWorkloadHours(workload);

    return this.teacherWorkloadRepository.save(workload);
  }

  private calculateWorkloadHours(workload: any): void {
    workload.totalWorkloadHours =
      (workload.totalTeachingHours || 0) +
      (workload.totalPreparationHours || 0) +
      (workload.totalAssessmentHours || 0) +
      (workload.totalAdministrativeHours || 0) +
      (workload.totalExtracurricularHours || 0) +
      (workload.totalProfessionalDevelopmentHours || 0) -
      (workload.totalLeaveHours || 0);

    const contractedHours = workload.contractedHours || 40;
    workload.utilizationRate = contractedHours > 0 ? (workload.totalWorkloadHours / contractedHours) * 100 : 0;

    // Determine workload status
    if (workload.utilizationRate >= 120) {
      workload.workloadStatus = WorkloadStatus.CRITICAL;
    } else if (workload.utilizationRate >= 100) {
      workload.workloadStatus = WorkloadStatus.OVER_LOADED;
    } else if (workload.utilizationRate >= 80) {
      workload.workloadStatus = WorkloadStatus.OPTIMAL;
    } else if (workload.utilizationRate >= 60) {
      workload.workloadStatus = WorkloadStatus.UNDER_LOADED;
    } else {
      workload.workloadStatus = WorkloadStatus.UNDER_LOADED;
    }

    workload.isOverloaded = workload.workloadStatus === 'over_loaded' || workload.workloadStatus === 'critical';
    workload.isUnderloaded = workload.workloadStatus === 'under_loaded';
  }

  async getWorkloadAnalytics(schoolId: string, academicYear: string): Promise<{
    totalTeachers: number;
    optimalWorkload: number;
    overLoaded: number;
    underLoaded: number;
    criticalLoad: number;
    averageUtilization: number;
  }> {
    const workloads = await this.teacherWorkloadRepository.find({
      where: { schoolId, academicYear },
    });

    const totalTeachers = workloads.length;
    const optimalWorkload = workloads.filter(w => w.workloadStatus === WorkloadStatus.OPTIMAL).length;
    const overLoaded = workloads.filter(w => w.isOverloaded).length;
    const underLoaded = workloads.filter(w => w.isUnderloaded).length;
    const criticalLoad = workloads.filter(w => w.workloadStatus === WorkloadStatus.CRITICAL).length;
    const averageUtilization = workloads.length > 0
      ? workloads.reduce((sum, w) => sum + w.utilizationRate, 0) / workloads.length
      : 0;

    return {
      totalTeachers,
      optimalWorkload,
      overLoaded,
      underLoaded,
      criticalLoad,
      averageUtilization,
    };
  }

  // ==================== ACADEMIC ANALYTICS & REPORTING ====================

  async getAdvancedAcademicStatistics(schoolId: string, academicYear?: string): Promise<any> {
    const [
      totalSubjects,
      totalCurricula,
      totalClasses,
      totalStudents,
      totalTeachers,
      curriculumStandards,
      studentEnrollments,
      substituteRequests,
      workloadAnalytics,
    ] = await Promise.all([
      this.subjectsRepository.count({ where: { schoolId } }),
      this.curriculaRepository.count({ where: { schoolId } }),
      this.classesRepository.count({ where: { schoolId } }),
      this.studentClassRepository.count({
        where: { schoolId, enrollmentStatus: EnrollmentStatus.ENROLLED }
      }),
      this.teacherWorkloadRepository.count({
        where: { schoolId, academicYear: academicYear || new Date().getFullYear().toString() }
      }),
      this.curriculumStandardsRepository.count({ where: { schoolId } }),
      this.studentClassRepository.count({ where: { schoolId } }),
      this.substituteTeacherRepository.count({ where: { schoolId } }),
      this.getWorkloadAnalytics(schoolId, academicYear || new Date().getFullYear().toString()),
    ]);

    return {
      overview: {
        totalSubjects,
        totalCurricula,
        totalClasses,
        totalStudents,
        totalTeachers,
        totalCurriculumStandards: curriculumStandards,
        totalEnrollments: studentEnrollments,
        totalSubstituteRequests: substituteRequests,
      },
      workloadAnalytics,
      academicYear: academicYear || new Date().getFullYear().toString(),
      generatedAt: new Date(),
    };
  }

  // ==================== BULK OPERATIONS ====================


  async bulkAssignSubjectsToClasses(assignments: Array<{
    classId: string;
    subjectId: string;
    teacherId: string;
    schedule: any[];
  }>): Promise<ClassSubject[]> {
    const assignmentEntities = await Promise.all(
      assignments.map(async (assignment) => {
        return this.assignSubjectToClass(
          assignment.classId,
          assignment.subjectId,
          assignment.teacherId,
          assignment.schedule,
        );
      })
    );

    return assignmentEntities;
  }

  // ==================== ACADEMIC YEAR MANAGEMENT ====================

  async createAcademicYear(yearData: {
    year: string;
    startDate: Date;
    endDate: Date;
    schoolId: string;
    createdBy: string;
  }): Promise<any> {
    // This would typically create an academic year entity
    // For now, return a placeholder
    return {
      id: `ay-${yearData.year}`,
      ...yearData,
      status: 'active',
      createdAt: new Date(),
    };
  }

  async getAcademicYearStatus(schoolId: string, year: string): Promise<any> {
    // Calculate academic year statistics
    const [
      totalClasses,
      totalEnrollments,
      activeEnrollments,
      totalSubstituteRequests,
      pendingSubstitutes,
    ] = await Promise.all([
      this.classesRepository.count({ where: { schoolId, academicYear: year } }),
      this.studentClassRepository.count({ where: { schoolId, academicYear: year } }),
      this.studentClassRepository.count({
        where: { schoolId, academicYear: year, enrollmentStatus: EnrollmentStatus.ENROLLED }
      }),
      this.substituteTeacherRepository.count({ where: { schoolId } }),
      this.substituteTeacherRepository.count({
        where: { schoolId, status: SubstituteRequestStatus.PENDING }
      }),
    ]);

    return {
      academicYear: year,
      schoolId,
      totalClasses,
      totalEnrollments,
      activeEnrollments,
      enrollmentRate: totalEnrollments > 0 ? (activeEnrollments / totalEnrollments) * 100 : 0,
      totalSubstituteRequests,
      pendingSubstitutes,
      substituteFulfillmentRate: totalSubstituteRequests > 0
        ? ((totalSubstituteRequests - pendingSubstitutes) / totalSubstituteRequests) * 100
        : 100,
    };
  }

  // ==================== SYLLABUS MANAGEMENT ====================

  async createSyllabus(syllabusData: {
    curriculumId: string;
    subjectId: string;
    schoolId: string;
    academicYear: string;
    gradeLevel: string;
    title: string;
    createdBy: string;
    totalWeeks?: number;
    totalHours?: number;
  }): Promise<Syllabus> {
    const syllabus = Syllabus.createSyllabus(
      syllabusData.curriculumId,
      syllabusData.subjectId,
      syllabusData.schoolId,
      syllabusData.academicYear,
      syllabusData.gradeLevel,
      syllabusData.createdBy,
      syllabusData.title,
    );

    if (syllabusData.totalWeeks) {
      syllabus.totalWeeks = syllabusData.totalWeeks;
    }

    if (syllabusData.totalHours) {
      syllabus.totalHours = syllabusData.totalHours;
    }

    return this.syllabusRepository.save(syllabus);
  }

  async findSyllabi(options?: {
    curriculumId?: string;
    subjectId?: string;
    academicYear?: string;
    gradeLevel?: string;
    status?: string;
  }): Promise<Syllabus[]> {
    const queryBuilder = this.syllabusRepository.createQueryBuilder('syllabus')
      .leftJoinAndSelect('syllabus.subject', 'subject')
      .leftJoinAndSelect('syllabus.curriculum', 'curriculum');

    if (options?.curriculumId) {
      queryBuilder.andWhere('syllabus.curriculumId = :curriculumId', { curriculumId: options.curriculumId });
    }

    if (options?.subjectId) {
      queryBuilder.andWhere('syllabus.subjectId = :subjectId', { subjectId: options.subjectId });
    }

    if (options?.academicYear) {
      queryBuilder.andWhere('syllabus.academicYear = :academicYear', { academicYear: options.academicYear });
    }

    if (options?.gradeLevel) {
      queryBuilder.andWhere('syllabus.gradeLevel = :gradeLevel', { gradeLevel: options.gradeLevel });
    }

    if (options?.status) {
      queryBuilder.andWhere('syllabus.status = :status', { status: options.status });
    }

    return queryBuilder.orderBy('syllabus.gradeLevel', 'ASC').getMany();
  }

  async updateSyllabusStatus(syllabusId: string, status: any, updatedBy: string): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });

    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    syllabus.status = status;
    syllabus.updatedAt = new Date();

    if (status === SyllabusStatus.APPROVED) {
      syllabus.approve(updatedBy);
    } else if (status === SyllabusStatus.PUBLISHED) {
      syllabus.publish();
    }

    return this.syllabusRepository.save(syllabus);
  }

  // ==================== SECTION ASSIGNMENT MANAGEMENT ====================

  async createSectionAssignment(sectionData: {
    classId: string;
    schoolId: string;
    academicYear: string;
    gradeLevel: string;
    sectionName: string;
    capacity: number;
    createdBy: string;
    sectionType?: any;
  }): Promise<SectionAssignment> {
    const section = SectionAssignment.createSection(
      sectionData.classId,
      sectionData.schoolId,
      sectionData.academicYear,
      sectionData.gradeLevel,
      sectionData.sectionName,
      sectionData.capacity,
      sectionData.createdBy,
    );

    if (sectionData.sectionType) {
      section.sectionType = sectionData.sectionType;
    }

    return this.sectionAssignmentRepository.save(section);
  }

  async findSectionAssignments(options?: {
    classId?: string;
    academicYear?: string;
    gradeLevel?: string;
    status?: string;
  }): Promise<SectionAssignment[]> {
    const queryBuilder = this.sectionAssignmentRepository.createQueryBuilder('section')
      .leftJoinAndSelect('section.class', 'class');

    if (options?.classId) {
      queryBuilder.andWhere('section.classId = :classId', { classId: options.classId });
    }

    if (options?.academicYear) {
      queryBuilder.andWhere('section.academicYear = :academicYear', { academicYear: options.academicYear });
    }

    if (options?.gradeLevel) {
      queryBuilder.andWhere('section.gradeLevel = :gradeLevel', { gradeLevel: options.gradeLevel });
    }

    if (options?.status) {
      queryBuilder.andWhere('section.status = :status', { status: options.status });
    }

    return queryBuilder.orderBy('section.gradeLevel', 'ASC')
                      .addOrderBy('section.sectionName', 'ASC')
                      .getMany();
  }

  async assignStudentToSection(sectionId: string, studentData: {
    studentId: string;
    studentName: string;
    rollNumber: number;
  }): Promise<SectionAssignment> {
    const section = await this.sectionAssignmentRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    section.enrollStudent(
      studentData.studentId,
      studentData.studentName,
      studentData.rollNumber,
    );

    return this.sectionAssignmentRepository.save(section);
  }

  async assignClassTeacherToSection(sectionId: string, teacherData: {
    teacherId: string;
    teacherName: string;
    assignedBy: string;
  }): Promise<SectionAssignment> {
    const section = await this.sectionAssignmentRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    section.assignClassTeacher(
      teacherData.teacherId,
      teacherData.teacherName,
      teacherData.assignedBy,
    );

    return this.sectionAssignmentRepository.save(section);
  }

  // ==================== TEACHER ASSIGNMENT OPTIMIZATION ====================

  async optimizeTeacherAssignments(schoolId: string, academicYear: string): Promise<{
    assignments: any[];
    workloadAnalysis: any;
    optimizationSuggestions: string[];
  }> {
    // Get all teachers and their current workloads
    const workloads = await this.teacherWorkloadRepository.find({
      where: { schoolId, academicYear },
    });

    // Get all class-subject assignments
    const classSubjects = await this.classSubjectsRepository.find({
      where: { class: { schoolId, academicYear } },
      relations: ['class', 'subject'],
    });

    // Analyze current workload distribution
    const workloadAnalysis = {
      totalTeachers: workloads.length,
      optimalWorkload: workloads.filter(w => w.isOptimal).length,
      overLoaded: workloads.filter(w => w.isOverloaded).length,
      underLoaded: workloads.filter(w => w.isUnderloaded).length,
      averageUtilization: workloads.length > 0
        ? workloads.reduce((sum, w) => sum + w.utilizationRate, 0) / workloads.length
        : 0,
    };

    // Generate optimization suggestions
    const optimizationSuggestions: string[] = [];

    if (workloadAnalysis.overLoaded > 0) {
      optimizationSuggestions.push(`${workloadAnalysis.overLoaded} teachers are overloaded. Consider redistributing subjects.`);
    }

    if (workloadAnalysis.underLoaded > 0) {
      optimizationSuggestions.push(`${workloadAnalysis.underLoaded} teachers have capacity for additional subjects.`);
    }

    if (workloadAnalysis.averageUtilization < 70) {
      optimizationSuggestions.push('Overall teacher utilization is low. Consider optimizing subject assignments.');
    }

    // Generate optimized assignments
    const assignments = await this.generateOptimizedAssignments(classSubjects, workloads);

    return {
      assignments,
      workloadAnalysis,
      optimizationSuggestions,
    };
  }

  private async generateOptimizedAssignments(classSubjects: any[], workloads: TeacherWorkload[]): Promise<any[]> {
    const assignments: any[] = [];
    const teacherMap = new Map(workloads.map(w => [w.teacherId, w]));

    for (const classSubject of classSubjects) {
      // Find best teacher for this subject based on workload and expertise
      const bestTeacher = this.findBestTeacherForSubject(classSubject, workloads);

      if (bestTeacher) {
        assignments.push({
          classSubjectId: classSubject.id,
          className: classSubject.class.name,
          subjectName: classSubject.subject.name,
          currentTeacher: classSubject.teacherId,
          recommendedTeacher: bestTeacher.teacherId,
          teacherName: `Teacher ${bestTeacher.teacherId}`,
          currentWorkload: teacherMap.get(classSubject.teacherId)?.utilizationRate || 0,
          recommendedWorkload: bestTeacher.utilizationRate,
          reason: this.getAssignmentReason(classSubject, bestTeacher),
        });
      }
    }

    return assignments;
  }

  private findBestTeacherForSubject(classSubject: any, workloads: TeacherWorkload[]): TeacherWorkload | null {
    // Simple optimization: find teacher with lowest utilization
    let bestTeacher: TeacherWorkload | null = null;
    let lowestUtilization = 100;

    for (const workload of workloads) {
      if (workload.utilizationRate < lowestUtilization && workload.utilizationRate < 90) {
        lowestUtilization = workload.utilizationRate;
        bestTeacher = workload;
      }
    }

    return bestTeacher;
  }

  private getAssignmentReason(classSubject: any, teacher: TeacherWorkload): string {
    const currentWorkload = teacher.utilizationRate;

    if (currentWorkload < 60) {
      return 'Teacher has significant capacity for additional subjects';
    } else if (currentWorkload < 80) {
      return 'Teacher has moderate capacity for additional subjects';
    } else {
      return 'Teacher has limited capacity but can accommodate this subject';
    }
  }

  // ==================== ADVANCED ACADEMIC ANALYTICS ====================

  async generateAcademicPerformanceReport(schoolId: string, academicYear: string): Promise<any> {
    const [
      totalStudents,
      totalSubjects,
      totalClasses,
      studentEnrollments,
      curriculumStandards,
      syllabi,
      sectionAssignments,
      substituteRequests,
      workloadAnalytics,
    ] = await Promise.all([
      this.studentClassRepository.count({
        where: { schoolId, academicYear, enrollmentStatus: EnrollmentStatus.ENROLLED }
      }),
      this.subjectsRepository.count({ where: { schoolId } }),
      this.classesRepository.count({ where: { schoolId, academicYear } }),
      this.studentClassRepository.find({
        where: { schoolId, academicYear },
        relations: ['class'],
      }),
      this.curriculumStandardsRepository.count({ where: { schoolId } }),
      this.syllabusRepository.count({ where: { schoolId, academicYear } }),
      this.sectionAssignmentRepository.find({
        where: { schoolId, academicYear },
      }),
      this.substituteTeacherRepository.count({ where: { schoolId } }),
      this.getWorkloadAnalytics(schoolId, academicYear),
    ]);

    // Calculate section utilization
    const sectionUtilization = {
      totalSections: sectionAssignments.length,
      averageUtilization: sectionAssignments.length > 0
        ? sectionAssignments.reduce((sum, s) => sum + s.utilizationRate, 0) / sectionAssignments.length
        : 0,
      fullSections: sectionAssignments.filter(s => s.isFull).length,
      underUtilizedSections: sectionAssignments.filter(s => s.utilizationRate < 70).length,
    };

    // Calculate enrollment distribution
    const enrollmentByGrade = this.calculateEnrollmentByGrade(studentEnrollments);
    const enrollmentBySection = this.calculateEnrollmentBySection(sectionAssignments);

    return {
      overview: {
        academicYear,
        schoolId,
        totalStudents,
        totalSubjects,
        totalClasses,
        totalCurriculumStandards: curriculumStandards,
        totalSyllabi: syllabi,
        totalSections: sectionAssignments.length,
      },
      enrollment: {
        totalEnrollments: studentEnrollments.length,
        activeEnrollments: studentEnrollments.filter(e => e.enrollmentStatus === EnrollmentStatus.ENROLLED).length,
        distributionByGrade: enrollmentByGrade,
        distributionBySection: enrollmentBySection,
      },
      sectionUtilization,
      workloadAnalytics,
      academicHealth: {
        syllabusCompletionRate: syllabi > 0 ? (syllabi / totalSubjects) * 100 : 0,
        standardsCoverage: curriculumStandards > 0 ? (curriculumStandards / totalSubjects) * 100 : 0,
        sectionEfficiency: sectionUtilization.averageUtilization,
        teacherUtilization: workloadAnalytics.averageUtilization,
      },
      generatedAt: new Date(),
    };
  }

  private calculateEnrollmentByGrade(enrollments: StudentClass[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    enrollments.forEach(enrollment => {
      const grade = enrollment.class?.gradeLevel || 'Unknown';
      distribution[grade] = (distribution[grade] || 0) + 1;
    });

    return distribution;
  }

  private calculateEnrollmentBySection(sections: SectionAssignment[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    sections.forEach(section => {
      const sectionType = section.sectionType;
      distribution[sectionType] = (distribution[sectionType] || 0) + section.currentEnrollment;
    });

    return distribution;
  }

  // ==================== INTEGRATION METHODS ====================

  async getStudentAcademicData(studentId: string, academicYear: string): Promise<any> {
    const [
      enrollments,
      curriculumStandards,
      syllabi,
      sectionAssignments,
    ] = await Promise.all([
      this.findStudentEnrollments({ studentId, academicYear }),
      this.curriculumStandardsRepository.find({
        where: { schoolId: (await this.studentClassRepository.findOne({
          where: { studentId, academicYear },
        }))?.schoolId },
      }),
      this.syllabusRepository.find({
        where: { academicYear },
      }),
      this.sectionAssignmentRepository.find({
        where: { studentList: { $elemMatch: { studentId } } } as any,
      }),
    ]);

    return {
      studentId,
      academicYear,
      enrollments,
      curriculumStandards: curriculumStandards.slice(0, 10), // Limit for performance
      syllabi: syllabi.slice(0, 5),
      sectionAssignments,
    };
  }

  async getParentAcademicData(parentId: string, academicYear: string): Promise<any> {
    // This would integrate with parent-student relationships
    // For now, return placeholder
    return {
      parentId,
      academicYear,
      children: [],
      notifications: [],
      reports: [],
    };
  }

  async getTeacherAcademicData(teacherId: string, academicYear: string): Promise<any> {
    const [
      workload,
      classSubjects,
      substituteRequests,
      syllabi,
    ] = await Promise.all([
      this.findTeacherWorkload(teacherId, academicYear),
      this.classSubjectsRepository.find({
        where: { teacherId },
        relations: ['class', 'subject'],
      }),
      this.substituteTeacherRepository.find({
        where: [
          { originalTeacherId: teacherId },
          { substituteTeacherId: teacherId },
        ],
      }),
      this.syllabusRepository.find({
        where: { createdBy: teacherId, academicYear },
      }),
    ]);

    return {
      teacherId,
      academicYear,
      workload,
      classSubjects,
      substituteRequests,
      syllabi,
    };
  }
}