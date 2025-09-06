"use strict";
// Academia Pro - Auth Types
// Shared type definitions for authentication module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TLoginAttemptStatus = exports.TSessionStatus = exports.TMFAType = exports.TAuthProvider = void 0;
// Enums
var TAuthProvider;
(function (TAuthProvider) {
    TAuthProvider["LOCAL"] = "local";
    TAuthProvider["GOOGLE"] = "google";
    TAuthProvider["MICROSOFT"] = "microsoft";
    TAuthProvider["FACEBOOK"] = "facebook";
    TAuthProvider["APPLE"] = "apple";
})(TAuthProvider || (exports.TAuthProvider = TAuthProvider = {}));
var TMFAType;
(function (TMFAType) {
    TMFAType["TOTP"] = "totp";
    TMFAType["SMS"] = "sms";
    TMFAType["EMAIL"] = "email";
    TMFAType["PUSH"] = "push";
})(TMFAType || (exports.TMFAType = TMFAType = {}));
var TSessionStatus;
(function (TSessionStatus) {
    TSessionStatus["ACTIVE"] = "active";
    TSessionStatus["EXPIRED"] = "expired";
    TSessionStatus["REVOKED"] = "revoked";
})(TSessionStatus || (exports.TSessionStatus = TSessionStatus = {}));
var TLoginAttemptStatus;
(function (TLoginAttemptStatus) {
    TLoginAttemptStatus["SUCCESS"] = "success";
    TLoginAttemptStatus["FAILED"] = "failed";
    TLoginAttemptStatus["BLOCKED"] = "blocked";
})(TLoginAttemptStatus || (exports.TLoginAttemptStatus = TLoginAttemptStatus = {}));
// All types are exported above with their declarations
