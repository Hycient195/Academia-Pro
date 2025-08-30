import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('push_tokens')
@Index(['parentPortalAccessId', 'schoolId'])
@Index(['deviceToken'])
@Index(['isActive'])
export class PushToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_portal_access_id', type: 'uuid' })
  parentPortalAccessId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'device_token', type: 'varchar', length: 500, unique: true })
  deviceToken: string;

  @Column({ name: 'device_type', type: 'varchar', length: 20 })
  deviceType: 'ios' | 'android' | 'web';

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ name: 'device_model', type: 'varchar', length: 100, nullable: true })
  deviceModel: string;

  @Column({ name: 'os_version', type: 'varchar', length: 50, nullable: true })
  osVersion: string;

  @Column({ name: 'app_version', type: 'varchar', length: 50, nullable: true })
  appVersion: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_used', type: 'timestamp', nullable: true })
  lastUsed: Date;

  @Column({ name: 'registered_at', type: 'timestamp' })
  registeredAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}