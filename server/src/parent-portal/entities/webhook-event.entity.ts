import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { WebhookEventType } from '../dtos/api-gateway.dto';

@Entity('webhook_events')
@Index(['parentPortalAccessId', 'webhookId'])
@Index(['timestamp'])
@Index(['status'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'webhook_id', type: 'uuid' })
  webhookId: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: WebhookEventType,
  })
  eventType: WebhookEventType;

  @Column({ name: 'data', type: 'jsonb' })
  data: any;

  @Column({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'delivery_attempts', type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: 'success' | 'failed' | 'pending';

  @Column({ name: 'response_status', type: 'int', nullable: true })
  responseStatus: number;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody: string;

  @Column({ name: 'processing_time', type: 'int', nullable: true }) // milliseconds
  processingTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}