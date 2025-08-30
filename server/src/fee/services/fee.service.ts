// Academia Pro - Fee Service
// Comprehensive business logic for fee management system

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FeeStructure, FeeStatus } from '../entities/fee-structure.entity';
import { FeePayment, PaymentStatus, PaymentType } from '../entities/fee-payment.entity';
import { FeeDiscount, DiscountStatus } from '../entities/fee-discount.entity';
import { InstallmentPlan, InstallmentSchedule } from '../entities/installment-plan.entity';
import { CreateFeeStructureDto, UpdateFeeStructureDto } from '../dtos/create-fee-structure.dto';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from '../dtos/create-payment.dto';

@Injectable()
export class FeeService {
  constructor(
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepository: Repository<FeeStructure>,

    @InjectRepository(FeePayment)
    private readonly feePaymentRepository: Repository<FeePayment>,

    @InjectRepository(FeeDiscount)
    private readonly feeDiscountRepository: Repository<FeeDiscount>,

    @InjectRepository(InstallmentPlan)
    private readonly installmentPlanRepository: Repository<InstallmentPlan>,

    @InjectRepository(InstallmentSchedule)
    private readonly installmentScheduleRepository: Repository<InstallmentSchedule>,

    private readonly dataSource: DataSource,
  ) {}

  // Fee Structure Management
  async createFeeStructure(dto: CreateFeeStructureDto, createdBy: string): Promise<FeeStructure> {
    const feeStructure = this.feeStructureRepository.create({
      ...dto,
      createdBy,
      createdByName: createdBy, // This should be fetched from user service
      updatedBy: createdBy,
      updatedByName: createdBy,
    });

    return await this.feeStructureRepository.save(feeStructure);
  }

  async updateFeeStructure(id: string, dto: UpdateFeeStructureDto, updatedBy: string): Promise<FeeStructure> {
    const feeStructure = await this.feeStructureRepository.findOne({ where: { id } });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    Object.assign(feeStructure, {
      ...dto,
      updatedBy,
      updatedByName: updatedBy,
    });

    return await this.feeStructureRepository.save(feeStructure);
  }

  async getFeeStructureById(id: string): Promise<FeeStructure> {
    const feeStructure = await this.feeStructureRepository.findOne({ where: { id } });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }
    return feeStructure;
  }

  async getFeeStructuresBySchool(schoolId: string, filters?: any): Promise<FeeStructure[]> {
    const query = this.feeStructureRepository.createQueryBuilder('fs')
      .where('fs.schoolId = :schoolId', { schoolId });

    if (filters?.feeType) {
      query.andWhere('fs.feeType = :feeType', { feeType: filters.feeType });
    }

    if (filters?.academicYear) {
      query.andWhere('fs.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.gradeLevel) {
      query.andWhere('fs.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.status) {
      query.andWhere('fs.status = :status', { status: filters.status });
    }

    return await query.orderBy('fs.priorityOrder', 'ASC').getMany();
  }

  async deleteFeeStructure(id: string): Promise<void> {
    const result = await this.feeStructureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Fee structure not found');
    }
  }

  // Payment Processing
  async createPayment(dto: CreatePaymentDto, createdBy: string): Promise<FeePayment> {
    // Generate unique transaction ID and receipt number
    const transactionId = await this.generateTransactionId();
    const receiptNumber = await this.generateReceiptNumber(dto.schoolId);

    const payment = this.feePaymentRepository.create({
      ...dto,
      transactionId,
      receiptNumber,
      createdBy,
      createdByName: createdBy,
      updatedBy: createdBy,
      updatedByName: createdBy,
    });

    return await this.feePaymentRepository.save(payment);
  }

  async processPayment(dto: ProcessPaymentDto, processedBy: string): Promise<FeePayment> {
    const payment = await this.feePaymentRepository.findOne({ where: { id: dto.paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    payment.paymentStatus = PaymentStatus.COMPLETED;
    payment.processedDate = new Date();
    payment.verifiedBy = processedBy;
    payment.verifiedByName = processedBy;
    payment.verificationDate = new Date();

    if (dto.gatewayTransactionId) {
      payment.gatewayTransactionId = dto.gatewayTransactionId;
    }

    if (dto.gatewayName) {
      payment.gatewayName = dto.gatewayName;
    }

    if (dto.gatewayResponse) {
      payment.gatewayResponse = dto.gatewayResponse;
    }

    return await this.feePaymentRepository.save(payment);
  }

  async refundPayment(dto: RefundPaymentDto, processedBy: string): Promise<FeePayment> {
    const originalPayment = await this.feePaymentRepository.findOne({ where: { id: dto.paymentId } });
    if (!originalPayment) {
      throw new NotFoundException('Original payment not found');
    }

    if (originalPayment.amountPaid < dto.refundAmount) {
      throw new BadRequestException('Refund amount cannot exceed original payment amount');
    }

    // Create refund payment record
    const refundPayment = this.feePaymentRepository.create({
      schoolId: originalPayment.schoolId,
      studentId: originalPayment.studentId,
      feeStructureId: originalPayment.feeStructureId,
      transactionId: await this.generateTransactionId(),
      receiptNumber: await this.generateReceiptNumber(originalPayment.schoolId),
      paymentMethod: originalPayment.paymentMethod,
      paymentType: PaymentType.REFUND,
      amountPaid: -dto.refundAmount, // Negative amount for refund
      currency: originalPayment.currency,
      totalAmount: -dto.refundAmount,
      paymentDate: dto.refundProcessingDate ? new Date(dto.refundProcessingDate) : new Date(),
      dueDate: originalPayment.dueDate,
      paymentStatus: PaymentStatus.COMPLETED,
      isRefund: true,
      originalPaymentId: originalPayment.id,
      refundReason: dto.refundReason,
      refundProcessedDate: dto.refundProcessingDate ? new Date(dto.refundProcessingDate) : new Date(),
      createdBy: processedBy,
      createdByName: processedBy,
      updatedBy: processedBy,
      updatedByName: processedBy,
    });

    const savedRefund = await this.feePaymentRepository.save(refundPayment);
    return savedRefund;
  }

  async getPaymentById(id: string): Promise<FeePayment> {
    const payment = await this.feePaymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async getPaymentsByStudent(studentId: string, filters?: any): Promise<FeePayment[]> {
    const query = this.feePaymentRepository.createQueryBuilder('fp')
      .where('fp.studentId = :studentId', { studentId });

    if (filters?.academicYear) {
      query.andWhere('fp.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.paymentStatus) {
      query.andWhere('fp.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('fp.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return await query.orderBy('fp.paymentDate', 'DESC').getMany();
  }

  async getPaymentsBySchool(schoolId: string, filters?: any): Promise<FeePayment[]> {
    const query = this.feePaymentRepository.createQueryBuilder('fp')
      .where('fp.schoolId = :schoolId', { schoolId });

    if (filters?.academicYear) {
      query.andWhere('fp.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.paymentStatus) {
      query.andWhere('fp.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }

    if (filters?.paymentMethod) {
      query.andWhere('fp.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('fp.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return await query.orderBy('fp.paymentDate', 'DESC').getMany();
  }

  // Fee Calculation and Analytics
  async calculateStudentFees(studentId: string, academicYear: string): Promise<any> {
    const feeStructures = await this.feeStructureRepository.find({
      where: {
        schoolId: (await this.getStudentSchoolId(studentId)),
        academicYear,
        status: FeeStatus.ACTIVE,
      },
    });

    const payments = await this.feePaymentRepository.find({
      where: { studentId, academicYear },
    });

    const discounts = await this.feeDiscountRepository.find({
      where: { studentId, academicYear, status: DiscountStatus.ACTIVE },
    });

    return this.calculateFeeSummary(feeStructures, payments, discounts);
  }

  async getOutstandingFees(studentId: string, academicYear?: string): Promise<any> {
    const query = this.feePaymentRepository.createQueryBuilder('fp')
      .where('fp.studentId = :studentId', { studentId })
      .andWhere('fp.paymentStatus IN (:...statuses)', { statuses: ['pending', 'overdue'] });

    if (academicYear) {
      query.andWhere('fp.academicYear = :academicYear', { academicYear });
    }

    const outstandingPayments = await query.getMany();

    return {
      totalOutstanding: outstandingPayments.reduce((sum, payment) => sum + payment.totalAmount, 0),
      payments: outstandingPayments,
      count: outstandingPayments.length,
    };
  }

  async getFeeAnalytics(schoolId: string, filters?: any): Promise<any> {
    const query = this.feePaymentRepository.createQueryBuilder('fp')
      .where('fp.schoolId = :schoolId', { schoolId });

    if (filters?.academicYear) {
      query.andWhere('fp.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('fp.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const payments = await query.getMany();

    return {
      totalRevenue: payments
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amountPaid, 0),
      totalOutstanding: payments
        .filter(p => ['pending', 'overdue'].includes(p.paymentStatus))
        .reduce((sum, p) => sum + p.totalAmount, 0),
      paymentMethods: this.groupByPaymentMethod(payments),
      monthlyTrends: this.calculateMonthlyTrends(payments),
      paymentStatus: this.groupByPaymentStatus(payments),
    };
  }

  // Installment Management
  async createInstallmentPlan(studentId: string, feeStructureId: string, planData: any, createdBy: string): Promise<InstallmentPlan> {
    const feeStructure = await this.getFeeStructureById(feeStructureId);
    if (!feeStructure.allowInstallments) {
      throw new BadRequestException('Installments are not allowed for this fee structure');
    }

    const totalAmount = feeStructure.baseAmount + (feeStructure.baseAmount * feeStructure.taxPercentage / 100);
    const installmentAmount = totalAmount / planData.totalInstallments;

    const installmentPlan = this.installmentPlanRepository.create({
      schoolId: feeStructure.schoolId,
      studentId,
      feeStructureId,
      planName: planData.planName,
      planDescription: planData.planDescription,
      totalAmount,
      installmentAmount,
      totalInstallments: planData.totalInstallments,
      startDate: new Date(planData.startDate),
      endDate: new Date(planData.endDate),
      firstInstallmentDate: new Date(planData.firstInstallmentDate),
      createdBy,
      createdByName: createdBy,
      updatedBy: createdBy,
      updatedByName: createdBy,
    });

    const savedPlan = await this.installmentPlanRepository.save(installmentPlan);

    // Create installment schedule
    await this.createInstallmentSchedule(savedPlan);

    return savedPlan;
  }

  // Helper Methods
  private async generateTransactionId(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  private async generateReceiptNumber(schoolId: string): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.feePaymentRepository.count({
      where: {
        schoolId,
        paymentDate: MoreThanOrEqual(new Date(today + 'T00:00:00Z')),
      },
    });
    return `RCP${today}${(count + 1).toString().padStart(4, '0')}`;
  }

  private async getStudentSchoolId(studentId: string): Promise<string> {
    // This should be implemented to get school ID from student service
    // For now, returning a placeholder
    return 'school-placeholder';
  }

  private calculateFeeSummary(feeStructures: FeeStructure[], payments: FeePayment[], discounts: FeeDiscount[]): any {
    const totalFees = feeStructures.reduce((sum, fee) => sum + fee.baseAmount, 0);
    const totalPaid = payments
      .filter(p => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDiscounts = discounts.reduce((sum, d) => sum + d.annualDiscountAmount, 0);

    return {
      totalFees,
      totalPaid,
      totalDiscounts,
      outstandingAmount: totalFees - totalPaid - totalDiscounts,
      paymentPercentage: totalFees > 0 ? (totalPaid / totalFees) * 100 : 0,
    };
  }

  private groupByPaymentMethod(payments: FeePayment[]): any {
    return payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amountPaid;
      return acc;
    }, {});
  }

  private calculateMonthlyTrends(payments: FeePayment[]): any {
    return payments.reduce((acc, payment) => {
      const month = payment.paymentDate.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + payment.amountPaid;
      return acc;
    }, {});
  }

  private groupByPaymentStatus(payments: FeePayment[]): any {
    return payments.reduce((acc, payment) => {
      acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + 1;
      return acc;
    }, {});
  }

  private async createInstallmentSchedule(plan: InstallmentPlan): Promise<void> {
    const schedules = [];
    const installmentAmount = plan.installmentAmount;
    let dueDate = new Date(plan.firstInstallmentDate);

    for (let i = 1; i <= plan.totalInstallments; i++) {
      schedules.push({
        installmentPlanId: plan.id,
        installmentNumber: i,
        dueDate: new Date(dueDate),
        amountDue: installmentAmount,
      });

      // Add one month for next installment
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    await this.installmentScheduleRepository.save(schedules);
  }
}