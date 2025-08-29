# @academia-pro/common

Shared TypeScript types and interfaces for the Academia Pro school management system.

## Overview

This package contains all the shared TypeScript types, interfaces, and validation schemas used across the Academia Pro application. It ensures type consistency between the frontend and backend, and provides a centralized location for all data models.

## Installation

```bash
# Install as a dependency in your project
npm install @academia-pro/common

# Or for development
npm install ../common --save-dev
```

## Usage

### Basic Import
```typescript
import { User, School, Student } from '@academia-pro/common';

// Use the types in your code
const user: User = {
  id: '123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student',
  // ... other properties
};
```

### Module-Specific Types
```typescript
import {
  CreateUserRequest,
  UpdateProfileRequest,
  UserListResponse
} from '@academia-pro/common';

// Use in API calls or forms
const createUser = async (data: CreateUserRequest) => {
  // API call implementation
};
```

### Validation Schemas
```typescript
import {
  createUserSchema,
  updateProfileSchema
} from '@academia-pro/common';

// Validate data
const result = createUserSchema.safeParse(userData);
if (result.success) {
  // Data is valid
  console.log(result.data);
} else {
  // Handle validation errors
  console.error(result.error);
}
```

## Package Structure

```
src/
├── index.ts                    # Main entry point
├── shared/                     # Common types used across modules
│   ├── types.ts               # Base entities, enums, interfaces
│   └── validation/            # Common validation schemas
├── modules/                   # Module-specific types
│   ├── user-management/
│   │   └── types.ts          # User, auth, profile types
│   ├── student-management/
│   │   └── types.ts          # Student, enrollment types
│   ├── academic-management/
│   │   └── types.ts          # Curriculum, subjects, grades
│   ├── attendance-management/
│   │   └── types.ts          # Attendance, tracking types
│   ├── examination-assessment/
│   │   └── types.ts          # Exams, results, grading
│   ├── fee-management/
│   │   └── types.ts          # Payments, billing, scholarships
│   ├── timetable-scheduling/
│   │   └── types.ts          # Schedules, resources, conflicts
│   ├── communication-notification/
│   │   └── types.ts          # Messages, notifications, alerts
│   ├── library-management/
│   │   └── types.ts          # Books, circulation, catalog
│   ├── transportation-management/
│   │   └── types.ts          # Routes, vehicles, tracking
│   ├── hostel-management/
│   │   └── types.ts          # Accommodation, residents, facilities
│   ├── staff-hr-management/
│   │   └── types.ts          # Employees, payroll, training
│   ├── inventory-asset-management/
│   │   └── types.ts          # Assets, procurement, maintenance
│   ├── reports-analytics/
│   │   └── types.ts          # Reports, dashboards, metrics
│   ├── parent-portal/
│   │   └── types.ts          # Parent access, communication
│   ├── student-portal/
│   │   └── types.ts          # Student self-service
│   ├── online-learning/
│   │   └── types.ts          # E-learning, courses, assessments
│   ├── security-compliance/
│   │   └── types.ts          # Security, audit, compliance
│   ├── integration-capabilities/
│   │   └── types.ts          # Third-party integrations
│   └── mobile-applications/
│       └── types.ts          # Mobile app specific types
├── api/                       # API-related types
│   ├── types.ts              # Request/response types
│   └── endpoints.ts          # API endpoint definitions
├── validation/               # Validation schemas
│   ├── schemas.ts            # Zod validation schemas
│   └── rules.ts              # Validation rules
└── utils/                    # Utility types
    ├── types.ts              # Helper types and utilities
    └── constants.ts          # Application constants
```

## Key Features

### Type Safety
- **Complete TypeScript coverage** for all data models
- **Strict typing** to prevent runtime errors
- **IntelliSense support** in IDEs
- **Compile-time validation** of data structures

### Validation
- **Zod schemas** for runtime data validation
- **Type-safe validation** with detailed error messages
- **Reusable validation rules** across modules
- **Input sanitization** and transformation

### Consistency
- **Standardized naming conventions**
- **Consistent data structures** across modules
- **Shared interfaces** for common entities
- **Versioned types** for API evolution

### Developer Experience
- **Auto-completion** in modern IDEs
- **Documentation** for all types and interfaces
- **Examples** and usage patterns
- **Migration guides** for type changes

## Core Types

### Base Entities
```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}
```

### User Types
```typescript
type UserRole = 'super-admin' | 'school-admin' | 'teacher' | 'student' | 'parent';

interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  schoolId?: string;
  // ... other properties
}
```

### API Response Types
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    timestamp: Date;
    version: string;
    requestId: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Validation Schemas

### Example Usage
```typescript
import { createUserSchema } from '@academia-pro/common';

// Validate user creation data
const validationResult = createUserSchema.safeParse({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student'
});

if (validationResult.success) {
  // Data is valid, proceed with creation
  const userData = validationResult.data;
} else {
  // Handle validation errors
  console.error(validationResult.error.errors);
}
```

## Development

### Building the Package
```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Publishing
```bash
# Build and publish
npm run build
npm publish

# Or publish with specific tag
npm publish --tag beta
```

### Development Workflow
```bash
# Start development mode
npm run dev

# Run tests in watch mode
npm run test:watch

# Generate documentation
npm run docs
```

## Contributing

### Adding New Types
1. **Identify the module** where the type belongs
2. **Create or update** the appropriate module file
3. **Add validation schemas** if needed
4. **Update the main index.ts** to export new types
5. **Add documentation** and examples
6. **Update tests** to cover new types

### Type Organization Guidelines
- **Group related types** in the same module
- **Use consistent naming** conventions
- **Document all interfaces** and types
- **Provide usage examples** in comments
- **Keep types focused** and single-purpose
- **Avoid circular dependencies**

### Validation Schema Guidelines
- **Use Zod** for all validation schemas
- **Provide clear error messages**
- **Include type transformations** when needed
- **Support optional fields** appropriately
- **Validate complex business rules**

## Versioning

This package follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for breaking changes
- **MINOR** version for new features
- **PATCH** version for bug fixes

## Dependencies

### Runtime Dependencies
- **zod**: ^3.22.0 - Runtime type validation

### Development Dependencies
- **@types/node**: ^20.0.0 - Node.js type definitions
- **typescript**: ^5.0.0 - TypeScript compiler
- **jest**: ^29.0.0 - Testing framework
- **eslint**: ^8.0.0 - Code linting

## License

MIT License - see LICENSE file for details.

## Support

For questions, issues, or contributions:

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and get help
- **Documentation**: Comprehensive guides and examples
- **Discord**: Community support and discussions

---

**This package is the foundation for type safety and consistency across the entire Academia Pro ecosystem.**