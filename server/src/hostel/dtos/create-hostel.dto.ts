// Academia Pro - Create Hostel DTO
// DTO for creating new hostels

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min, Max, MaxLength, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateHostelRequest,
  IUpdateHostelRequest,
  IFacility,
  IHostelRules,
  IHostelPricing,
  IContactInfo,
  IOperatingHours,
  THostelType,
  THostelStatus,
  TFacilityType
} from '@academia-pro/types/hostel';

import {
  IAddress,
} from '@academia-pro/types/shared';

export class AddressDto implements IAddress {
  @ApiProperty({
    description: 'Street address',
    example: '123 University Avenue',
  })
  @IsNotEmpty({ message: 'Street is required' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'Academic City',
  })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'State Province',
  })
  @IsNotEmpty({ message: 'State is required' })
  @IsString({ message: 'State must be a string' })
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '12345',
  })
  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString({ message: 'Postal code must be a string' })
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'Country Name',
  })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiPropertyOptional({
    description: 'Coordinates',
  })
  @IsOptional()
  @IsObject({ message: 'Coordinates must be an object' })
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class FacilityDto implements IFacility {
  @ApiProperty({
    description: 'Facility type',
    example: TFacilityType.WIFI,
    enum: TFacilityType,
  })
  @IsNotEmpty({ message: 'Facility type is required' })
  @IsEnum(TFacilityType, { message: 'Invalid facility type' })
  type: TFacilityType;

  @ApiProperty({
    description: 'Facility name',
    example: 'WiFi Network',
  })
  @IsNotEmpty({ message: 'Facility name is required' })
  @IsString({ message: 'Facility name must be a string' })
  name: string;

  @ApiPropertyOptional({
    description: 'Facility description',
    example: 'High-speed internet access throughout the hostel',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the facility is available',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is available must be a boolean' })
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Operating hours',
  })
  @IsOptional()
  @IsObject({ message: 'Operating hours must be an object' })
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
}

export class HostelRulesDto implements IHostelRules {
  @ApiProperty({
    description: 'Check-in time',
    example: '14:00',
  })
  @IsNotEmpty({ message: 'Check-in time is required' })
  @IsString({ message: 'Check-in time must be a string' })
  checkInTime: string;

  @ApiProperty({
    description: 'Check-out time',
    example: '12:00',
  })
  @IsNotEmpty({ message: 'Check-out time is required' })
  @IsString({ message: 'Check-out time must be a string' })
  checkOutTime: string;

  @ApiPropertyOptional({
    description: 'Whether visitors are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Visitors allowed must be a boolean' })
  visitorsAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Visitor hours',
  })
  @IsOptional()
  @IsObject({ message: 'Visitor hours must be an object' })
  visitorHours?: {
    start: string;
    end: string;
  };

  @ApiPropertyOptional({
    description: 'Whether smoking is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Smoking allowed must be a boolean' })
  smokingAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether alcohol is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Alcohol allowed must be a boolean' })
  alcoholAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether pets are allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Pets allowed must be a boolean' })
  petsAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether cooking is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Cooking allowed must be a boolean' })
  cookingAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Noise policy',
    example: 'Quiet hours from 22:00 to 06:00',
  })
  @IsOptional()
  @IsString({ message: 'Noise policy must be a string' })
  noisePolicy?: string;

  @ApiPropertyOptional({
    description: 'Cleaning schedule',
    example: 'Daily room cleaning and weekly deep cleaning',
  })
  @IsOptional()
  @IsString({ message: 'Cleaning schedule must be a string' })
  cleaningSchedule?: string;

  @ApiPropertyOptional({
    description: 'Whether laundry facilities are available',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Laundry facilities must be a boolean' })
  laundryFacilities?: boolean;

  @ApiPropertyOptional({
    description: 'Whether parking is available',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Parking available must be a boolean' })
  parkingAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Curfew time',
    example: '22:00',
  })
  @IsOptional()
  @IsString({ message: 'Curfew time must be a string' })
  curfewTime?: string;

  @ApiPropertyOptional({
    description: 'Additional rules',
    example: ['No loud music after 10 PM', 'Keep rooms clean'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Additional rules must be an array' })
  @IsString({ each: true, message: 'Each rule must be a string' })
  additionalRules?: string[];
}

export class HostelPricingDto implements IHostelPricing {
  @ApiProperty({
    description: 'Base rent amount',
    example: 500.00,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Base rent is required' })
  @IsNumber({}, { message: 'Base rent must be a number' })
  @Min(0, { message: 'Base rent cannot be negative' })
  baseRent: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'NGN',
    maxLength: 3,
  })
  @IsNotEmpty({ message: 'Currency is required' })
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency cannot exceed 3 characters' })
  currency: string;

  @ApiProperty({
    description: 'Billing cycle',
    example: 'monthly',
    enum: ['monthly', 'quarterly', 'semesterly', 'yearly'],
  })
  @IsNotEmpty({ message: 'Billing cycle is required' })
  @IsEnum(['monthly', 'quarterly', 'semesterly', 'yearly'], { message: 'Invalid billing cycle' })
  billingCycle: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';

  @ApiPropertyOptional({
    description: 'Security deposit amount',
    example: 200.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Security deposit must be a number' })
  @Min(0, { message: 'Security deposit cannot be negative' })
  securityDeposit?: number;

  @ApiPropertyOptional({
    description: 'Maintenance fee',
    example: 50.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maintenance fee must be a number' })
  @Min(0, { message: 'Maintenance fee cannot be negative' })
  maintenanceFee?: number;

  @ApiPropertyOptional({
    description: 'Whether utilities are included',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Utilities included must be a boolean' })
  utilitiesIncluded?: boolean;

  @ApiPropertyOptional({
    description: 'Whether internet is included',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Internet included must be a boolean' })
  internetIncluded?: boolean;

  @ApiPropertyOptional({
    description: 'Whether laundry is included',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Laundry included must be a boolean' })
  laundryIncluded?: boolean;

  @ApiPropertyOptional({
    description: 'Whether meal plan is available',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Meal plan available must be a boolean' })
  mealPlanAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Meal plan cost',
    example: 150.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Meal plan cost must be a number' })
  @Min(0, { message: 'Meal plan cost cannot be negative' })
  mealPlanCost?: number;

  @ApiPropertyOptional({
    description: 'Discounts available',
    type: [Object],
  })
  @IsOptional()
  @IsArray({ message: 'Discounts must be an array' })
  discounts?: Array<{
    type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
    percentage: number;
    description: string;
  }>;
}

export class ContactInfoDto implements IContactInfo {
  @ApiProperty({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'hostel@university.edu',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({
    description: 'Emergency contact number',
    example: '+1234567899',
  })
  @IsNotEmpty({ message: 'Emergency contact is required' })
  @IsString({ message: 'Emergency contact must be a string' })
  emergencyContact: string;

  @ApiProperty({
    description: 'Office hours',
  })
  @IsNotEmpty({ message: 'Office hours is required' })
  @IsObject({ message: 'Office hours must be an object' })
  officeHours: {
    weekdays: {
      open: string;
      close: string;
    };
    weekends?: {
      open: string;
      close: string;
    };
  };
}

export class OperatingHoursDto implements IOperatingHours {
  @ApiProperty({
    description: 'Weekday operating hours',
  })
  @IsNotEmpty({ message: 'Weekday hours is required' })
  @IsObject({ message: 'Weekday hours must be an object' })
  weekdays: {
    open: string;
    close: string;
  };

  @ApiProperty({
    description: 'Weekend operating hours',
  })
  @IsNotEmpty({ message: 'Weekend hours is required' })
  @IsObject({ message: 'Weekend hours must be an object' })
  weekends: {
    open: string;
    close: string;
  };

  @ApiPropertyOptional({
    description: 'Holiday operating information',
  })
  @IsOptional()
  @IsObject({ message: 'Holiday info must be an object' })
  holidays?: {
    closed: boolean;
    exceptions?: string[];
  };
}

export class CreateHostelDto implements ICreateHostelRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Hostel name',
    example: 'University Hostel A',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Hostel name is required' })
  @IsString({ message: 'Hostel name must be a string' })
  @MaxLength(200, { message: 'Hostel name cannot exceed 200 characters' })
  hostelName: string;

  @ApiProperty({
    description: 'Hostel code',
    example: 'HOSTEL-A',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Hostel code is required' })
  @IsString({ message: 'Hostel code must be a string' })
  @MaxLength(20, { message: 'Hostel code cannot exceed 20 characters' })
  hostelCode: string;

  @ApiPropertyOptional({
    description: 'Hostel type',
    example: THostelType.BOYS,
    enum: THostelType,
  })
  @IsOptional()
  @IsEnum(THostelType, { message: 'Invalid hostel type' })
  hostelType?: THostelType;

  @ApiProperty({
    description: 'Address information',
    type: AddressDto,
  })
  @IsNotEmpty({ message: 'Address is required' })
  @ValidateNested()
  address: AddressDto;

  @ApiPropertyOptional({
    description: 'Building number',
    example: 'Building A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Building number must be a string' })
  @MaxLength(20, { message: 'Building number cannot exceed 20 characters' })
  buildingNumber?: string;

  @ApiPropertyOptional({
    description: 'Number of floors',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Floors must be a number' })
  @Min(1, { message: 'Floors must be at least 1' })
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total number of rooms',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Total rooms must be a number' })
  @Min(0, { message: 'Total rooms cannot be negative' })
  totalRooms?: number;

  @ApiPropertyOptional({
    description: 'Total number of beds',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Total beds must be a number' })
  @Min(0, { message: 'Total beds cannot be negative' })
  totalBeds?: number;

  @ApiPropertyOptional({
    description: 'Warden ID',
    example: 'warden-uuid-456',
  })
  @IsOptional()
  @IsString({ message: 'Warden ID must be a string' })
  wardenId?: string;

  @ApiPropertyOptional({
    description: 'Warden name',
    example: 'Dr. John Smith',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Warden name must be a string' })
  @MaxLength(100, { message: 'Warden name cannot exceed 100 characters' })
  wardenName?: string;

  @ApiPropertyOptional({
    description: 'Warden contact',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Warden contact must be a string' })
  @MaxLength(20, { message: 'Warden contact cannot exceed 20 characters' })
  wardenContact?: string;

  @ApiPropertyOptional({
    description: 'Assistant warden ID',
    example: 'assistant-warden-uuid-789',
  })
  @IsOptional()
  @IsString({ message: 'Assistant warden ID must be a string' })
  assistantWardenId?: string;

  @ApiPropertyOptional({
    description: 'Assistant warden name',
    example: 'Ms. Jane Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Assistant warden name must be a string' })
  @MaxLength(100, { message: 'Assistant warden name cannot exceed 100 characters' })
  assistantWardenName?: string;

  @ApiPropertyOptional({
    description: 'Facilities available',
    type: [FacilityDto],
  })
  @IsOptional()
  @IsArray({ message: 'Facilities must be an array' })
  @ValidateNested({ each: true })
  facilities?: FacilityDto[];

  @ApiPropertyOptional({
    description: 'Hostel rules and policies',
    type: HostelRulesDto,
  })
  @IsOptional()
  @ValidateNested()
  rules?: HostelRulesDto;

  @ApiPropertyOptional({
    description: 'Pricing information',
    type: HostelPricingDto,
  })
  @IsOptional()
  @ValidateNested()
  pricing?: HostelPricingDto;

  @ApiPropertyOptional({
    description: 'Contact information',
    type: ContactInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({
    description: 'Operating hours',
    type: OperatingHoursDto,
  })
  @IsOptional()
  @ValidateNested()
  operatingHours?: OperatingHoursDto;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Modern student accommodation with all amenities',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Amenities',
    example: ['WiFi', 'Laundry', 'Gym'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Amenities must be an array' })
  @IsString({ each: true, message: 'Each amenity must be a string' })
  amenities?: string[];

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Recently renovated with new furniture',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateHostelDto implements IUpdateHostelRequest {
  @ApiPropertyOptional({
    description: 'Hostel name',
    example: 'University Hostel A',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Hostel name must be a string' })
  @MaxLength(200, { message: 'Hostel name cannot exceed 200 characters' })
  hostelName?: string;

  @ApiPropertyOptional({
    description: 'Hostel type',
    example: THostelType.BOYS,
    enum: THostelType,
  })
  @IsOptional()
  @IsEnum(THostelType, { message: 'Invalid hostel type' })
  hostelType?: THostelType;

  @ApiPropertyOptional({
    description: 'Hostel status',
    example: THostelStatus.ACTIVE,
    enum: THostelStatus,
  })
  @IsOptional()
  @IsEnum(THostelStatus, { message: 'Invalid hostel status' })
  status?: THostelStatus;

  @ApiPropertyOptional({
    description: 'Address information',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  address?: AddressDto;

  @ApiPropertyOptional({
    description: 'Warden ID',
    example: 'warden-uuid-456',
  })
  @IsOptional()
  @IsString({ message: 'Warden ID must be a string' })
  wardenId?: string;

  @ApiPropertyOptional({
    description: 'Warden name',
    example: 'Dr. John Smith',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Warden name must be a string' })
  @MaxLength(100, { message: 'Warden name cannot exceed 100 characters' })
  wardenName?: string;

  @ApiPropertyOptional({
    description: 'Warden contact',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Warden contact must be a string' })
  @MaxLength(20, { message: 'Warden contact cannot exceed 20 characters' })
  wardenContact?: string;

  @ApiPropertyOptional({
    description: 'Facilities available',
    type: [FacilityDto],
  })
  @IsOptional()
  @IsArray({ message: 'Facilities must be an array' })
  @ValidateNested({ each: true })
  facilities?: FacilityDto[];

  @ApiPropertyOptional({
    description: 'Hostel rules and policies',
    type: HostelRulesDto,
  })
  @IsOptional()
  @ValidateNested()
  rules?: HostelRulesDto;

  @ApiPropertyOptional({
    description: 'Pricing information',
    type: HostelPricingDto,
  })
  @IsOptional()
  @ValidateNested()
  pricing?: HostelPricingDto;

  @ApiPropertyOptional({
    description: 'Contact information',
    type: ContactInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({
    description: 'Operating hours',
    type: OperatingHoursDto,
  })
  @IsOptional()
  @ValidateNested()
  operatingHours?: OperatingHoursDto;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Modern student accommodation with all amenities',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Amenities',
    example: ['WiFi', 'Laundry', 'Gym'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Amenities must be an array' })
  @IsString({ each: true, message: 'Each amenity must be a string' })
  amenities?: string[];

  @ApiPropertyOptional({
    description: 'Internal notes',
    example: 'Updated facilities and amenities',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}