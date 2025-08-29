// Academia Pro - School Entity
// Database entity for school management in multi-school architecture

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum SchoolType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  MIXED = 'mixed', // Both primary and secondary
}

export enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_MAINTENANCE = 'under_maintenance',
}

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // Unique school identifier

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SchoolType,
    default: SchoolType.MIXED,
  })
  type: SchoolType;

  @Column({
    type: 'enum',
    enum: SchoolStatus,
    default: SchoolStatus.ACTIVE,
  })
  status: SchoolStatus;

  // Contact Information
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  // Address Information
  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Administrative Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  principalName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  principalPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  principalEmail: string;

  // Academic Information
  @Column({ type: 'int', nullable: true })
  totalStudents: number;

  @Column({ type: 'int', nullable: true })
  totalTeachers: number;

  @Column({ type: 'int', nullable: true })
  totalStaff: number;

  @Column({ type: 'jsonb', nullable: true })
  gradeStructure: {
    primary: number[]; // e.g., [1, 2, 3, 4, 5]
    secondary: number[]; // e.g., [6, 7, 8, 9, 10, 11, 12]
  };

  // Operational Information
  @Column({ type: 'time', nullable: true })
  openingTime: string;

  @Column({ type: 'time', nullable: true })
  closingTime: string;

  @Column({ type: 'jsonb', nullable: true })
  workingDays: string[]; // e.g., ['monday', 'tuesday', ...]

  // Financial Information
  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string; // e.g., 'USD', 'EUR', 'NGN'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyFee: number;

  // System Configuration
  @Column({ type: 'jsonb', default: {} })
  settings: {
    timezone: string;
    language: string;
    dateFormat: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      logo?: string;
    };
    features: {
      onlineLearning: boolean;
      mobileApp: boolean;
      parentPortal: boolean;
      studentPortal: boolean;
      transportation: boolean;
      hostel: boolean;
      library: boolean;
    };
    notifications: {
      sms: boolean;
      email: boolean;
      push: boolean;
    };
  };

  // Compliance and Legal
  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'date', nullable: true })
  establishmentDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  accreditations: {
    name: string;
    issuingAuthority: string;
    validFrom: Date;
    validTo: Date;
    certificateNumber: string;
  }[];

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Virtual properties
  get fullAddress(): string {
    if (!this.address) return '';
    const { street, city, state, country } = this.address;
    return `${street}, ${city}, ${state}, ${country}`;
  }

  get isActive(): boolean {
    return this.status === SchoolStatus.ACTIVE;
  }

  get hasOnlineLearning(): boolean {
    return this.settings?.features?.onlineLearning || false;
  }

  get hasTransportation(): boolean {
    return this.settings?.features?.transportation || false;
  }

  get hasHostel(): boolean {
    return this.settings?.features?.hostel || false;
  }

  // Relations (to be added as needed)
  // @OneToMany(() => User, user => user.school)
  // users: User[];

  // @OneToMany(() => Student, student => student.school)
  // students: Student[];

  // @OneToMany(() => Teacher, teacher => teacher.school)
  // teachers: Teacher[];
}