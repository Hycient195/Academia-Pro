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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  TransferStudentDto,
  UpdateMedicalInfoDto,
  AddDocumentDto,
  AssignClassDto,
  PromotionRequestDto,
  BulkImportRequestDto,
  GraduationRequestDto,
  TransferStudentRequestDto,
} from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators';
import { Auditable, AuditCreate, AuditUpdate, AuditRead, AuditDelete } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';
import { StudentStatus, EnrollmentType } from './student.entity';
import { EUserRole } from '@academia-pro/types/users';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @AuditCreate('student', 'studentId')
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.DELEGATED_SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.DELEGATED_SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiBearerAuth()
  @AuditRead('students')
  @ApiOperation({ summary: 'Get all students with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'stages', required: false, type: [String] })
  @ApiQuery({ name: 'gradeCodes', required: false, type: [String] })
  @ApiQuery({ name: 'streamSections', required: false, type: [String] })
  @ApiQuery({ name: 'statuses', required: false, type: [String] })
  @ApiQuery({ name: 'enrollmentType', required: false, enum: ['regular', 'special_needs', 'gifted', 'international', 'transfer'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'firstName', required: false, type: String })
  @ApiQuery({ name: 'lastName', required: false, type: String })
  @ApiQuery({ name: 'middleName', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female', 'other'] })
  @ApiQuery({ name: 'admissionNumber', required: false, type: String })
  @ApiQuery({ name: 'dateOfBirthFrom', required: false, type: String })
  @ApiQuery({ name: 'dateOfBirthTo', required: false, type: String })
  @ApiQuery({ name: 'admissionDateFrom', required: false, type: String })
  @ApiQuery({ name: 'admissionDateTo', required: false, type: String })
  @ApiQuery({ name: 'isBoarding', required: false, type: Boolean })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'phone', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('schoolId') schoolId?: string,
    @Query('stages') stages?: string,
    @Query('gradeCodes') gradeCodes?: string,
    @Query('streamSections') streamSections?: string,
    @Query('statuses') statuses?: string,
    @Query('enrollmentType') enrollmentType?: EnrollmentType,
    @Query('search') search?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('middleName') middleName?: string,
    @Query('gender') gender?: 'male' | 'female' | 'other',
    @Query('admissionNumber') admissionNumber?: string,
    @Query('dateOfBirthFrom') dateOfBirthFrom?: string,
    @Query('dateOfBirthTo') dateOfBirthTo?: string,
    @Query('admissionDateFrom') admissionDateFrom?: string,
    @Query('admissionDateTo') admissionDateTo?: string,
    @Query('isBoarding') isBoarding?: boolean,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    // Parse comma-separated strings back to arrays
    const parsedStages = stages ? stages.split(',').filter(s => s.trim()) : undefined;
    const parsedGradeCodes = gradeCodes ? gradeCodes.split(',').filter(s => s.trim()) : undefined;
    const parsedStreamSections = streamSections ? streamSections.split(',').filter(s => s.trim()) : undefined;
    const parsedStatuses = statuses ? statuses.split(',').filter(s => s.trim()) : undefined;

    // Parse numeric parameters
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    // console.log('Controller Debug - Parsed params:', {
    //   stages: parsedStages,
    //   gradeCodes: parsedGradeCodes,
    //   streamSections: parsedStreamSections,
    //   statuses: parsedStatuses,
    //   search,
    //   schoolId,
    //   page: parsedPage,
    //   limit: parsedLimit,
    //   firstName,
    //   lastName,
    //   middleName,
    //   gender,
    //   admissionNumber,
    //   dateOfBirthFrom,
    //   dateOfBirthTo,
    //   admissionDateFrom,
    //   admissionDateTo,
    //   isBoarding,
    //   email,
    //   phone
    // });

    return this.studentsService.findAll({
      page: parsedPage,
      limit: parsedLimit,
      schoolId,
      stages: parsedStages,
      gradeCodes: parsedGradeCodes,
      streamSections: parsedStreamSections,
      statuses: parsedStatuses,
      enrollmentType,
      search,
      firstName,
      lastName,
      middleName,
      gender,
      admissionNumber,
      dateOfBirthFrom,
      dateOfBirthTo,
      admissionDateFrom,
      admissionDateTo,
      isBoarding,
      email,
      phone,
    });
  }

  @Get('search')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search students' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'gradeCode', required: false, type: String })
  @ApiQuery({ name: 'streamSection', required: false, type: String })
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
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.studentsService.search(query, schoolId, { grade, section, limit: parsedLimit });
  }

  @Get('by-grade/:schoolId/:gradeCode')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students by grade code' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  getStudentsByGradeCode(
    @Param('schoolId') schoolId: string,
    @Param('gradeCode') gradeCode: string,
  ) {
    return this.studentsService.getStudentsByGradeCode(schoolId, gradeCode);
  }

  @Get('by-section/:schoolId/:gradeCode/:streamSection')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students by stream section' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  getStudentsByStreamSection(
    @Param('schoolId') schoolId: string,
    @Param('gradeCode') gradeCode: string,
    @Param('streamSection') streamSection: string,
  ) {
    return this.studentsService.getStudentsByStreamSection(schoolId, gradeCode, streamSection);
  }

  @Get('statistics')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF, EUserRole.STUDENT, EUserRole.PARENT)
  @ApiBearerAuth()
  @AuditRead('student', 'id')
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.STAFF)
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @AuditUpdate('student', 'id')
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'student',
    resourceId: 'id',
    severity: AuditSeverity.MEDIUM,
    customAction: 'student_transfer'
  })
  @ApiOperation({ summary: 'Transfer student to different grade/section' })
  @ApiResponse({
    status: 200,
    description: 'Student transferred successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer or already in grade/section' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  internalTransfer(@Param('id') id: string, @Body() transferDto: TransferStudentDto) {
    return this.studentsService.internalTransfer(id, transferDto);
  }

  @Post(':id/transfer/external')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'External transfer to another school' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: TransferStudentDto })
  @ApiResponse({
    status: 200,
    description: 'External transfer executed',
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  externalTransfer(@Param('id') id: string, @Body() transferDto: TransferStudentDto) {
    return this.studentsService.externalTransfer(id, transferDto);
  }

  @Post(':id/graduate')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Graduate student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        graduationYear: { type: 'number', example: 2025 },
        clearanceStatus: { type: 'string', enum: ['cleared', 'pending'], example: 'cleared' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student graduated successfully',
  })
  @ApiResponse({ status: 400, description: 'Student already graduated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  graduate(@Param('id') id: string, @Body() graduationData: any) {
    const graduationDate = graduationData.graduationYear ? new Date(graduationData.graduationYear, 0, 1) : undefined;
    return this.studentsService.graduateStudent(id, graduationDate);
  }

  @Patch(':id/medical-info')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'student_medical_record',
    resourceId: 'id',
    severity: AuditSeverity.HIGH,
    customAction: 'medical_info_update',
    excludeFields: ['password', 'token', 'secret']
  })
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
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
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @AuditCreate('student_document', 'id')
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
  @Roles(EUserRole.SUPER_ADMIN)
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

  @Post(':id/assign-class')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign or reassign class/section' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: AssignClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class assigned successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid assignment' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  assignClass(@Param('id') id: string, @Body() assignClassDto: AssignClassDto) {
    return this.studentsService.assignClass(id, assignClassDto);
  }

  @Post('promotion')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Batch promotion of students' })
  @ApiBody({ type: PromotionRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Promotion executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid promotion configuration' })
  promotion(@Body() promotionDto: PromotionRequestDto) {
    return this.studentsService.executePromotion(promotionDto);
  }

  @Post('bulk-import')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import students from CSV data' })
  @ApiBody({ type: BulkImportRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk import completed',
  })
  @ApiResponse({ status: 400, description: 'Invalid import data' })
  bulkImport(@Body() bulkImportDto: BulkImportRequestDto) {
    return this.studentsService.bulkImport(bulkImportDto);
  }

  @Post('batch-graduate')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Batch graduation of students' })
  @ApiBody({ type: GraduationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Graduation completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid graduation request' })
  batchGraduate(@Body() graduationDto: GraduationRequestDto) {
    return this.studentsService.batchGraduate(graduationDto);
  }

  @Post('batch-transfer')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Batch transfer of students' })
  @ApiBody({ type: TransferStudentRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  batchTransfer(@Body() transferDto: TransferStudentRequestDto) {
    return this.studentsService.batchTransfer(transferDto);
  }
}