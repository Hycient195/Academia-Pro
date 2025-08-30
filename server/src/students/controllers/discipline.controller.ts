// Academia Pro - Student Discipline Controller
// REST API endpoints for managing student discipline incidents

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
import { StudentDisciplineService } from '../services/discipline.service';
import { CreateDisciplineDto, UpdateDisciplineDto } from '../dtos/create-discipline.dto';
import { StudentManagementGuard } from '../guards/student-management.guard';

@ApiTags('Student Discipline Management')
@ApiBearerAuth()
@Controller('students/:studentId/discipline')
@UseGuards(StudentManagementGuard)
export class StudentDisciplineController {
  constructor(private readonly disciplineService: StudentDisciplineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create discipline incident',
    description: 'Create a new discipline incident for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Discipline incident created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createDisciplineIncident(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateDisciplineDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.disciplineService.createDisciplineIncident(studentId, createDto, createdBy);
  }

  @Get()
  @ApiOperation({
    summary: 'Get student discipline incidents',
    description: 'Retrieve all discipline incidents for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by incident status',
    example: 'resolved',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by discipline type',
    example: 'behavioral',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    description: 'Filter by severity level',
    example: 'minor',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of incidents',
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
    description: 'Discipline incidents retrieved successfully',
  })
  async getStudentDisciplineIncidents(
    @Param('studentId') studentId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      type: query.type,
      severity: query.severity,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.disciplineService.getStudentDisciplineIncidents(studentId, options);
  }

  @Get(':incidentId')
  @ApiOperation({
    summary: 'Get specific discipline incident',
    description: 'Retrieve a specific discipline incident by ID',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incident retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  async getDisciplineIncident(@Param('incidentId') incidentId: string) {
    return this.disciplineService.getDisciplineIncident(incidentId);
  }

  @Put(':incidentId')
  @ApiOperation({
    summary: 'Update discipline incident',
    description: 'Update a specific discipline incident',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incident updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  async updateDisciplineIncident(
    @Param('incidentId') incidentId: string,
    @Body() updateDto: UpdateDisciplineDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.disciplineService.updateDisciplineIncident(incidentId, updateDto, updatedBy);
  }

  @Delete(':incidentId')
  @ApiOperation({
    summary: 'Delete discipline incident',
    description: 'Delete a specific discipline incident',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incident deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  async deleteDisciplineIncident(@Param('incidentId') incidentId: string) {
    await this.disciplineService.deleteDisciplineIncident(incidentId);
    return { message: 'Discipline incident deleted successfully' };
  }

  @Get('type/:disciplineType')
  @ApiOperation({
    summary: 'Get discipline incidents by type',
    description: 'Retrieve discipline incidents of a specific type for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'disciplineType',
    description: 'Discipline type',
    example: 'behavioral',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incidents retrieved successfully',
  })
  async getDisciplineIncidentsByType(
    @Param('studentId') studentId: string,
    @Param('disciplineType') disciplineType: string,
  ) {
    return this.disciplineService.getDisciplineIncidentsByType(studentId, disciplineType);
  }

  @Get('severity/:severity')
  @ApiOperation({
    summary: 'Get discipline incidents by severity',
    description: 'Retrieve discipline incidents of a specific severity for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'severity',
    description: 'Severity level',
    example: 'minor',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incidents retrieved successfully',
  })
  async getDisciplineIncidentsBySeverity(
    @Param('studentId') studentId: string,
    @Param('severity') severity: string,
  ) {
    return this.disciplineService.getDisciplineIncidentsBySeverity(studentId, severity);
  }

  @Get('resolved/all')
  @ApiOperation({
    summary: 'Get resolved discipline incidents',
    description: 'Retrieve all resolved discipline incidents for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Resolved discipline incidents retrieved successfully',
  })
  async getResolvedDisciplineIncidents(@Param('studentId') studentId: string) {
    return this.disciplineService.getResolvedDisciplineIncidents(studentId);
  }

  @Get('follow-up-required')
  @ApiOperation({
    summary: 'Get discipline incidents requiring follow-up',
    description: 'Retrieve discipline incidents that require follow-up for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up required incidents retrieved successfully',
  })
  async getDisciplineIncidentsRequiringFollowUp(@Param('studentId') studentId: string) {
    return this.disciplineService.getDisciplineIncidentsRequiringFollowUp(studentId);
  }

  @Get('investigation/pending')
  @ApiOperation({
    summary: 'Get discipline incidents under investigation',
    description: 'Retrieve discipline incidents currently under investigation for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Incidents under investigation retrieved successfully',
  })
  async getDisciplineIncidentsUnderInvestigation(@Param('studentId') studentId: string) {
    return this.disciplineService.getDisciplineIncidentsUnderInvestigation(studentId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search discipline incidents',
    description: 'Search discipline incidents by term for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'disruption',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchDisciplineIncidents(
    @Param('studentId') studentId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.disciplineService.searchDisciplineIncidents(studentId, searchTerm);
  }

  @Put(':incidentId/investigation/start')
  @ApiOperation({
    summary: 'Start investigation',
    description: 'Start investigation for a discipline incident',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Investigation started successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid operation',
  })
  async startInvestigation(
    @Param('incidentId') incidentId: string,
    @Body() body: { investigatorId: string; investigatorName: string },
  ) {
    return this.disciplineService.startInvestigation(
      incidentId,
      body.investigatorId,
      body.investigatorName,
    );
  }

  @Put(':incidentId/investigation/complete')
  @ApiOperation({
    summary: 'Complete investigation',
    description: 'Complete investigation for a discipline incident',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Investigation completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  async completeInvestigation(
    @Param('incidentId') incidentId: string,
    @Body() body: { findings: string; recommendedAction?: string },
  ) {
    return this.disciplineService.completeInvestigation(
      incidentId,
      body.findings,
      body.recommendedAction as any,
    );
  }

  @Put(':incidentId/resolve')
  @ApiOperation({
    summary: 'Resolve discipline incident',
    description: 'Resolve a discipline incident with summary and lessons learned',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline incident resolved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  async resolveDisciplineIncident(
    @Param('incidentId') incidentId: string,
    @Body() body: { resolutionSummary: string; lessonsLearned?: string },
  ) {
    return this.disciplineService.resolveDisciplineIncident(
      incidentId,
      body.resolutionSummary,
      body.lessonsLearned,
    );
  }

  @Put(':incidentId/appeal')
  @ApiOperation({
    summary: 'Submit appeal',
    description: 'Submit an appeal for a resolved discipline incident',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'incidentId',
    description: 'Discipline incident ID',
    example: 'incident-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Appeal submitted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Discipline incident not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid operation',
  })
  async submitAppeal(
    @Param('incidentId') incidentId: string,
    @Body() body: { appealReason: string; appealHearingDate?: string },
  ) {
    const appealHearingDate = body.appealHearingDate ? new Date(body.appealHearingDate) : undefined;
    return this.disciplineService.submitAppeal(incidentId, body.appealReason, appealHearingDate);
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get discipline statistics',
    description: 'Get discipline statistics for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline statistics retrieved successfully',
  })
  async getDisciplineStatistics(@Param('studentId') studentId: string) {
    return this.disciplineService.getDisciplineStatistics(studentId);
  }
}