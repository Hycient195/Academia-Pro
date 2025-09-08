// Academia Pro - Student Health Controller
// REST API endpoints for managing student health records

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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentHealthService } from '../services/health.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto } from '../dtos/create-health-record.dto';
import { StudentManagementGuard } from '../guards/student-management.guard';
import { Auditable, AuditCreate, AuditUpdate, AuditRead, AuditDelete } from '../../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@ApiTags('Student Health Management')
@ApiBearerAuth()
@Controller('students/:studentId/health')
@UseGuards(StudentManagementGuard)
export class StudentHealthController {
  constructor(private readonly healthService: StudentHealthService) {}

  @Get()
  @AuditRead('student_medical_record', 'studentId')
  @ApiOperation({
    summary: 'Get student health information',
    description: 'Retrieve basic health information for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Student health information retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async getStudentHealthInfo(@Param('studentId') studentId: string) {
    return this.healthService.getStudentHealthInfo(studentId);
  }

  @Put()
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'student_medical_record',
    resourceId: 'studentId',
    severity: AuditSeverity.HIGH,
    customAction: 'health_info_update',
    excludeFields: ['password', 'token', 'secret']
  })
  @ApiOperation({
    summary: 'Update student health information',
    description: 'Update basic health information for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Student health information updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateStudentHealthInfo(
    @Param('studentId') studentId: string,
    @Body() updateDto: UpdateHealthRecordDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.healthService.updateStudentHealthInfo(studentId, updateDto, updatedBy);
  }

  @Post('records')
  @HttpCode(HttpStatus.CREATED)
  @AuditCreate('student_medical_record', 'studentId')
  @ApiOperation({
    summary: 'Create medical record',
    description: 'Create a new medical record for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createMedicalRecord(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateHealthRecordDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.healthService.createMedicalRecord(studentId, createDto, createdBy);
  }

  @Get('records')
  @ApiOperation({
    summary: 'Get student medical records',
    description: 'Retrieve all medical records for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by record status',
    example: 'active',
  })
  @ApiQuery({
    name: 'recordType',
    required: false,
    description: 'Filter by record type',
    example: 'physical_exam',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of records',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async getStudentMedicalRecords(
    @Param('studentId') studentId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      recordType: query.recordType,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.healthService.getStudentMedicalRecords(studentId, options);
  }

  @Get('records/:recordId')
  @ApiOperation({
    summary: 'Get specific medical record',
    description: 'Retrieve a specific medical record by ID',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'recordId',
    description: 'Medical record ID',
    example: 'record-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  async getMedicalRecord(@Param('recordId') recordId: string) {
    return this.healthService.getMedicalRecord(recordId);
  }

  @Put('records/:recordId')
  @ApiOperation({
    summary: 'Update medical record',
    description: 'Update a specific medical record',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'recordId',
    description: 'Medical record ID',
    example: 'record-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  async updateMedicalRecord(
    @Param('recordId') recordId: string,
    @Body() updateData: Partial<any>,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.healthService.updateMedicalRecord(recordId, updateData, updatedBy);
  }

  @Delete('records/:recordId')
  @ApiOperation({
    summary: 'Delete medical record',
    description: 'Delete a specific medical record',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'recordId',
    description: 'Medical record ID',
    example: 'record-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  async deleteMedicalRecord(@Param('recordId') recordId: string) {
    await this.healthService.deleteMedicalRecord(recordId);
    return { message: 'Medical record deleted successfully' };
  }

  @Get('records/type/:recordType')
  @ApiOperation({
    summary: 'Get medical records by type',
    description: 'Retrieve medical records of a specific type for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'recordType',
    description: 'Medical record type',
    example: 'physical_exam',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async getMedicalRecordsByType(
    @Param('studentId') studentId: string,
    @Param('recordType') recordType: string,
  ) {
    return this.healthService.getMedicalRecordsByType(studentId, recordType);
  }

  @Get('active-conditions')
  @ApiOperation({
    summary: 'Get active medical conditions',
    description: 'Retrieve all active medical conditions for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Active medical conditions retrieved successfully',
  })
  async getActiveMedicalConditions(@Param('studentId') studentId: string) {
    return this.healthService.getActiveMedicalConditions(studentId);
  }

  @Get('follow-up-required')
  @ApiOperation({
    summary: 'Get medical records requiring follow-up',
    description: 'Retrieve medical records that require follow-up for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up required records retrieved successfully',
  })
  async getMedicalRecordsRequiringFollowUp(@Param('studentId') studentId: string) {
    return this.healthService.getMedicalRecordsRequiringFollowUp(studentId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search medical records',
    description: 'Search medical records by term for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'asthma',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchMedicalRecords(
    @Param('studentId') studentId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.healthService.searchMedicalRecords(studentId, searchTerm);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get medical statistics',
    description: 'Get medical statistics for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical statistics retrieved successfully',
  })
  async getMedicalStatistics(@Param('studentId') studentId: string) {
    return this.healthService.getMedicalStatistics(studentId);
  }
}