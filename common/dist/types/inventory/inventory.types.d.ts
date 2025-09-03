export declare enum TAssetCategory {
    FURNITURE = "furniture",
    EQUIPMENT = "equipment",
    ELECTRONICS = "electronics",
    BOOKS = "books",
    SPORTS_EQUIPMENT = "sports_equipment",
    LABORATORY_EQUIPMENT = "laboratory_equipment",
    VEHICLES = "vehicles",
    COMPUTERS = "computers",
    AUDIO_VISUAL = "audio_visual",
    MAINTENANCE_TOOLS = "maintenance_tools",
    OFFICE_SUPPLIES = "office_supplies",
    OTHER = "other"
}
export declare enum TAssetStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    DISPOSED = "disposed",
    LOST = "lost",
    STOLEN = "stolen",
    DAMAGED = "damaged"
}
export declare enum TProcurementStatus {
    REQUESTED = "requested",
    APPROVED = "approved",
    ORDERED = "ordered",
    RECEIVED = "received",
    CANCELLED = "cancelled",
    REJECTED = "rejected"
}
export declare enum TMaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    CONDITION_BASED = "condition_based"
}
export declare enum TMaintenanceStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue"
}
export declare enum TDepreciationMethod {
    STRAIGHT_LINE = "straight_line",
    DECLINING_BALANCE = "declining_balance",
    UNITS_OF_PRODUCTION = "units_of_production"
}
export declare enum TAssetCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    DAMAGED = "damaged"
}
export interface IAsset {
    id: string;
    assetCode: string;
    name: string;
    description?: string;
    category: TAssetCategory;
    status: TAssetStatus;
    location: IAssetLocation;
    procurement: IProcurementInfo;
    financial: IFinancialInfo;
    maintenance: IMaintenanceInfo;
    specifications: IAssetSpecifications;
    assignments: IAssetAssignment[];
    documents: IDocument[];
    schoolId: string;
    assignedToUserId?: string;
    assignedToDepartment?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface IAssetLocation {
    building?: string;
    floor?: string;
    room?: string;
    department?: string;
    custodian?: string;
    custodianContact?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface IProcurementInfo {
    supplier: ISupplier;
    purchaseOrderNumber?: string;
    invoiceNumber?: string;
    purchaseDate: Date;
    warrantyPeriod?: number;
    warrantyExpiryDate?: Date;
    procurementStatus: TProcurementStatus;
    procurementRequest?: IProcurementRequest;
}
export interface ISupplier {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    rating?: number;
}
export interface IProcurementRequest {
    id: string;
    requestedBy: string;
    requestedDate: Date;
    requiredDate: Date;
    justification: string;
    estimatedCost: number;
    approvedBy?: string;
    approvalDate?: Date;
    approvalComments?: string;
    status: TProcurementStatus;
}
export interface IFinancialInfo {
    purchasePrice: number;
    salvageValue: number;
    usefulLife: number;
    depreciationMethod: TDepreciationMethod;
    accumulatedDepreciation: number;
    currentValue: number;
    depreciationSchedule: IDepreciationEntry[];
    insurance?: IInsuranceInfo;
}
export interface IDepreciationEntry {
    period: string;
    depreciationAmount: number;
    accumulatedDepreciation: number;
    currentValue: number;
    calculationDate: Date;
}
export interface IInsuranceInfo {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
    startDate: Date;
    endDate: Date;
    deductible: number;
}
export interface IMaintenanceInfo {
    maintenanceSchedule: IMaintenanceSchedule[];
    maintenanceHistory: IMaintenanceRecord[];
    nextMaintenanceDate?: Date;
    maintenanceCost: number;
    lastMaintenanceDate?: Date;
    maintenanceFrequency?: number;
}
export interface IMaintenanceSchedule {
    id: string;
    type: TMaintenanceType;
    description: string;
    frequency: number;
    estimatedCost: number;
    isActive: boolean;
    createdAt: Date;
}
export interface IMaintenanceRecord {
    id: string;
    type: TMaintenanceType;
    description: string;
    performedBy: string;
    performedDate: Date;
    cost: number;
    status: TMaintenanceStatus;
    findings?: string;
    recommendations?: string;
    nextMaintenanceDate?: Date;
    partsReplaced?: string[];
    documents: IDocument[];
}
export interface IAssetSpecifications {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        unit: 'cm' | 'inch';
    };
    weight?: {
        value: number;
        unit: 'kg' | 'lb';
    };
    powerRequirements?: {
        voltage?: number;
        current?: number;
        power?: number;
        unit: 'V' | 'A' | 'W';
    };
    material?: string;
    color?: string;
    capacity?: string;
    additionalSpecs?: Record<string, any>;
}
export interface IAssetAssignment {
    id: string;
    assignedTo: string;
    assignedBy: string;
    assignedDate: Date;
    returnDate?: Date;
    expectedReturnDate?: Date;
    purpose: string;
    conditionAtAssignment: string;
    conditionAtReturn?: string;
    notes?: string;
    isActive: boolean;
}
export interface IDocument {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
    isVerified: boolean;
    verificationDate?: Date;
    verifiedBy?: string;
}
export interface IInventoryItem {
    id: string;
    itemCode: string;
    name: string;
    description?: string;
    category: string;
    unitOfMeasure: string;
    minimumStock: number;
    maximumStock: number;
    currentStock: number;
    reorderPoint: number;
    unitCost: number;
    supplier: ISupplier;
    location: string;
    lastRestockedDate?: Date;
    expiryDate?: Date;
    isActive: boolean;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateAssetRequest {
    assetCode: string;
    name: string;
    description?: string;
    category: TAssetCategory;
    location: IAssetLocation;
    procurement: Omit<IProcurementInfo, 'procurementStatus'>;
    financial: Omit<IFinancialInfo, 'accumulatedDepreciation' | 'currentValue' | 'depreciationSchedule'>;
    specifications: IAssetSpecifications;
    schoolId: string;
}
export interface IUpdateAssetRequest {
    name?: string;
    description?: string;
    category?: TAssetCategory;
    status?: TAssetStatus;
    location?: IAssetLocation;
    procurement?: Partial<IProcurementInfo>;
    financial?: Partial<IFinancialInfo>;
    specifications?: Partial<IAssetSpecifications>;
}
export interface ICreateProcurementRequest {
    assetName: string;
    category: TAssetCategory;
    estimatedCost: number;
    justification: string;
    requiredDate: Date;
    specifications: IAssetSpecifications;
    schoolId: string;
}
export interface ICreateMaintenanceRequest {
    assetId: string;
    type: TMaintenanceType;
    description: string;
    scheduledDate: Date;
    estimatedCost: number;
    assignedTo: string;
}
export interface IAssetAssignmentRequest {
    assetId: string;
    assignedTo: string;
    expectedReturnDate: Date;
    purpose: string;
    notes?: string;
}
export interface IAssetResponse extends Omit<IAsset, 'procurement' | 'financial' | 'maintenance' | 'assignments' | 'documents' | 'createdBy' | 'updatedBy'> {
    procurementSummary: {
        supplierName: string;
        purchaseDate: Date;
        purchasePrice: number;
        warrantyExpiryDate?: Date;
        procurementStatus: TProcurementStatus;
    };
    financialSummary: {
        currentValue: number;
        accumulatedDepreciation: number;
        depreciationPercentage: number;
        nextDepreciationDate?: Date;
    };
    maintenanceSummary: {
        lastMaintenanceDate?: Date;
        nextMaintenanceDate?: Date;
        totalMaintenanceCost: number;
        maintenanceCount: number;
    };
    assignmentSummary: {
        isCurrentlyAssigned: boolean;
        currentAssignee?: string;
        assignedDate?: Date;
        expectedReturnDate?: Date;
    };
    locationSummary: {
        building?: string;
        room?: string;
        department?: string;
        custodian?: string;
    };
    depreciationPercentage: number;
    daysSinceLastMaintenance: number;
    isWarrantyActive: boolean;
    isOverdueForMaintenance: boolean;
}
export interface IAssetListResponse {
    assets: IAssetResponse[];
    total: number;
    page: number;
    limit: number;
    summary: {
        totalValue: number;
        activeAssets: number;
        maintenanceDue: number;
        depreciationThisMonth: number;
    };
}
export interface IAssetStatisticsResponse {
    totalAssets: number;
    activeAssets: number;
    assetsByCategory: Record<TAssetCategory, number>;
    assetsByStatus: Record<TAssetStatus, number>;
    totalValue: number;
    totalDepreciation: number;
    maintenanceDueCount: number;
    procurementPendingCount: number;
    categoryValueBreakdown: Record<TAssetCategory, number>;
    monthlyDepreciation: number;
    assetsByAge: {
        '0-1_years': number;
        '1-3_years': number;
        '3-5_years': number;
        '5+_years': number;
    };
    topSuppliers: Array<{
        supplierName: string;
        assetCount: number;
        totalValue: number;
    }>;
}
export interface IProcurementResponse extends IProcurementRequest {
    asset?: {
        id: string;
        name: string;
        category: TAssetCategory;
    };
    supplier: ISupplier;
    totalCost: number;
    approvalWorkflow: {
        currentStep: string;
        nextApprover?: string;
        approvalHistory: Array<{
            approvedBy: string;
            approvedAt: Date;
            comments?: string;
            status: TProcurementStatus;
        }>;
    };
}
export interface IMaintenanceResponse extends IMaintenanceRecord {
    asset: {
        id: string;
        name: string;
        assetCode: string;
        category: TAssetCategory;
    };
    performedByUser: {
        id: string;
        firstName: string;
        lastName: string;
        department?: string;
    };
    costBreakdown: {
        laborCost: number;
        partsCost: number;
        totalCost: number;
    };
}
export interface IAssetFilters {
    schoolId: string;
    category?: TAssetCategory;
    status?: TAssetStatus;
    department?: string;
    building?: string;
    custodian?: string;
    procurementStatus?: TProcurementStatus;
    maintenanceDue?: boolean;
    warrantyExpiring?: boolean;
    minValue?: number;
    maxValue?: number;
    purchaseDateFrom?: Date;
    purchaseDateTo?: Date;
    search?: string;
}
export interface IProcurementFilters {
    schoolId: string;
    status?: TProcurementStatus;
    requestedBy?: string;
    approvedBy?: string;
    category?: TAssetCategory;
    minCost?: number;
    maxCost?: number;
    requestDateFrom?: Date;
    requestDateTo?: Date;
}
export interface IMaintenanceFilters {
    schoolId: string;
    assetId?: string;
    type?: TMaintenanceType;
    status?: TMaintenanceStatus;
    assignedTo?: string;
    performedBy?: string;
    scheduledDateFrom?: Date;
    scheduledDateTo?: Date;
}
export interface IAssetValidationRules {
    maxDocuments: number;
    maxAssignments: number;
    maxMaintenanceRecords: number;
    depreciationCalculationFrequency: 'monthly' | 'quarterly' | 'yearly';
    maintenanceReminderDays: number;
    warrantyReminderDays: number;
    requiredFieldsByCategory: Record<TAssetCategory, string[]>;
}
export interface IAssetReport {
    id: string;
    title: string;
    type: 'inventory' | 'maintenance' | 'financial' | 'utilization';
    generatedBy: string;
    generatedAt: Date;
    parameters: Record<string, any>;
    data: any;
    format: 'pdf' | 'excel' | 'csv';
    fileUrl: string;
    expiresAt: Date;
}
export interface IAssetDashboardData {
    summary: {
        totalAssets: number;
        activeAssets: number;
        totalValue: number;
        maintenanceDue: number;
    };
    categoryBreakdown: Array<{
        category: TAssetCategory;
        count: number;
        value: number;
        percentage: number;
    }>;
    statusBreakdown: Array<{
        status: TAssetStatus;
        count: number;
        percentage: number;
    }>;
    maintenanceOverview: {
        dueThisWeek: number;
        dueThisMonth: number;
        overdue: number;
        completedThisMonth: number;
    };
    financialOverview: {
        totalDepreciation: number;
        monthlyDepreciation: number;
        insuranceValue: number;
        maintenanceCostsThisYear: number;
    };
    recentActivities: Array<{
        type: 'procurement' | 'maintenance' | 'assignment' | 'disposal';
        description: string;
        date: Date;
        assetName: string;
    }>;
}
//# sourceMappingURL=inventory.types.d.ts.map