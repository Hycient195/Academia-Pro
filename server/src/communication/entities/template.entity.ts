// Academia Pro - Template Entity
// Database entity for managing communication templates

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
  MESSAGE = 'message',
  NOTICE = 'notice',
}

export enum TemplateCategory {
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  EXAMINATION = 'examination',
  FEE = 'fee',
  DISCIPLINE = 'discipline',
  HEALTH = 'health',
  EVENT = 'event',
  EMERGENCY = 'emergency',
  GENERAL = 'general',
  SYSTEM = 'system',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('communication_templates')
@Index(['schoolId', 'templateType'])
@Index(['schoolId', 'category'])
@Index(['schoolId', 'status'])
export class CommunicationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'template_name', type: 'varchar', length: 100 })
  templateName: string;

  @Column({ name: 'template_description', type: 'text', nullable: true })
  templateDescription: string;

  @Column({
    name: 'template_type',
    type: 'enum',
    enum: TemplateType,
  })
  templateType: TemplateType;

  @Column({
    name: 'category',
    type: 'enum',
    enum: TemplateCategory,
    default: TemplateCategory.GENERAL,
  })
  category: TemplateCategory;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.ACTIVE,
  })
  status: TemplateStatus;

  // Template Content
  @Column({ name: 'subject_template', type: 'varchar', length: 200, nullable: true })
  subjectTemplate: string;

  @Column({ name: 'content_template', type: 'text' })
  contentTemplate: string;

  @Column({ name: 'short_content_template', type: 'varchar', length: 160, nullable: true })
  shortContentTemplate: string; // For SMS templates

  // Template Variables
  @Column({ name: 'available_variables', type: 'jsonb', default: [] })
  availableVariables: Array<{
    name: string;
    description: string;
    example: string;
    required: boolean;
    type: 'string' | 'number' | 'date' | 'boolean';
  }>;

  // Template Metadata
  @Column({ name: 'language', type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ name: 'version', type: 'varchar', length: 20, default: '1.0' })
  version: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  // Validation Rules
  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules: {
    maxLength?: number;
    minLength?: number;
    requiredVariables?: string[];
    formatValidation?: Record<string, any>;
  };

  // Preview and Testing
  @Column({ name: 'sample_data', type: 'jsonb', nullable: true })
  sampleData: Record<string, any>;

  @Column({ name: 'preview_html', type: 'text', nullable: true })
  previewHtml: string;

  // Access Control
  @Column({ name: 'allowed_roles', type: 'jsonb', default: ['admin', 'teacher', 'staff'] })
  allowedRoles: string[];

  @Column({ name: 'is_system_template', type: 'boolean', default: false })
  isSystemTemplate: boolean;

  // Tags and Organization
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'folder', type: 'varchar', length: 100, nullable: true })
  folder: string;

  // Metadata
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    subcategory?: string;
    priority?: 'low' | 'normal' | 'high';
    featured?: boolean;
    deprecated?: boolean;
    replacementTemplateId?: string;
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_by_name', type: 'varchar', length: 100 })
  createdByName: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'updated_by_name', type: 'varchar', length: 100, nullable: true })
  updatedByName: string;
}