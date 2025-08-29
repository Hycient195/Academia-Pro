// Academia Pro - Reports Service
// Business logic for reports and analytics management

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Report } from './report.entity';
import {
  CreateReportDto,
  UpdateReportDto,
  ReportResponseDto,
  ReportListResponseDto,
  ReportGenerationResponseDto,
  ReportsStatisticsResponseDto,
} from './dtos/index';
import {
  TReportType,
  TReportFormat,
  TTimeRange,
  IReportFiltersQuery,
  IGenerateReportRequest,
  IReportsStatisticsResponse,
} from '../../../common/src/types/reports/reports.types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new report
   */
  async create(createReportDto: CreateReportDto, createdBy?: string): Promise<ReportResponseDto> {
    const { schoolId, ...reportData } = createReportDto;

    // Create report entity
    const report = this.reportRepository.create({
      ...reportData,
      schoolId,
      createdBy: createdBy || 'system', // Default to system if not provided
      isActive: true,
    });

    // Calculate next run if scheduled
    if (report.schedule) {
      report.calculateNextRun();
    }

    const savedReport = await this.reportRepository.save(report);
    return ReportResponseDto.fromEntity(savedReport);
  }

  /**
   * Get all reports with filtering and pagination
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    filters?: IReportFiltersQuery;
  }): Promise<ReportListResponseDto> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('report.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.type) {
      queryBuilder.andWhere('report.type = :type', { type: filters.type });
    }

    if (filters?.format) {
      queryBuilder.andWhere('report.format = :format', { format: filters.format });
    }

    if (filters?.frequency) {
      queryBuilder.andWhere('report.frequency = :frequency', { frequency: filters.frequency });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('report.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('report.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters?.createdBy) {
      queryBuilder.andWhere('report.createdBy = :createdBy', { createdBy: filters.createdBy });
    }

    if (filters?.createdAfter) {
      queryBuilder.andWhere('report.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }

    if (filters?.createdBefore) {
      queryBuilder.andWhere('report.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(report.title ILIKE :search OR report.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    const reportResponseDtos = reports.map(report => ReportResponseDto.fromEntity(report));

    // Calculate summary
    const summary = {
      activeReports: reports.filter(r => r.isActive).length,
      scheduledReports: reports.filter(r => r.schedule?.isActive).length,
      publicReports: reports.filter(r => r.isPublic).length,
      totalGenerations: reports.reduce((sum, r) => sum + (r.lastGeneratedAt ? 1 : 0), 0),
    };

    return new ReportListResponseDto({
      reports: reportResponseDtos,
      total,
      page,
      limit,
      summary,
    });
  }

  /**
   * Get report by ID
   */
  async findOne(id: string): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return ReportResponseDto.fromEntity(report);
  }

  /**
   * Update report
   */
  async update(id: string, updateReportDto: UpdateReportDto): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    Object.assign(report, updateReportDto);

    // Recalculate next run if schedule was updated
    if (updateReportDto.schedule) {
      report.calculateNextRun();
    }

    const updatedReport = await this.reportRepository.save(report);
    return ReportResponseDto.fromEntity(updatedReport);
  }

  /**
   * Delete report
   */
  async remove(id: string): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    await this.reportRepository.remove(report);
  }

  /**
   * Generate report
   */
  async generateReport(request: IGenerateReportRequest): Promise<ReportGenerationResponseDto> {
    let report: Report;

    if (request.reportId) {
      // Use existing report
      report = await this.reportRepository.findOne({
        where: { id: request.reportId },
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }
    } else {
      // Create ad-hoc report
      const schoolId = request.parameters?.filters?.schoolId || '';
      const createDto: CreateReportDto = {
        title: 'Ad-hoc Report',
        type: TReportType.CUSTOM_REPORT,
        format: request.format || TReportFormat.PDF,
        parameters: request.parameters || {
          timeRange: TTimeRange.THIS_MONTH,
          filters: { schoolId },
          metrics: [],
          includeCharts: true,
          includeTables: true,
        },
        schoolId,
      };

      report = this.reportRepository.create({
        ...createDto,
        createdBy: 'system',
        isActive: false, // Ad-hoc reports are not saved permanently
      });
    }

    // Simulate report generation
    const fileUrl = `https://storage.example.com/reports/${report.id}.${request.format || report.format}`;
    const fileSize = Math.floor(Math.random() * 5000000) + 1000000; // 1-6MB

    // Mark as generated
    report.markAsGenerated(fileUrl, fileSize);

    // Save if it's a persistent report
    if (request.reportId) {
      await this.reportRepository.save(report);
    }

    return new ReportGenerationResponseDto({
      reportId: report.id,
      fileUrl,
      fileSize,
      format: request.format || report.format,
      generatedAt: new Date(),
      expiresAt: report.expiresAt!,
      downloadUrl: `${fileUrl}?download=true`,
      previewUrl: `${fileUrl}?preview=true`,
    });
  }

  /**
   * Get reports statistics
   */
  async getStatistics(schoolId: string): Promise<ReportsStatisticsResponseDto> {
    const [
      totalReports,
      activeReports,
      reportsByType,
      reportsByFormat,
      reportsByFrequency,
      totalGenerations,
      averageGenerationTime,
    ] = await Promise.all([
      // Total reports count
      this.reportRepository.count({ where: { schoolId } }),

      // Active reports count
      this.reportRepository.count({ where: { schoolId, isActive: true } }),

      // Reports by type
      this.reportRepository
        .createQueryBuilder('report')
        .select('report.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('report.schoolId = :schoolId', { schoolId })
        .groupBy('report.type')
        .getRawMany(),

      // Reports by format
      this.reportRepository
        .createQueryBuilder('report')
        .select('report.format', 'format')
        .addSelect('COUNT(*)', 'count')
        .where('report.schoolId = :schoolId', { schoolId })
        .groupBy('report.format')
        .getRawMany(),

      // Reports by frequency
      this.reportRepository
        .createQueryBuilder('report')
        .select('report.frequency', 'frequency')
        .addSelect('COUNT(*)', 'count')
        .where('report.schoolId = :schoolId', { schoolId })
        .groupBy('report.frequency')
        .getRawMany(),

      // Total generations (simplified)
      this.reportRepository.count({ where: { schoolId, lastGeneratedAt: null } }),

      // Average generation time (mock data)
      Promise.resolve(45.5),
    ]);

    // Helper function to convert array to record
    const convertToRecord = (data: any[], keyField: string): Record<string, number> => {
      const result: Record<string, number> = {};
      data.forEach(item => {
        result[item[keyField]] = parseInt(item.count) || 0;
      });
      return result;
    };

    // Mock data for demonstration
    const storageUsed = totalReports * 2000000; // 2MB per report average
    const topReportCreators = [
      { userId: 'user-1', userName: 'John Doe', reportsCount: 25 },
      { userId: 'user-2', userName: 'Jane Smith', reportsCount: 18 },
      { userId: 'user-3', userName: 'Bob Johnson', reportsCount: 12 },
    ];

    const generationTrends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      generations: Math.floor(Math.random() * 10) + 1,
    }));

    return new ReportsStatisticsResponseDto({
      totalReports,
      activeReports,
      reportsByType: convertToRecord(reportsByType, 'type'),
      reportsByFormat: convertToRecord(reportsByFormat, 'format'),
      reportsByFrequency: convertToRecord(reportsByFrequency, 'frequency'),
      totalGenerations,
      averageGenerationTime,
      storageUsed,
      topReportCreators,
      generationTrends,
    });
  }

  /**
   * Get reports due for generation
   */
  async getDueReports(schoolId: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.schoolId = :schoolId', { schoolId })
      .andWhere('report.isActive = :isActive', { isActive: true })
      .andWhere('report.schedule->>\'isActive\' = :scheduleActive', { scheduleActive: 'true' })
      .andWhere('report.schedule->>\'nextRun\' < :currentDate', { currentDate: new Date().toISOString() })
      .getMany();

    return reports.map(report => ReportResponseDto.fromEntity(report));
  }

  /**
   * Get reports by type
   */
  async getReportsByType(schoolId: string, type: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportRepository.find({
      where: { schoolId, type: type as any },
    });

    return reports.map(report => ReportResponseDto.fromEntity(report));
  }

  /**
   * Process scheduled reports
   */
  async processScheduledReports(): Promise<void> {
    const dueReports = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.isActive = :isActive', { isActive: true })
      .andWhere('report.schedule->>\'isActive\' = :scheduleActive', { scheduleActive: 'true' })
      .andWhere('report.schedule->>\'nextRun\' < :currentDate', { currentDate: new Date().toISOString() })
      .getMany();

    for (const report of dueReports) {
      try {
        await this.generateReport({ reportId: report.id });
      } catch (error) {
        console.error(`Failed to generate scheduled report ${report.id}:`, error);
      }
    }
  }

  /**
   * Export reports configuration
   */
  async exportReports(schoolId: string, reportIds: string[]): Promise<string> {
    const reports = await this.reportRepository.find({
      where: reportIds.length > 0 ? { id: reportIds[0], schoolId } : { schoolId },
    });

    // Generate export file (simplified)
    const exportData = {
      exportedAt: new Date(),
      schoolId,
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        type: report.type,
        parameters: report.parameters,
        schedule: report.schedule,
      })),
    };

    return JSON.stringify(exportData);
  }

  /**
   * Import reports configuration
   */
  async importReports(schoolId: string, importData: string, overwriteExisting: boolean = false): Promise<void> {
    const data = JSON.parse(importData);

    for (const reportData of data.reports) {
      const existingReport = await this.reportRepository.findOne({
        where: { id: reportData.id },
      });

      if (existingReport && !overwriteExisting) {
        continue; // Skip existing reports
      }

      const report = existingReport || this.reportRepository.create();
      Object.assign(report, {
        ...reportData,
        schoolId,
        createdBy: report.createdBy || 'system',
      });

      await this.reportRepository.save(report);
    }
  }
}