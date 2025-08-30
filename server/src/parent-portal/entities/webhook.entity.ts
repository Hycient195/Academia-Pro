import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { WebhookEventType } from '../dtos/api-gateway.dto';

@Entity('webhooks')
@Index(['parentPortalAccessId', 'schoolId'])
@Index(['isActive', 'schoolId'])
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'url', type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'events', type: 'jsonb' })
  events: WebhookEventType[];

  @Column({ name: 'secret', type: 'varchar', length: 255 })
  secret: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'retry_config', type: 'jsonb', nullable: true })
  retryConfig: {
    maxRetries: number;
    retryDelay: number; // seconds
    backoffMultiplier: number;
  };

  @Column({ name: 'filters', type: 'jsonb', nullable: true })
  filters: {
    studentIds?: string[];
    gradeLevels?: string[];
    subjects?: string[];
  };

  @Column({ name: 'last_triggered', type: 'timestamp', nullable: true })
  lastTriggered: Date;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column({ name: 'total_deliveries', type: 'int', default: 0 })
  totalDeliveries: number;

  @Column({ name: 'failed_deliveries', type: 'int', default: 0 })
  failedDeliveries: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}