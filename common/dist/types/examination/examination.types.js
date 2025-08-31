"use strict";
// Academia Pro - Examination Management Types
// Shared type definitions for examination and assessment management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TQuestionType = exports.TExamResultStatus = exports.TAssessmentType = exports.TGradingMethod = exports.TExamStatus = exports.TExamType = void 0;
// Enums
var TExamType;
(function (TExamType) {
    TExamType["QUIZ"] = "quiz";
    TExamType["MID_TERM"] = "mid_term";
    TExamType["FINAL"] = "final";
    TExamType["PRACTICAL"] = "practical";
    TExamType["PROJECT"] = "project";
    TExamType["ASSIGNMENT"] = "assignment";
    TExamType["PRESENTATION"] = "presentation";
    TExamType["LAB_WORK"] = "lab_work";
    TExamType["COMPREHENSIVE"] = "comprehensive";
    TExamType["ENTRANCE"] = "entrance";
    TExamType["SCHOLARSHIP"] = "scholarship";
    TExamType["OTHER"] = "other";
})(TExamType || (exports.TExamType = TExamType = {}));
var TExamStatus;
(function (TExamStatus) {
    TExamStatus["DRAFT"] = "draft";
    TExamStatus["SCHEDULED"] = "scheduled";
    TExamStatus["PUBLISHED"] = "published";
    TExamStatus["IN_PROGRESS"] = "in_progress";
    TExamStatus["COMPLETED"] = "completed";
    TExamStatus["GRADED"] = "graded";
    TExamStatus["CANCELLED"] = "cancelled";
    TExamStatus["POSTPONED"] = "postponed";
})(TExamStatus || (exports.TExamStatus = TExamStatus = {}));
var TGradingMethod;
(function (TGradingMethod) {
    TGradingMethod["MANUAL"] = "manual";
    TGradingMethod["AUTOMATIC"] = "automatic";
    TGradingMethod["HYBRID"] = "hybrid";
    TGradingMethod["PEER_REVIEW"] = "peer_review";
    TGradingMethod["EXTERNAL"] = "external";
})(TGradingMethod || (exports.TGradingMethod = TGradingMethod = {}));
var TAssessmentType;
(function (TAssessmentType) {
    TAssessmentType["FORMATIVE"] = "formative";
    TAssessmentType["SUMMATIVE"] = "summative";
    TAssessmentType["DIAGNOSTIC"] = "diagnostic";
    TAssessmentType["PLACEMENT"] = "placement";
})(TAssessmentType || (exports.TAssessmentType = TAssessmentType = {}));
var TExamResultStatus;
(function (TExamResultStatus) {
    TExamResultStatus["PENDING"] = "pending";
    TExamResultStatus["SUBMITTED"] = "submitted";
    TExamResultStatus["GRADED"] = "graded";
    TExamResultStatus["LATE_SUBMISSION"] = "late_submission";
    TExamResultStatus["MISSING"] = "missing";
    TExamResultStatus["EXEMPTED"] = "exempted";
})(TExamResultStatus || (exports.TExamResultStatus = TExamResultStatus = {}));
var TQuestionType;
(function (TQuestionType) {
    TQuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    TQuestionType["TRUE_FALSE"] = "true_false";
    TQuestionType["SHORT_ANSWER"] = "short_answer";
    TQuestionType["ESSAY"] = "essay";
    TQuestionType["FILL_IN_BLANK"] = "fill_in_blank";
    TQuestionType["MATCHING"] = "matching";
    TQuestionType["ORDERING"] = "ordering";
})(TQuestionType || (exports.TQuestionType = TQuestionType = {}));
//# sourceMappingURL=examination.types.js.map