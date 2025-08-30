// Academia Pro - Student Portal Fee Controller
// Handles student fee information, payment status, and financial records

import { Controller, Get, Post, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';

@ApiTags('Student Portal - Fees')
@Controller('student-portal/fees')
@UseGuards(StudentPortalGuard)
export class StudentPortalFeeController {
  private readonly logger = new Logger(StudentPortalFeeController.name);

  constructor() {
    // Services will be injected here
  }

  @Get(':studentId/summary')
  @ApiOperation({
    summary: 'Get fee summary',
    description: 'Get comprehensive fee summary for the student',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Fee summary retrieved successfully',
  })
  async getFeeSummary(@Param('studentId') studentId: string) {
    this.logger.log(`Getting fee summary for student: ${studentId}`);

    return {
      studentId,
      academicYear: '2024-2025',
      totalFees: 250000, // Total annual fees
      paidAmount: 180000,
      outstandingAmount: 70000,
      overdueAmount: 15000,
      nextDueDate: '2024-02-15',
      paymentStatus: 'partial',
      lastPayment: {
        amount: 50000,
        date: '2024-01-10',
        method: 'online',
        reference: 'PAY_20240110_001',
      },
      breakdown: {
        tuition: {
          total: 150000,
          paid: 120000,
          outstanding: 30000,
          dueDate: '2024-02-15',
        },
        transportation: {
          total: 30000,
          paid: 20000,
          outstanding: 10000,
          dueDate: '2024-02-01',
        },
        hostel: {
          total: 40000,
          paid: 25000,
          outstanding: 15000,
          dueDate: '2024-01-31',
        },
        examination: {
          total: 15000,
          paid: 10000,
          outstanding: 5000,
          dueDate: '2024-03-01',
        },
        library: {
          total: 5000,
          paid: 3000,
          outstanding: 2000,
          dueDate: '2024-02-28',
        },
        activity: {
          total: 10000,
          paid: 5000,
          outstanding: 5000,
          dueDate: '2024-02-20',
        },
      },
      scholarships: [
        {
          id: 'scholarship-1',
          name: 'Merit Scholarship',
          amount: 25000,
          awardedDate: '2024-01-01',
          status: 'active',
          description: 'Academic excellence award',
        },
      ],
      discounts: [
        {
          id: 'discount-1',
          name: 'Early Payment Discount',
          amount: 5000,
          appliedDate: '2024-01-05',
          type: 'percentage',
          description: '5% discount for early payment',
        },
      ],
      paymentPlan: {
        type: 'quarterly',
        installments: [
          {
            installmentNumber: 1,
            amount: 62500,
            dueDate: '2024-01-15',
            status: 'paid',
            paidDate: '2024-01-10',
          },
          {
            installmentNumber: 2,
            amount: 62500,
            dueDate: '2024-04-15',
            status: 'pending',
          },
          {
            installmentNumber: 3,
            amount: 62500,
            dueDate: '2024-07-15',
            status: 'pending',
          },
          {
            installmentNumber: 4,
            amount: 62500,
            dueDate: '2024-10-15',
            status: 'pending',
          },
        ],
      },
    };
  }

  @Get(':studentId/payment-history')
  @ApiOperation({
    summary: 'Get payment history',
    description: 'Get complete payment history for the student',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getPaymentHistory(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    this.logger.log(`Getting payment history for student: ${studentId}`);

    return {
      studentId,
      totalPayments: 8,
      totalAmount: 180000,
      payments: [
        {
          id: 'payment-1',
          amount: 50000,
          date: '2024-01-10',
          method: 'online',
          reference: 'PAY_20240110_001',
          status: 'completed',
          description: 'Q1 Tuition Fee Payment',
          breakdown: {
            tuition: 37500,
            transportation: 7500,
            hostel: 5000,
          },
          receipt: {
            number: 'REC_20240110_001',
            downloadUrl: '/receipts/REC_20240110_001.pdf',
          },
        },
        {
          id: 'payment-2',
          amount: 30000,
          date: '2023-12-15',
          method: 'bank_transfer',
          reference: 'BT_20231215_001',
          status: 'completed',
          description: 'Hostel Fee Payment',
          breakdown: {
            hostel: 30000,
          },
          receipt: {
            number: 'REC_20231215_001',
            downloadUrl: '/receipts/REC_20231215_001.pdf',
          },
        },
        {
          id: 'payment-3',
          amount: 25000,
          date: '2023-11-20',
          method: 'cash',
          reference: 'CASH_20231120_001',
          status: 'completed',
          description: 'Transportation Fee Payment',
          breakdown: {
            transportation: 25000,
          },
          receipt: {
            number: 'REC_20231120_001',
            downloadUrl: '/receipts/REC_20231120_001.pdf',
          },
        },
        {
          id: 'payment-4',
          amount: 20000,
          date: '2023-10-25',
          method: 'cheque',
          reference: 'CHQ_20231025_001',
          status: 'completed',
          description: 'Library & Activity Fees',
          breakdown: {
            library: 5000,
            activity: 15000,
          },
          receipt: {
            number: 'REC_20231025_001',
            downloadUrl: '/receipts/REC_20231025_001.pdf',
          },
        },
        {
          id: 'payment-5',
          amount: 15000,
          date: '2023-09-30',
          method: 'online',
          reference: 'PAY_20230930_001',
          status: 'completed',
          description: 'Examination Fee Payment',
          breakdown: {
            examination: 15000,
          },
          receipt: {
            number: 'REC_20230930_001',
            downloadUrl: '/receipts/REC_20230930_001.pdf',
          },
        },
      ],
      statistics: {
        totalPaid: 180000,
        averagePayment: 22500,
        paymentMethods: {
          online: 2,
          bank_transfer: 1,
          cash: 1,
          cheque: 1,
        },
        monthlyAverage: 20000,
      },
    };
  }

  @Post(':studentId/pay')
  @ApiOperation({
    summary: 'Make fee payment',
    description: 'Process online fee payment for the student',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiBody({
    description: 'Payment data',
    schema: {
      type: 'object',
      required: ['amount', 'paymentMethod'],
      properties: {
        amount: { type: 'number', description: 'Payment amount' },
        paymentMethod: {
          type: 'string',
          enum: ['online', 'bank_transfer', 'cash', 'cheque'],
          description: 'Payment method',
        },
        breakdown: {
          type: 'object',
          description: 'Fee breakdown for payment',
          properties: {
            tuition: { type: 'number' },
            transportation: { type: 'number' },
            hostel: { type: 'number' },
            examination: { type: 'number' },
            library: { type: 'number' },
            activity: { type: 'number' },
          },
        },
        notes: { type: 'string', description: 'Payment notes' },
        installmentNumber: { type: 'number', description: 'Installment number if applicable' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
  })
  async makePayment(
    @Param('studentId') studentId: string,
    @Body() paymentData: any,
  ) {
    this.logger.log(`Processing payment for student ${studentId}: ${paymentData.amount}`);

    return {
      paymentId: 'PAY_' + Date.now(),
      studentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      status: 'processing',
      initiatedAt: new Date(),
      estimatedCompletion: '5-10 minutes',
      breakdown: paymentData.breakdown,
      paymentUrl: paymentData.paymentMethod === 'online' ? 'https://payment.example.com/pay/PAY_123456' : null,
      message: 'Payment initiated successfully. You will receive a confirmation once processed.',
    };
  }

  @Get(':studentId/receipts')
  @ApiOperation({
    summary: 'Get payment receipts',
    description: 'Get list of payment receipts for download',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of receipts to return' })
  @ApiResponse({
    status: 200,
    description: 'Payment receipts retrieved successfully',
  })
  async getReceipts(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Getting receipts for student: ${studentId}`);

    return {
      studentId,
      totalReceipts: 8,
      receipts: [
        {
          id: 'receipt-1',
          paymentId: 'PAY_20240110_001',
          receiptNumber: 'REC_20240110_001',
          amount: 50000,
          paymentDate: '2024-01-10',
          generatedDate: '2024-01-10',
          downloadUrl: '/receipts/REC_20240110_001.pdf',
          emailSent: true,
          emailDate: '2024-01-10',
        },
        {
          id: 'receipt-2',
          paymentId: 'BT_20231215_001',
          receiptNumber: 'REC_20231215_001',
          amount: 30000,
          paymentDate: '2023-12-15',
          generatedDate: '2023-12-15',
          downloadUrl: '/receipts/REC_20231215_001.pdf',
          emailSent: true,
          emailDate: '2023-12-15',
        },
        {
          id: 'receipt-3',
          paymentId: 'CASH_20231120_001',
          receiptNumber: 'REC_20231120_001',
          amount: 25000,
          paymentDate: '2023-11-20',
          generatedDate: '2023-11-20',
          downloadUrl: '/receipts/REC_20231120_001.pdf',
          emailSent: false,
          emailDate: null,
        },
      ],
    };
  }

  @Get(':studentId/outstanding')
  @ApiOperation({
    summary: 'Get outstanding fees',
    description: 'Get detailed breakdown of outstanding fees',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Outstanding fees retrieved successfully',
  })
  async getOutstandingFees(@Param('studentId') studentId: string) {
    this.logger.log(`Getting outstanding fees for student: ${studentId}`);

    return {
      studentId,
      totalOutstanding: 70000,
      overdueAmount: 15000,
      breakdown: [
        {
          feeType: 'tuition',
          description: 'Q2 Tuition Fee',
          amount: 30000,
          dueDate: '2024-02-15',
          daysOverdue: 0,
          priority: 'high',
          installmentNumber: 2,
        },
        {
          feeType: 'transportation',
          description: 'Q1 Transportation Fee',
          amount: 10000,
          dueDate: '2024-02-01',
          daysOverdue: 0,
          priority: 'medium',
          installmentNumber: 1,
        },
        {
          feeType: 'hostel',
          description: 'Q1 Hostel Fee',
          amount: 15000,
          dueDate: '2024-01-31',
          daysOverdue: 2,
          priority: 'high',
          lateFee: 750, // 5% late fee
        },
        {
          feeType: 'examination',
          description: 'Final Exam Fee',
          amount: 5000,
          dueDate: '2024-03-01',
          daysOverdue: 0,
          priority: 'medium',
        },
        {
          feeType: 'library',
          description: 'Library Membership Fee',
          amount: 2000,
          dueDate: '2024-02-28',
          daysOverdue: 0,
          priority: 'low',
        },
        {
          feeType: 'activity',
          description: 'Sports Club Fee',
          amount: 5000,
          dueDate: '2024-02-20',
          daysOverdue: 0,
          priority: 'low',
        },
      ],
      paymentReminders: [
        {
          id: 'reminder-1',
          feeType: 'hostel',
          amount: 15000,
          dueDate: '2024-01-31',
          sentDate: '2024-01-25',
          status: 'sent',
        },
        {
          id: 'reminder-2',
          feeType: 'tuition',
          amount: 30000,
          dueDate: '2024-02-15',
          sentDate: '2024-02-01',
          status: 'pending',
        },
      ],
      suggestedPaymentPlan: {
        totalAmount: 70000,
        suggestedInstallments: 3,
        installmentAmount: 23333,
        firstInstallmentDate: '2024-02-01',
        frequency: 'monthly',
      },
    };
  }

  @Post(':studentId/payment-plan')
  @ApiOperation({
    summary: 'Create payment plan',
    description: 'Create a customized payment plan for outstanding fees',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiBody({
    description: 'Payment plan data',
    schema: {
      type: 'object',
      required: ['totalAmount', 'installments', 'frequency'],
      properties: {
        totalAmount: { type: 'number', description: 'Total amount to be paid' },
        installments: { type: 'number', description: 'Number of installments' },
        frequency: {
          type: 'string',
          enum: ['weekly', 'monthly', 'quarterly'],
          description: 'Payment frequency',
        },
        startDate: { type: 'string', format: 'date', description: 'Plan start date' },
        notes: { type: 'string', description: 'Additional notes' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment plan created successfully',
  })
  async createPaymentPlan(
    @Param('studentId') studentId: string,
    @Body() planData: any,
  ) {
    this.logger.log(`Creating payment plan for student ${studentId}`);

    const installmentAmount = Math.ceil(planData.totalAmount / planData.installments);

    return {
      planId: 'PLAN_' + Date.now(),
      studentId,
      totalAmount: planData.totalAmount,
      installments: planData.installments,
      installmentAmount,
      frequency: planData.frequency,
      startDate: planData.startDate,
      status: 'active',
      createdAt: new Date(),
      installmentSchedule: Array.from({ length: planData.installments }, (_, i) => ({
        installmentNumber: i + 1,
        amount: installmentAmount,
        dueDate: new Date(new Date(planData.startDate).setMonth(
          new Date(planData.startDate).getMonth() + i
        )),
        status: i === 0 ? 'pending' : 'scheduled',
      })),
      message: 'Payment plan created successfully',
    };
  }

  @Get(':studentId/scholarships')
  @ApiOperation({
    summary: 'Get scholarships and discounts',
    description: 'Get information about available scholarships and applied discounts',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Scholarships and discounts retrieved successfully',
  })
  async getScholarships(@Param('studentId') studentId: string) {
    this.logger.log(`Getting scholarships for student: ${studentId}`);

    return {
      studentId,
      activeScholarships: [
        {
          id: 'scholarship-1',
          name: 'Merit Scholarship',
          type: 'merit_based',
          amount: 25000,
          awardedDate: '2024-01-01',
          validUntil: '2024-12-31',
          criteria: 'Academic excellence (GPA > 3.8)',
          renewalRequired: true,
          description: 'Annual scholarship for outstanding academic performance',
        },
        {
          id: 'scholarship-2',
          name: 'Sports Excellence Award',
          type: 'sports_based',
          amount: 15000,
          awardedDate: '2024-01-15',
          validUntil: '2024-12-31',
          criteria: 'Active participation in school sports teams',
          renewalRequired: true,
          description: 'Scholarship for athletic excellence and team contribution',
        },
      ],
      appliedDiscounts: [
        {
          id: 'discount-1',
          name: 'Early Payment Discount',
          type: 'early_payment',
          amount: 5000,
          appliedDate: '2024-01-05',
          discountType: 'percentage',
          discountValue: 5,
          description: '5% discount for payments made before due date',
        },
        {
          id: 'discount-2',
          name: 'Sibling Discount',
          type: 'sibling',
          amount: 10000,
          appliedDate: '2024-01-01',
          discountType: 'fixed',
          discountValue: 10000,
          description: 'Fixed discount for having siblings in the same school',
        },
      ],
      availableScholarships: [
        {
          id: 'available-1',
          name: 'Need-Based Financial Aid',
          type: 'need_based',
          estimatedAmount: 30000,
          applicationDeadline: '2024-03-01',
          requirements: ['Family income certificate', 'Academic transcripts'],
          description: 'Financial assistance based on family income',
        },
        {
          id: 'available-2',
          name: 'Arts & Culture Scholarship',
          type: 'special_talent',
          estimatedAmount: 20000,
          applicationDeadline: '2024-02-28',
          requirements: ['Portfolio submission', 'Recommendation letters'],
          description: 'Scholarship for students with exceptional talent in arts',
        },
      ],
      statistics: {
        totalScholarshipAmount: 40000,
        totalDiscountAmount: 15000,
        netSavings: 55000,
        savingsPercentage: 22, // 22% of total fees
      },
    };
  }

  @Post(':studentId/scholarship/:scholarshipId/apply')
  @ApiOperation({
    summary: 'Apply for scholarship',
    description: 'Submit application for available scholarship',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiParam({ name: 'scholarshipId', description: 'Scholarship identifier' })
  @ApiBody({
    description: 'Application data',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of uploaded document IDs',
        },
        statement: { type: 'string', description: 'Personal statement' },
        references: {
          type: 'array',
          items: { type: 'object' },
          description: 'Reference contact information',
        },
        additionalInfo: { type: 'string', description: 'Additional information' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Scholarship application submitted successfully',
  })
  async applyForScholarship(
    @Param('studentId') studentId: string,
    @Param('scholarshipId') scholarshipId: string,
    @Body() applicationData: any,
  ) {
    this.logger.log(`Scholarship application submitted by student ${studentId} for ${scholarshipId}`);

    return {
      applicationId: 'APP_' + Date.now(),
      studentId,
      scholarshipId,
      status: 'submitted',
      submittedAt: new Date(),
      reviewDeadline: '2024-03-15',
      documents: applicationData.documents,
      message: 'Scholarship application submitted successfully. You will be notified of the decision within 2 weeks.',
    };
  }
}