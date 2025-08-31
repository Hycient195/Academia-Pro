import { Controller, Get, Post, Param, Query, Body, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ParentPortalFeeService } from '../services/fee.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';
import {
  FeeSummaryResponseDto,
  FeeDetailsResponseDto,
  PaymentHistoryResponseDto,
  PaymentMethodsResponseDto,
  ProcessPaymentDto,
  PaymentResponseDto,
  FeeAlertsResponseDto,
  FeeProjectionsResponseDto,
  FeeSummaryListResponseDto,
  FeeDetailsListResponseDto,
  PaymentHistoryListResponseDto,
} from '../dtos/fee.dto';

@ApiTags('Parent Portal - Fee Management')
@Controller('parent-portal/fee')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalFeeController {
  private readonly logger = new Logger(ParentPortalFeeController.name);

  constructor(
    private readonly feeService: ParentPortalFeeService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get fee summary for all children',
    description: 'Retrieve a comprehensive overview of fees for all children associated with the parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fee summary retrieved successfully',
    type: FeeSummaryListResponseDto,
  })
  async getFeeSummary(@Request() req: any): Promise<FeeSummaryListResponseDto> {
    this.logger.log(`Getting fee summary for parent: ${req.user.userId}`);

    const result = await this.feeService.getFeeSummary(req.user.parentPortalAccessId);

    this.logger.log(`Fee summary retrieved for parent: ${req.user.userId}, children: ${result.summaries.length}`);

    return result;
  }

  @Get('details/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get detailed fee information for a specific student',
    description: 'Retrieve comprehensive fee details including breakdown, due dates, and payment history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get fee details for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Fee details retrieved successfully',
    type: FeeDetailsResponseDto,
  })
  async getFeeDetails(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<FeeDetailsResponseDto> {
    this.logger.log(`Getting fee details for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.getFeeDetails(req.user.parentPortalAccessId, studentId);

    this.logger.log(`Fee details retrieved for student: ${studentId}`);

    return result;
  }

  @Get('payment-history/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get payment history for a specific student',
    description: 'Retrieve complete payment history with receipts and transaction details.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get payment history for',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of payments to retrieve',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
    type: PaymentHistoryListResponseDto,
  })
  async getPaymentHistory(
    @Param('studentId') studentId: string,
    @Query() query: { limit?: number; offset?: number },
    @Request() req: any,
  ): Promise<PaymentHistoryListResponseDto> {
    this.logger.log(`Getting payment history for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.getPaymentHistory(
      req.user.parentPortalAccessId,
      studentId,
      query.limit,
      query.offset,
    );

    this.logger.log(`Payment history retrieved for student: ${studentId}, payments: ${result.payments.length}`);

    return result;
  }

  @Get('payment-methods')
  @ApiOperation({
    summary: 'Get available payment methods',
    description: 'Retrieve all available payment methods and their configurations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
    type: PaymentMethodsResponseDto,
  })
  async getPaymentMethods(@Request() req: any): Promise<PaymentMethodsResponseDto> {
    this.logger.log(`Getting payment methods for parent: ${req.user.userId}`);

    const result = await this.feeService.getPaymentMethods(req.user.parentPortalAccessId);

    this.logger.log(`Payment methods retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Post('process-payment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process a payment',
    description: 'Process a payment for student fees using the specified payment method.',
  })
  @ApiBody({
    type: ProcessPaymentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  async processPayment(
    @Request() req: any,
    @Body() paymentData: ProcessPaymentDto,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`Processing payment for student: ${paymentData.studentId}, amount: ${paymentData.amount}, parent: ${req.user.userId}`);

    const result = await this.feeService.processPayment(
      req.user.parentPortalAccessId,
      paymentData,
    );

    this.logger.log(`Payment processed successfully: ${result.paymentId}`);

    return result;
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get fee alerts and notifications',
    description: 'Retrieve fee-related alerts including due dates, overdue payments, and payment reminders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fee alerts retrieved successfully',
    type: FeeAlertsResponseDto,
  })
  async getFeeAlerts(@Request() req: any): Promise<FeeAlertsResponseDto> {
    this.logger.log(`Getting fee alerts for parent: ${req.user.userId}`);

    const result = await this.feeService.getFeeAlerts(req.user.parentPortalAccessId);

    this.logger.log(`Fee alerts retrieved for parent: ${req.user.userId}, alerts: ${result.alerts.length}`);

    return result;
  }

  @Get('projections/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get fee projections for a student',
    description: 'Calculate projected fees for upcoming periods including discounts and adjustments.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get fee projections for',
    type: 'string',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    description: 'Number of months to project',
    type: 'number',
    minimum: 1,
    maximum: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Fee projections retrieved successfully',
    type: FeeProjectionsResponseDto,
  })
  async getFeeProjections(
    @Param('studentId') studentId: string,
    @Query('months') months: number = 6,
    @Request() req: any,
  ): Promise<FeeProjectionsResponseDto> {
    this.logger.log(`Getting fee projections for student: ${studentId}, months: ${months}, parent: ${req.user.userId}`);

    const result = await this.feeService.getFeeProjections(
      req.user.parentPortalAccessId,
      studentId,
      months,
    );

    this.logger.log(`Fee projections retrieved for student: ${studentId}`);

    return result;
  }

  @Get('receipt/:paymentId')
  @ApiOperation({
    summary: 'Download payment receipt',
    description: 'Download a PDF receipt for a specific payment transaction.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment ID to download receipt for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt download initiated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async downloadReceipt(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ): Promise<{
    downloadUrl: string;
    expiresAt: Date;
  }> {
    this.logger.log(`Downloading receipt for payment: ${paymentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.downloadReceipt(
      req.user.parentPortalAccessId,
      paymentId,
    );

    this.logger.log(`Receipt download initiated for payment: ${paymentId}`);

    return result;
  }

  @Get('installments/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get installment plan options',
    description: 'Retrieve available installment plan options for fee payments.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get installment options for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Installment options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        totalAmount: { type: 'number' },
        installmentPlans: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              planId: { type: 'string' },
              name: { type: 'string' },
              installments: { type: 'number' },
              monthlyAmount: { type: 'number' },
              totalWithInterest: { type: 'number' },
              interestRate: { type: 'number' },
              firstPaymentDate: { type: 'string', format: 'date' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getInstallmentOptions(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<{
    studentId: string;
    totalAmount: number;
    installmentPlans: Array<{
      planId: string;
      name: string;
      installments: number;
      monthlyAmount: number;
      totalWithInterest: number;
      interestRate: number;
      firstPaymentDate: Date;
      description: string;
    }>;
  }> {
    this.logger.log(`Getting installment options for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.getInstallmentOptions(
      req.user.parentPortalAccessId,
      studentId,
    );

    this.logger.log(`Installment options retrieved for student: ${studentId}`);

    return result;
  }

  @Post('installments/:studentId/:planId')
  @UseGuards(ChildAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enroll in installment plan',
    description: 'Enroll a student in a specific installment payment plan.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to enroll in installment plan',
    type: 'string',
  })
  @ApiParam({
    name: 'planId',
    description: 'Installment plan ID to enroll in',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully enrolled in installment plan',
    schema: {
      type: 'object',
      properties: {
        enrollmentId: { type: 'string' },
        planId: { type: 'string' },
        studentId: { type: 'string' },
        status: { type: 'string' },
        firstPaymentDate: { type: 'string', format: 'date' },
        monthlyAmount: { type: 'number' },
        totalInstallments: { type: 'number' },
        enrolledAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async enrollInInstallmentPlan(
    @Param('studentId') studentId: string,
    @Param('planId') planId: string,
    @Request() req: any,
  ): Promise<{
    enrollmentId: string;
    planId: string;
    studentId: string;
    status: string;
    firstPaymentDate: Date;
    monthlyAmount: number;
    totalInstallments: number;
    enrolledAt: Date;
  }> {
    this.logger.log(`Enrolling student: ${studentId} in installment plan: ${planId}, parent: ${req.user.userId}`);

    const result = await this.feeService.enrollInInstallmentPlan(
      req.user.parentPortalAccessId,
      studentId,
      planId,
    );

    this.logger.log(`Student enrolled in installment plan: ${result.enrollmentId}`);

    return result;
  }

  @Get('scholarships/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get available scholarships and financial aid',
    description: 'Retrieve scholarships and financial aid options available for the student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get scholarship options for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Scholarship options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        availableScholarships: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              scholarshipId: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              amount: { type: 'number' },
              coverage: { type: 'string', enum: ['full', 'partial', 'percentage'] },
              eligibilityCriteria: { type: 'array', items: { type: 'string' } },
              applicationDeadline: { type: 'string', format: 'date' },
              status: { type: 'string', enum: ['available', 'applied', 'awarded', 'denied'] },
              appliedDate: { type: 'string', format: 'date' },
            },
            required: ['scholarshipId', 'name', 'description', 'amount', 'coverage', 'eligibilityCriteria', 'status'],
          },
        },
        appliedScholarships: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              applicationId: { type: 'string' },
              scholarshipId: { type: 'string' },
              scholarshipName: { type: 'string' },
              appliedDate: { type: 'string', format: 'date' },
              status: { type: 'string', enum: ['pending', 'under_review', 'approved', 'denied'] },
              decisionDate: { type: 'string', format: 'date' },
              awardedAmount: { type: 'number' },
            },
            required: ['applicationId', 'scholarshipId', 'scholarshipName', 'appliedDate', 'status'],
          },
        },
      },
    },
  })
  async getScholarshipOptions(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<{
    studentId: string;
    availableScholarships: Array<{
      scholarshipId: string;
      name: string;
      description: string;
      amount: number;
      coverage: 'full' | 'partial' | 'percentage';
      eligibilityCriteria: string[];
      applicationDeadline?: Date;
      status: 'available' | 'applied' | 'awarded' | 'denied';
      appliedDate?: Date;
    }>;
    appliedScholarships: Array<{
      applicationId: string;
      scholarshipId: string;
      scholarshipName: string;
      appliedDate: Date;
      status: 'pending' | 'under_review' | 'approved' | 'denied';
      decisionDate?: Date;
      awardedAmount?: number;
    }>;
  }> {
    this.logger.log(`Getting scholarship options for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.getScholarshipOptions(
      req.user.parentPortalAccessId,
      studentId,
    );

    this.logger.log(`Scholarship options retrieved for student: ${studentId}`);

    return result;
  }

  @Post('scholarships/:studentId/:scholarshipId/apply')
  @UseGuards(ChildAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Apply for a scholarship',
    description: 'Submit an application for a specific scholarship on behalf of the student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID applying for scholarship',
    type: 'string',
  })
  @ApiParam({
    name: 'scholarshipId',
    description: 'Scholarship ID to apply for',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        additionalInfo: { type: 'string', description: 'Additional information for the application' },
        supportingDocuments: {
          type: 'array',
          description: 'Supporting document file URLs',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Scholarship application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        scholarshipId: { type: 'string' },
        studentId: { type: 'string' },
        status: { type: 'string' },
        submittedAt: { type: 'string', format: 'date-time' },
        estimatedDecisionDate: { type: 'string', format: 'date' },
      },
    },
  })
  async applyForScholarship(
    @Param('studentId') studentId: string,
    @Param('scholarshipId') scholarshipId: string,
    @Body() applicationData: {
      additionalInfo?: string;
      supportingDocuments?: string[];
    },
    @Request() req: any,
  ): Promise<{
    applicationId: string;
    scholarshipId: string;
    studentId: string;
    status: string;
    submittedAt: Date;
    estimatedDecisionDate: Date;
  }> {
    this.logger.log(`Applying for scholarship: ${scholarshipId} for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.feeService.applyForScholarship(
      req.user.parentPortalAccessId,
      studentId,
      scholarshipId,
      applicationData,
    );

    this.logger.log(`Scholarship application submitted: ${result.applicationId}`);

    return result;
  }
}