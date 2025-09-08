// Academia Pro - Examination Controller
// REST API endpoints for managing examinations and assessments

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExaminationService } from '../services/examination.service';
import { CreateExamDto, SubmitExamResultDto, GradeExamResultDto, RequestReEvaluationDto } from '../dtos';
import { ExamType, ExamStatus } from '../entities/exam.entity';
import { ResultStatus } from '../entities/exam-result.entity';
import { Auditable, AuditCreate, AuditUpdate, AuditRead, SampleAudit } from '../../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@ApiTags('Examination Management')
@ApiBearerAuth()
@Controller('examinations')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new exam',
    description: 'Create a new examination or assessment',
  })
  @ApiResponse({
    status: 201,
    description: 'Exam created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Exam conflicts with existing scheduled exam',
  })
  async createExam(
    @Body() dto: CreateExamDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.examinationService.createExam(dto, createdBy);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get exam by ID',
    description: 'Retrieve a specific exam with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Exam not found',
  })
  async getExamById(@Param('id', ParseUUIDPipe) examId: string) {
    return this.examinationService.getExamById(examId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update exam',
    description: 'Update an existing exam (only if not completed)',
  })
  @ApiParam({
    name: 'id',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update completed exam',
  })
  async updateExam(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body() dto: Partial<CreateExamDto>,
  ) {
    return this.examinationService.updateExam(examId, dto);
  }

  @Put(':id/publish')
  @ApiOperation({
    summary: 'Publish exam',
    description: 'Make the exam visible to students',
  })
  @ApiParam({
    name: 'id',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam published successfully',
  })
  async publishExam(@Param('id', ParseUUIDPipe) examId: string) {
    return this.examinationService.publishExam(examId);
  }

  @Put(':id/start')
  @ApiOperation({
    summary: 'Start exam',
    description: 'Change exam status to in progress',
  })
  @ApiParam({
    name: 'id',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam started successfully',
  })
  async startExam(@Param('id', ParseUUIDPipe) examId: string) {
    return this.examinationService.startExam(examId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete exam',
    description: 'Delete an exam (only if not completed)',
  })
  @ApiParam({
    name: 'id',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam deleted successfully',
  })
  async deleteExam(@Param('id', ParseUUIDPipe) examId: string) {
    await this.examinationService.deleteExam(examId);
    return { message: 'Exam deleted successfully' };
  }

  @Get('class/:classId')
  @ApiOperation({
    summary: 'Get class exams',
    description: 'Retrieve all exams for a specific class',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'examType',
    required: false,
    description: 'Filter by exam type',
    enum: ExamType,
    example: ExamType.FINAL,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by exam status',
    enum: ExamStatus,
    example: ExamStatus.SCHEDULED,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Class exams retrieved successfully',
  })
  async getClassExams(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query() query: any,
  ) {
    const options = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      examType: query.examType,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.examinationService.getClassExams(classId, options);
  }

  @Post('results/submit')
  @HttpCode(HttpStatus.CREATED)
  @Auditable({
    action: AuditAction.DATA_CREATED,
    resource: 'exam_result',
    severity: AuditSeverity.MEDIUM,
    customAction: 'submit_exam_result',
    metadata: { operationType: 'result_submission' }
  })
  @ApiOperation({
    summary: 'Submit exam result',
    description: 'Submit a student\'s exam result',
  })
  @ApiResponse({
    status: 201,
    description: 'Exam result submitted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Exam or student not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Result already submitted',
  })
  async submitExamResult(
    @Body() dto: SubmitExamResultDto,
    @Request() req: any,
  ) {
    const submittedBy = req.user?.id || dto.studentId;
    return this.examinationService.submitExamResult(dto, submittedBy);
  }

  @Put('results/grade')
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'exam_result',
    severity: AuditSeverity.MEDIUM,
    customAction: 'grade_exam_result',
    metadata: { operationType: 'grading' }
  })
  @ApiOperation({
    summary: 'Grade exam result',
    description: 'Grade a submitted exam result',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam result graded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Exam result not found',
  })
  async gradeExamResult(
    @Body() dto: GradeExamResultDto,
    @Request() req: any,
  ) {
    const gradedBy = req.user?.id || 'system';
    return this.examinationService.gradeExamResult(dto, gradedBy);
  }

  @Post('results/re-evaluate')
  @ApiOperation({
    summary: 'Request re-evaluation',
    description: 'Request re-evaluation of an exam result',
  })
  @ApiResponse({
    status: 200,
    description: 'Re-evaluation request submitted successfully',
  })
  async requestReEvaluation(
    @Body() dto: RequestReEvaluationDto,
    @Request() req: any,
  ) {
    const requestedBy = req.user?.id || 'system';
    return this.examinationService.requestReEvaluation(dto, requestedBy);
  }

  @Get(':examId/results')
  @ApiOperation({
    summary: 'Get exam results',
    description: 'Retrieve all results for a specific exam',
  })
  @ApiParam({
    name: 'examId',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by result status',
    enum: ResultStatus,
    example: ResultStatus.GRADED,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Exam results retrieved successfully',
  })
  async getExamResults(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.examinationService.getExamResults(examId, options);
  }

  @Get('results/student/:studentId')
  @AuditRead('exam_results')
  @SampleAudit(0.5) // Sample 50% of requests for performance
  @ApiOperation({
    summary: 'Get student exam results',
    description: 'Retrieve all exam results for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-456',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'examType',
    required: false,
    description: 'Filter by exam type',
    enum: ExamType,
    example: ExamType.FINAL,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Student exam results retrieved successfully',
  })
  async getStudentExamResults(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: any,
  ) {
    const options = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      examType: query.examType,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.examinationService.getStudentExamResults(studentId, options);
  }

  @Get(':examId/statistics')
  @ApiOperation({
    summary: 'Get exam statistics',
    description: 'Retrieve comprehensive statistics for an exam',
  })
  @ApiParam({
    name: 'examId',
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam statistics retrieved successfully',
  })
  async getExamStatistics(@Param('examId', ParseUUIDPipe) examId: string) {
    return this.examinationService.getExamStatistics(examId);
  }

  @Get('results/:resultId')
  @ApiOperation({
    summary: 'Get exam result by ID',
    description: 'Retrieve a specific exam result with full details',
  })
  @ApiParam({
    name: 'resultId',
    description: 'Exam Result ID',
    example: 'result-uuid-789',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam result retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Exam result not found',
  })
  async getExamResultById(@Param('resultId', ParseUUIDPipe) resultId: string) {
    // This would need to be implemented in the service
    // For now, return a placeholder
    return { message: 'Exam result retrieval not yet implemented' };
  }

  @Get('dashboard/overview')
  @ApiOperation({
    summary: 'Get examination dashboard overview',
    description: 'Retrieve overview statistics for examinations',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for dashboard data (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for dashboard data (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Examination dashboard overview retrieved successfully',
  })
  async getExaminationDashboard(@Query() query: any) {
    // This would aggregate data from multiple exams
    // For now, return a placeholder
    return {
      message: 'Examination dashboard overview not yet implemented',
      period: {
        startDate: query.startDate || '2024-01-01',
        endDate: query.endDate || '2024-12-31',
      },
    };
  }
}