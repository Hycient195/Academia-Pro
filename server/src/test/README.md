# Integration Tests with Test Containers

This directory contains integration tests for the Academia Pro backend application using Test Containers for isolated PostgreSQL database testing.

## Overview

The integration test setup uses:
- **Test Containers**: Provides isolated PostgreSQL instances for each test run
- **Jest**: Test runner with custom e2e configuration
- **Supertest**: HTTP endpoint testing
- **TypeORM**: Database operations with automatic schema synchronization

## Project Structure

```
server/test/
├── jest-e2e.json          # Jest configuration for e2e tests
├── setup.ts              # Global test setup
├── students.e2e-spec.ts  # Example integration tests
└── README.md             # This file
```

```
server/src/test/
├── database-test.module.ts  # Test database module with PostgreSQL container
└── test-seeder.ts          # Test data seeding utility
```

## Setup

### Prerequisites

1. **Docker**: Required for Test Containers to run PostgreSQL containers
2. **Node.js**: Version 18+ recommended

### Installation

The test dependencies are already configured in `package.json`:

```json
{
  "devDependencies": {
    "@testcontainers/postgresql": "^10.13.2",
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.5.0",
    "supertest": "^7.0.0"
  }
}
```

### Environment Requirements

- Docker must be running
- Port 5432 should be available (Test Containers will use random ports)
- Sufficient memory for Docker containers

## Running Tests

### Run All E2E Tests

```bash
cd server
npm run test:e2e
```

### Run Tests in Watch Mode

```bash
cd server
npm run test:e2e:watch
```

### Run Tests with Debug Mode

```bash
cd server
npm run test:e2e:debug
```

### Run Specific Test File

```bash
cd server
npx jest --config ./test/jest-e2e.json --testPathPattern=students.e2e-spec.ts
```

## Test Structure

### Test Database Module

The `DatabaseTestModule` provides:
- Automatic PostgreSQL container startup
- TypeORM configuration with test database
- Schema synchronization for clean test state
- Container cleanup after tests

### Test Seeder

The `TestSeeder` class provides:
- Consistent test data creation
- School and student seeding
- Data cleanup between tests
- Bulk data generation utilities

### Example Test Structure

```typescript
describe('Students (e2e)', () => {
  let app: INestApplication;
  let container: PostgreSqlContainer;

  beforeAll(async () => {
    // Start PostgreSQL container
    // Configure test module
    // Initialize NestJS app
  }, 60000);

  afterAll(async () => {
    // Close app
    // Stop container
  });

  beforeEach(async () => {
    // Clean database state
  });

  describe('/api/v1/students (GET)', () => {
    it('should return empty array when no students exist', () => {
      // Test implementation
    });
  });
});
```

## Configuration

### Jest E2E Configuration (`jest-e2e.json`)

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage-e2e",
  "testEnvironment": "node",
  "testTimeout": 30000,
  "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"]
}
```

### Test Database Configuration

The test database uses:
- **Database**: `test_db`
- **Username**: `test_user`
- **Password**: `test_password`
- **Schema Sync**: `true` (auto-create tables)
- **Drop Schema**: `true` (clean between tests)

## Best Practices

### 1. Test Isolation

Each test should:
- Start with a clean database state
- Not depend on other tests
- Clean up after completion

### 2. Container Management

- Tests automatically start/stop containers
- Use appropriate timeouts (60 seconds for startup)
- Handle container failures gracefully

### 3. Data Seeding

- Use consistent test data
- Avoid hard-coded IDs
- Clean up test data between runs

### 4. Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Troubleshooting

### Common Issues

1. **Docker not running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   Solution: Start Docker daemon

2. **Port conflicts**
   ```
   Error: Port 5432 is already in use
   ```
   Solution: Test Containers use random ports, but ensure 5432 is free

3. **Timeout errors**
   ```
   Timeout - Async callback was not invoked within the 30000 ms timeout
   ```
   Solution: Increase timeout or check Docker performance

4. **Memory issues**
   ```
   Error: Container startup failed
   ```
   Solution: Ensure sufficient memory for Docker containers

### Debug Mode

Run tests in debug mode to inspect container logs:

```bash
cd server
npm run test:e2e:debug
```

## Extending Tests

### Adding New Test Files

1. Create new test file: `test/new-feature.e2e-spec.ts`
2. Follow the established pattern
3. Import required modules and utilities

### Adding New Test Data

1. Extend the `TestSeeder` class
2. Add new seeding methods
3. Update existing tests to use new data

### Custom Database Configuration

Modify `DatabaseTestModule` for:
- Different database versions
- Custom initialization scripts
- Additional database configuration

## Performance Considerations

- **Container Startup**: ~30-60 seconds per test run
- **Memory Usage**: ~100-200MB per container
- **Parallel Execution**: Limited by Docker resources
- **Cleanup**: Automatic container cleanup prevents resource leaks

## CI/CD Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Integration Tests
  run: |
    cd server
    npm run test:e2e
  env:
    DOCKER_HOST: unix:///var/run/docker.sock
```

## Contributing

When adding new integration tests:

1. Follow the established patterns
2. Add appropriate documentation
3. Ensure tests are isolated
4. Update this README if needed
5. Test locally before committing

## Resources

- [Test Containers Documentation](https://testcontainers.com/)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)