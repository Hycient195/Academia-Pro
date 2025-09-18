// Academia Pro - Academic Controller
// REST API endpoints for academic management

import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, SampleAudit, MonitorPerformance } from '../common/audit/auditable.decorator';
import { AcademicService } from './academic.service';
import { CreateSubjectDto, UpdateSubjectDto, CreateCurriculumDto, CreateClassDto, CreateLearningObjectiveDto } from './dtos/index';
import {
  CreateCurriculumStandardDto,
  UpdateCurriculumStandardDto,
  CurriculumStandardFiltersDto,
  CurriculumStandardResponseDto,
  CurriculumStandardsListResponseDto,
} from './dtos/curriculum-standards.dto';
import {
  CreateStudentEnrollmentDto,
  UpdateStudentEnrollmentDto,
  WithdrawStudentDto,
  StudentEnrollmentFiltersDto,
  StudentEnrollmentResponseDto,
  StudentEnrollmentsListResponseDto,
  BulkEnrollmentDto,
  BulkEnrollmentResponseDto,
} from './dtos/student-enrollment.dto';
import {
  CreateSubstituteRequestDto,
  UpdateSubstituteRequestDto,
  AssignSubstituteTeacherDto,
  SubstituteFeedbackDto,
  SubstituteRequestFiltersDto,
  SubstituteRequestResponseDto,
  SubstituteRequestsListResponseDto,
} from './dtos/substitute-teacher.dto';
import {
  CreateTeacherWorkloadDto,
  UpdateTeacherWorkloadDto,
  TeacherWorkloadFiltersDto,
  TeacherWorkloadResponseDto,
  TeacherWorkloadsListResponseDto,
  WorkloadAnalyticsResponseDto,
  TeacherAssignmentOptimizationDto,
} from './dtos/teacher-workload.dto';
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';
import { Class } from './class.entity';
import { LearningObjective } from './learning-objective.entity';
import { ISubjectFilters, ICurriculumFilters, IClassFilters, IAcademicStatistics } from '@academia-pro/types/academic';
import { Roles } from '../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users/users.types';

@ApiTags('Academic Management')
@ApiBearerAuth()
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // Subject Management Endpoints
  @Post('subjects')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @AuditCreate('subject', 'id')
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully', type: Subject })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async createSubject(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.academicService.createSubject(createSubjectDto);
  }

  @Get('subjects')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get all subjects with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'gradeLevel', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully' })
  async findAllSubjects(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('isActive') isActive?: boolean,
    @Query('schoolId') schoolId?: string,
  ) {
    const filters: ISubjectFilters = {
      schoolId: schoolId || '',
      ...(type && { type: type as any }),
      ...(gradeLevel && { gradeLevel: gradeLevel as any }),
      ...(isActive !== undefined && { isActive }),
    };

    return this.academicService.findAllSubjects({ page, limit, filters });
  }

  @Get('subjects/search')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Search subjects by name or code' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchSubjects(
    @Query('q') query: string,
    @Query('schoolId') schoolId: string,
  ) {
    // Implement search logic in service
    return this.academicService.findAllSubjects({
      filters: { schoolId },
      page: 1,
      limit: 50,
    });
  }

  @Get('subjects/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @AuditRead('subject', 'id')
  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiResponse({ status: 200, description: 'Subject retrieved successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findSubjectById(@Param('id', ParseUUIDPipe) id: string): Promise<Subject> {
    return this.academicService.findSubjectById(id);
  }

  @Put('subjects/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @AuditUpdate('subject', 'id')
  @ApiOperation({ summary: 'Update subject information' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async updateSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    return this.academicService.updateSubject(id, updateSubjectDto);
  }

  @Delete('subjects/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @AuditDelete('subject', 'id')
  @ApiOperation({ summary: 'Delete subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete subject in use' })
  async deleteSubject(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.academicService.deleteSubject(id);
  }

  // Curriculum Management Endpoints
  @Post('curricula')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @AuditCreate('curriculum', 'id')
  @ApiOperation({ summary: 'Create a new curriculum' })
  @ApiResponse({ status: 201, description: 'Curriculum created successfully', type: Curriculum })
  async createCurriculum(@Body() createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    return this.academicService.createCurriculum(createCurriculumDto);
  }

  @Get('curricula')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get all curricula with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'gradeLevel', required: false })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Curricula retrieved successfully' })
  async findAllCurricula(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('academicYear') academicYear?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    const filters: ICurriculumFilters = {
      schoolId: schoolId || '',
      ...(gradeLevel && { gradeLevel: gradeLevel as any }),
      ...(academicYear && { academicYear }),
      ...(status && { status: status as any }),
    };

    return this.academicService.findAllCurricula({ page, limit, filters });
  }

  @Get('curricula/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @AuditRead('curriculum', 'id')
  @ApiOperation({ summary: 'Get curriculum by ID' })
  @ApiResponse({ status: 200, description: 'Curriculum retrieved successfully', type: Curriculum })
  @ApiResponse({ status: 404, description: 'Curriculum not found' })
  async findCurriculumById(@Param('id', ParseUUIDPipe) id: string): Promise<Curriculum> {
    return this.academicService.findCurriculumById(id);
  }

  // Class Management Endpoints
  @Post('classes')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @AuditCreate('class', 'id')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully', type: Class })
  async createClass(@Body() createClassDto: CreateClassDto): Promise<Class> {
    return this.academicService.createClass(createClassDto);
  }

  @Get('classes')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get all classes with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'gradeLevel', required: false })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  async findAllClasses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('academicYear') academicYear?: string,
    @Query('isActive') isActive?: boolean,
    @Query('schoolId') schoolId?: string,
  ) {
    const filters: IClassFilters = {
      schoolId: schoolId || '',
      ...(gradeLevel && { gradeLevel: gradeLevel as any }),
      ...(academicYear && { academicYear }),
      ...(isActive !== undefined && { isActive }),
    };

    return this.academicService.findAllClasses({ page, limit, filters });
  }

  @Get('classes/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully', type: Class })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async findClassById(@Param('id', ParseUUIDPipe) id: string): Promise<Class> {
    return this.academicService.findClassById(id);
  }

  // Learning Objectives Management Endpoints
  @Post('learning-objectives')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new learning objective' })
  @ApiResponse({ status: 201, description: 'Learning objective created successfully', type: LearningObjective })
  async createLearningObjective(@Body() createLearningObjectiveDto: CreateLearningObjectiveDto): Promise<LearningObjective> {
    return this.academicService.createLearningObjective(createLearningObjectiveDto);
  }

  @Get('learning-objectives')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get all learning objectives with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'gradeLevel', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiResponse({ status: 200, description: 'Learning objectives retrieved successfully' })
  async findAllLearningObjectives(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('subjectId') subjectId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = {
      ...(gradeLevel && { gradeLevel }),
      ...(subjectId && { subjectId }),
      ...(isActive !== undefined && { isActive }),
    };

    return this.academicService.findAllLearningObjectives({ page, limit, filters });
  }

  // Curriculum-Subject Management Endpoints
  @Post('curricula/:curriculumId/subjects')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Add subject to curriculum' })
  @ApiResponse({ status: 201, description: 'Subject added to curriculum successfully' })
  @ApiResponse({ status: 409, description: 'Subject already in curriculum' })
  async addSubjectToCurriculum(
    @Param('curriculumId', ParseUUIDPipe) curriculumId: string,
    @Body() body: { subjectId: string; hoursPerWeek: number; assessmentWeight: number; isCompulsory?: boolean },
  ) {
    return this.academicService.addSubjectToCurriculum(
      curriculumId,
      body.subjectId,
      body.hoursPerWeek,
      body.assessmentWeight,
      body.isCompulsory,
    );
  }

  // Class-Subject-Teacher Assignment Endpoints
  @Post('classes/:classId/subjects')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Assign subject and teacher to class' })
  @ApiResponse({ status: 201, description: 'Subject assigned to class successfully' })
  @ApiResponse({ status: 409, description: 'Subject already assigned to class' })
  async assignSubjectToClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() body: { subjectId: string; teacherId: string; schedule: any[] },
  ) {
    return this.academicService.assignSubjectToClass(
      classId,
      body.subjectId,
      body.teacherId,
      body.schedule,
    );
  }

  // Statistics and Analytics Endpoints
  @Get('statistics')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get academic statistics for school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({ status: 200, description: 'Academic statistics retrieved successfully' })
  async getAcademicStatistics(@Query('schoolId') schoolId: string): Promise<IAcademicStatistics> {
    return this.academicService.getAcademicStatistics(schoolId);
  }

  // Utility Endpoints
  @Get('subjects/by-grade/:schoolId/:grade')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get subjects by grade level' })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully' })
  async getSubjectsByGrade(
    @Param('schoolId') schoolId: string,
    @Param('grade') grade: string,
  ) {
    return this.academicService.findAllSubjects({
      filters: {
        schoolId,
        gradeLevel: grade as any,
        isActive: true,
      },
    });
  }

  @Get('classes/by-grade/:schoolId/:grade')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get classes by grade level' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  async getClassesByGrade(
    @Param('schoolId') schoolId: string,
    @Param('grade') grade: string,
  ) {
    return this.academicService.findAllClasses({
      filters: {
        schoolId,
        gradeLevel: grade as any,
        isActive: true,
      },
    });
  }

  @Get('curricula/by-year/:schoolId/:year')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get curricula by academic year' })
  @ApiResponse({ status: 200, description: 'Curricula retrieved successfully' })
  async getCurriculaByYear(
    @Param('schoolId') schoolId: string,
    @Param('year') year: string,
  ) {
    return this.academicService.findAllCurricula({
      filters: {
        schoolId,
        academicYear: year,
      },
    });
  }

  // ==================== CURRICULUM STANDARDS ENDPOINTS ====================

  @Post('curriculum-standards')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new curriculum standard' })
  @ApiResponse({ status: 201, description: 'Curriculum standard created successfully', type: CurriculumStandardResponseDto })
  async createCurriculumStandard(@Body() createDto: CreateCurriculumStandardDto) {
    return this.academicService.createCurriculumStandard(createDto);
  }

  @Get('curriculum-standards')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get all curriculum standards with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Curriculum standards retrieved successfully', type: CurriculumStandardsListResponseDto })
  async findCurriculumStandards(
    @Query() filters: CurriculumStandardFiltersDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.academicService.findCurriculumStandards({ ...filters, page, limit });
  }

  @Get('curriculum-standards/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get curriculum standard by ID' })
  @ApiResponse({ status: 200, description: 'Curriculum standard retrieved successfully', type: CurriculumStandardResponseDto })
  async findCurriculumStandardById(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicService.findCurriculumStandardById(id);
  }

  @Put('curriculum-standards/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update curriculum standard' })
  @ApiResponse({ status: 200, description: 'Curriculum standard updated successfully', type: CurriculumStandardResponseDto })
  async updateCurriculumStandard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCurriculumStandardDto,
  ) {
    return this.academicService.updateCurriculumStandard(id, updateDto);
  }

  // ==================== STUDENT ENROLLMENT ENDPOINTS ====================

  @Post('student-enrollments')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Enroll student in class' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully', type: StudentEnrollmentResponseDto })
  async enrollStudent(@Body() enrollmentDto: CreateStudentEnrollmentDto) {
    return this.academicService.enrollStudentInClass(enrollmentDto);
  }

  @Get('student-enrollments')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get student enrollments with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Student enrollments retrieved successfully', type: StudentEnrollmentsListResponseDto })
  async findStudentEnrollments(
    @Query() filters: StudentEnrollmentFiltersDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.academicService.findStudentEnrollments({ ...filters, page, limit });
  }

  @Get('student-enrollments/:studentId')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF, EUserRole.STUDENT)
  @ApiOperation({ summary: 'Get student enrollment history' })
  @ApiResponse({ status: 200, description: 'Student enrollment history retrieved successfully' })
  async findStudentEnrollmentHistory(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.academicService.findStudentEnrollments(studentId);
  }

  @Put('student-enrollments/:studentId/:classId')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update student enrollment' })
  @ApiResponse({ status: 200, description: 'Student enrollment updated successfully', type: StudentEnrollmentResponseDto })
  async updateStudentEnrollment(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() updateDto: UpdateStudentEnrollmentDto,
  ) {
    return this.academicService.updateStudentEnrollment(studentId, classId, updateDto);
  }

  @Post('student-enrollments/:studentId/:classId/withdraw')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Withdraw student from class' })
  @ApiResponse({ status: 200, description: 'Student withdrawn successfully' })
  async withdrawStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() withdrawDto: WithdrawStudentDto,
  ) {
    return this.academicService.withdrawStudentFromClass(studentId, classId, withdrawDto);
  }

  @Post('student-enrollments/bulk')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @SampleAudit(0.1) // Sample 10% of bulk operations
  @AuditCreate('student-enrollment', 'successful.0.id')
  @ApiOperation({ summary: 'Bulk enroll students' })
  @ApiResponse({ status: 200, description: 'Bulk enrollment completed', type: BulkEnrollmentResponseDto })
  async bulkEnrollStudents(@Body() bulkDto: BulkEnrollmentDto) {
    return this.academicService.bulkEnrollStudents(bulkDto);
  }

  // ==================== SUBSTITUTE TEACHER ENDPOINTS ====================

  @Post('substitute-requests')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Create substitute teacher request' })
  @ApiResponse({ status: 201, description: 'Substitute request created successfully', type: SubstituteRequestResponseDto })
  async createSubstituteRequest(@Body() requestDto: CreateSubstituteRequestDto) {
    return this.academicService.createSubstituteRequest(requestDto);
  }

  @Get('substitute-requests')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get substitute requests with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Substitute requests retrieved successfully', type: SubstituteRequestsListResponseDto })
  async findSubstituteRequests(
    @Query() filters: SubstituteRequestFiltersDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.academicService.findSubstituteRequests({ ...filters, page, limit });
  }

  @Put('substitute-requests/:id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update substitute request' })
  @ApiResponse({ status: 200, description: 'Substitute request updated successfully', type: SubstituteRequestResponseDto })
  async updateSubstituteRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSubstituteRequestDto,
  ) {
    return this.academicService.updateSubstituteRequest(id, updateDto);
  }

  @Post('substitute-requests/:id/assign')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Assign substitute teacher' })
  @ApiResponse({ status: 200, description: 'Substitute teacher assigned successfully', type: SubstituteRequestResponseDto })
  async assignSubstituteTeacher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignSubstituteTeacherDto,
  ) {
    return this.academicService.assignSubstituteTeacher(id, assignDto);
  }

  @Post('substitute-requests/:id/feedback')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Submit substitute feedback' })
  @ApiResponse({ status: 200, description: 'Feedback submitted successfully' })
  async submitSubstituteFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() feedbackDto: SubstituteFeedbackDto,
  ) {
    return this.academicService.submitSubstituteFeedback(id, feedbackDto);
  }

  // ==================== TEACHER WORKLOAD ENDPOINTS ====================

  @Post('teacher-workloads')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create teacher workload' })
  @ApiResponse({ status: 201, description: 'Teacher workload created successfully', type: TeacherWorkloadResponseDto })
  async createTeacherWorkload(@Body() workloadDto: CreateTeacherWorkloadDto) {
    return this.academicService.createTeacherWorkload(workloadDto);
  }

  @Get('teacher-workloads')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get teacher workloads with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Teacher workloads retrieved successfully', type: TeacherWorkloadsListResponseDto })
  async findTeacherWorkloads(
    @Query() filters: TeacherWorkloadFiltersDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.academicService.findTeacherWorkloads({ ...filters, page, limit });
  }

  @Get('teacher-workloads/:teacherId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get teacher workload by teacher and year' })
  @ApiResponse({ status: 200, description: 'Teacher workload retrieved successfully', type: TeacherWorkloadResponseDto })
  async findTeacherWorkload(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.findTeacherWorkload(teacherId, academicYear);
  }

  @Put('teacher-workloads/:teacherId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update teacher workload' })
  @ApiResponse({ status: 200, description: 'Teacher workload updated successfully', type: TeacherWorkloadResponseDto })
  async updateTeacherWorkload(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('academicYear') academicYear: string,
    @Body() updateDto: UpdateTeacherWorkloadDto,
  ) {
    return this.academicService.updateTeacherWorkload(teacherId, academicYear, updateDto);
  }

  @Get('teacher-workloads/analytics/:schoolId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get teacher workload analytics' })
  @ApiResponse({ status: 200, description: 'Workload analytics retrieved successfully', type: WorkloadAnalyticsResponseDto })
  async getWorkloadAnalytics(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.getWorkloadAnalytics(schoolId, academicYear);
  }

  @Get('teacher-workloads/optimization/:schoolId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get teacher assignment optimization' })
  @ApiResponse({ status: 200, description: 'Assignment optimization retrieved successfully', type: TeacherAssignmentOptimizationDto })
  async optimizeTeacherAssignments(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.optimizeTeacherAssignments(schoolId, academicYear);
  }

  // ==================== ACADEMIC ANALYTICS ENDPOINTS ====================

  @Get('analytics/performance/:schoolId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get academic performance report' })
  @ApiResponse({ status: 200, description: 'Academic performance report retrieved successfully' })
  async getAcademicPerformanceReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.generateAcademicPerformanceReport(schoolId, academicYear);
  }

  @Get('analytics/advanced/:schoolId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get advanced academic statistics' })
  @ApiResponse({ status: 200, description: 'Advanced academic statistics retrieved successfully' })
  async getAdvancedAcademicStatistics(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.getAdvancedAcademicStatistics(schoolId, academicYear);
  }

  @Get('analytics/academic-year/:schoolId/:year')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get academic year status' })
  @ApiResponse({ status: 200, description: 'Academic year status retrieved successfully' })
  async getAcademicYearStatus(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('year') year: string,
  ) {
    return this.academicService.getAcademicYearStatus(schoolId, year);
  }

  // ==================== INTEGRATION ENDPOINTS ====================

  @Get('integration/student/:studentId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF, EUserRole.STUDENT)
  @ApiOperation({ summary: 'Get student academic data for integration' })
  @ApiResponse({ status: 200, description: 'Student academic data retrieved successfully' })
  async getStudentAcademicData(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.getStudentAcademicData(studentId, academicYear);
  }

  @Get('integration/parent/:parentId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.PARENT)
  @ApiOperation({ summary: 'Get parent academic data for integration' })
  @ApiResponse({ status: 200, description: 'Parent academic data retrieved successfully' })
  async getParentAcademicData(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.getParentAcademicData(parentId, academicYear);
  }

  @Get('integration/teacher/:teacherId/:academicYear')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiOperation({ summary: 'Get teacher academic data for integration' })
  @ApiResponse({ status: 200, description: 'Teacher academic data retrieved successfully' })
  async getTeacherAcademicData(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('academicYear') academicYear: string,
  ) {
    return this.academicService.getTeacherAcademicData(teacherId, academicYear);
  }
}