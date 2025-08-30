// Academia Pro - Students Controller
// REST API endpoints for student management

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  TransferStudentDto,
  UpdateMedicalInfoDto,
  AddDocumentDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators';
import { StudentStatus, EnrollmentType } from './student.entity';
import { UserRole } from '../users/user.entity';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Student already exists' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: String })
  @ApiQuery({ name: 'section', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'graduated', 'transferred', 'withdrawn', 'suspended'] })
  @ApiQuery({ name: 'enrollmentType', required: false, enum: ['regular', 'special_needs', 'gifted', 'international', 'transfer'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('schoolId') schoolId?: string,
    @Query('grade') grade?: string,
    @Query('section') section?: string,
    @Query('status') status?: StudentStatus,
    @Query('enrollmentType') enrollmentType?: EnrollmentType,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAll({
      page,
      limit,
      schoolId,
      grade,
      section,
      status,
      enrollmentType,
      search,
    });
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search students' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: String })
  @ApiQuery({ name: 'section', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  search(
    @Query('query') query: string,
    @Query('schoolId') schoolId?: string,
    @Query('grade') grade?: string,
    @Query('section') section?: string,
    @Query('limit') limit?: number,
  ) {
    return this.studentsService.search(query, schoolId, { grade, section, limit });
  }

  @Get('by-grade/:schoolId/:grade')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students by grade' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  getStudentsByGrade(
    @Param('schoolId') schoolId: string,
    @Param('grade') grade: string,
  ) {
    return this.studentsService.getStudentsByGrade(schoolId, grade);
  }

  @Get('by-section/:schoolId/:grade/:section')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students by section' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  getStudentsBySection(
    @Param('schoolId') schoolId: string,
    @Param('grade') grade: string,
    @Param('section') section: string,
  ) {
    return this.studentsService.getStudentsBySection(schoolId, grade, section);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student statistics' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics(@Query('schoolId') schoolId?: string) {
    return this.studentsService.getStatistics(schoolId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('admission/:admissionNumber')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student by admission number' })
  @ApiResponse({
    status: 200,
    description: 'Student retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByAdmissionNumber(@Param('admissionNumber') admissionNumber: string) {
    return this.studentsService.findByAdmissionNumber(admissionNumber);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student status' })
  @ApiResponse({
    status: 200,
    description: 'Student status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status or already in status' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: StudentStatus,
    @Body('reason') reason?: string,
  ) {
    return this.studentsService.updateStatus(id, status, reason);
  }

  @Patch(':id/transfer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer student to different grade/section' })
  @ApiResponse({
    status: 200,
    description: 'Student transferred successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer or already in grade/section' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  transferStudent(@Param('id') id: string, @Body() transferStudentDto: TransferStudentDto) {
    return this.studentsService.transferStudent(id, transferStudentDto.newGrade, transferStudentDto.newSection);
  }

  @Patch(':id/graduate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Graduate student' })
  @ApiResponse({
    status: 200,
    description: 'Student graduated successfully',
  })
  @ApiResponse({ status: 400, description: 'Student already graduated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  graduateStudent(
    @Param('id') id: string,
    @Body('graduationDate') graduationDate?: Date,
  ) {
    return this.studentsService.graduateStudent(id, graduationDate);
  }

  @Patch(':id/medical-info')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student medical information' })
  @ApiResponse({
    status: 200,
    description: 'Medical information updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  updateMedicalInfo(@Param('id') id: string, @Body() updateMedicalInfoDto: UpdateMedicalInfoDto) {
    return this.studentsService.updateMedicalInfo(id, updateMedicalInfoDto);
  }

  @Patch(':id/financial-info')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student financial information' })
  @ApiResponse({
    status: 200,
    description: 'Financial information updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  updateFinancialInfo(@Param('id') id: string, @Body() financialInfo: any) {
    return this.studentsService.updateFinancialInfo(id, financialInfo);
  }

  @Post(':id/documents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add document to student record' })
  @ApiResponse({
    status: 201,
    description: 'Document added successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  addDocument(@Param('id') id: string, @Body() addDocumentDto: AddDocumentDto) {
    return this.studentsService.addDocument(id, addDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete student (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Student deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}