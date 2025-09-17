import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { CircuitBreakerService } from '../common/services/circuit-breaker.service';

export enum JobType {
  BULK_IMPORT = 'bulk_import',
  BATCH_PROMOTION = 'batch_promotion',
  BATCH_GRADUATION = 'batch_graduation',
  BATCH_TRANSFER = 'batch_transfer',
}

export interface JobData {
  operationId: string;
  userId?: string;
  schoolId: string;
  data: any;
}

export interface JobResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('student-operations')
    private studentQueue: Queue,
    private circuitBreaker: CircuitBreakerService,
  ) {}

  async addJob(jobType: JobType, data: JobData): Promise<Job<JobData>> {
    const job = await this.studentQueue.add(jobType, data, {
      priority: this.getJobPriority(jobType),
      delay: this.getJobDelay(jobType),
    });

    this.logger.log(`Added job ${jobType} with ID ${job.id}`);
    return job;
  }

  async getJobStatus(jobId: string): Promise<Job<JobData> | undefined> {
    return this.studentQueue.getJob(jobId);
  }

  async getActiveJobs(): Promise<Job<JobData>[]> {
    return this.studentQueue.getActive();
  }

  async getWaitingJobs(): Promise<Job<JobData>[]> {
    return this.studentQueue.getWaiting();
  }

  async getCompletedJobs(limit = 10): Promise<Job<JobData>[]> {
    return this.studentQueue.getCompleted(0, limit);
  }

  async getFailedJobs(limit = 10): Promise<Job<JobData>[]> {
    return this.studentQueue.getFailed(0, limit);
  }

  private getJobPriority(jobType: JobType): number {
    switch (jobType) {
      case JobType.BATCH_GRADUATION:
        return 1; // Highest priority
      case JobType.BATCH_PROMOTION:
        return 2;
      case JobType.BATCH_TRANSFER:
        return 3;
      case JobType.BULK_IMPORT:
        return 4; // Lowest priority
      default:
        return 5;
    }
  }

  private getJobDelay(jobType: JobType): number {
    // Add small delay to prevent overwhelming the system
    return 1000; // 1 second
  }

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    return this.circuitBreaker.execute(operation, operationName);
  }
}