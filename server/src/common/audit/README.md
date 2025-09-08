# Academia Pro Audit System Documentation

## Overview

The Academia Pro audit system provides comprehensive logging and monitoring capabilities across all major modules. This system ensures compliance, security, and operational visibility for the entire application.

## Features

- **Comprehensive Logging**: All CRUD operations are logged with detailed context
- **Performance Monitoring**: Track response times and system performance
- **Security Alerts**: Monitor suspicious activities and security events
- **Compliance Reporting**: Generate reports for regulatory compliance
- **Real-time Analytics**: Monitor system usage and performance metrics
- **Module-Specific Audit Events**: Custom audit methods for each module's unique operations
- **Bulk Operation Sampling**: Optimized logging for high-volume operations
- **Data Sanitization**: Automatic redaction of sensitive information

## Architecture

### Core Components

1. **AuditService**: Central service for logging audit events
2. **AuditInterceptor**: Automatically logs HTTP requests/responses
3. **AuditMiddleware**: Logs middleware-level events
4. **Audit Decorators**: Declarative audit configuration
5. **Audit Entities**: Database schema for audit logs
6. **Module-Specific Audit Methods**: Custom audit functions for each module

### Database Schema

The audit system uses partitioned tables for optimal performance:

- `audit_logs`: Main audit log table
- `audit_logs_YYYY_MM`: Monthly partitions
- `student_audit_logs`: Specialized student audit logs

## Module Integration Status

### ✅ Academic Module
**Audit Coverage:**
- Curriculum changes and updates
- Course management operations
- Academic policy modifications
- Teacher workload changes
- Bulk academic operations (with sampling)
- Student enrollment modifications
- Substitute teacher assignments
- Syllabus and section management

**Key Audit Methods:**
- `auditCurriculumChange()`: Logs curriculum modifications
- `auditCourseManagement()`: Tracks course-related operations
- `auditAcademicPolicyChange()`: Monitors policy updates
- `auditBulkAcademicOperation()`: Samples bulk operations
- `auditTeacherWorkloadChange()`: Tracks workload modifications

### ✅ Attendance Module
**Audit Coverage:**
- Attendance record modifications
- Bulk attendance updates (with sampling)
- Attendance policy changes
- Student attendance access
- Teacher attendance management
- Automated attendance processing

**Key Audit Methods:**
- `auditAttendanceModification()`: Logs attendance changes
- `auditBulkAttendanceOperation()`: Samples bulk attendance updates
- `auditAttendancePolicyChange()`: Monitors policy modifications
- `auditAttendanceAccess()`: Tracks attendance data access

### ✅ Communication Module
**Audit Coverage:**
- Message sending and delivery
- Announcement creation and distribution
- Notification preferences and settings
- Bulk communication operations (with sampling)
- Template usage and modifications
- Emergency communication alerts
- Communication channel usage

**Key Audit Methods:**
- `auditCommunicationChannelUsage()`: Tracks channel utilization
- `auditBulkCommunicationOperation()`: Samples bulk communications
- `auditEmergencyCommunication()`: Logs emergency alerts
- `auditTemplateUsage()`: Monitors template usage
- `auditCommunicationSettingsChange()`: Tracks settings modifications

### ✅ Staff Module
**Audit Coverage:**
- Staff hiring and onboarding
- Role and permission changes
- Performance reviews and evaluations
- Disciplinary actions and terminations
- Salary and compensation modifications
- Leave and attendance policy changes
- Bulk staff operations (with sampling)

**Key Audit Methods:**
- `auditStaffHiring()`: Logs new staff creation
- `auditStaffTermination()`: Tracks termination events
- `auditPerformanceReview()`: Monitors performance evaluations
- `auditSalaryChange()`: Logs compensation modifications
- `auditBulkStaffOperation()`: Samples bulk staff operations
- `auditLeavePolicyChange()`: Tracks policy modifications

### ✅ Fee Module (Financial)
**Audit Coverage:**
- Fee structure creation and modifications
- Payment processing and verification
- Refund processing and approvals
- Installment plan management
- Bulk financial operations (with sampling)
- Fee calculation and adjustments
- Financial policy changes

**Key Audit Methods:**
- `auditFeeStructureChange()`: Logs fee structure modifications
- `auditPaymentProcessing()`: Tracks payment transactions
- `auditRefundProcessing()`: Monitors refund operations
- `auditBulkFinancialOperation()`: Samples bulk financial operations
- `auditFeeCalculation()`: Logs fee calculations
- `auditInstallmentPlanChange()`: Tracks installment modifications

## Usage

### Basic Logging

```typescript
import { AuditService } from '../security/services/audit.service';

constructor(private auditService: AuditService) {}

async createUser(userData: any) {
  // Log the creation
  await this.auditService.logActivity({
    action: AuditAction.DATA_CREATED,
    resource: 'user',
    resourceId: userId,
    severity: AuditSeverity.MEDIUM,
    userId: currentUserId,
    details: { userData },
  });
}
```

### Using Decorators

```typescript
import { Auditable, AuditCreate } from '../common/audit/auditable.decorator';

@Controller('users')
export class UserController {
  @AuditCreate('user', 'id')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
```

### Module-Specific Custom Audit

```typescript
// In Academic Service
async auditCurriculumChange(curriculumId: string, changeType: string, changes: any, userId: string): Promise<void> {
  await this.auditService.logActivity({
    action: AuditAction.DATA_UPDATED,
    resource: 'curriculum',
    resourceId: curriculumId,
    severity: AuditSeverity.MEDIUM,
    userId,
    details: {
      changeType,
      changes: this.sanitizeAuditData(changes),
      timestamp: new Date(),
      module: 'academic',
      eventType: 'curriculum_change',
    },
  });
}
```

## Configuration

### Environment Variables

```env
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=2555
AUDIT_MAX_BATCH_SIZE=1000
AUDIT_SAMPLING_RATE=0.1
```

### Module Configuration

```typescript
@Module({
  imports: [AuditSharedModule],
  providers: [AcademicService],
})
export class AcademicModule {}
```

## Best Practices

1. **Use Appropriate Severity Levels**:
   - `LOW`: Routine operations (attendance marking, message sending)
   - `MEDIUM`: Important business operations (staff hiring, fee structure changes)
   - `HIGH`: Security-sensitive operations (terminations, refunds, policy changes)
   - `CRITICAL`: System-critical operations (bulk financial operations, emergency communications)

2. **Sanitize Sensitive Data**:
   ```typescript
   details: {
     userData: this.sanitizeData(userData),
   }
   ```

3. **Use Sampling for High-Volume Operations**:
   ```typescript
   @SampleAudit(0.1) // Log 10% of operations
   async bulkOperation() {}
   ```

4. **Include Context**:
   ```typescript
   details: {
     operation: 'bulk_import',
     totalRecords: 1000,
     successCount: 950,
     module: 'academic',
     eventType: 'bulk_enrollment',
   }
   ```

## Performance Optimizations

### Sampling Strategy
- **Bulk Operations**: 10% sampling rate for operations affecting >10 records
- **High-Frequency Events**: 1% sampling for attendance marking, message delivery
- **Financial Operations**: 100% logging for all payment/refund operations
- **Security Events**: 100% logging for all security-related events

### Async Logging
- All audit operations are performed asynchronously
- Non-blocking audit logging to prevent performance impact
- Batch processing for high-volume scenarios

### Data Optimization
- Automatic data sanitization removes sensitive fields
- Compressed storage for large audit payloads
- Partitioned tables for efficient querying
- Retention policies for automatic cleanup

## Security Features

### Data Sanitization
- Automatic redaction of sensitive fields:
  - Passwords, API keys, tokens
  - Bank account numbers, IFSC codes
  - Medical information, SSN
  - Credit card details, CVV

### Access Control
- Role-based access to audit logs
- Encrypted storage for sensitive audit data
- Tamper-proof audit logs with integrity verification

### Compliance Support
- GDPR-compliant data handling
- SOX-compliant financial audit trails
- FERPA-compliant student data protection
- Automatic retention policy enforcement

## Monitoring and Analytics

### Real-time Dashboards

- Audit event volume by module
- Error rates and performance metrics
- Security incident tracking
- Compliance reporting
- Module-specific audit analytics

### Alerts and Notifications

- Configurable thresholds for audit events
- Real-time alerts for security incidents
- Performance degradation notifications
- Compliance violation alerts
- Bulk operation monitoring

## Compliance and Security

### GDPR Compliance

- Data minimization in audit logs
- Automatic data retention policies
- User consent tracking
- Right to erasure support
- Data portability features

### Financial Compliance (SOX)

- Complete audit trail for all financial transactions
- Dual authorization for high-value operations
- Automated reconciliation reporting
- Tamper-evident audit logs

### Educational Compliance (FERPA)

- Student data access tracking
- Parental consent logging
- Data sharing audit trails
- Privacy violation monitoring

## Troubleshooting

### Common Issues

1. **High Volume of Audit Logs**
   - Implement sampling for bulk operations
   - Use appropriate retention policies
   - Archive old logs to separate storage

2. **Performance Impact**
   - Use async logging
   - Implement batch processing
   - Monitor audit service performance

3. **Storage Concerns**
   - Implement data retention policies
   - Use partitioned tables
   - Archive to cost-effective storage

## API Reference

### AuditService Methods

- `logActivity(data: AuditLogData)`: Log a single audit event
- `logActivityWithIntegrity(data: AuditLogData)`: Log with integrity verification
- `logUserCreated(...)`: Convenience method for user creation
- `logUserUpdated(...)`: Convenience method for user updates
- `logSystemConfigChanged(...)`: Log system configuration changes

### Decorators

- `@Auditable(options)`: Generic audit decorator
- `@AuditCreate(resource, resourceId)`: Audit data creation
- `@AuditUpdate(resource, resourceId)`: Audit data updates
- `@AuditDelete(resource, resourceId)`: Audit data deletion
- `@AuditRead(resource, resourceId)`: Audit data access
- `@SampleAudit(rate)`: Sample high-volume operations
- `@MonitorPerformance(threshold)`: Monitor operation performance

### Module-Specific Audit Methods

Each module provides custom audit methods for specific business operations:

**Academic Module:**
- `auditCurriculumChange()`
- `auditCourseManagement()`
- `auditAcademicPolicyChange()`
- `auditBulkAcademicOperation()`
- `auditTeacherWorkloadChange()`

**Staff Module:**
- `auditStaffHiring()`
- `auditStaffTermination()`
- `auditPerformanceReview()`
- `auditSalaryChange()`
- `auditBulkStaffOperation()`

**Fee Module:**
- `auditFeeStructureChange()`
- `auditPaymentProcessing()`
- `auditRefundProcessing()`
- `auditBulkFinancialOperation()`

## Testing

Run the audit integration test:

```bash
cd server
npx ts-node src/test-audit-integration.ts
```

This will verify:
- Audit service injection
- Custom audit methods availability
- Decorator application
- Module imports
- Sampling configuration

## Future Enhancements

- Machine learning-based anomaly detection
- Advanced compliance reporting
- Integration with SIEM systems
- Real-time audit dashboards
- Automated incident response
- Predictive analytics for audit patterns
- Blockchain-based audit log integrity
- Advanced data correlation and analysis