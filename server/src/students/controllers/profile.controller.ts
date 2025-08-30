import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StudentManagementGuard } from '../guards/student-management.guard';
import { StudentProfileService } from '../services/profile.service';

@ApiTags('Student Management - Profile')
@ApiBearerAuth()
@Controller('students/profile')
@UseGuards(StudentManagementGuard)
export class StudentProfileController {
  constructor(
    private readonly profileService: StudentProfileService,
  ) {}

  @Get(':studentId')
  @ApiOperation({ summary: 'Get student profile' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student profile retrieved successfully' })
  async getStudentProfile(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.profileService.getStudentProfile(studentId, schoolId);
  }

  @Put(':studentId')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student profile updated successfully' })
  async updateStudentProfile(
    @Param('studentId') studentId: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updateStudentProfile(studentId, updateData, schoolId, userId);
  }

  @Put(':studentId/personal')
  @ApiOperation({ summary: 'Update student personal information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updatePersonalInfo(
    @Param('studentId') studentId: string,
    @Body() personalData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updatePersonalInfo(studentId, personalData, schoolId, userId);
  }

  @Put(':studentId/contact')
  @ApiOperation({ summary: 'Update student contact information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updateContactInfo(
    @Param('studentId') studentId: string,
    @Body() contactData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updateContactInfo(studentId, contactData, schoolId, userId);
  }

  @Put(':studentId/academic')
  @ApiOperation({ summary: 'Update student academic information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updateAcademicInfo(
    @Param('studentId') studentId: string,
    @Body() academicData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updateAcademicInfo(studentId, academicData, schoolId, userId);
  }

  @Put(':studentId/medical')
  @ApiOperation({ summary: 'Update student medical information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updateMedicalInfo(
    @Param('studentId') studentId: string,
    @Body() medicalData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updateMedicalInfo(studentId, medicalData, schoolId, userId);
  }

  @Put(':studentId/financial')
  @ApiOperation({ summary: 'Update student financial information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updateFinancialInfo(
    @Param('studentId') studentId: string,
    @Body() financialData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updateFinancialInfo(studentId, financialData, schoolId, userId);
  }

  @Put(':studentId/preferences')
  @ApiOperation({ summary: 'Update student preferences' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async updatePreferences(
    @Param('studentId') studentId: string,
    @Body() preferencesData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.updatePreferences(studentId, preferencesData, schoolId, userId);
  }

  @Post(':studentId/photo')
  @ApiOperation({ summary: 'Upload student photo' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Student photo file',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentPhoto(
    @Param('studentId') studentId: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.uploadStudentPhoto(studentId, file, schoolId, userId);
  }

  @Get(':studentId/history')
  @ApiOperation({ summary: 'Get student profile update history' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getProfileHistory(
    @Param('studentId') studentId: string,
    @Query() query: any,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.profileService.getProfileHistory(studentId, schoolId, query);
  }

  @Get(':studentId/audit')
  @ApiOperation({ summary: 'Get student profile audit trail' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getProfileAuditTrail(
    @Param('studentId') studentId: string,
    @Query() query: any,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.profileService.getProfileAuditTrail(studentId, schoolId, query);
  }

  @Post(':studentId/verify')
  @ApiOperation({ summary: 'Verify student profile information' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async verifyProfile(
    @Param('studentId') studentId: string,
    @Body() verificationData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.verifyProfile(studentId, verificationData, schoolId, userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search students by criteria' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'grade', required: false, description: 'Filter by grade' })
  @ApiQuery({ name: 'section', required: false, description: 'Filter by section' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async searchStudents(
    @Query() query: any,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.profileService.searchStudents(schoolId, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get student profile statistics' })
  async getProfileStatistics(@Request() req: any) {
    const { schoolId } = req;
    return this.profileService.getProfileStatistics(schoolId);
  }

  @Post(':studentId/archive')
  @ApiOperation({ summary: 'Archive student profile' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async archiveProfile(
    @Param('studentId') studentId: string,
    @Body() archiveData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.archiveProfile(studentId, archiveData, schoolId, userId);
  }

  @Post(':studentId/restore')
  @ApiOperation({ summary: 'Restore archived student profile' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async restoreProfile(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.profileService.restoreProfile(studentId, schoolId, userId);
  }
}