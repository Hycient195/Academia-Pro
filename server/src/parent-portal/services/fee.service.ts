import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThan, MoreThan } from 'typeorm';
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { ParentStudentLink, AuthorizationLevel } from '../entities/parent-student-link.entity';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';
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
  PaymentHistoryListResponseDto,
  FeeType,
  FeeStatus,
  PaymentMethod,
  PaymentStatus,
} from '../dtos/fee.dto';

@Injectable()
export class ParentPortalFeeService {
  private readonly logger = new Logger(ParentPortalFeeService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
    @InjectRepository(PortalActivityLog)
    private portalActivityLogRepository: Repository<PortalActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getFeeSummary(parentPortalAccessId: string): Promise<FeeSummaryListResponseDto> {
    try {
      this.logger.log(`Getting fee summary for parent: ${parentPortalAccessId}`);

      // Get all students linked to this parent
      const studentLinks = await this.parentStudentLinkRepository.find({
        where: {
          parentPortalAccessId,
          isActive: true,
        },
      });

      const summaries: FeeSummaryResponseDto[] = [];

      for (const link of studentLinks) {
        const summary = await this.getStudentFeeSummary(link.studentId, `Student ${link.studentId}`);
        summaries.push(summary);
      }

      // Calculate overall summary
      const overallSummary = {
        totalChildren: summaries.length,
        totalOutstanding: summaries.reduce((sum, s) => sum + s.outstandingBalance, 0),
        totalOverdue: summaries.reduce((sum, s) => sum + (s.statusSummary.overdue || 0), 0),
        nextPaymentDate: new Date(Math.min(...summaries.map(s => s.nextDueDate.getTime()))),
        nextPaymentAmount: summaries.reduce((sum, s) => sum + s.nextPaymentAmount, 0),
      };

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_FEES, `Viewed fee summary for ${summaries.length} children`);

      return {
        summaries,
        overallSummary,
      };
    } catch (error) {
      this.logger.error(`Fee summary error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFeeDetails(parentPortalAccessId: string, studentId: string): Promise<FeeDetailsResponseDto> {
    try {
      this.logger.log(`Getting fee details for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get fee details (mock data - would integrate with fee management module)
      const feeDetails = await this.getStudentFeeDetails(studentId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_FEES, `Viewed fee details for student ${studentId}`, studentId);

      return feeDetails;
    } catch (error) {
      this.logger.error(`Fee details error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPaymentHistory(
    parentPortalAccessId: string,
    studentId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaymentHistoryListResponseDto> {
    try {
      this.logger.log(`Getting payment history for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get payment history (mock data - would integrate with payment module)
      const payments = await this.getStudentPaymentHistory(studentId, limit, offset);

      // Calculate summary
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const summary = {
        totalPaid,
        totalPayments: payments.length,
        averagePayment: payments.length > 0 ? totalPaid / payments.length : 0,
        lastPaymentDate: payments.length > 0 ? payments[0].paymentDate : new Date(),
      };

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_FEES, `Viewed payment history for student ${studentId}`, studentId);

      return {
        payments,
        total: payments.length,
        summary,
        page: Math.floor(offset / limit) + 1,
        limit,
      };
    } catch (error) {
      this.logger.error(`Payment history error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPaymentMethods(parentPortalAccessId: string): Promise<PaymentMethodsResponseDto> {
    try {
      this.logger.log(`Getting payment methods for parent: ${parentPortalAccessId}`);

      // Get available payment methods (mock data - would integrate with payment gateway)
      const paymentMethods = [
        {
          method: PaymentMethod.CREDIT_CARD,
          name: 'Credit Card',
          description: 'Visa, Mastercard, American Express',
          isEnabled: true,
          processingFee: 2.9,
          estimatedProcessingTime: 'Instant',
          supportedCurrencies: ['NGN', 'EUR', 'GBP'],
          minimumAmount: 10,
          maximumAmount: 10000,
          requiresSetup: false,
        },
        {
          method: PaymentMethod.BANK_TRANSFER,
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          isEnabled: true,
          estimatedProcessingTime: '1-3 business days',
          supportedCurrencies: ['NGN', 'EUR', 'GBP'],
          minimumAmount: 100,
          requiresSetup: true,
          setupInstructions: 'Provide bank account details',
        },
        {
          method: PaymentMethod.ONLINE_WALLET,
          name: 'Digital Wallet',
          description: 'PayPal, Apple Pay, Google Pay',
          isEnabled: true,
          processingFee: 3.5,
          estimatedProcessingTime: 'Instant',
          supportedCurrencies: ['NGN', 'EUR', 'GBP'],
          minimumAmount: 5,
          requiresSetup: true,
          setupInstructions: 'Link your digital wallet',
        },
      ];

      // Get saved payment methods (mock data)
      const savedPaymentMethods = [
        {
          paymentMethodId: 'pm-001',
          method: PaymentMethod.CREDIT_CARD,
          maskedDetails: '**** **** **** 1234',
          isDefault: true,
          lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          expiryDate: new Date('2026-12-31'),
        },
      ];

      return {
        paymentMethods,
        savedPaymentMethods,
      };
    } catch (error) {
      this.logger.error(`Payment methods error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processPayment(parentPortalAccessId: string, paymentData: ProcessPaymentDto): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Processing payment for student: ${paymentData.studentId}, amount: ${paymentData.amount}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, paymentData.studentId, AuthorizationLevel.FULL);

      // Process payment (mock implementation - would integrate with payment gateway)
      const paymentResult = await this.processPaymentTransaction(paymentData);

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.MAKE_PAYMENT,
        `Processed payment of $${paymentData.amount} for student ${paymentData.studentId}`,
        paymentData.studentId,
      );

      return paymentResult;
    } catch (error) {
      this.logger.error(`Payment processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFeeAlerts(parentPortalAccessId: string): Promise<FeeAlertsResponseDto> {
    try {
      this.logger.log(`Getting fee alerts for parent: ${parentPortalAccessId}`);

      // Get all students linked to this parent
      const studentLinks = await this.parentStudentLinkRepository.find({
        where: {
          parentPortalAccessId,
          isActive: true,
        },
      });

      const alerts = [];
      let criticalAlerts = 0;
      let actionRequired = 0;

      for (const link of studentLinks) {
        const studentAlerts = await this.getStudentFeeAlerts(link.studentId, `Student ${link.studentId}`);
        alerts.push(...studentAlerts);

        criticalAlerts += studentAlerts.filter(a => a.severity === 'critical').length;
        actionRequired += studentAlerts.filter(a => a.actionRequired).length;
      }

      const summary = {
        totalAlerts: alerts.length,
        criticalAlerts,
        actionRequired,
        acknowledgedToday: 0, // Would track actual acknowledgments
      };

      return {
        alerts,
        summary,
      };
    } catch (error) {
      this.logger.error(`Fee alerts error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFeeProjections(
    parentPortalAccessId: string,
    studentId: string,
    months: number = 6,
  ): Promise<FeeProjectionsResponseDto> {
    try {
      this.logger.log(`Getting fee projections for student: ${studentId}, months: ${months}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get fee projections (mock data - would integrate with fee management module)
      const projections = await this.calculateFeeProjections(studentId, months);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_FEES, `Viewed fee projections for student ${studentId}`, studentId);

      return projections;
    } catch (error) {
      this.logger.error(`Fee projections error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async downloadReceipt(parentPortalAccessId: string, paymentId: string): Promise<{
    downloadUrl: string;
    expiresAt: Date;
  }> {
    try {
      this.logger.log(`Downloading receipt for payment: ${paymentId}, parent: ${parentPortalAccessId}`);

      // Verify payment belongs to parent's student
      // This would involve checking payment ownership

      // Generate receipt URL (mock implementation)
      const downloadUrl = `/api/parent-portal/fee/receipts/${paymentId}/download`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_FEES, `Downloaded receipt for payment ${paymentId}`);

      return {
        downloadUrl,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(`Receipt download error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getInstallmentOptions(parentPortalAccessId: string, studentId: string): Promise<{
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
    try {
      this.logger.log(`Getting installment options for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get installment options (mock data)
      const totalAmount = 12000; // Would get from fee management
      const installmentPlans = [
        {
          planId: 'plan-3',
          name: '3-Month Plan',
          installments: 3,
          monthlyAmount: 4000,
          totalWithInterest: 12000,
          interestRate: 0,
          firstPaymentDate: new Date(),
          description: 'Pay in 3 equal monthly installments',
        },
        {
          planId: 'plan-6',
          name: '6-Month Plan',
          installments: 6,
          monthlyAmount: 2000,
          totalWithInterest: 12000,
          interestRate: 0,
          firstPaymentDate: new Date(),
          description: 'Pay in 6 equal monthly installments',
        },
        {
          planId: 'plan-12',
          name: '12-Month Plan',
          installments: 12,
          monthlyAmount: 1000,
          totalWithInterest: 12000,
          interestRate: 0,
          firstPaymentDate: new Date(),
          description: 'Pay in 12 equal monthly installments',
        },
      ];

      return {
        studentId,
        totalAmount,
        installmentPlans,
      };
    } catch (error) {
      this.logger.error(`Installment options error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async enrollInInstallmentPlan(
    parentPortalAccessId: string,
    studentId: string,
    planId: string,
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
    try {
      this.logger.log(`Enrolling student: ${studentId} in installment plan: ${planId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.FULL);

      // Enroll in installment plan (mock implementation)
      const enrollment = {
        enrollmentId: `enrollment-${Date.now()}`,
        planId,
        studentId,
        status: 'active',
        firstPaymentDate: new Date(),
        monthlyAmount: 2000, // Would calculate based on plan
        totalInstallments: 6,
        enrolledAt: new Date(),
      };

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.MAKE_PAYMENT,
        `Enrolled in installment plan ${planId} for student ${studentId}`,
        studentId,
      );

      return enrollment;
    } catch (error) {
      this.logger.error(`Installment enrollment error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getScholarshipOptions(parentPortalAccessId: string, studentId: string): Promise<{
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
    try {
      this.logger.log(`Getting scholarship options for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get scholarship options (mock data)
      const availableScholarships = [
        {
          scholarshipId: 'scholarship-001',
          name: 'Academic Excellence Scholarship',
          description: 'For students with GPA 3.5 or higher',
          amount: 2000,
          coverage: 'partial' as const,
          eligibilityCriteria: ['GPA 3.5+', 'Good conduct record', 'No disciplinary actions'],
          applicationDeadline: new Date('2024-12-31'),
          status: 'available' as const,
        },
        {
          scholarshipId: 'scholarship-002',
          name: 'Need-Based Financial Aid',
          description: 'For students from low-income families',
          amount: 5000,
          coverage: 'partial' as const,
          eligibilityCriteria: ['Family income below threshold', 'Academic standing', 'Community involvement'],
          applicationDeadline: new Date('2024-11-30'),
          status: 'available' as const,
        },
      ];

      const appliedScholarships = [
        {
          applicationId: 'app-001',
          scholarshipId: 'scholarship-001',
          scholarshipName: 'Academic Excellence Scholarship',
          appliedDate: new Date('2024-09-15'),
          status: 'pending' as const,
        },
      ];

      return {
        studentId,
        availableScholarships,
        appliedScholarships,
      };
    } catch (error) {
      this.logger.error(`Scholarship options error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async applyForScholarship(
    parentPortalAccessId: string,
    studentId: string,
    scholarshipId: string,
    applicationData: {
      additionalInfo?: string;
      supportingDocuments?: string[];
    },
  ): Promise<{
    applicationId: string;
    scholarshipId: string;
    studentId: string;
    status: string;
    submittedAt: Date;
    estimatedDecisionDate: Date;
  }> {
    try {
      this.logger.log(`Applying for scholarship: ${scholarshipId} for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.FULL);

      // Submit scholarship application (mock implementation)
      const application = {
        applicationId: `app-${Date.now()}`,
        scholarshipId,
        studentId,
        status: 'pending',
        submittedAt: new Date(),
        estimatedDecisionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      };

      // Log activity
      await this.logActivity(
        parentPortalAccessId,
        PortalActivityType.VIEW_FEES,
        `Applied for scholarship ${scholarshipId} for student ${studentId}`,
        studentId,
      );

      return application;
    } catch (error) {
      this.logger.error(`Scholarship application error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async verifyStudentAccess(
    parentPortalAccessId: string,
    studentId: string,
    requiredLevel: AuthorizationLevel,
  ): Promise<void> {
    const studentLink = await this.parentStudentLinkRepository.findOne({
      where: {
        parentPortalAccessId,
        studentId,
        isActive: true,
      },
    });

    if (!studentLink) {
      throw new NotFoundException('Student not found or access denied');
    }

    if (!studentLink.isAuthorizedFor(requiredLevel)) {
      throw new ForbiddenException(`Insufficient authorization level. Required: ${requiredLevel}`);
    }
  }

  private async getStudentFeeSummary(studentId: string, studentName: string): Promise<FeeSummaryResponseDto> {
    // Mock data - would integrate with fee management module
    return {
      studentId,
      studentName,
      academicYear: '2024-2025',
      totalFees: 12000,
      totalPaid: 8000,
      outstandingBalance: 4000,
      nextDueDate: new Date('2024-02-01'),
      nextPaymentAmount: 1500,
      statusSummary: {
        paid: 8000,
        pending: 2000,
        overdue: 2000,
        waived: 0,
      },
      recentPayments: [
        {
          paymentId: 'payment-001',
          amount: 1500,
          date: new Date('2024-01-15'),
          status: PaymentStatus.COMPLETED,
        },
        {
          paymentId: 'payment-002',
          amount: 1500,
          date: new Date('2024-12-15'),
          status: PaymentStatus.COMPLETED,
        },
      ],
    };
  }

  private async getStudentFeeDetails(studentId: string): Promise<FeeDetailsResponseDto> {
    // Mock data - would integrate with fee management module
    return {
      studentId,
      studentName: 'John Doe',
      academicYear: '2024-2025',
      feeBreakdown: [
        {
          feeId: 'fee-001',
          type: FeeType.TUITION,
          description: 'Monthly Tuition',
          amount: 1500,
          dueDate: new Date('2024-02-01'),
          status: FeeStatus.PENDING,
          paidAmount: 0,
          outstandingAmount: 1500,
        },
        {
          feeId: 'fee-002',
          type: FeeType.BOOKS,
          description: 'Textbook Fees',
          amount: 300,
          dueDate: new Date('2024-01-15'),
          status: FeeStatus.OVERDUE,
          paidAmount: 0,
          outstandingAmount: 300,
        },
      ],
      monthlySchedule: [
        {
          month: 'January 2024',
          totalAmount: 1500,
          paidAmount: 1500,
          dueDate: new Date('2024-01-01'),
          status: FeeStatus.PAID,
        },
        {
          month: 'February 2024',
          totalAmount: 1500,
          paidAmount: 0,
          dueDate: new Date('2024-02-01'),
          status: FeeStatus.PENDING,
        },
      ],
      summary: {
        totalFees: 12000,
        totalPaid: 8000,
        outstandingBalance: 4000,
        overdueAmount: 300,
        nextPayment: {
          amount: 1500,
          dueDate: new Date('2024-02-01'),
        },
      },
      discounts: [
        {
          discountId: 'discount-001',
          type: 'Sibling Discount',
          description: '10% discount for second child',
          amount: 1200,
          appliedDate: new Date('2024-08-01'),
        },
      ],
    };
  }

  private async getStudentPaymentHistory(
    studentId: string,
    limit: number,
    offset: number,
  ): Promise<PaymentHistoryResponseDto[]> {
    // Mock data - would integrate with payment module
    return [
      {
        paymentId: 'payment-001',
        amount: 1500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date('2024-01-15'),
        transactionReference: 'TXN-2024-001',
        description: 'January Tuition',
        receiptUrl: '/receipts/payment-001.pdf',
        feeAllocations: [
          {
            feeId: 'fee-001',
            feeType: FeeType.TUITION,
            amount: 1500,
          },
        ],
      },
      {
        paymentId: 'payment-002',
        amount: 300,
        paymentMethod: PaymentMethod.ONLINE_WALLET,
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date('2024-01-10'),
        transactionReference: 'TXN-2024-002',
        description: 'Book Fees',
        receiptUrl: '/receipts/payment-002.pdf',
        feeAllocations: [
          {
            feeId: 'fee-002',
            feeType: FeeType.BOOKS,
            amount: 300,
          },
        ],
      },
    ];
  }

  private async processPaymentTransaction(paymentData: ProcessPaymentDto): Promise<PaymentResponseDto> {
    // Mock payment processing - would integrate with payment gateway
    const paymentId = `payment-${Date.now()}`;
    const transactionReference = `TXN-${Date.now()}`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      paymentId,
      status: PaymentStatus.COMPLETED,
      amount: paymentData.amount,
      transactionReference,
      paymentDate: new Date(),
      receiptUrl: `/receipts/${paymentId}.pdf`,
      message: 'Payment processed successfully',
    };
  }

  private async getStudentFeeAlerts(studentId: string, studentName: string): Promise<Array<{
    alertId: string;
    type: 'due_soon' | 'overdue' | 'payment_failed' | 'discount_available' | 'installment_due';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    studentId: string;
    studentName: string;
    amount?: number;
    dueDate?: Date;
    actionRequired: boolean;
    actionUrl?: string;
    createdAt: Date;
    acknowledgedAt?: Date;
  }>> {
    // Mock data - would integrate with fee management module
    return [
      {
        alertId: 'alert-001',
        type: 'due_soon' as const,
        severity: 'medium' as const,
        title: 'Payment Due Soon',
        message: 'February tuition payment of $1,500 is due in 3 days',
        studentId,
        studentName,
        amount: 1500,
        dueDate: new Date('2024-02-01'),
        actionRequired: true,
        actionUrl: '/fee/pay',
        createdAt: new Date(),
      },
      {
        alertId: 'alert-002',
        type: 'overdue' as const,
        severity: 'high' as const,
        title: 'Overdue Payment',
        message: 'Book fees of $300 are 5 days overdue',
        studentId,
        studentName,
        amount: 300,
        dueDate: new Date('2024-01-15'),
        actionRequired: true,
        actionUrl: '/fee/pay',
        createdAt: new Date(),
      },
    ];
  }

  private async calculateFeeProjections(studentId: string, months: number): Promise<FeeProjectionsResponseDto> {
    // Mock data - would integrate with fee management module
    const projectedPayments = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(currentDate.getMonth() + i);

      projectedPayments.push({
        month: paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        projectedDate: paymentDate,
        amount: 1500,
        description: `Monthly tuition for ${paymentDate.toLocaleDateString('en-US', { month: 'long' })}`,
        isEstimated: i > 0,
        confidence: i === 0 ? 'high' as const : 'medium' as const,
      });
    }

    return {
      studentId,
      projectionPeriod: months,
      currentBalance: 4000,
      projectedPayments,
      availableDiscounts: [
        {
          discountId: 'discount-001',
          name: 'Early Payment Discount',
          description: '5% discount for payments made 15+ days early',
          amount: 75,
          type: 'percentage' as const,
          eligibilityCriteria: ['Payment made 15+ days before due date'],
          autoApplied: false,
        },
      ],
      summary: {
        totalProjectedPayments: projectedPayments.reduce((sum, p) => sum + p.amount, 0),
        totalAvailableDiscounts: 75,
        netProjectedAmount: projectedPayments.reduce((sum, p) => sum + p.amount, 0) - 75,
        monthlyAverage: 1500,
        recommendedSavings: 75,
      },
      recommendations: [
        {
          type: 'early_payment' as const,
          title: 'Pay Early for Discount',
          description: 'Save $75 by paying February tuition early',
          potentialSavings: 75,
          actionUrl: '/fee/pay',
          priority: 'high' as const,
        },
      ],
    };
  }

  private async logActivity(
    parentPortalAccessId: string,
    activityType: PortalActivityType,
    description: string,
    studentId?: string,
  ): Promise<void> {
    try {
      await this.portalActivityLogRepository.save({
        parentPortalAccessId,
        studentId,
        activityType,
        description,
        action: activityType.replace('_', ' '),
        ipAddress: 'system', // Would get from request context
        success: true,
      });
    } catch (error) {
      this.logger.error('Failed to log activity', error);
    }
  }
}