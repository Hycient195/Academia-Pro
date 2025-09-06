// Academia Pro - Create Asset DTO
// Data Transfer Object for creating new assets

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import {
  TAssetCategory,
  TDepreciationMethod,
  ICreateAssetRequest,
  IAssetLocation,
  IProcurementInfo,
  IFinancialInfo,
  IAssetSpecifications
} from '@academia-pro/types/inventory';

export class CreateAssetDto implements ICreateAssetRequest {
  @ApiProperty({
    description: 'Unique asset code',
    example: 'AST-001',
  })
  @IsString()
  assetCode: string;

  @ApiProperty({
    description: 'Asset name',
    example: 'Dell Laptop',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Asset description',
    example: 'High-performance laptop for teaching staff',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Asset category',
    example: 'computers',
    enum: TAssetCategory,
  })
  @IsEnum(TAssetCategory)
  category: TAssetCategory;

  @ApiProperty({
    description: 'Asset location information',
    type: Object,
  })
  @IsObject()
  location: IAssetLocation;

  @ApiProperty({
    description: 'Procurement information',
    type: Object,
  })
  @IsObject()
  procurement: Omit<IProcurementInfo, 'procurementStatus'>;

  @ApiProperty({
    description: 'Financial information',
    type: Object,
  })
  @IsObject()
  financial: Omit<IFinancialInfo, 'accumulatedDepreciation' | 'currentValue' | 'depreciationSchedule'>;

  @ApiProperty({
    description: 'Asset specifications',
    type: Object,
  })
  @IsObject()
  specifications: IAssetSpecifications;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;
}

// Nested DTOs for complex objects
export class AssetLocationDto implements IAssetLocation {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  custodianContact?: string;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class ProcurementInfoDto implements Omit<IProcurementInfo, 'procurementStatus'> {
  @ApiProperty({
    type: Object,
  })
  @IsObject()
  supplier: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    rating?: number;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseOrderNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty()
  @IsDateString()
  purchaseDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  warrantyPeriod?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: Date;
}

export class FinancialInfoDto implements Omit<IFinancialInfo, 'accumulatedDepreciation' | 'currentValue' | 'depreciationSchedule'> {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salvageValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(50)
  usefulLife: number;

  @ApiProperty({
    enum: TDepreciationMethod,
  })
  @IsEnum(TDepreciationMethod)
  depreciationMethod: TDepreciationMethod;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  insurance?: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
    startDate: Date;
    endDate: Date;
    deductible: number;
  };
}

export class AssetSpecificationsDto implements IAssetSpecifications {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'inch';
  };

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
  };

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  powerRequirements?: {
    voltage?: number;
    current?: number;
    power?: number;
    unit: 'V' | 'A' | 'W';
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capacity?: string;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  additionalSpecs?: Record<string, any>;
}

export class SupplierDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}