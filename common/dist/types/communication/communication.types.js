"use strict";
// Academia Pro - Communication Management Types
// Shared type definitions for communication management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTemplateType = exports.TNoticeType = exports.TNotificationStatus = exports.TNotificationTypeChannel = exports.TRecipientType = exports.TMessageStatus = exports.TMessageType = exports.TMessagePriority = exports.TNotificationType = void 0;
const shared_1 = require("../shared");
Object.defineProperty(exports, "TNotificationType", { enumerable: true, get: function () { return shared_1.TNotificationType; } });
Object.defineProperty(exports, "TMessagePriority", { enumerable: true, get: function () { return shared_1.TMessagePriority; } });
// Enums
var TMessageType;
(function (TMessageType) {
    TMessageType["DIRECT"] = "direct";
    TMessageType["GROUP"] = "group";
    TMessageType["ANNOUNCEMENT"] = "announcement";
    TMessageType["EMERGENCY"] = "emergency";
    TMessageType["SYSTEM"] = "system";
})(TMessageType || (exports.TMessageType = TMessageType = {}));
var TMessageStatus;
(function (TMessageStatus) {
    TMessageStatus["DRAFT"] = "draft";
    TMessageStatus["SENT"] = "sent";
    TMessageStatus["DELIVERED"] = "delivered";
    TMessageStatus["READ"] = "read";
    TMessageStatus["FAILED"] = "failed";
    TMessageStatus["ARCHIVED"] = "archived";
})(TMessageStatus || (exports.TMessageStatus = TMessageStatus = {}));
var TRecipientType;
(function (TRecipientType) {
    TRecipientType["STUDENT"] = "student";
    TRecipientType["PARENT"] = "parent";
    TRecipientType["TEACHER"] = "teacher";
    TRecipientType["ADMIN"] = "admin";
    TRecipientType["STAFF"] = "staff";
    TRecipientType["ALL"] = "all";
    TRecipientType["GROUP"] = "group";
})(TRecipientType || (exports.TRecipientType = TRecipientType = {}));
var TNotificationTypeChannel;
(function (TNotificationTypeChannel) {
    TNotificationTypeChannel["EMAIL"] = "email";
    TNotificationTypeChannel["SMS"] = "sms";
    TNotificationTypeChannel["PUSH"] = "push";
    TNotificationTypeChannel["IN_APP"] = "in_app";
})(TNotificationTypeChannel || (exports.TNotificationTypeChannel = TNotificationTypeChannel = {}));
var TNotificationStatus;
(function (TNotificationStatus) {
    TNotificationStatus["PENDING"] = "pending";
    TNotificationStatus["SENT"] = "sent";
    TNotificationStatus["DELIVERED"] = "delivered";
    TNotificationStatus["FAILED"] = "failed";
    TNotificationStatus["READ"] = "read";
})(TNotificationStatus || (exports.TNotificationStatus = TNotificationStatus = {}));
var TNoticeType;
(function (TNoticeType) {
    TNoticeType["GENERAL"] = "general";
    TNoticeType["ACADEMIC"] = "academic";
    TNoticeType["ADMINISTRATIVE"] = "administrative";
    TNoticeType["EMERGENCY"] = "emergency";
    TNoticeType["EVENT"] = "event";
})(TNoticeType || (exports.TNoticeType = TNoticeType = {}));
var TTemplateType;
(function (TTemplateType) {
    TTemplateType["MESSAGE"] = "message";
    TTemplateType["NOTICE"] = "notice";
    TTemplateType["NOTIFICATION"] = "notification";
    TTemplateType["EMAIL"] = "email";
})(TTemplateType || (exports.TTemplateType = TTemplateType = {}));
