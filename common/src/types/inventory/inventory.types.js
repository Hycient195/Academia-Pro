export var TAssetCategory;
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
})(TAssetCategory || (TAssetCategory = {}));
export var TAssetStatus;
(function (TAssetStatus) {
    TAssetStatus["ACTIVE"] = "active";
    TAssetStatus["INACTIVE"] = "inactive";
    TAssetStatus["MAINTENANCE"] = "maintenance";
    TAssetStatus["DISPOSED"] = "disposed";
    TAssetStatus["LOST"] = "lost";
    TAssetStatus["STOLEN"] = "stolen";
    TAssetStatus["DAMAGED"] = "damaged";
})(TAssetStatus || (TAssetStatus = {}));
export var TProcurementStatus;
(function (TProcurementStatus) {
    TProcurementStatus["REQUESTED"] = "requested";
    TProcurementStatus["APPROVED"] = "approved";
    TProcurementStatus["ORDERED"] = "ordered";
    TProcurementStatus["RECEIVED"] = "received";
    TProcurementStatus["CANCELLED"] = "cancelled";
    TProcurementStatus["REJECTED"] = "rejected";
})(TProcurementStatus || (TProcurementStatus = {}));
export var TMaintenanceType;
(function (TMaintenanceType) {
    TMaintenanceType["PREVENTIVE"] = "preventive";
    TMaintenanceType["CORRECTIVE"] = "corrective";
    TMaintenanceType["PREDICTIVE"] = "predictive";
    TMaintenanceType["CONDITION_BASED"] = "condition_based";
})(TMaintenanceType || (TMaintenanceType = {}));
export var TMaintenanceStatus;
(function (TMaintenanceStatus) {
    TMaintenanceStatus["SCHEDULED"] = "scheduled";
    TMaintenanceStatus["IN_PROGRESS"] = "in_progress";
    TMaintenanceStatus["COMPLETED"] = "completed";
    TMaintenanceStatus["CANCELLED"] = "cancelled";
    TMaintenanceStatus["OVERDUE"] = "overdue";
})(TMaintenanceStatus || (TMaintenanceStatus = {}));
export var TDepreciationMethod;
(function (TDepreciationMethod) {
    TDepreciationMethod["STRAIGHT_LINE"] = "straight_line";
    TDepreciationMethod["DECLINING_BALANCE"] = "declining_balance";
    TDepreciationMethod["UNITS_OF_PRODUCTION"] = "units_of_production";
})(TDepreciationMethod || (TDepreciationMethod = {}));
//# sourceMappingURL=inventory.types.js.map