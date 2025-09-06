"use strict";
// Academia Pro - Inventory & Asset Management Types
// Shared type definitions for inventory and asset management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAssetCondition = exports.TMaintenanceStatus = exports.TMaintenanceType = exports.TInventoryMaintenanceStatus = exports.TInventoryMaintenanceType = exports.TProcurementStatus = exports.TAssetStatus = exports.TAssetCategory = exports.TDepreciationMethod = void 0;
const shared_1 = require("../shared");
Object.defineProperty(exports, "TDepreciationMethod", { enumerable: true, get: function () { return shared_1.TDepreciationMethod; } });
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
var TInventoryMaintenanceType;
(function (TInventoryMaintenanceType) {
    TInventoryMaintenanceType["PREVENTIVE"] = "preventive";
    TInventoryMaintenanceType["CORRECTIVE"] = "corrective";
    TInventoryMaintenanceType["PREDICTIVE"] = "predictive";
    TInventoryMaintenanceType["CONDITION_BASED"] = "condition_based";
})(TInventoryMaintenanceType || (exports.TMaintenanceType = exports.TInventoryMaintenanceType = TInventoryMaintenanceType = {}));
var TInventoryMaintenanceStatus;
(function (TInventoryMaintenanceStatus) {
    TInventoryMaintenanceStatus["SCHEDULED"] = "scheduled";
    TInventoryMaintenanceStatus["IN_PROGRESS"] = "in_progress";
    TInventoryMaintenanceStatus["COMPLETED"] = "completed";
    TInventoryMaintenanceStatus["CANCELLED"] = "cancelled";
    TInventoryMaintenanceStatus["OVERDUE"] = "overdue";
})(TInventoryMaintenanceStatus || (exports.TMaintenanceStatus = exports.TInventoryMaintenanceStatus = TInventoryMaintenanceStatus = {}));
var TAssetCondition;
(function (TAssetCondition) {
    TAssetCondition["EXCELLENT"] = "excellent";
    TAssetCondition["GOOD"] = "good";
    TAssetCondition["FAIR"] = "fair";
    TAssetCondition["POOR"] = "poor";
    TAssetCondition["DAMAGED"] = "damaged";
})(TAssetCondition || (exports.TAssetCondition = TAssetCondition = {}));
// All types are exported above with their declarations
