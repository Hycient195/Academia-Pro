"use strict";
// Academia Pro - Fee Management Types
// Shared type definitions for fee management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TDiscountType = exports.TPaymentMethod = exports.TPaymentStatus = exports.TFeeStatus = exports.TFeeFrequency = exports.TFeeType = void 0;
// Enums
var TFeeType;
(function (TFeeType) {
    TFeeType["TUITION"] = "tuition";
    TFeeType["TRANSPORT"] = "transport";
    TFeeType["HOSTEL"] = "hostel";
    TFeeType["EXAMINATION"] = "examination";
    TFeeType["LIBRARY"] = "library";
    TFeeType["LABORATORY"] = "laboratory";
    TFeeType["SPORTS"] = "sports";
    TFeeType["MEDICAL"] = "medical";
    TFeeType["ACTIVITY"] = "activity";
    TFeeType["OTHER"] = "other";
})(TFeeType || (exports.TFeeType = TFeeType = {}));
var TFeeFrequency;
(function (TFeeFrequency) {
    TFeeFrequency["ONE_TIME"] = "one_time";
    TFeeFrequency["MONTHLY"] = "monthly";
    TFeeFrequency["QUARTERLY"] = "quarterly";
    TFeeFrequency["SEMI_ANNUAL"] = "semi_annual";
    TFeeFrequency["ANNUAL"] = "annual";
    TFeeFrequency["GRADE_WISE"] = "grade_wise";
})(TFeeFrequency || (exports.TFeeFrequency = TFeeFrequency = {}));
var TFeeStatus;
(function (TFeeStatus) {
    TFeeStatus["PAID"] = "paid";
    TFeeStatus["PENDING"] = "pending";
    TFeeStatus["OVERDUE"] = "overdue";
    TFeeStatus["PARTIAL"] = "partial";
    TFeeStatus["WAIVED"] = "waived";
})(TFeeStatus || (exports.TFeeStatus = TFeeStatus = {}));
var TPaymentStatus;
(function (TPaymentStatus) {
    TPaymentStatus["PENDING"] = "pending";
    TPaymentStatus["PARTIAL"] = "partial";
    TPaymentStatus["COMPLETED"] = "completed";
    TPaymentStatus["OVERDUE"] = "overdue";
    TPaymentStatus["CANCELLED"] = "cancelled";
    TPaymentStatus["REFUNDED"] = "refunded";
})(TPaymentStatus || (exports.TPaymentStatus = TPaymentStatus = {}));
var TPaymentMethod;
(function (TPaymentMethod) {
    TPaymentMethod["CASH"] = "cash";
    TPaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    TPaymentMethod["CHEQUE"] = "cheque";
    TPaymentMethod["ONLINE"] = "online";
    TPaymentMethod["CARD"] = "card";
    TPaymentMethod["WALLET"] = "wallet";
})(TPaymentMethod || (exports.TPaymentMethod = TPaymentMethod = {}));
var TDiscountType;
(function (TDiscountType) {
    TDiscountType["PERCENTAGE"] = "percentage";
    TDiscountType["FIXED"] = "fixed";
    TDiscountType["SCHOLARSHIP"] = "scholarship";
    TDiscountType["SIBLING"] = "sibling";
    TDiscountType["EARLY_BIRD"] = "early_bird";
    TDiscountType["OTHER"] = "other";
})(TDiscountType || (exports.TDiscountType = TDiscountType = {}));
