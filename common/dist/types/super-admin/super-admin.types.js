"use strict";
// Academia Pro - Super Admin Types
// Shared type definitions for super admin module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAuditStatus = exports.TAuditActionType = void 0;
var TAuditActionType;
(function (TAuditActionType) {
    TAuditActionType["LOGIN"] = "LOGIN";
    TAuditActionType["LOGOUT"] = "LOGOUT";
    TAuditActionType["CREATE"] = "CREATE";
    TAuditActionType["UPDATE"] = "UPDATE";
    TAuditActionType["DELETE"] = "DELETE";
    TAuditActionType["VIEW"] = "VIEW";
    TAuditActionType["EXPORT"] = "EXPORT";
})(TAuditActionType || (exports.TAuditActionType = TAuditActionType = {}));
var TAuditStatus;
(function (TAuditStatus) {
    TAuditStatus["SUCCESS"] = "SUCCESS";
    TAuditStatus["FAILED"] = "FAILED";
    TAuditStatus["WARNING"] = "WARNING";
})(TAuditStatus || (exports.TAuditStatus = TAuditStatus = {}));
