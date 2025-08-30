import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('api_keys')
@Index(['parentPortalAccessId', 'schoolId'])
@Index(['isActive'])
@Index(['expiresAt'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'prefix', type: 'varchar', length: 20, default: 'pp_live_' })
  prefix: string;

  @Column({ name: 'masked_key', type: 'varchar', length: 50 })
  maskedKey: string;

  @Column({ name: 'permissions', type: 'jsonb', nullable: true })
  permissions: string[];

  @Column({ name: 'rate_limits', type: 'jsonb', nullable: true })
  rateLimits: {
    requests: number;
    period: string;
  };

  @Column({ name: 'allowed_ips', type: 'jsonb', nullable: true })
  allowedIPs: string[];

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'last_used', type: 'timestamp', nullable: true })
  lastUsed: Date;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}