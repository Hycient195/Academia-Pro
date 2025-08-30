import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IntegrationType, IntegrationStatus } from '../dtos/api-gateway.dto';

@Entity('integrations')
@Index(['parentPortalAccessId', 'schoolId'])
@Index(['status', 'schoolId'])
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: IntegrationType,
  })
  type: IntegrationType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'provider', type: 'varchar', length: 100 })
  provider: string;

  @Column({ name: 'config', type: 'jsonb', nullable: true })
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    baseUrl?: string;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
    };
  };

  @Column({
    name: 'status',
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.CONFIGURING,
  })
  status: IntegrationStatus;

  @Column({ name: 'features', type: 'jsonb', nullable: true })
  features: string[];

  @Column({ name: 'rate_limits', type: 'jsonb', nullable: true })
  rateLimits: {
    requests: number;
    period: string;
  };

  @Column({ name: 'health_check_url', type: 'varchar', length: 500, nullable: true })
  healthCheckUrl: string;

  @Column({ name: 'last_tested', type: 'timestamp', nullable: true })
  lastTested: Date;

  @Column({ name: 'test_results', type: 'jsonb', nullable: true })
  testResults: {
    success: boolean;
    responseTime: number;
    errorMessage?: string;
  };

  @Column({ name: 'usage_stats', type: 'jsonb', nullable: true })
  usageStats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}