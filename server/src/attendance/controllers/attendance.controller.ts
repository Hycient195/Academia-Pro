// Academia Pro - Attendance Controller
// REST API endpoints for managing student attendance

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
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, SampleAudit, MonitorPerformance } from '../../common/audit/auditable.decorator';
import { AttendanceService } from '../services/attendance.service';
import {
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  BulkUpdateAttendanceDto,
  AttendanceResponseDto,
  AttendanceStatisticsDto,
  StudentAttendanceSummaryDto,
  ClassAttendanceReportDto,
  AttendanceListResponseDto,
} from '../dtos';
import { AttendanceType } from '../entities/attendance.entity';

@ApiTags('Attendance Management')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @HttpCode(HttpStatus.CREATED)
  @AuditCreate('attendance', 'id')
  @ApiOperation({
    summary: 'Mark attendance for a student',
    description: 'Mark attendance for an individual student',
  })
  @ApiResponse({
    status: 201,
    description: 'Attendance marked successfully',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Attendance already marked for this student on this date',
  })
  async markAttendance(
    @Body() dto: MarkAttendanceDto,
    @Request() req: any,
  ) {
    const markedBy = req.user?.id || 'system';
    const markedByName = req.user?.name || 'System';
    const markedByRole = req.user?.role || 'System';

    return this.attendanceService.markAttendance(dto, markedBy, markedByName, markedByRole);
  }

  @Post('bulk-mark')
  @HttpCode(HttpStatus.CREATED)
  @SampleAudit(0.1) // Sample 10% of bulk attendance operations
  @AuditCreate('attendance', '0.id')
  @ApiOperation({
    summary: 'Mark attendance for multiple students',
    description: 'Mark attendance for multiple students in bulk',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk attendance marked successfully',
    type: [AttendanceResponseDto],
  })
  async bulkMarkAttendance(
    @Body() dto: BulkMarkAttendanceDto,
    @Request() req: any,
  ) {
    const markedBy = req.user?.id || 'system';
    const markedByName = req.user?.name || 'System';
    const markedByRole = req.user?.role || 'System';

    return this.attendanceService.bulkMarkAttendance(dto, markedBy, markedByName, markedByRole);
  }

  @Put('bulk-update')
  @ApiOperation({
    summary: 'Update attendance for multiple students',
    description: 'Update attendance status for multiple students',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk attendance updated successfully',
    type: [AttendanceResponseDto],
  })
  async bulkUpdateAttendance(@Body() dto: BulkUpdateAttendanceDto) {
    return this.attendanceService.bulkUpdateAttendance(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get attendance record by ID',
    description: 'Retrieve a specific attendance record',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record ID',
    example: 'attendance-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
  })
  async getAttendanceById(@Param('id', ParseUUIDPipe) attendanceId: string) {
    return this.attendanceService.getAttendanceById(attendanceId);
  }

  @Put(':id')
  @AuditUpdate('attendance', 'id')
  @ApiOperation({
    summary: 'Update attendance record',
    description: 'Update an existing attendance record',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record ID',
    example: 'attendance-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance record updated successfully',
    type: AttendanceResponseDto,
  })
  async updateAttendance(
    @Param('id', ParseUUIDPipe) attendanceId: string,
    @Body() dto: Partial<MarkAttendanceDto>,
  ) {
    return this.attendanceService.updateAttendance(attendanceId, dto);
  }

  @Delete(':id')
  @AuditDelete('attendance', 'id')
  @ApiOperation({
    summary: 'Delete attendance record',
    description: 'Delete an attendance record',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record ID',
    example: 'attendance-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance record deleted successfully',
  })
  async deleteAttendance(@Param('id', ParseUUIDPipe) attendanceId: string) {
    await this.attendanceService.deleteAttendance(attendanceId);
    return { message: 'Attendance record deleted successfully' };
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Get student attendance records',
    description: 'Retrieve attendance records for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'attendanceType',
    required: false,
    description: 'Type of attendance to filter',
    enum: AttendanceType,
    example: AttendanceType.CLASS,
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
    description: 'Student attendance records retrieved successfully',
    type: [AttendanceResponseDto],
  })
  async getStudentAttendance(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: any,
  ) {
    const options = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      attendanceType: query.attendanceType,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.attendanceService.getStudentAttendance(studentId, options);
  }

  @Get('class/:classId/date/:date')
  @ApiOperation({
    summary: 'Get class attendance for a specific date',
    description: 'Retrieve attendance records for a class on a specific date',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  @ApiParam({
    name: 'date',
    description: 'Attendance date (YYYY-MM-DD)',
    example: '2024-03-15',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    description: 'Section ID to filter',
    example: 'section-uuid-456',
  })
  @ApiQuery({
    name: 'periodNumber',
    required: false,
    description: 'Period number to filter',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Class attendance records retrieved successfully',
    type: [AttendanceResponseDto],
  })
  async getClassAttendance(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('date') date: string,
    @Query() query: any,
  ) {
    const attendanceDate = new Date(date);
    const options = {
      sectionId: query.sectionId,
      periodNumber: query.periodNumber ? parseInt(query.periodNumber) : undefined,
    };

    return this.attendanceService.getClassAttendance(classId, attendanceDate, options);
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get attendance statistics',
    description: 'Get attendance statistics for a date range',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Class ID to filter statistics',
    example: 'class-uuid-123',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    description: 'Section ID to filter statistics',
    example: 'section-uuid-456',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for statistics (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for statistics (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'attendanceType',
    required: false,
    description: 'Type of attendance to filter',
    enum: AttendanceType,
    example: AttendanceType.CLASS,
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance statistics retrieved successfully',
    type: AttendanceStatisticsDto,
  })
  async getAttendanceStatistics(@Query() query: any) {
    const options = {
      classId: query.classId,
      sectionId: query.sectionId,
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      attendanceType: query.attendanceType,
    };

    return this.attendanceService.getAttendanceStatistics(options);
  }

  @Get('student/:studentId/summary')
  @ApiOperation({
    summary: 'Get student attendance summary',
    description: 'Get attendance summary for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for summary (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for summary (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'attendanceType',
    required: false,
    description: 'Type of attendance to filter',
    enum: AttendanceType,
    example: AttendanceType.CLASS,
  })
  @ApiResponse({
    status: 200,
    description: 'Student attendance summary retrieved successfully',
    type: StudentAttendanceSummaryDto,
  })
  async getStudentAttendanceSummary(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: any,
  ) {
    const options = {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      attendanceType: query.attendanceType,
    };

    return this.attendanceService.getStudentAttendanceSummary(studentId, options);
  }

  @Get('reports/class/:classId')
  @ApiOperation({
    summary: 'Get class attendance report',
    description: 'Generate a comprehensive attendance report for a class',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Report date (YYYY-MM-DD)',
    example: '2024-03-15',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    description: 'Section ID to filter',
    example: 'section-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Class attendance report generated successfully',
    type: ClassAttendanceReportDto,
  })
  async getClassAttendanceReport(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query() query: any,
  ) {
    // This would typically involve more complex logic to generate a full report
    // For now, we'll return basic class attendance data
    const attendanceDate = new Date(query.date);
    const options = {
      sectionId: query.sectionId,
    };

    const records = await this.attendanceService.getClassAttendance(classId, attendanceDate, options);

    // Calculate statistics
    const totalStudents = records.length;
    const presentCount = records.filter(r => r.isPresent).length;
    const absentCount = records.filter(r => r.isAbsent).length;
    const lateCount = records.filter(r => r.isLate).length;
    const excusedCount = records.filter(r => r.status === 'excused').length;

    return {
      classId,
      className: 'Class Name', // This would come from class service
      sectionName: query.sectionId ? 'Section Name' : 'All Sections',
      reportDate: query.date,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage: totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0,
      absentStudents: records.filter(r => r.isAbsent).map(r => r.student?.fullName || 'Unknown'),
      lateStudents: records.filter(r => r.isLate).map(r => r.student?.fullName || 'Unknown'),
    };
  }
}