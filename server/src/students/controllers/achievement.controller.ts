// Academia Pro - Student Achievement Controller
// REST API endpoints for managing student achievements and recognitions

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
import { StudentAchievementService } from '../services/achievement.service';
import { CreateAchievementDto, UpdateAchievementDto } from '../dtos/create-achievement.dto';
import { StudentManagementGuard } from '../guards/student-management.guard';

@ApiTags('Student Achievement Management')
@ApiBearerAuth()
@Controller('students/:studentId/achievements')
@UseGuards(StudentManagementGuard)
export class StudentAchievementController {
  constructor(private readonly achievementService: StudentAchievementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create achievement',
    description: 'Create a new achievement for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Achievement created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createAchievement(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateAchievementDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.achievementService.createAchievement(studentId, createDto, createdBy);
  }

  @Get()
  @ApiOperation({
    summary: 'Get student achievements',
    description: 'Retrieve all achievements for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by achievement status',
    example: 'verified',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by achievement type',
    example: 'academic',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by achievement level',
    example: 'school',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of achievements',
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
    description: 'Achievements retrieved successfully',
  })
  async getStudentAchievements(
    @Param('studentId') studentId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      type: query.type,
      level: query.level,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.achievementService.getStudentAchievements(studentId, options);
  }

  @Get(':achievementId')
  @ApiOperation({
    summary: 'Get specific achievement',
    description: 'Retrieve a specific achievement by ID',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'Achievement ID',
    example: 'achievement-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found',
  })
  async getAchievement(@Param('achievementId') achievementId: string) {
    return this.achievementService.getAchievement(achievementId);
  }

  @Put(':achievementId')
  @ApiOperation({
    summary: 'Update achievement',
    description: 'Update a specific achievement',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'Achievement ID',
    example: 'achievement-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found',
  })
  async updateAchievement(
    @Param('achievementId') achievementId: string,
    @Body() updateDto: UpdateAchievementDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.achievementService.updateAchievement(achievementId, updateDto, updatedBy);
  }

  @Delete(':achievementId')
  @ApiOperation({
    summary: 'Delete achievement',
    description: 'Delete a specific achievement',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'Achievement ID',
    example: 'achievement-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found',
  })
  async deleteAchievement(@Param('achievementId') achievementId: string) {
    await this.achievementService.deleteAchievement(achievementId);
    return { message: 'Achievement deleted successfully' };
  }

  @Get('type/:achievementType')
  @ApiOperation({
    summary: 'Get achievements by type',
    description: 'Retrieve achievements of a specific type for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementType',
    description: 'Achievement type',
    example: 'academic',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements retrieved successfully',
  })
  async getAchievementsByType(
    @Param('studentId') studentId: string,
    @Param('achievementType') achievementType: string,
  ) {
    return this.achievementService.getAchievementsByType(studentId, achievementType);
  }

  @Get('level/:achievementLevel')
  @ApiOperation({
    summary: 'Get achievements by level',
    description: 'Retrieve achievements of a specific level for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementLevel',
    description: 'Achievement level',
    example: 'school',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements retrieved successfully',
  })
  async getAchievementsByLevel(
    @Param('studentId') studentId: string,
    @Param('achievementLevel') achievementLevel: string,
  ) {
    return this.achievementService.getAchievementsByLevel(studentId, achievementLevel);
  }

  @Get('published/all')
  @ApiOperation({
    summary: 'Get published achievements',
    description: 'Retrieve all published achievements for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Published achievements retrieved successfully',
  })
  async getPublishedAchievements(@Param('studentId') studentId: string) {
    return this.achievementService.getPublishedAchievements(studentId);
  }

  @Get('follow-up-required')
  @ApiOperation({
    summary: 'Get achievements requiring follow-up',
    description: 'Retrieve achievements that require follow-up for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up required achievements retrieved successfully',
  })
  async getAchievementsRequiringFollowUp(@Param('studentId') studentId: string) {
    return this.achievementService.getAchievementsRequiringFollowUp(studentId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search achievements',
    description: 'Search achievements by term for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'science fair',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchAchievements(
    @Param('studentId') studentId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.achievementService.searchAchievements(studentId, searchTerm);
  }

  @Put(':achievementId/verify')
  @ApiOperation({
    summary: 'Verify achievement',
    description: 'Verify an achievement and update its status',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'Achievement ID',
    example: 'achievement-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement verified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found',
  })
  async verifyAchievement(
    @Param('achievementId') achievementId: string,
    @Body() body: { verificationNotes?: string },
    @Request() req: any,
  ) {
    const verifiedBy = req.user?.id || 'system';
    return this.achievementService.verifyAchievement(achievementId, verifiedBy, body.verificationNotes);
  }

  @Put(':achievementId/publish')
  @ApiOperation({
    summary: 'Publish achievement',
    description: 'Publish a verified achievement',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'Achievement ID',
    example: 'achievement-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement published successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Achievement must be verified before publishing',
  })
  async publishAchievement(@Param('achievementId') achievementId: string) {
    return this.achievementService.publishAchievement(achievementId);
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get achievement statistics',
    description: 'Get achievement statistics for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement statistics retrieved successfully',
  })
  async getAchievementStatistics(@Param('studentId') studentId: string) {
    return this.achievementService.getAchievementStatistics(studentId);
  }
}