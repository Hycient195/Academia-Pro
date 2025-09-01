"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_guard_1 = require("./src/common/guards/throttler.guard");
const jwt_auth_guard_1 = require("./src/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./src/auth/guards/roles.guard");
const logging_interceptor_1 = require("./src/common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./src/common/interceptors/timeout.interceptor");
const transform_interceptor_1 = require("./src/common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./src/common/filters/all-exceptions.filter");
const logger_service_1 = require("./src/common/services/logger.service");
const email_service_1 = require("./src/common/services/email.service");
const file_upload_service_1 = require("./src/common/services/file-upload.service");
__exportStar(require("./src/common/decorators/roles.decorator"), exports);
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            throttler_guard_1.ThrottlerGuard,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            logging_interceptor_1.LoggingInterceptor,
            timeout_interceptor_1.TimeoutInterceptor,
            transform_interceptor_1.TransformInterceptor,
            all_exceptions_filter_1.AllExceptionsFilter,
            logger_service_1.LoggerService,
            email_service_1.EmailService,
            file_upload_service_1.FileUploadService,
        ],
        exports: [
            throttler_guard_1.ThrottlerGuard,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            logging_interceptor_1.LoggingInterceptor,
            timeout_interceptor_1.TimeoutInterceptor,
            transform_interceptor_1.TransformInterceptor,
            all_exceptions_filter_1.AllExceptionsFilter,
            logger_service_1.LoggerService,
            email_service_1.EmailService,
            file_upload_service_1.FileUploadService,
            config_1.ConfigModule,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map