// Academia Pro - Report Entity
// Database entity for reports and analytics management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import {
  TReportType,
  TReportFormat,
  TReportFrequency,
  TChartType,
  TMetricType,
  TTimeRange
} from '../../../common/src/types/reports/reports.types';

@Entity('reports')
@Index(['schoolId', 'type'])
@Index(['schoolId', 'isActive'])
@Index(['schoolId', 'createdBy'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TReportType
  })
  type: TReportType;

  @Column({
    type: 'enum',
    enum: TReportFormat,
    default: TReportFormat.PDF
  })
  format: TReportFormat;

  @Column({
    type: 'enum',
    enum: TReportFrequency,
    default: TReportFrequency.AD_HOC
  })
  frequency: TReportFrequency;

  @Column({ type: 'jsonb' })
  parameters: {
    timeRange: TTimeRange;
    startDate?: Date;
    endDate?: Date;
    filters: {
      schoolId: string;
      gradeIds?: string[];
      classIds?: string[];
      subjectIds?: string[];
      studentIds?: string[];
      staffIds?: string[];
      departmentIds?: string[];
      category?: string;
      status?: string;
      minValue?: number;
      maxValue?: number;
      search?: string;
    };
    groupBy?: string[];
    metrics: Array<{
      name: string;
      type: TMetricType;
      field: string;
      label: string;
      format?: string;
      aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>;
    chartType?: TChartType;
    includeCharts: boolean;
    includeTables: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  schedule?: {
    frequency: TReportFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
    isActive: boolean;
    nextRun?: Date;
    lastRun?: Date;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column()
  createdBy: string;

  @Column()
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastGeneratedAt?: Date;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true })
  fileSize?: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  // Business logic methods
  updateParameters(parameters: Partial<typeof this.parameters>): void {
    this.parameters = { ...this.parameters, ...parameters };
    this.calculateNextRun();
  }

  updateSchedule(schedule: Partial<NonNullable<typeof this.schedule>>): void {
    if (!this.schedule) {
      this.schedule = {
        frequency: TReportFrequency.MONTHLY,
        time: '09:00',
        recipients: [],
        isActive: true,
      };
    }
    this.schedule = { ...this.schedule, ...schedule };
    this.calculateNextRun();
  }

  calculateNextRun(): void {
    if (!this.schedule || !this.schedule.isActive) return;

    const now = new Date();
    let nextRun = new Date(now);

    switch (this.schedule.frequency) {
      case TReportFrequency.DAILY:
        nextRun.setDate(now.getDate() + 1);
        break;
      case TReportFrequency.WEEKLY:
        const daysUntilNext = (this.schedule.dayOfWeek || 1) - now.getDay();
        nextRun.setDate(now.getDate() + (daysUntilNext <= 0 ? daysUntilNext + 7 : daysUntilNext));
        break;
      case TReportFrequency.MONTHLY:
        const targetDay = this.schedule.dayOfMonth || 1;
        nextRun.setMonth(now.getMonth() + 1, targetDay);
        break;
      case TReportFrequency.QUARTERLY:
        const currentQuarter = Math.floor(now.getMonth() / 3);
        nextRun.setMonth((currentQuarter + 1) * 3, 1);
        break;
      case TReportFrequency.YEARLY:
        nextRun.setFullYear(now.getFullYear() + 1, 0, 1);
        break;
    }

    // Set the time
    if (this.schedule.time) {
      const [hours, minutes] = this.schedule.time.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);
    }

    this.schedule.nextRun = nextRun;
  }

  markAsGenerated(fileUrl: string, fileSize: number): void {
    this.lastGeneratedAt = new Date();
    this.fileUrl = fileUrl;
    this.fileSize = fileSize;

    // Set expiration (30 days from now)
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + 30);

    // Update next run if scheduled
    if (this.schedule) {
      this.schedule.lastRun = this.lastGeneratedAt;
      this.calculateNextRun();
    }
  }

  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  isDueForGeneration(): boolean {
    if (!this.schedule || !this.schedule.isActive || !this.schedule.nextRun) {
      return false;
    }
    return new Date() >= this.schedule.nextRun;
  }

  getScheduleSummary(): {
    nextRun?: Date;
    lastRun?: Date;
    isOverdue: boolean;
    daysUntilNext: number;
  } {
    if (!this.schedule) {
      return { isOverdue: false, daysUntilNext: Infinity };
    }

    const now = new Date();
    const nextRun = this.schedule.nextRun;
    const lastRun = this.schedule.lastRun;

    let isOverdue = false;
    let daysUntilNext = Infinity;

    if (nextRun) {
      isOverdue = now > nextRun;
      daysUntilNext = Math.ceil((nextRun.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      nextRun,
      lastRun,
      isOverdue,
      daysUntilNext,
    };
  }

  getGenerationStats(): {
    totalGenerations: number;
    averageGenerationTime: number;
    lastGenerationTime?: Date;
    successRate: number;
  } {
    // This would typically be calculated from a separate generations table
    // For now, return mock data
    return {
      totalGenerations: this.lastGeneratedAt ? 1 : 0,
      averageGenerationTime: 300, // 5 minutes in seconds
      lastGenerationTime: this.lastGeneratedAt,
      successRate: 1.0,
    };
  }

  // Computed properties
  get isScheduled(): boolean {
    return this.schedule?.isActive || false;
  }

  get daysSinceLastGeneration(): number {
    if (!this.lastGeneratedAt) return Infinity;
    const now = new Date();
    const lastGen = new Date(this.lastGeneratedAt);
    return Math.floor((now.getTime() - lastGen.getTime()) / (1000 * 60 * 60 * 24));
  }

  get fileSizeFormatted(): string {
    if (!this.fileSize) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  get status(): 'active' | 'inactive' | 'expired' | 'scheduled' | 'overdue' {
    if (!this.isActive) return 'inactive';
    if (this.isExpired()) return 'expired';
    if (this.isDueForGeneration()) return 'overdue';
    if (this.isScheduled) return 'scheduled';
    return 'active';
  }

  get priority(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isDueForGeneration() && this.daysSinceLastGeneration > 7) return 'critical';
    if (this.isDueForGeneration()) return 'high';
    if (this.isExpired()) return 'medium';
    return 'low';
  }

  get recipientCount(): number {
    return this.schedule?.recipients?.length || 0;
  }

  get metricsCount(): number {
    return this.parameters.metrics?.length || 0;
  }

  get filtersCount(): number {
    const filters = this.parameters.filters;
    let count = 0;
    if (filters.gradeIds?.length) count++;
    if (filters.classIds?.length) count++;
    if (filters.subjectIds?.length) count++;
    if (filters.studentIds?.length) count++;
    if (filters.staffIds?.length) count++;
    if (filters.departmentIds?.length) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.minValue !== undefined) count++;
    if (filters.maxValue !== undefined) count++;
    if (filters.search) count++;
    return count;
  }
}