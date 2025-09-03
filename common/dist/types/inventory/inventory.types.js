"use strict";
// Academia Pro - Inventory & Asset Management Types
// Shared type definitions for inventory and asset management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAssetCondition = exports.TDepreciationMethod = exports.TMaintenanceStatus = exports.TMaintenanceType = exports.TProcurementStatus = exports.TAssetStatus = exports.TAssetCategory = void 0;
// Enums
var TAssetCategory;
(function (TAssetCategory) {
    TAssetCategory["FURNITURE"] = "furniture";
    TAssetCategory["EQUIPMENT"] = "equipment";
    TAssetCategory["ELECTRONICS"] = "electronics";
    TAssetCategory["BOOKS"] = "books";
    TAssetCategory["SPORTS_EQUIPMENT"] = "sports_equipment";
    TAssetCategory["LABORATORY_EQUIPMENT"] = "laboratory_equipment";
    TAssetCategory["VEHICLES"] = "vehicles";
    TAssetCategory["COMPUTERS"] = "computers";
    TAssetCategory["AUDIO_VISUAL"] = "audio_visual";
    TAssetCategory["MAINTENANCE_TOOLS"] = "maintenance_tools";
    TAssetCategory["OFFICE_SUPPLIES"] = "office_supplies";
    TAssetCategory["OTHER"] = "other";
})(TAssetCategory || (exports.TAssetCategory = TAssetCategory = {}));
var TAssetStatus;
(function (TAssetStatus) {
    TAssetStatus["ACTIVE"] = "active";
    TAssetStatus["INACTIVE"] = "inactive";
    TAssetStatus["MAINTENANCE"] = "maintenance";
    TAssetStatus["DISPOSED"] = "disposed";
    TAssetStatus["LOST"] = "lost";
    TAssetStatus["STOLEN"] = "stolen";
    TAssetStatus["DAMAGED"] = "damaged";
})(TAssetStatus || (exports.TAssetStatus = TAssetStatus = {}));
var TProcurementStatus;
(function (TProcurementStatus) {
    TProcurementStatus["REQUESTED"] = "requested";
    TProcurementStatus["APPROVED"] = "approved";
    TProcurementStatus["ORDERED"] = "ordered";
    TProcurementStatus["RECEIVED"] = "received";
    TProcurementStatus["CANCELLED"] = "cancelled";
    TProcurementStatus["REJECTED"] = "rejected";
})(TProcurementStatus || (exports.TProcurementStatus = TProcurementStatus = {}));
var TMaintenanceType;
(function (TMaintenanceType) {
    TMaintenanceType["PREVENTIVE"] = "preventive";
    TMaintenanceType["CORRECTIVE"] = "corrective";
    TMaintenanceType["PREDICTIVE"] = "predictive";
    TMaintenanceType["CONDITION_BASED"] = "condition_based";
})(TMaintenanceType || (exports.TMaintenanceType = TMaintenanceType = {}));
var TMaintenanceStatus;
(function (TMaintenanceStatus) {
    TMaintenanceStatus["SCHEDULED"] = "scheduled";
    TMaintenanceStatus["IN_PROGRESS"] = "in_progress";
    TMaintenanceStatus["COMPLETED"] = "completed";
    TMaintenanceStatus["CANCELLED"] = "cancelled";
    TMaintenanceStatus["OVERDUE"] = "overdue";
})(TMaintenanceStatus || (exports.TMaintenanceStatus = TMaintenanceStatus = {}));
var TDepreciationMethod;
(function (TDepreciationMethod) {
    TDepreciationMethod["STRAIGHT_LINE"] = "straight_line";
    TDepreciationMethod["DECLINING_BALANCE"] = "declining_balance";
    TDepreciationMethod["UNITS_OF_PRODUCTION"] = "units_of_production";
})(TDepreciationMethod || (exports.TDepreciationMethod = TDepreciationMethod = {}));
var TAssetCondition;
(function (TAssetCondition) {
    TAssetCondition["EXCELLENT"] = "excellent";
    TAssetCondition["GOOD"] = "good";
    TAssetCondition["FAIR"] = "fair";
    TAssetCondition["POOR"] = "poor";
    TAssetCondition["DAMAGED"] = "damaged";
})(TAssetCondition || (exports.TAssetCondition = TAssetCondition = {}));
// All types are exported above with their declarations
//# sourceMappingURL=inventory.types.js.map