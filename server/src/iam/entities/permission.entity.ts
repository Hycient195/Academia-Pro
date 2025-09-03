import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PermissionResource {
  SCHOOLS = 'schools',
  USERS = 'users',
  ANALYTICS = 'analytics',
  AUDIT = 'audit',
  SYSTEM = 'system',
  SETTINGS = 'settings',
  ALL = '*'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  ALL = '*'
}

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "schools:create"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PermissionResource,
    default: PermissionResource.ALL
  })
  resource: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
    default: PermissionAction.ALL
  })
  action: PermissionAction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}