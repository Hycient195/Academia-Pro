// Academia Pro - Academic Controller
// REST API endpoints for academic management

import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { CreateSubjectDto, UpdateSubjectDto, CreateCurriculumDto, CreateClassDto, CreateLearningObjectiveDto } from './dtos';
import { Subject } from './subject.entity';
import { Curriculum } from './curriculum.entity';
import { Class } from './class.entity';
import { LearningObjective } from './learning-objective.entity';
import { ISubjectFilters, ICurriculumFilters, IClassFilters, IAcademicStatistics } from '../../../common/src/types/academic/academic.types';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/src/types/shared/user.types';

@ApiTags('Academic Management')
@ApiBearerAuth()
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // Subject Management Endpoints
  @Post('subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully', type: Subject })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async createSubject(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.academicService.createSubject(createSubjectDto);
  }

  @Get('subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiResponse({ status: 200, description: 'Subject retrieved successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findSubjectById(@Param('id', ParseUUIDPipe) id: string): Promise<Subject> {
    return this.academicService.findSubjectById(id);
  }

  @Put('subjects/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete subject in use' })
  async deleteSubject(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.academicService.deleteSubject(id);
  }

  // Curriculum Management Endpoints
  @Post('curricula')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new curriculum' })
  @ApiResponse({ status: 201, description: 'Curriculum created successfully', type: Curriculum })
  async createCurriculum(@Body() createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    return this.academicService.createCurriculum(createCurriculumDto);
  }

  @Get('curricula')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get curriculum by ID' })
  @ApiResponse({ status: 200, description: 'Curriculum retrieved successfully', type: Curriculum })
  @ApiResponse({ status: 404, description: 'Curriculum not found' })
  async findCurriculumById(@Param('id', ParseUUIDPipe) id: string): Promise<Curriculum> {
    return this.academicService.findCurriculumById(id);
  }

  // Class Management Endpoints
  @Post('classes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully', type: Class })
  async createClass(@Body() createClassDto: CreateClassDto): Promise<Class> {
    return this.academicService.createClass(createClassDto);
  }

  @Get('classes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully', type: Class })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async findClassById(@Param('id', ParseUUIDPipe) id: string): Promise<Class> {
    return this.academicService.findClassById(id);
  }

  // Learning Objectives Management Endpoints
  @Post('learning-objectives')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new learning objective' })
  @ApiResponse({ status: 201, description: 'Learning objective created successfully', type: LearningObjective })
  async createLearningObjective(@Body() createLearningObjectiveDto: CreateLearningObjectiveDto): Promise<LearningObjective> {
    return this.academicService.createLearningObjective(createLearningObjectiveDto);
  }

  @Get('learning-objectives')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get academic statistics for school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({ status: 200, description: 'Academic statistics retrieved successfully' })
  async getAcademicStatistics(@Query('schoolId') schoolId: string): Promise<IAcademicStatistics> {
    return this.academicService.getAcademicStatistics(schoolId);
  }

  // Utility Endpoints
  @Get('subjects/by-grade/:schoolId/:grade')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
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
}