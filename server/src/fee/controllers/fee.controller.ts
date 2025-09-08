// Academia Pro - Fee Controller
// REST API endpoints for fee management system

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
  UseInterceptors,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, SampleAudit, MonitorPerformance } from '../../common/audit/auditable.decorator';
import { FeeService } from '../services/fee.service';
import { CreateFeeStructureDto, UpdateFeeStructureDto } from '../dtos/create-fee-structure.dto';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from '../dtos/create-payment.dto';
import { FeeManagementGuard } from '../guards/fee-management.guard';
import { FeeInterceptor } from '../interceptors/fee.interceptor';

@ApiTags('Fee Management')
@ApiBearerAuth()
@Controller('fees')
@UseGuards(FeeManagementGuard)
@UseInterceptors(FeeInterceptor)
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  // Fee Structure Management
  @Post('structures')
  @ApiOperation({ summary: 'Create a new fee structure' })
  @ApiResponse({ status: 201, description: 'Fee structure created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createFeeStructure(@Body() dto: CreateFeeStructureDto, @Request() req: any) {
    return await this.feeService.createFeeStructure(dto, req.user.id);
  }

  @Put('structures/:id')
  @ApiOperation({ summary: 'Update an existing fee structure' })
  @ApiResponse({ status: 200, description: 'Fee structure updated successfully' })
  @ApiResponse({ status: 404, description: 'Fee structure not found' })
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() dto: UpdateFeeStructureDto,
    @Request() req: any,
  ) {
    return await this.feeService.updateFeeStructure(id, dto, req.user.id);
  }

  @Get('structures/:id')
  @ApiOperation({ summary: 'Get fee structure by ID' })
  @ApiResponse({ status: 200, description: 'Fee structure retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Fee structure not found' })
  async getFeeStructure(@Param('id') id: string) {
    return await this.feeService.getFeeStructureById(id);
  }

  @Get('structures')
  @ApiOperation({ summary: 'Get fee structures by school' })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'feeType', required: false })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'gradeLevel', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Fee structures retrieved successfully' })
  async getFeeStructures(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    return await this.feeService.getFeeStructuresBySchool(schoolId, filters);
  }

  @Delete('structures/:id')
  @ApiOperation({ summary: 'Delete a fee structure' })
  @ApiResponse({ status: 200, description: 'Fee structure deleted successfully' })
  @ApiResponse({ status: 404, description: 'Fee structure not found' })
  async deleteFeeStructure(@Param('id') id: string) {
    await this.feeService.deleteFeeStructure(id);
    return { message: 'Fee structure deleted successfully' };
  }

  // Payment Processing
  @Post('payments')
  @AuditCreate('fee_payment', 'id')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(@Body() dto: CreatePaymentDto, @Request() req: any) {
    return await this.feeService.createPayment(dto, req.user.id);
  }

  @Put('payments/:id/process')
  @AuditUpdate('fee_payment', 'id')
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(
    @Param('id') paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Request() req: any,
  ) {
    dto.paymentId = paymentId;
    return await this.feeService.processPayment(dto, req.user.id);
  }

  @Put('payments/:id/refund')
  @AuditCreate('fee_refund', 'id')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() dto: RefundPaymentDto,
    @Request() req: any,
  ) {
    dto.paymentId = paymentId;
    return await this.feeService.refundPayment(dto, req.user.id);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return await this.feeService.getPaymentById(id);
  }

  @Get('students/:studentId/payments')
  @ApiOperation({ summary: 'Get payments by student' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPaymentsByStudent(
    @Param('studentId') studentId: string,
    @Query() filters: any,
  ) {
    return await this.feeService.getPaymentsByStudent(studentId, filters);
  }

  @Get('schools/:schoolId/payments')
  @ApiOperation({ summary: 'Get payments by school' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'paymentMethod', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPaymentsBySchool(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    return await this.feeService.getPaymentsBySchool(schoolId, filters);
  }

  // Fee Calculation and Analytics
  @Get('students/:studentId/calculation')
  @ApiOperation({ summary: 'Calculate student fees' })
  @ApiQuery({ name: 'academicYear', required: true })
  @ApiResponse({ status: 200, description: 'Fee calculation completed successfully' })
  async calculateStudentFees(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return await this.feeService.calculateStudentFees(studentId, academicYear);
  }

  @Get('students/:studentId/outstanding')
  @ApiOperation({ summary: 'Get outstanding fees for student' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiResponse({ status: 200, description: 'Outstanding fees retrieved successfully' })
  async getOutstandingFees(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return await this.feeService.getOutstandingFees(studentId, academicYear);
  }

  @Get('schools/:schoolId/analytics')
  @ApiOperation({ summary: 'Get fee analytics for school' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Fee analytics retrieved successfully' })
  async getFeeAnalytics(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    return await this.feeService.getFeeAnalytics(schoolId, filters);
  }

  // Installment Management
  @Post('installments')
  @ApiOperation({ summary: 'Create installment plan' })
  @ApiResponse({ status: 201, description: 'Installment plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createInstallmentPlan(
    @Body() planData: any,
    @Request() req: any,
  ) {
    const { studentId, feeStructureId, ...planDetails } = planData;
    return await this.feeService.createInstallmentPlan(
      studentId,
      feeStructureId,
      planDetails,
      req.user.id,
    );
  }

  // Dashboard and Reports
  @Get('schools/:schoolId/dashboard')
  @ApiOperation({ summary: 'Get fee management dashboard data' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getFeeDashboard(
    @Query('schoolId') schoolId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const analytics = await this.feeService.getFeeAnalytics(schoolId, { academicYear });

    // Get recent payments
    const recentPayments = await this.feeService.getPaymentsBySchool(schoolId, {
      limit: 10,
      sortBy: 'paymentDate',
      sortOrder: 'desc',
    });

    // Get outstanding fees summary
    const outstandingSummary = await this.getOutstandingSummary(schoolId, academicYear);

    return {
      analytics,
      recentPayments,
      outstandingSummary,
      generatedAt: new Date(),
    };
  }

  @Get('schools/:schoolId/reports/outstanding')
  @ApiOperation({ summary: 'Generate outstanding fees report' })
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  @ApiResponse({ status: 200, description: 'Outstanding fees report generated successfully' })
  async generateOutstandingReport(
    @Query('schoolId') schoolId: string,
    @Query('academicYear') academicYear?: string,
    @Query('format') format: string = 'json',
  ) {
    const reportData = await this.generateOutstandingFeesReport(schoolId, academicYear);

    if (format === 'csv') {
      return this.convertToCSV(reportData);
    }

    return reportData;
  }

  @Get('schools/:schoolId/reports/revenue')
  @ApiOperation({ summary: 'Generate revenue report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  @ApiResponse({ status: 200, description: 'Revenue report generated successfully' })
  async generateRevenueReport(
    @Query('schoolId') schoolId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: string = 'json',
  ) {
    const reportData = await this.generateRevenueReportData(schoolId, startDate, endDate);

    if (format === 'csv') {
      return this.convertToCSV(reportData);
    }

    return reportData;
  }

  // Helper methods
  private async getOutstandingSummary(schoolId: string, academicYear?: string): Promise<any> {
    // This would aggregate outstanding fees across all students
    // Implementation would depend on student service integration
    return {
      totalOutstanding: 0,
      studentCount: 0,
      averageOutstanding: 0,
    };
  }

  private async generateOutstandingFeesReport(schoolId: string, academicYear?: string): Promise<any> {
    // Implementation for generating detailed outstanding fees report
    return {
      schoolId,
      academicYear,
      generatedAt: new Date(),
      data: [],
    };
  }

  private async generateRevenueReportData(schoolId: string, startDate: string, endDate: string): Promise<any> {
    // Implementation for generating revenue report
    return {
      schoolId,
      period: { startDate, endDate },
      generatedAt: new Date(),
      data: [],
    };
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - would need proper implementation
    return 'CSV conversion not implemented yet';
  }
}