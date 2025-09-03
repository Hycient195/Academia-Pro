import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DelegatedAccountStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

@Entity('delegated_accounts')
@Index(['email'], { unique: true })
@Index(['userId'])
@Index(['status'])
export class DelegatedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string; // Reference to the actual user

  @Column({ type: 'varchar', length: 255 })
  email: string; // Email for login

  @Column({ type: 'jsonb' })
  permissions: string[]; // Array of permission names, e.g., ["schools:create", "users:read"]

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @Column({ type: 'uuid' })
  createdBy: string; // Super admin who created this

  @Column({
    type: 'enum',
    enum: DelegatedAccountStatus,
    default: DelegatedAccountStatus.ACTIVE
  })
  status: DelegatedAccountStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; // Optional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  revokedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;
}