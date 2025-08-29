import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { VirtualClassroomService } from '../services/virtual-classroom.service';

@ApiTags('Online Learning - Virtual Classrooms')
@Controller('online-learning/classrooms')
export class VirtualClassroomController {
  private readonly logger = new Logger(VirtualClassroomController.name);

  constructor(
    private readonly classroomService: VirtualClassroomService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all virtual classrooms',
    description: 'Returns a list of virtual classrooms with optional filtering and pagination.',
  })
  @ApiQuery({
    name: 'schoolId',
    required: false,
    description: 'Filter by school ID',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled', 'archived'],
    description: 'Filter by classroom status',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    description: 'Filter by teacher ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (ISO format)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Classrooms retrieved successfully',
  })
  async getClassrooms(@Query() filters: any) {
    this.logger.log(`Getting classrooms with filters:`, filters);
    return this.classroomService.getClassrooms(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get virtual classroom by ID',
    description: 'Returns detailed information about a specific virtual classroom.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  async getClassroomById(@Param('id') id: string) {
    this.logger.log(`Getting classroom ${id}`);
    return this.classroomService.getClassroomById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create virtual classroom',
    description: 'Creates a new virtual classroom with the provided configuration.',
  })
  @ApiBody({
    description: 'Virtual classroom creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'subjectId', 'teacherId', 'title', 'scheduledStartTime', 'scheduledEndTime'],
      properties: {
        schoolId: { type: 'string', description: 'School ID' },
        subjectId: { type: 'string', description: 'Subject ID' },
        teacherId: { type: 'string', description: 'Teacher ID' },
        title: { type: 'string', description: 'Classroom title' },
        description: { type: 'string', description: 'Classroom description' },
        scheduledStartTime: { type: 'string', format: 'date-time', description: 'Start time' },
        scheduledEndTime: { type: 'string', format: 'date-time', description: 'End time' },
        classroomType: { type: 'string', enum: ['live_session', 'recorded_session', 'hybrid_session', 'self_paced'] },
        accessLevel: { type: 'string', enum: ['public', 'private', 'invitation_only', 'password_protected'] },
        maxParticipants: { type: 'number', description: 'Maximum participants' },
        settings: { type: 'object', description: 'Classroom settings' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Classroom created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createClassroom(@Body() createData: any) {
    this.logger.log(`Creating classroom: ${createData.title}`);
    return this.classroomService.createClassroom(createData);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update virtual classroom',
    description: 'Updates an existing virtual classroom with the provided data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiBody({
    description: 'Virtual classroom update data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Classroom title' },
        description: { type: 'string', description: 'Classroom description' },
        scheduledStartTime: { type: 'string', format: 'date-time', description: 'Start time' },
        scheduledEndTime: { type: 'string', format: 'date-time', description: 'End time' },
        status: { type: 'string', enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled', 'archived'] },
        settings: { type: 'object', description: 'Classroom settings' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  async updateClassroom(@Param('id') id: string, @Body() updateData: any) {
    this.logger.log(`Updating classroom ${id}`);
    return this.classroomService.updateClassroom(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete virtual classroom',
    description: 'Deletes a virtual classroom and all associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  async deleteClassroom(@Param('id') id: string) {
    this.logger.log(`Deleting classroom ${id}`);
    return this.classroomService.deleteClassroom(id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Start virtual classroom session',
    description: 'Starts a virtual classroom session and generates meeting URLs.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom session started successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Classroom already active or cannot be started',
  })
  async startClassroomSession(@Param('id') id: string) {
    this.logger.log(`Starting classroom session ${id}`);
    return this.classroomService.startClassroomSession(id);
  }

  @Post(':id/end')
  @ApiOperation({
    summary: 'End virtual classroom session',
    description: 'Ends a virtual classroom session and processes recordings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom session ended successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  async endClassroomSession(@Param('id') id: string) {
    this.logger.log(`Ending classroom session ${id}`);
    return this.classroomService.endClassroomSession(id);
  }

  @Get(':id/participants')
  @ApiOperation({
    summary: 'Get classroom participants',
    description: 'Returns the list of participants for a virtual classroom session.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiQuery({
    name: 'includeHistory',
    required: false,
    type: Boolean,
    description: 'Include participation history',
  })
  @ApiResponse({
    status: 200,
    description: 'Participants retrieved successfully',
  })
  async getClassroomParticipants(
    @Param('id') id: string,
    @Query('includeHistory') includeHistory?: boolean,
  ) {
    this.logger.log(`Getting participants for classroom ${id}`);
    return this.classroomService.getClassroomParticipants(id, includeHistory);
  }

  @Post(':id/join')
  @ApiOperation({
    summary: 'Join virtual classroom',
    description: 'Generates join URL for a participant to enter the virtual classroom.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiBody({
    description: 'Participant information',
    schema: {
      type: 'object',
      required: ['participantId', 'participantType'],
      properties: {
        participantId: { type: 'string', description: 'Participant ID (student/teacher)' },
        participantType: { type: 'string', enum: ['student', 'teacher', 'observer'], description: 'Type of participant' },
        participantName: { type: 'string', description: 'Participant display name' },
        accessCode: { type: 'string', description: 'Access code if required' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Join URL generated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - invalid credentials or classroom not accessible',
  })
  async joinClassroom(@Param('id') id: string, @Body() participantData: any) {
    this.logger.log(`Generating join URL for classroom ${id}, participant: ${participantData.participantId}`);
    return this.classroomService.joinClassroom(id, participantData);
  }

  @Get(':id/recordings')
  @ApiOperation({
    summary: 'Get classroom recordings',
    description: 'Returns available recordings for a virtual classroom.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordings retrieved successfully',
  })
  async getClassroomRecordings(@Param('id') id: string) {
    this.logger.log(`Getting recordings for classroom ${id}`);
    return this.classroomService.getClassroomRecordings(id);
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get classroom analytics',
    description: 'Returns analytics and engagement data for a virtual classroom.',
  })
  @ApiParam({
    name: 'id',
    description: 'Virtual classroom ID',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['session', 'day', 'week', 'month'],
    description: 'Time range for analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
  })
  async getClassroomAnalytics(
    @Param('id') id: string,
    @Query('timeRange') timeRange?: string,
  ) {
    this.logger.log(`Getting analytics for classroom ${id}, timeRange: ${timeRange}`);
    return this.classroomService.getClassroomAnalytics(id, timeRange);
  }
}