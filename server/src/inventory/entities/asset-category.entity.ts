// Academia Pro - Asset Category Entity
// Entity for organizing assets into categories and subcategories

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Tree, TreeChildren, TreeParent, Index } from 'typeorm';

export enum CategoryType {
  ASSET = 'asset',
  CONSUMABLE = 'consumable',
  SERVICE = 'service',
}

@Entity('asset_categories')
@Index(['schoolId', 'categoryCode'])
@Index(['schoolId', 'parentId'])
@Tree('materialized-path')
export class AssetCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'category_code', type: 'varchar', length: 50, unique: true })
  categoryCode: string;

  @Column({ name: 'category_name', type: 'varchar', length: 255 })
  categoryName: string;

  @Column({ name: 'category_description', type: 'text', nullable: true })
  categoryDescription: string;

  @Column({
    name: 'category_type',
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.ASSET,
  })
  categoryType: CategoryType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  iconUrl: string;

  @Column({ name: 'color_code', type: 'varchar', length: 7, nullable: true })
  colorCode: string;

  @Column({ name: 'default_depreciation_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  defaultDepreciationRate: number;

  @Column({ name: 'default_useful_life_years', type: 'int', nullable: true })
  defaultUsefulLifeYears: number;

  @Column({ name: 'maintenance_schedule_template', type: 'jsonb', nullable: true })
  maintenanceScheduleTemplate: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
    maintenanceType: string;
    estimatedCost?: number;
    checklist?: string[];
  };

  @Column({ name: 'custom_fields_template', type: 'jsonb', nullable: true })
  customFieldsTemplate: { [key: string]: any };

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Tree relations
  @TreeParent()
  parent: AssetCategory;

  @TreeChildren()
  children: AssetCategory[];

  // Relations
  // @OneToMany(() => Asset, asset => asset.category)
  // assets: Asset[];
}