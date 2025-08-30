// Academia Pro - Timetable Controller
// REST API endpoints for managing class schedules and timetables

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
import { TimetableService } from '../services/timetable.service';
import { CreateTimetableDto, BulkCreateTimetableDto, UpdateTimetableDto } from '../dtos';
import { DayOfWeek, TimetableStatus, PeriodType, PriorityLevel } from '../entities/timetable.entity';

@ApiTags('Timetable Management')
@ApiBearerAuth()
@Controller('timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new timetable entry',
    description: 'Create a new class schedule entry with conflict checking',
  })
  @ApiResponse({
    status: 201,
    description: 'Timetable entry created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Schedule conflicts detected',
  })
  async createTimetable(
    @Body() dto: CreateTimetableDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.timetableService.createTimetable(dto, createdBy);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create multiple timetable entries',
    description: 'Bulk create timetable entries for efficient scheduling',
  })
  @ApiResponse({
    status: 201,
    description: 'Timetable entries created successfully',
  })
  async bulkCreateTimetable(
    @Body() dto: BulkCreateTimetableDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.timetableService.bulkCreateTimetable(dto, createdBy);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get timetable entry by ID',
    description: 'Retrieve a specific timetable entry with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable entry ID',
    example: 'timetable-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable entry not found',
  })
  async getTimetableById(@Param('id', ParseUUIDPipe) timetableId: string) {
    return this.timetableService.getTimetableById(timetableId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update timetable entry',
    description: 'Update an existing timetable entry with conflict checking',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable entry ID',
    example: 'timetable-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry updated successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Schedule conflicts detected',
  })
  async updateTimetable(
    @Param('id', ParseUUIDPipe) timetableId: string,
    @Body() dto: UpdateTimetableDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.timetableService.updateTimetable(timetableId, dto, updatedBy);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete timetable entry',
    description: 'Delete a timetable entry (only if not active)',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable entry ID',
    example: 'timetable-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry deleted successfully',
  })
  async deleteTimetable(@Param('id', ParseUUIDPipe) timetableId: string) {
    await this.timetableService.deleteTimetable(timetableId);
    return { message: 'Timetable entry deleted successfully' };
  }

  @Put(':id/publish')
  @ApiOperation({
    summary: 'Publish timetable entry',
    description: 'Make the timetable entry visible to students and teachers',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable entry ID',
    example: 'timetable-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry published successfully',
  })
  async publishTimetable(@Param('id', ParseUUIDPipe) timetableId: string) {
    return this.timetableService.publishTimetable(timetableId);
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancel timetable entry',
    description: 'Cancel a timetable entry with reason',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable entry ID',
    example: 'timetable-uuid-123',
  })
  @ApiQuery({
    name: 'reason',
    description: 'Reason for cancellation',
    example: 'Teacher unavailable',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry cancelled successfully',
  })
  async cancelTimetable(
    @Param('id', ParseUUIDPipe) timetableId: string,
    @Query('reason') reason: string,
  ) {
    return this.timetableService.cancelTimetable(timetableId, reason);
  }

  @Get('class/:classId')
  @ApiOperation({
    summary: 'Get class timetable',
    description: 'Retrieve all timetable entries for a specific class',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year filter',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    description: 'Grade level filter',
    example: 'Grade 10',
  })
  @ApiQuery({
    name: 'section',
    required: false,
    description: 'Section filter',
    example: 'A',
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Day of week filter',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
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
    description: 'Class timetable retrieved successfully',
  })
  async getClassTimetable(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query() query: any,
  ) {
    const options = {
      academicYear: query.academicYear,
      gradeLevel: query.gradeLevel,
      section: query.section,
      dayOfWeek: query.dayOfWeek,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.timetableService.getClassTimetable(classId, options);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({
    summary: 'Get teacher timetable',
    description: 'Retrieve all timetable entries for a specific teacher',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher ID',
    example: 'teacher-uuid-456',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year filter',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Day of week filter',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
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
    description: 'Teacher timetable retrieved successfully',
  })
  async getTeacherTimetable(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query() query: any,
  ) {
    const options = {
      academicYear: query.academicYear,
      dayOfWeek: query.dayOfWeek,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.timetableService.getTeacherTimetable(teacherId, options);
  }

  @Get('room/:roomId')
  @ApiOperation({
    summary: 'Get room timetable',
    description: 'Retrieve all timetable entries for a specific room',
  })
  @ApiParam({
    name: 'roomId',
    description: 'Room ID',
    example: 'room-uuid-789',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year filter',
    example: '2024-2025',
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Day of week filter',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
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
    description: 'Room timetable retrieved successfully',
  })
  async getRoomTimetable(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: any,
  ) {
    const options = {
      academicYear: query.academicYear,
      dayOfWeek: query.dayOfWeek,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.timetableService.getRoomTimetable(roomId, options);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate optimized timetable',
    description: 'Automatically generate an optimized timetable using AI algorithms',
  })
  @ApiResponse({
    status: 201,
    description: 'Timetable generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid generation parameters',
  })
  async generateTimetable(@Body() options: {
    schoolId: string;
    academicYear: string;
    gradeLevel: string;
    section?: string;
    subjects: Array<{
      subjectId: string;
      subjectName: string;
      teacherId: string;
      teacherName: string;
      periodsPerWeek: number;
      durationMinutes: number;
      priorityLevel?: PriorityLevel;
    }>;
    constraints?: {
      maxPeriodsPerDay?: number;
      breakDurationMinutes?: number;
      lunchBreak?: {
        startTime: string;
        endTime: string;
      };
      workingDays?: DayOfWeek[];
      startTime?: string;
      endTime?: string;
    };
  }) {
    return this.timetableService.generateTimetable(options);
  }

  @Get('conflicts/check')
  @ApiOperation({
    summary: 'Check for scheduling conflicts',
    description: 'Check for conflicts in proposed timetable entries',
  })
  @ApiQuery({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'teacherId',
    description: 'Teacher ID',
    example: 'teacher-uuid-456',
  })
  @ApiQuery({
    name: 'roomId',
    description: 'Room ID',
    example: 'room-uuid-789',
    required: false,
  })
  @ApiQuery({
    name: 'dayOfWeek',
    description: 'Day of week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @ApiQuery({
    name: 'startTime',
    description: 'Start time (HH:MM)',
    example: '09:00',
  })
  @ApiQuery({
    name: 'endTime',
    description: 'End time (HH:MM)',
    example: '10:00',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict check completed',
  })
  async checkConflicts(@Query() query: {
    schoolId: string;
    teacherId: string;
    roomId?: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) {
    const dto: CreateTimetableDto = {
      schoolId: query.schoolId,
      academicYear: '2024-2025', // Default
      gradeLevel: 'Grade 10', // Default
      classId: 'temp-class-id',
      subjectId: 'temp-subject-id',
      subjectName: 'Temp Subject',
      teacherId: query.teacherId,
      teacherName: 'Temp Teacher',
      dayOfWeek: query.dayOfWeek,
      startTime: query.startTime,
      endTime: query.endTime,
      durationMinutes: 60, // Default
      roomId: query.roomId,
    };

    const conflicts = await this.timetableService.checkConflicts(dto);
    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts,
    };
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get timetable statistics',
    description: 'Retrieve comprehensive statistics for timetable management',
  })
  @ApiQuery({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'academicYear',
    description: 'Academic year',
    example: '2024-2025',
    required: false,
  })
  @ApiQuery({
    name: 'gradeLevel',
    description: 'Grade level',
    example: 'Grade 10',
    required: false,
  })
  @ApiQuery({
    name: 'section',
    description: 'Section',
    example: 'A',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable statistics retrieved successfully',
  })
  async getTimetableStatistics(@Query() query: {
    schoolId: string;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
  }) {
    return this.timetableService.getTimetableStatistics(query);
  }

  @Get('dashboard/overview')
  @ApiOperation({
    summary: 'Get timetable dashboard overview',
    description: 'Retrieve dashboard data for timetable management',
  })
  @ApiQuery({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'academicYear',
    description: 'Academic year',
    example: '2024-2025',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for dashboard data',
    example: '2024-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for dashboard data',
    example: '2024-12-31',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable dashboard overview retrieved successfully',
  })
  async getTimetableDashboard(@Query() query: {
    schoolId: string;
    academicYear?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // This would aggregate data from multiple timetables
    // For now, return basic statistics
    const stats = await this.timetableService.getTimetableStatistics({
      schoolId: query.schoolId,
      academicYear: query.academicYear,
    });

    return {
      summary: stats,
      period: {
        academicYear: query.academicYear || '2024-2025',
        startDate: query.startDate || '2024-01-01',
        endDate: query.endDate || '2024-12-31',
      },
      alerts: {
        conflictsCount: stats.conflictsCount,
        unpublishedEntries: stats.totalEntries - stats.publishedEntries,
      },
    };
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Get student timetable',
    description: 'Retrieve timetable for a specific student based on their class',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-101',
  })
  @ApiQuery({
    name: 'academicYear',
    description: 'Academic year',
    example: '2024-2025',
    required: false,
  })
  @ApiQuery({
    name: 'dayOfWeek',
    description: 'Day of week filter',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Student timetable retrieved successfully',
  })
  async getStudentTimetable(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: {
      academicYear?: string;
      dayOfWeek?: DayOfWeek;
    },
  ) {
    // This would need to get student's class information first
    // For now, return a placeholder
    return {
      message: 'Student timetable retrieval not yet implemented',
      studentId,
      academicYear: query.academicYear || '2024-2025',
      dayOfWeek: query.dayOfWeek,
    };
  }

  @Get('today/overview')
  @ApiOperation({
    summary: 'Get today\'s timetable overview',
    description: 'Retrieve today\'s schedule for all classes and teachers',
  })
  @ApiQuery({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'academicYear',
    description: 'Academic year',
    example: '2024-2025',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Today\'s timetable overview retrieved successfully',
  })
  async getTodaysOverview(@Query() query: {
    schoolId: string;
    academicYear?: string;
  }) {
    const today = new Date().getDay();
    const dayMap = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };

    const dayOfWeek = dayMap[today];

    // Get all active timetables for today
    const todaysEntries = await this.timetableService.getClassTimetable(
      `${query.schoolId}-all-classes`,
      {
        academicYear: query.academicYear,
        dayOfWeek: dayOfWeek,
      },
    );

    return {
      date: new Date().toISOString().split('T')[0],
      dayOfWeek,
      totalEntries: todaysEntries.length,
      entries: todaysEntries,
      summary: {
        activeClasses: todaysEntries.filter(e => e.status === TimetableStatus.ACTIVE).length,
        publishedEntries: todaysEntries.filter(e => e.status === TimetableStatus.PUBLISHED).length,
        conflicts: todaysEntries.filter(e => e.hasConflicts).length,
      },
    };
  }
}