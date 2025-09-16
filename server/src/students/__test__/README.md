erver/src/students/__test__/README.md</path>
<content lines="1-85">
# Student Promotion Integration Tests

This directory contains integration tests for the student promotion functionality in the Academia Pro application.

## Overview

The promotion system allows bulk promotion of students across different scopes:
- **All students**: Promote all active students
- **Grade-specific**: Promote students from a specific grade
- **Section-specific**: Promote students from a specific grade and section
- **Individual students**: Promote specific students by ID

## Test Structure

### Files
- `promotion.e2e-spec.ts` - Main integration test file for promotion functionality

### Test Categories

#### 1. Promotion Service Integration
- Basic promotion request structure validation
- Different promotion scopes validation
- Promotion history structure validation

#### 2. API Endpoint Tests (`/api/v1/students/promotion`)
- **All students promotion**: Tests promoting all students in the system
- **Grade-specific promotion**: Tests promoting students from a specific grade
- **Section-specific promotion**: Tests promoting students from a specific section
- **Individual student promotion**: Tests promoting specific students by ID
- **Repeater handling**: Tests inclusion/exclusion of students on probation
- **Stage boundary crossing**: Tests automatic stage updates when crossing grade boundaries
- **Custom section assignment**: Tests assigning promoted students to custom sections
- **Promotion history creation**: Tests that promotion history is properly recorded
- **Error handling**: Tests validation for invalid requests and edge cases

#### 3. Statistics and Reporting
- Tests for accurate statistics updates after promotion
- Validation of promotion metrics and reporting

## Running the Tests

### Prerequisites
1. Ensure PostgreSQL is running and properly configured
2. Install dependencies: `npm install`
3. Set up environment variables for testing

### Run All Promotion Tests
```bash
npm run test:e2e -- promotion.e2e-spec.ts
```

### Run Specific Test Categories
```bash
# Run only promotion service integration tests
npm run test:e2e -- --testNamePattern="Promotion Service Integration"

# Run only API endpoint tests
npm run test:e2e -- --testNamePattern="/api/v1/students/promotion"
```

### Run with Coverage
```bash
npm run test:cov -- promotion.e2e-spec.ts
```

## Test Data Setup

The tests use a `TestSeeder` utility that creates:
- Test schools with configurable parameters
- Students with various grade codes and sections
- Consistent test data for reliable test execution

### Test Data Helpers
- `seedSchoolWithStudents(gradeCode, count)` - Creates students in a specific grade
- `seedSchoolWithStudentsInSections(gradeCode, sections, countPerSection)` - Creates students across multiple sections
- `clear()` - Cleans up test data between test runs

## Test Scenarios Covered

### Happy Path Scenarios
1. ✅ Promote all students successfully
2. ✅ Promote students by grade
3. ✅ Promote students by section
4. ✅ Promote specific students
5. ✅ Handle repeater inclusion/exclusion
6. ✅ Update stage on boundary crossing
7. ✅ Assign custom sections
8. ✅ Create promotion history

### Edge Cases & Error Handling
1. ✅ Invalid promotion scope
2. ✅ Missing required fields
3. ✅ Empty student lists
4. ✅ Cross-section consolidation

### Data Validation
1. ✅ Promotion history structure
2. ✅ Statistics accuracy
3. ✅ Student state transitions

## API Request/Response Examples

### Promotion Request
```json
{
  "scope": "grade",
  "gradeCode": "JSS3",
  "targetGradeCode": "SSS1",
  "academicYear": "2025",
  "reason": "End of year promotion",
  "includeRepeaters": false,
  "streamSection": "A"
}
```

### Promotion Response
```json
{
  "promotedStudents": 25,
  "studentIds": ["uuid1", "uuid2", "..."],
  "message": "Promotion completed successfully"
}
```

## Dependencies

- `@nestjs/testing` - NestJS testing utilities
- `supertest` - HTTP endpoint testing
- `jest` - Test framework
- Custom test utilities:
  - `TestSeeder` - Test data management
  - `DatabaseTestModule` - Test database configuration

## Best Practices

1. **Isolation**: Each test cleans up data to prevent interference
2. **Consistency**: Use seeded data for predictable test results
3. **Coverage**: Tests cover both success and failure scenarios
4. **Documentation**: Clear test descriptions and comments
5. **Performance**: Tests are optimized for reasonable execution time

## Troubleshooting

### Common Issues
1. **Database connection errors**: Ensure PostgreSQL is running and accessible
2. **Test timeouts**: Increase timeout values for complex operations
3. **Data conflicts**: Ensure proper cleanup between test runs
4. **Type errors**: Check TypeScript types match entity definitions

### Debug Mode
Run tests in debug mode for detailed logging:
```bash
npm run test:debug -- promotion.e2e-spec.ts
```

## Future Enhancements

- Add performance tests for large-scale promotions
- Implement promotion rollback functionality tests
- Add integration tests with external systems (audit logs, notifications)
- Create tests for promotion approval workflows
- Add tests for promotion scheduling and automation