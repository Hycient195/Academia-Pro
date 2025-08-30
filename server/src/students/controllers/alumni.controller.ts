// Academia Pro - Student Alumni Controller
// REST API endpoints for managing alumni records and engagement

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
import { StudentAlumniService } from '../services/alumni.service';
import { CreateAlumniDto, UpdateAlumniDto } from '../dtos/create-alumni.dto';
import { StudentManagementGuard } from '../guards/student-management.guard';

@ApiTags('Student Alumni Management')
@ApiBearerAuth()
@Controller('students/:studentId/alumni')
@UseGuards(StudentManagementGuard)
export class StudentAlumniController {
  constructor(private readonly alumniService: StudentAlumniService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create alumni record',
    description: 'Create an alumni record for a graduated student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Alumni record created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createAlumniRecord(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateAlumniDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.alumniService.createAlumniRecord(studentId, createDto, createdBy);
  }

  @Get()
  @ApiOperation({
    summary: 'Get alumni record',
    description: 'Retrieve alumni record for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni record retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni record not found',
  })
  async getAlumniRecord(@Param('studentId') studentId: string) {
    return this.alumniService.getAlumniRecord(studentId);
  }

  @Put()
  @ApiOperation({
    summary: 'Update alumni record',
    description: 'Update alumni record for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni record updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni record not found',
  })
  async updateAlumniRecord(
    @Param('studentId') studentId: string,
    @Body() updateDto: UpdateAlumniDto,
  ) {
    return this.alumniService.updateAlumniRecord(studentId, updateDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete alumni record',
    description: 'Delete alumni record for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumni record not found',
  })
  async deleteAlumniRecord(@Param('studentId') studentId: string) {
    await this.alumniService.deleteAlumniRecord(studentId);
    return { message: 'Alumni record deleted successfully' };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all alumni records',
    description: 'Retrieve all alumni records with optional filtering',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by alumni status',
    example: 'active',
  })
  @ApiQuery({
    name: 'graduationYear',
    required: false,
    description: 'Filter by graduation year',
    example: 2024,
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
    description: 'Alumni records retrieved successfully',
  })
  async getAlumniRecords(@Query() query: any) {
    const options = {
      status: query.status,
      graduationYear: query.graduationYear ? parseInt(query.graduationYear) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.alumniService.getAlumniRecords(options);
  }

  @Get('year/:graduationYear')
  @ApiOperation({
    summary: 'Get alumni by graduation year',
    description: 'Retrieve alumni records for a specific graduation year',
  })
  @ApiParam({
    name: 'graduationYear',
    description: 'Graduation year',
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni records retrieved successfully',
  })
  async getAlumniByGraduationYear(@Param('graduationYear') graduationYear: string) {
    return this.alumniService.getAlumniByGraduationYear(parseInt(graduationYear));
  }

  @Get('notable/all')
  @ApiOperation({
    summary: 'Get notable alumni',
    description: 'Retrieve all notable alumni records',
  })
  @ApiResponse({
    status: 200,
    description: 'Notable alumni retrieved successfully',
  })
  async getNotableAlumni() {
    return this.alumniService.getNotableAlumni();
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get alumni by status',
    description: 'Retrieve alumni records by status',
  })
  @ApiParam({
    name: 'status',
    description: 'Alumni status',
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni records retrieved successfully',
  })
  async getAlumniByStatus(@Param('status') status: string) {
    return this.alumniService.getAlumniByStatus(status);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search alumni',
    description: 'Search alumni records by name, email, or contact',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'John Doe',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchAlumni(@Query('q') searchTerm: string) {
    return this.alumniService.searchAlumni(searchTerm);
  }

  @Put('contact')
  @ApiOperation({
    summary: 'Record contact with alumni',
    description: 'Record a contact interaction with an alumni',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact recorded successfully',
  })
  async recordContact(
    @Param('studentId') studentId: string,
    @Body() body: { contactMethod: string; contactNotes?: string },
  ) {
    return this.alumniService.recordContact(studentId, body.contactMethod, body.contactNotes);
  }

  @Post('survey')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add survey response',
    description: 'Add a survey response for an alumni',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Survey response added successfully',
  })
  async addSurveyResponse(
    @Param('studentId') studentId: string,
    @Body() body: { surveyName: string; responses: Record<string, any> },
  ) {
    return this.alumniService.addSurveyResponse(studentId, body.surveyName, body.responses);
  }

  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add feedback',
    description: 'Add feedback from an alumni',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback added successfully',
  })
  async addFeedback(
    @Param('studentId') studentId: string,
    @Body() body: { feedbackType: string; feedbackContent: string },
  ) {
    return this.alumniService.addFeedback(studentId, body.feedbackType, body.feedbackContent);
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get alumni statistics',
    description: 'Get overall alumni statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni statistics retrieved successfully',
  })
  async getAlumniStatistics() {
    return this.alumniService.getAlumniStatistics();
  }

  @Get('engagement/metrics')
  @ApiOperation({
    summary: 'Get engagement metrics',
    description: 'Get alumni engagement and participation metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Engagement metrics retrieved successfully',
  })
  async getEngagementMetrics() {
    return this.alumniService.getEngagementMetrics();
  }
}