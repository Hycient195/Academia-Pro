"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTemplateType = exports.TNoticeType = exports.TNotificationStatus = exports.TNotificationType = exports.TRecipientType = exports.TMessageStatus = exports.TMessagePriority = exports.TMessageType = void 0;
var TMessageType;
(function (TMessageType) {
    TMessageType["DIRECT"] = "direct";
    TMessageType["GROUP"] = "group";
    TMessageType["ANNOUNCEMENT"] = "announcement";
    TMessageType["EMERGENCY"] = "emergency";
    TMessageType["SYSTEM"] = "system";
})(TMessageType || (exports.TMessageType = TMessageType = {}));
var TMessagePriority;
(function (TMessagePriority) {
    TMessagePriority["LOW"] = "low";
    TMessagePriority["NORMAL"] = "normal";
    TMessagePriority["HIGH"] = "high";
    TMessagePriority["URGENT"] = "urgent";
})(TMessagePriority || (exports.TMessagePriority = TMessagePriority = {}));
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
var TNotificationType;
(function (TNotificationType) {
    TNotificationType["EMAIL"] = "email";
    TNotificationType["SMS"] = "sms";
    TNotificationType["PUSH"] = "push";
    TNotificationType["IN_APP"] = "in_app";
})(TNotificationType || (exports.TNotificationType = TNotificationType = {}));
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
//# sourceMappingURL=communication.types.js.map