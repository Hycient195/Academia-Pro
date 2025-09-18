import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/school.entity';

export enum DelegatedSchoolAdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

@Entity('delegated_school_admins')
@Index(['email'], { unique: true })
@Index(['userId'])
@Index(['schoolId'])
@Index(['status'])
export class DelegatedSchoolAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string; // Reference to the actual user

  @Column({ type: 'uuid' })
  schoolId: string; // School this delegated admin belongs to

  @Column({ type: 'varchar', length: 255 })
  email: string; // Email for login

  @Column({ type: 'jsonb' })
  permissions: string[]; // Array of permission names, e.g., ["students:create", "teachers:read"]

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null; // When the delegated account becomes active

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null; // School admin who created this

  @Column({
    type: 'enum',
    enum: DelegatedSchoolAdminStatus,
    default: DelegatedSchoolAdminStatus.ACTIVE
  })
  status: DelegatedSchoolAdminStatus;

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

  // Relations
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;
}