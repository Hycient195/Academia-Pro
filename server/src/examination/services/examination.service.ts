// Academia Pro - Examination Service
// Service for managing examinations, assessments, and results

import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Exam, ExamStatus, ExamType, AssessmentType } from '../entities/exam.entity';
import { ExamResult, ResultStatus } from '../entities/exam-result.entity';
import { Student } from '../../students/student.entity';
import { CreateExamDto, SubmitExamResultDto, GradeExamResultDto, RequestReEvaluationDto } from '../dtos';

@Injectable()
export class ExaminationService {
  private readonly logger = new Logger(ExaminationService.name);

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamResult)
    private readonly examResultRepository: Repository<ExamResult>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  /**
   * Create a new exam
   */
  async createExam(dto: CreateExamDto, createdBy: string): Promise<Exam> {
    // Validate that the exam doesn't conflict with existing exams
    const conflictingExam = await this.examRepository.findOne({
      where: {
        classId: dto.classId,
        scheduledDate: new Date(dto.scheduledDate),
        startTime: dto.startTime,
        status: ExamStatus.SCHEDULED,
      },
    });

    if (conflictingExam) {
      throw new ConflictException(
        `Another exam is already scheduled for this class at the same time`
      );
    }

    // Validate passing marks
    if (dto.passingMarks >= dto.totalMarks) {
      throw new BadRequestException('Passing marks cannot be greater than or equal to total marks');
    }

    // Get academic year and grade level from class (simplified)
    const academicYear = this.getCurrentAcademicYear();
    const gradeLevel = 'Grade 10'; // This would come from class service

    // Create exam
    const examData = {
      examTitle: dto.examTitle,
      examDescription: dto.examDescription,
      examType: dto.examType,
      assessmentType: dto.assessmentType || AssessmentType.SUMMATIVE,
      subjectId: dto.subjectId,
      classId: dto.classId,
      sectionId: dto.sectionId,
      teacherId: dto.teacherId,
      scheduledDate: new Date(dto.scheduledDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationMinutes: dto.durationMinutes,
      bufferTimeMinutes: dto.bufferTimeMinutes || 15,
      totalMarks: dto.totalMarks,
      passingMarks: dto.passingMarks,
      weightagePercentage: dto.weightagePercentage || 100,
      gradingMethod: dto.gradingMethod,
      totalQuestions: dto.totalQuestions,
      instructions: dto.instructions,
      isMandatory: dto.isMandatory !== false,
      allowRetake: dto.allowRetake || false,
      maxRetakes: dto.maxRetakes || 1,
      shuffleQuestions: dto.shuffleQuestions || false,
      shuffleOptions: dto.shuffleOptions || false,
      showResultsImmediately: dto.showResultsImmediately || false,
      allowReviewAfterSubmission: dto.allowReviewAfterSubmission !== false,
      requiresProctoring: dto.requiresProctoring || false,
      proctorId: dto.proctorId,
      monitoringEnabled: dto.monitoringEnabled || false,
      screenshotIntervalMinutes: dto.screenshotIntervalMinutes,
      tabSwitchAllowed: dto.tabSwitchAllowed || false,
      maxTabSwitches: dto.maxTabSwitches || 3,
      eligibilityCriteria: dto.eligibilityCriteria || {},
      excludedStudents: dto.excludedStudents || [],
      notifyStudents: dto.notifyStudents !== false,
      notifyParents: dto.notifyParents || false,
      reminderHoursBefore: dto.reminderHoursBefore || 24,
      academicYear,
      gradeLevel,
      section: dto.sectionId ? 'Section A' : undefined, // This would come from section service
      createdBy,
      updatedBy: createdBy,
    };

    const savedExam = await this.examRepository.save(examData as any);

    this.logger.log(
      `Created exam "${dto.examTitle}" for class ${dto.classId} on ${dto.scheduledDate}`
    );

    return savedExam;
  }

  /**
   * Get exam by ID
   */
  async getExamById(examId: string): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    return exam;
  }

  /**
   * Get exams for a class
   */
  async getClassExams(
    classId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      examType?: ExamType;
      status?: ExamStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Exam[]> {
    const queryBuilder = this.examRepository
      .createQueryBuilder('exam')
      .where('exam.classId = :classId', { classId })
      .orderBy('exam.scheduledDate', 'DESC')
      .addOrderBy('exam.startTime', 'DESC');

    if (options?.startDate) {
      queryBuilder.andWhere('exam.scheduledDate >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      queryBuilder.andWhere('exam.scheduledDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.examType) {
      queryBuilder.andWhere('exam.examType = :examType', {
        examType: options.examType,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('exam.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Update exam
   */
  async updateExam(examId: string, updates: Partial<CreateExamDto>): Promise<Exam> {
    const exam = await this.getExamById(examId);

    // Prevent updates to completed exams
    if (exam.isCompleted) {
      throw new BadRequestException('Cannot update a completed exam');
    }

    // Validate updates
    if (updates.passingMarks && updates.totalMarks && updates.passingMarks >= updates.totalMarks) {
      throw new BadRequestException('Passing marks cannot be greater than or equal to total marks');
    }

    // Apply updates
    Object.assign(exam, updates);
    exam.updatedBy = 'system'; // This would come from request context

    const updatedExam = await this.examRepository.save(exam);

    this.logger.log(`Updated exam ${examId}`);
    return updatedExam;
  }

  /**
   * Publish exam (make it visible to students)
   */
  async publishExam(examId: string): Promise<Exam> {
    const exam = await this.getExamById(examId);

    if (exam.status !== ExamStatus.DRAFT && exam.status !== ExamStatus.SCHEDULED) {
      throw new BadRequestException('Only draft or scheduled exams can be published');
    }

    exam.status = ExamStatus.PUBLISHED;
    const updatedExam = await this.examRepository.save(exam);

    this.logger.log(`Published exam ${examId}`);
    return updatedExam;
  }

  /**
   * Start exam (change status to in progress)
   */
  async startExam(examId: string): Promise<Exam> {
    const exam = await this.getExamById(examId);

    if (!exam.canStart()) {
      throw new BadRequestException('Exam cannot be started at this time');
    }

    exam.status = ExamStatus.IN_PROGRESS;
    const updatedExam = await this.examRepository.save(exam);

    this.logger.log(`Started exam ${examId}`);
    return updatedExam;
  }

  /**
   * Submit exam result
   */
  async submitExamResult(dto: SubmitExamResultDto, submittedBy: string): Promise<ExamResult> {
    const exam = await this.getExamById(dto.examId);

    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      select: ['id', 'firstName', 'lastName'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    // Check if student is eligible
    if (!exam.isEligible(dto.studentId)) {
      throw new BadRequestException('Student is not eligible for this exam');
    }

    // Check if result already exists
    const existingResult = await this.examResultRepository.findOne({
      where: { examId: dto.examId, studentId: dto.studentId },
    });

    if (existingResult && existingResult.status === ResultStatus.SUBMITTED) {
      throw new ConflictException('Exam result already submitted for this student');
    }

    // Calculate total marks from question scores
    let totalObtainedMarks = 0;
    let totalPossibleMarks = 0;

    let questionScores: Array<{
      questionId: string;
      obtainedMarks: number;
      totalMarks: number;
      timeSpentSeconds: number;
      attempts: number;
      isCorrect: boolean;
    }> = [];

    if (dto.questionScores && dto.questionScores.length > 0) {
      totalObtainedMarks = dto.questionScores.reduce((sum, q) => sum + q.obtainedMarks, 0);
      totalPossibleMarks = dto.questionScores.reduce((sum, q) => sum + q.totalMarks, 0);

      // Transform DTO to entity format
      questionScores = dto.questionScores.map(q => ({
        questionId: q.questionId,
        obtainedMarks: q.obtainedMarks,
        totalMarks: q.totalMarks,
        timeSpentSeconds: q.timeSpentSeconds || 0,
        attempts: q.attempts || 1,
        isCorrect: q.isCorrect || false,
      }));
    }

    const result = existingResult || this.examResultRepository.create({
      examId: dto.examId,
      studentId: dto.studentId,
      totalMarks: exam.totalMarks,
      examDate: exam.scheduledDate,
      academicYear: exam.academicYear,
      gradeLevel: exam.gradeLevel,
      section: exam.section,
      subjectName: 'Subject Name', // This would come from subject service
      createdBy: submittedBy,
    });

    // Update result
    result.obtainedMarks = totalObtainedMarks;
    result.questionScores = questionScores;
    result.studentFeedback = dto.notes;

    result.submitExam();

    const savedResult = await this.examResultRepository.save(result);

    // Update exam statistics
    await this.updateExamStatistics(dto.examId);

    this.logger.log(
      `Student ${student.fullName} submitted exam ${exam.examTitle} with ${totalObtainedMarks}/${exam.totalMarks} marks`
    );

    return savedResult;
  }

  /**
   * Grade exam result
   */
  async gradeExamResult(dto: GradeExamResultDto, gradedBy: string): Promise<ExamResult> {
    const result = await this.examResultRepository.findOne({
      where: { id: dto.examResultId },
      relations: ['exam'],
    });

    if (!result) {
      throw new NotFoundException(`Exam result with ID ${dto.examResultId} not found`);
    }

    if (result.status !== ResultStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted results can be graded');
    }

    // Validate marks
    if (dto.obtainedMarks > result.totalMarks) {
      throw new BadRequestException('Obtained marks cannot exceed total marks');
    }

    result.gradeResult(dto.obtainedMarks, gradedBy);
    result.teacherComments = dto.teacherComments;
    result.improvementAreas = dto.improvementAreas || [];
    result.strengths = dto.strengths || [];

    const savedResult = await this.examResultRepository.save(result);

    // Update exam statistics
    await this.updateExamStatistics(result.examId);

    this.logger.log(`Graded exam result ${dto.examResultId}: ${dto.obtainedMarks}/${result.totalMarks} marks`);
    return savedResult;
  }

  /**
   * Get exam results for a specific exam
   */
  async getExamResults(
    examId: string,
    options?: {
      status?: ResultStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<ExamResult[]> {
    const queryBuilder = this.examResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.student', 'student')
      .where('result.examId = :examId', { examId })
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC');

    if (options?.status) {
      queryBuilder.andWhere('result.status = :status', { status: options.status });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get student exam results
   */
  async getStudentExamResults(
    studentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      examType?: ExamType;
      limit?: number;
      offset?: number;
    },
  ): Promise<ExamResult[]> {
    const queryBuilder = this.examResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.exam', 'exam')
      .where('result.studentId = :studentId', { studentId })
      .orderBy('exam.scheduledDate', 'DESC');

    if (options?.startDate) {
      queryBuilder.andWhere('exam.scheduledDate >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      queryBuilder.andWhere('exam.scheduledDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.examType) {
      queryBuilder.andWhere('exam.examType = :examType', {
        examType: options.examType,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Request re-evaluation
   */
  async requestReEvaluation(dto: RequestReEvaluationDto, requestedBy: string): Promise<ExamResult> {
    const result = await this.examResultRepository.findOne({
      where: { id: dto.examResultId },
    });

    if (!result) {
      throw new NotFoundException(`Exam result with ID ${dto.examResultId} not found`);
    }

    if (result.studentId !== requestedBy) {
      throw new BadRequestException('Only the student can request re-evaluation');
    }

    result.requestReEvaluation(dto.reason);
    const updatedResult = await this.examResultRepository.save(result);

    this.logger.log(`Re-evaluation requested for exam result ${dto.examResultId}`);
    return updatedResult;
  }

  /**
   * Get exam statistics
   */
  async getExamStatistics(examId: string): Promise<{
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passPercentage: number;
    gradeDistribution: Record<string, number>;
  }> {
    const results = await this.getExamResults(examId);

    const totalStudents = results.length;
    const submittedResults = results.filter(r => r.status === ResultStatus.SUBMITTED || r.status === ResultStatus.GRADED);
    const gradedResults = results.filter(r => r.status === ResultStatus.GRADED);

    const submittedCount = submittedResults.length;
    const gradedCount = gradedResults.length;

    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let passCount = 0;
    const gradeDistribution: Record<string, number> = {};

    if (gradedResults.length > 0) {
      const scores = gradedResults.map(r => r.percentage || 0);
      averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);

      gradedResults.forEach(result => {
        if (result.isPassed) passCount++;

        const grade = result.grade || 'N/A';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
      });
    }

    const passPercentage = gradedCount > 0 ? (passCount / gradedCount) * 100 : 0;

    return {
      totalStudents,
      submittedCount,
      gradedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      passPercentage: Math.round(passPercentage * 100) / 100,
      gradeDistribution,
    };
  }

  /**
   * Update exam statistics
   */
  private async updateExamStatistics(examId: string): Promise<void> {
    const results = await this.getExamResults(examId);
    const submittedCount = results.filter(r => r.status === ResultStatus.SUBMITTED || r.status === ResultStatus.GRADED).length;
    const gradedCount = results.filter(r => r.status === ResultStatus.GRADED).length;

    const exam = await this.getExamById(examId);
    exam.updateStatistics(results.length, submittedCount, gradedCount);

    await this.examRepository.save(exam);
  }

  /**
   * Get current academic year
   */
  private getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Assuming academic year starts in August
    if (month >= 8) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Delete exam
   */
  async deleteExam(examId: string): Promise<void> {
    const exam = await this.getExamById(examId);

    // Prevent deletion of completed exams
    if (exam.isCompleted) {
      throw new BadRequestException('Cannot delete a completed exam');
    }

    await this.examRepository.remove(exam);
    this.logger.log(`Deleted exam ${examId}`);
  }
}