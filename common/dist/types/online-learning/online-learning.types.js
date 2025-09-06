"use strict";
// Academia Pro - Online Learning Types
// Shared type definitions for online learning and digital education module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCollaborationType = exports.TDiscussionType = exports.TEnrollmentStatus = exports.TProgressStatus = exports.TOnlineLearningAssessmentType = exports.TLearningPathType = exports.TDifficultyLevel = exports.TContentStatus = exports.TContentType = void 0;
// Enums
var TContentType;
(function (TContentType) {
    TContentType["VIDEO"] = "video";
    TContentType["DOCUMENT"] = "document";
    TContentType["PRESENTATION"] = "presentation";
    TContentType["INTERACTIVE"] = "interactive";
    TContentType["ASSESSMENT"] = "assessment";
    TContentType["AUDIO"] = "audio";
    TContentType["IMAGE"] = "image";
    TContentType["TEXT"] = "text";
    TContentType["SIMULATION"] = "simulation";
    TContentType["GAME"] = "game";
})(TContentType || (exports.TContentType = TContentType = {}));
var TContentStatus;
(function (TContentStatus) {
    TContentStatus["DRAFT"] = "draft";
    TContentStatus["REVIEW"] = "review";
    TContentStatus["PUBLISHED"] = "published";
    TContentStatus["ARCHIVED"] = "archived";
    TContentStatus["DEPRECATED"] = "deprecated";
})(TContentStatus || (exports.TContentStatus = TContentStatus = {}));
var TDifficultyLevel;
(function (TDifficultyLevel) {
    TDifficultyLevel["BEGINNER"] = "beginner";
    TDifficultyLevel["INTERMEDIATE"] = "intermediate";
    TDifficultyLevel["ADVANCED"] = "advanced";
    TDifficultyLevel["EXPERT"] = "expert";
})(TDifficultyLevel || (exports.TDifficultyLevel = TDifficultyLevel = {}));
var TLearningPathType;
(function (TLearningPathType) {
    TLearningPathType["SUBJECT"] = "subject";
    TLearningPathType["SKILL"] = "skill";
    TLearningPathType["CAREER"] = "career";
    TLearningPathType["CERTIFICATION"] = "certification";
    TLearningPathType["PERSONAL"] = "personal";
})(TLearningPathType || (exports.TLearningPathType = TLearningPathType = {}));
var TOnlineLearningAssessmentType;
(function (TOnlineLearningAssessmentType) {
    TOnlineLearningAssessmentType["QUIZ"] = "quiz";
    TOnlineLearningAssessmentType["TEST"] = "test";
    TOnlineLearningAssessmentType["EXAM"] = "exam";
    TOnlineLearningAssessmentType["ASSIGNMENT"] = "assignment";
    TOnlineLearningAssessmentType["PROJECT"] = "project";
    TOnlineLearningAssessmentType["PRACTICAL"] = "practical";
})(TOnlineLearningAssessmentType || (exports.TOnlineLearningAssessmentType = TOnlineLearningAssessmentType = {}));
var TProgressStatus;
(function (TProgressStatus) {
    TProgressStatus["NOT_STARTED"] = "not_started";
    TProgressStatus["IN_PROGRESS"] = "in_progress";
    TProgressStatus["COMPLETED"] = "completed";
    TProgressStatus["LOCKED"] = "locked";
    TProgressStatus["EXPIRED"] = "expired";
})(TProgressStatus || (exports.TProgressStatus = TProgressStatus = {}));
var TEnrollmentStatus;
(function (TEnrollmentStatus) {
    TEnrollmentStatus["ACTIVE"] = "active";
    TEnrollmentStatus["COMPLETED"] = "completed";
    TEnrollmentStatus["DROPPED"] = "dropped";
    TEnrollmentStatus["EXPIRED"] = "expired";
    TEnrollmentStatus["SUSPENDED"] = "suspended";
})(TEnrollmentStatus || (exports.TEnrollmentStatus = TEnrollmentStatus = {}));
var TDiscussionType;
(function (TDiscussionType) {
    TDiscussionType["QUESTION"] = "question";
    TDiscussionType["DISCUSSION"] = "discussion";
    TDiscussionType["ANNOUNCEMENT"] = "announcement";
    TDiscussionType["CLARIFICATION"] = "clarification";
})(TDiscussionType || (exports.TDiscussionType = TDiscussionType = {}));
var TCollaborationType;
(function (TCollaborationType) {
    TCollaborationType["GROUP_PROJECT"] = "group_project";
    TCollaborationType["PEER_REVIEW"] = "peer_review";
    TCollaborationType["STUDY_GROUP"] = "study_group";
    TCollaborationType["TUTORING"] = "tutoring";
})(TCollaborationType || (exports.TCollaborationType = TCollaborationType = {}));
