"use strict";
// Academia Pro - Schools Management Types
// Shared type definitions for schools management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSchoolStatus = exports.TSchoolType = void 0;
// Enums
var TSchoolType;
(function (TSchoolType) {
    TSchoolType["PRIMARY"] = "primary";
    TSchoolType["SECONDARY"] = "secondary";
    TSchoolType["MIXED"] = "mixed";
})(TSchoolType || (exports.TSchoolType = TSchoolType = {}));
var TSchoolStatus;
(function (TSchoolStatus) {
    TSchoolStatus["ACTIVE"] = "active";
    TSchoolStatus["INACTIVE"] = "inactive";
    TSchoolStatus["SUSPENDED"] = "suspended";
    TSchoolStatus["CLOSED"] = "closed";
})(TSchoolStatus || (exports.TSchoolStatus = TSchoolStatus = {}));
// All types are exported above with their declarations
//# sourceMappingURL=schools.types.js.map