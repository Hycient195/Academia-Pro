import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentManagementGuard } from '../guards/student-management.guard';
import { StudentTransferService } from '../services/transfer.service';

@ApiTags('Student Management - Transfer')
@ApiBearerAuth()
@Controller('students/transfer')
@UseGuards(StudentManagementGuard)
export class StudentTransferController {
  constructor(
    private readonly transferService: StudentTransferService,
  ) {}

  @Post('request')
  @ApiOperation({ summary: 'Create transfer request' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transfer request created successfully' })
  async createTransferRequest(@Body() transferData: any, @Request() req: any) {
    const { schoolId, userId } = req;
    return this.transferService.createTransferRequest(transferData, schoolId, userId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get transfer requests' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by transfer type' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getTransferRequests(
    @Request() req: any,
    @Query() query: any,
  ) {
    const { schoolId } = req;
    return this.transferService.getTransferRequests(schoolId, query);
  }

  @Get('requests/:requestId')
  @ApiOperation({ summary: 'Get transfer request by ID' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async getTransferRequest(
    @Param('requestId') requestId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.transferService.getTransferRequest(requestId, schoolId);
  }

  @Put('requests/:requestId/review')
  @ApiOperation({ summary: 'Review transfer request' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async reviewTransferRequest(
    @Param('requestId') requestId: string,
    @Body() reviewData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.reviewTransferRequest(requestId, reviewData, schoolId, userId);
  }

  @Post('requests/:requestId/approve')
  @ApiOperation({ summary: 'Approve transfer request' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async approveTransferRequest(
    @Param('requestId') requestId: string,
    @Body() approvalData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.approveTransferRequest(requestId, approvalData, schoolId, userId);
  }

  @Post('requests/:requestId/reject')
  @ApiOperation({ summary: 'Reject transfer request' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async rejectTransferRequest(
    @Param('requestId') requestId: string,
    @Body() rejectionData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.rejectTransferRequest(requestId, rejectionData, schoolId, userId);
  }

  @Post('requests/:requestId/appeal')
  @ApiOperation({ summary: 'Submit transfer appeal' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async submitTransferAppeal(
    @Param('requestId') requestId: string,
    @Body() appealData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.submitTransferAppeal(requestId, appealData, schoolId, userId);
  }

  @Put('requests/:requestId/appeal/review')
  @ApiOperation({ summary: 'Review transfer appeal' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async reviewTransferAppeal(
    @Param('requestId') requestId: string,
    @Body() appealReviewData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.reviewTransferAppeal(requestId, appealReviewData, schoolId, userId);
  }

  @Post('requests/:requestId/complete')
  @ApiOperation({ summary: 'Complete transfer process' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async completeTransfer(
    @Param('requestId') requestId: string,
    @Body() completionData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.completeTransfer(requestId, completionData, schoolId, userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get transfer statistics' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Academic year for statistics' })
  @ApiQuery({ name: 'month', required: false, description: 'Month for statistics' })
  async getTransferStatistics(
    @Request() req: any,
    @Query('academicYear') academicYear?: string,
    @Query('month') month?: string,
  ) {
    const { schoolId } = req;
    return this.transferService.getTransferStatistics(schoolId, academicYear, month);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available transfer types' })
  async getTransferTypes() {
    return this.transferService.getTransferTypes();
  }

  @Get('reasons')
  @ApiOperation({ summary: 'Get available transfer reasons' })
  async getTransferReasons() {
    return this.transferService.getTransferReasons();
  }

  @Post('bulk-approve')
  @ApiOperation({ summary: 'Bulk approve transfer requests' })
  async bulkApproveTransfers(
    @Body() bulkData: { requestIds: string[], approvalData: any },
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.bulkApproveTransfers(bulkData.requestIds, bulkData.approvalData, schoolId, userId);
  }

  @Get('student/:studentId/history')
  @ApiOperation({ summary: 'Get student transfer history' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async getStudentTransferHistory(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.transferService.getStudentTransferHistory(studentId, schoolId);
  }

  @Post('requests/:requestId/documents')
  @ApiOperation({ summary: 'Upload transfer documents' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async uploadTransferDocuments(
    @Param('requestId') requestId: string,
    @Body() documentData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.uploadTransferDocuments(requestId, documentData, schoolId, userId);
  }

  @Get('requests/:requestId/documents')
  @ApiOperation({ summary: 'Get transfer documents' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async getTransferDocuments(
    @Param('requestId') requestId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.transferService.getTransferDocuments(requestId, schoolId);
  }

  @Delete('requests/:requestId')
  @ApiOperation({ summary: 'Cancel transfer request' })
  @ApiParam({ name: 'requestId', description: 'Transfer request ID' })
  async cancelTransferRequest(
    @Param('requestId') requestId: string,
    @Body() cancellationData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.transferService.cancelTransferRequest(requestId, cancellationData, schoolId, userId);
  }
}