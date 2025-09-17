import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Staff } from './staff.entity';
import { EDepartmentType } from '@academia-pro/types/staff';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EDepartmentType })
  type: EDepartmentType;

  @Column()
  name: string; // e.g. "Teaching", "Medical"

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Staff, (staff) => staff.departments)
  staff: Staff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}