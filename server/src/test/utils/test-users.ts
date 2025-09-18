// Test users for end-to-end testing
// These credentials match the users seeded by TestSeederService in tests
// Default password for seeded users: 'Test1234$'
// Usage examples: see getAuthAgent(app, role)

export type TestUserRecord = {
  email: string;
  password: string;
  role: 'super-admin' | 'delegated-super-admin' | 'school-admin' | 'staff' | 'teacher' | 'student' | 'parent';
};

export const testUsers: Record<string, TestUserRecord> = {
  'super-admin': {
    email: 'superadmin@example.com',
    password: 'Test1234$',
    role: 'super-admin',
  },
  'delegated-super-admin': {
    email: 'superadmin@example.com',
    password: 'Test1234$',
    role: 'super-admin',
  },
  'school-admin': {
    email: 'schooladmin@example.com',
    password: 'Test1234$',
    role: 'school-admin',
  },
  staff: {
    email: 'teacher@example.com',
    password: 'Test1234$',
    role: 'teacher',
  },
  teacher: {
    email: 'teacher@example.com',
    password: 'Test1234$',
    role: 'teacher',
  },
  student: {
    email: 'student@example.com',
    password: 'Test1234$',
    role: 'student',
  },
  parent: {
    email: 'parent@example.com',
    password: 'Test1234$',
    role: 'parent',
  },
  'school-admin-test': {
    email: 'schooladmin@test.com',
    password: 'testpassword',
    role: 'school-admin',
  },
};