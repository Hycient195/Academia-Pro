import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiVersion, HttpMethod } from '../dtos/api-gateway.dto';

@Entity('api_logs')
@Index(['parentPortalAccessId', 'timestamp'])
@Index(['endpoint', 'timestamp'])
@Index(['statusCode'])
@Index(['requestId'])
export class ApiLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @Column({
    name: 'method',
    type: 'enum',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @Column({ name: 'endpoint', type: 'varchar', length: 500 })
  endpoint: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'response_time', type: 'int' }) // milliseconds
  responseTime: number;

  @Column({ name: 'request_size', type: 'int', nullable: true }) // bytes
  requestSize: number;

  @Column({ name: 'response_size', type: 'int', nullable: true }) // bytes
  responseSize: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({
    name: 'version',
    type: 'enum',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @Column({ name: 'request_id', type: 'varchar', length: 100 })
  requestId: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'rate_limit', type: 'jsonb', nullable: true })
  rateLimit: {
    limit: number;
    remaining: number;
    resetIn: number;
  };

  @Column({ name: 'geolocation', type: 'jsonb', nullable: true })
  geolocation: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}