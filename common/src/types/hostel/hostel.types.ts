// Academia Pro - Hostel Management Types
// Shared type definitions for hostel/dormitory management module

// Enums
export enum THostelType {
  BOYS = 'boys',
  GIRLS = 'girls',
  MIXED = 'mixed',
  INTERNATIONAL = 'international',
  VIP = 'vip',
  STAFF = 'staff',
  GUEST = 'guest',
}

export enum THostelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  CLOSED = 'closed',
  DECOMMISSIONED = 'decommissioned',
}

export enum TRoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  TRIPLE = 'triple',
  QUADRUPLE = 'quadruple',
  SUITE = 'suite',
  DORMITORY = 'dormitory',
  STUDIO = 'studio',
}

export enum TRoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  UNDER_MAINTENANCE = 'under_maintenance',
  OUT_OF_ORDER = 'out_of_order',
  QUARANTINE = 'quarantine',
}

export enum TBedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  OUT_OF_ORDER = 'out_of_order',
  QUARANTINE = 'quarantine',
}

export enum TFacilityType {
  WIFI = 'wifi',
  LAUNDRY = 'laundry',
  GYM = 'gym',
  STUDY_ROOM = 'study_room',
  COMMON_ROOM = 'common_room',
  KITCHEN = 'kitchen',
  DINING_HALL = 'dining_hall',
  SECURITY = 'security',
  PARKING = 'parking',
  GARDEN = 'garden',
  SWIMMING_POOL = 'swimming_pool',
  LIBRARY = 'library',
  COMPUTER_LAB = 'computer_lab',
  MEDICAL_ROOM = 'medical_room',
  PRAYER_ROOM = 'prayer_room',
  GAMES_ROOM = 'games_room',
  TV_ROOM = 'tv_room',
  STORE = 'store',
  CAFETERIA = 'cafeteria',
}

export enum TMaintenanceType {
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  CARPENTRY = 'carpentry',
  PAINTING = 'painting',
  CLEANING = 'cleaning',
  HVAC = 'hvac',
  SECURITY = 'security',
  LANDSCAPING = 'landscaping',
  PEST_CONTROL = 'pest_control',
  OTHER = 'other',
}

export enum TMaintenanceStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
}

export enum TAllocationStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked_out',
  TRANSFERRED = 'transferred',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

// Address Interface
export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Facility Interface
export interface IFacility {
  type: TFacilityType;
  name: string;
  description?: string;
  isAvailable?: boolean;
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
}

// Hostel Rules Interface
export interface IHostelRules {
  checkInTime: string;
  checkOutTime: string;
  visitorsAllowed?: boolean;
  visitorHours?: {
    start: string;
    end: string;
  };
  smokingAllowed?: boolean;
  alcoholAllowed?: boolean;
  petsAllowed?: boolean;
  cookingAllowed?: boolean;
  noisePolicy?: string;
  cleaningSchedule?: string;
  laundryFacilities?: boolean;
  parkingAvailable?: boolean;
  curfewTime?: string;
  additionalRules?: string[];
}

// Hostel Pricing Interface
export interface IHostelPricing {
  baseRent: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';
  securityDeposit?: number;
  maintenanceFee?: number;
  utilitiesIncluded?: boolean;
  internetIncluded?: boolean;
  laundryIncluded?: boolean;
  mealPlanAvailable?: boolean;
  mealPlanCost?: number;
  discounts?: Array<{
    type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
    percentage: number;
    description: string;
  }>;
}

// Contact Info Interface
export interface IContactInfo {
  phone: string;
  email: string;
  emergencyContact: string;
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

// Operating Hours Interface
export interface IOperatingHours {
  weekdays: {
    open: string;
    close: string;
  };
  weekends: {
    open: string;
    close: string;
  };
  holidays?: {
    closed: boolean;
    exceptions?: string[];
  };
}

// Interfaces
export interface IHostel {
  id: string;
  schoolId: string;
  hostelName: string;
  hostelCode: string;
  hostelType: THostelType;
  status: THostelStatus;
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
  buildingNumber?: string;
  floors: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  wardenId?: string;
  wardenName?: string;
  wardenContact?: string;
  assistantWardenId?: string;
  assistantWardenName?: string;
  facilities: Array<{
    type: TFacilityType;
    name: string;
    description?: string;
    isAvailable: boolean;
    operatingHours?: {
      open: string;
      close: string;
      days: string[];
    };
  }>;
  rules: {
    checkInTime: string;
    checkOutTime: string;
    visitorsAllowed: boolean;
    visitorHours?: {
      start: string;
      end: string;
    };
    smokingAllowed: boolean;
    alcoholAllowed: boolean;
    petsAllowed: boolean;
    cookingAllowed: boolean;
    noisePolicy: string;
    cleaningSchedule: string;
    laundryFacilities: boolean;
    parkingAvailable: boolean;
    curfewTime?: string;
    additionalRules?: string[];
  };
  pricing: {
    baseRent: number;
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';
    securityDeposit: number;
    maintenanceFee: number;
    utilitiesIncluded: boolean;
    internetIncluded: boolean;
    laundryIncluded: boolean;
    mealPlanAvailable: boolean;
    mealPlanCost?: number;
    discounts?: Array<{
      type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
      percentage: number;
      description: string;
    }>;
  };
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
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
  };
  operatingHours: {
    weekdays: {
      open: string;
      close: string;
    };
    weekends: {
      open: string;
      close: string;
    };
    holidays?: {
      closed: boolean;
      exceptions?: string[];
    };
  };
  securityFeatures: Array<{
    type: string;
    description: string;
    isActive: boolean;
  }>;
  maintenanceSchedule: {
    regularCleaning: string;
    deepCleaning: string;
    pestControl: string;
    fireSafetyChecks: string;
    electricalInspections: string;
    plumbingChecks: string;
  };
  occupancyRate: number;
  averageStayDuration: number;
  turnoverRate: number;
  description?: string;
  amenities: string[];
  photos: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
    room?: string;
  }>;
  metadata?: {
    yearBuilt?: number;
    lastRenovated?: number;
    energyRating?: string;
    accessibilityFeatures?: string[];
    nearbyFacilities?: string[];
    transportationAccess?: string[];
    tags?: string[];
  };
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface IRoom {
  id: string;
  hostelId: string;
  roomNumber: string;
  floor: number;
  roomType: TRoomType;
  status: TRoomStatus;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  beds: Array<{
    bedNumber: string;
    status: TBedStatus;
    studentId?: string;
    studentName?: string;
  }>;
  facilities: string[];
  amenities: string[];
  monthlyRent: number;
  securityDeposit: number;
  description?: string;
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHostelAllocation {
  id: string;
  hostelId: string;
  roomId: string;
  bedNumber: string;
  studentId: string;
  status: TAllocationStatus;
  allocationDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  expectedCheckOutDate?: Date;
  monthlyRent: number;
  securityDeposit: number;
  securityDepositReturned: boolean;
  securityDepositReturnDate?: Date;
  specialRequests?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaintenanceRequest {
  id: string;
  hostelId: string;
  roomId?: string;
  requestedBy: string;
  maintenanceType: TMaintenanceType;
  status: TMaintenanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  location: string;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Interfaces
export interface ICreateHostelRequest {
  schoolId: string;
  hostelName: string;
  hostelCode: string;
  hostelType?: THostelType;
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
  buildingNumber?: string;
  floors?: number;
  totalRooms?: number;
  totalBeds?: number;
  wardenId?: string;
  wardenName?: string;
  wardenContact?: string;
  assistantWardenId?: string;
  assistantWardenName?: string;
  facilities?: Array<{
    type: TFacilityType;
    name: string;
    description?: string;
    isAvailable?: boolean;
    operatingHours?: {
      open: string;
      close: string;
      days: string[];
    };
  }>;
  rules?: {
    checkInTime: string;
    checkOutTime: string;
    visitorsAllowed?: boolean;
    visitorHours?: {
      start: string;
      end: string;
    };
    smokingAllowed?: boolean;
    alcoholAllowed?: boolean;
    petsAllowed?: boolean;
    cookingAllowed?: boolean;
    noisePolicy?: string;
    cleaningSchedule?: string;
    laundryFacilities?: boolean;
    parkingAvailable?: boolean;
    curfewTime?: string;
    additionalRules?: string[];
  };
  pricing?: {
    baseRent: number;
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';
    securityDeposit?: number;
    maintenanceFee?: number;
    utilitiesIncluded?: boolean;
    internetIncluded?: boolean;
    laundryIncluded?: boolean;
    mealPlanAvailable?: boolean;
    mealPlanCost?: number;
    discounts?: Array<{
      type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
      percentage: number;
      description: string;
    }>;
  };
  contactInfo?: {
    phone: string;
    email: string;
    emergencyContact: string;
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
  };
  operatingHours?: {
    weekdays: {
      open: string;
      close: string;
    };
    weekends: {
      open: string;
      close: string;
    };
    holidays?: {
      closed: boolean;
      exceptions?: string[];
    };
  };
  description?: string;
  amenities?: string[];
  internalNotes?: string;
}

export interface IUpdateHostelRequest {
  hostelName?: string;
  hostelType?: THostelType;
  status?: THostelStatus;
  address?: {
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
  wardenId?: string;
  wardenName?: string;
  wardenContact?: string;
  facilities?: Array<{
    type: TFacilityType;
    name: string;
    description?: string;
    isAvailable?: boolean;
    operatingHours?: {
      open: string;
      close: string;
      days: string[];
    };
  }>;
  rules?: {
    checkInTime?: string;
    checkOutTime?: string;
    visitorsAllowed?: boolean;
    visitorHours?: {
      start: string;
      end: string;
    };
    smokingAllowed?: boolean;
    alcoholAllowed?: boolean;
    petsAllowed?: boolean;
    cookingAllowed?: boolean;
    noisePolicy?: string;
    cleaningSchedule?: string;
    laundryFacilities?: boolean;
    parkingAvailable?: boolean;
    curfewTime?: string;
    additionalRules?: string[];
  };
  pricing?: {
    baseRent?: number;
    currency?: string;
    billingCycle?: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';
    securityDeposit?: number;
    maintenanceFee?: number;
    utilitiesIncluded?: boolean;
    internetIncluded?: boolean;
    laundryIncluded?: boolean;
    mealPlanAvailable?: boolean;
    mealPlanCost?: number;
    discounts?: Array<{
      type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
      percentage: number;
      description: string;
    }>;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: string;
    officeHours?: {
      weekdays?: {
        open: string;
        close: string;
      };
      weekends?: {
        open: string;
        close: string;
      };
    };
  };
  operatingHours?: {
    weekdays?: {
      open: string;
      close: string;
    };
    weekends?: {
      open: string;
      close: string;
    };
    holidays?: {
      closed: boolean;
      exceptions?: string[];
    };
  };
  description?: string;
  amenities?: string[];
  internalNotes?: string;
}

export interface ICreateRoomRequest {
  hostelId: string;
  roomNumber: string;
  floor: number;
  roomType: TRoomType;
  capacity: number;
  facilities?: string[];
  amenities?: string[];
  monthlyRent: number;
  securityDeposit: number;
  description?: string;
}

export interface IAllocateRoomRequest {
  hostelId: string;
  roomId: string;
  bedNumber: string;
  studentId: string;
  allocationDate: string;
  expectedCheckOutDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  specialRequests?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ICreateMaintenanceRequest {
  hostelId: string;
  roomId?: string;
  maintenanceType: TMaintenanceType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  location: string;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  estimatedCost?: number;
}

// Response Interfaces
export interface IHostelResponse extends Omit<IHostel, 'createdBy' | 'updatedBy'> {
  warden?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assistantWarden?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  occupancyStats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  };
  facilitiesCount: number;
  amenitiesCount: number;
}

export interface IRoomResponse extends IRoom {
  hostel?: {
    id: string;
    name: string;
    type: THostelType;
  };
  currentOccupants: Array<{
    studentId: string;
    studentName: string;
    bedNumber: string;
    allocationDate: Date;
  }>;
}

export interface IHostelAllocationResponse extends IHostelAllocation {
  hostel?: {
    id: string;
    name: string;
    address: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    grade: string;
    section: string;
  };
  duration: number; // in days
  totalPaid: number;
  outstandingAmount: number;
}

export interface IMaintenanceRequestResponse extends IMaintenanceRequest {
  hostel?: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    roomNumber: string;
  };
  requestedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedToUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  timeToComplete?: number; // in hours
}

// List Responses
export interface IHostelListResponse {
  hostels: IHostelResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalHostels: number;
    activeHostels: number;
    totalCapacity: number;
    totalOccupied: number;
    overallOccupancyRate: number;
    byType: Record<THostelType, number>;
  };
}

export interface IRoomListResponse {
  rooms: IRoomResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hostel: {
    id: string;
    name: string;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
  };
}

export interface IHostelAllocationListResponse {
  allocations: IHostelAllocationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    activeAllocations: number;
    checkedOutToday: number;
    expectedCheckouts: number;
    totalRevenue: number;
  };
}

// Filter and Query Interfaces
export interface IHostelFilters {
  schoolId: string;
  hostelType?: THostelType;
  status?: THostelStatus;
  wardenId?: string;
  minOccupancyRate?: number;
  maxOccupancyRate?: number;
  hasFacilities?: string[];
  hasAmenities?: string[];
  search?: string;
}

export interface IRoomFilters {
  hostelId: string;
  roomType?: TRoomType;
  status?: TRoomStatus;
  floor?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minRent?: number;
  maxRent?: number;
  availableBeds?: boolean;
}

export interface IHostelAllocationFilters {
  hostelId?: string;
  roomId?: string;
  studentId?: string;
  status?: TAllocationStatus;
  allocationDateFrom?: string;
  allocationDateTo?: string;
  checkOutDateFrom?: string;
  checkOutDateTo?: string;
  expectedCheckOutFrom?: string;
  expectedCheckOutTo?: string;
}

export interface IMaintenanceRequestFilters {
  hostelId?: string;
  roomId?: string;
  maintenanceType?: TMaintenanceType;
  status?: TMaintenanceStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy?: string;
  assignedTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

// Statistics and Analytics
export interface IHostelStatistics {
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  averageStayDuration: number;
  turnoverRate: number;
  byHostelType: Record<THostelType, {
    count: number;
    occupancyRate: number;
    averageRent: number;
  }>;
  byRoomType: Record<TRoomType, {
    count: number;
    occupancyRate: number;
    averageRent: number;
  }>;
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    outstandingPayments: number;
    averageMonthlyRent: number;
  };
  maintenance: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    averageResolutionTime: number;
  };
  trends: {
    occupancy: Array<{
      month: string;
      rate: number;
    }>;
    revenue: Array<{
      month: string;
      amount: number;
    }>;
  };
}

// Student Hostel Dashboard
export interface IStudentHostelDashboardResponse {
  studentId: string;
  currentAllocation?: IHostelAllocationResponse;
  hostelDetails?: {
    id: string;
    name: string;
    address: string;
    contactInfo: {
      phone: string;
      email: string;
      emergencyContact: string;
    };
    facilities: Array<{
      type: TFacilityType;
      name: string;
      isAvailable: boolean;
    }>;
    rules: {
      checkInTime: string;
      checkOutTime: string;
      visitorsAllowed: boolean;
      curfewTime?: string;
    };
  };
  roomDetails?: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: TRoomType;
    facilities: string[];
    amenities: string[];
  };
  roommates?: Array<{
    studentId: string;
    studentName: string;
    bedNumber: string;
  }>;
  paymentHistory: Array<{
    date: Date;
    amount: number;
    description: string;
    status: 'paid' | 'pending' | 'overdue';
  }>;
  outstandingAmount: number;
  nextPaymentDue?: Date;
}

// Bulk Operations
export interface IBulkRoomAllocationRequest {
  allocations: IAllocateRoomRequest[];
}

export interface IBulkMaintenanceUpdateRequest {
  requestIds: string[];
  updates: {
    status?: TMaintenanceStatus;
    assignedTo?: string;
    notes?: string;
    actualCost?: number;
  };
}

// Notification Templates
export interface IHostelNotificationTemplate {
  id: string;
  schoolId: string;
  type: 'allocation_confirmed' | 'check_in_reminder' | 'payment_due' | 'maintenance_completed' | 'rule_violation' | 'check_out_notice';
  subject: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}