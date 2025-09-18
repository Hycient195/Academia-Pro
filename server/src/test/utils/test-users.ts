// Test users for end-to-end testing
// These credentials match the users seeded by TestSeederService in tests
// Default password for seeded users: 'Test1234$'
// Usage examples: see getAuthAgent(app, role)

export type TestUserRecord = {
  email: string;
  password: string;
  role: 'super-admin' | 'delegated-super-admin' | 'school-admin' | 'delegated-school-admin' | 'delegated-school-admin' | 'staff' | 'staff' | 'student' | 'parent';
};

export const testUsers: Record<string, TestUserRecord> = {
  'super-admin': {
    email: 'superadmin@example.com',
    password: 'Test1234$',
    role: 'super-admin',
  },
  'delegated-super-admin': {
    email: 'delegatedsuperadmin@example.com',
    password: 'Test1234$',
    role: 'delegated-super-admin',
  },
  'delegated-super-admin-limited': {
    email: 'delegatedsuperadmin-limited@example.com',
    password: 'Test1234$',
    role: 'delegated-super-admin',
  },
  'delegated-super-admin-schools': {
    email: 'delegatedsuperadmin-schools@example.com',
    password: 'Test1234$',
    role: 'delegated-super-admin',
  },
  'delegated-super-admin-analytics': {
    email: 'delegatedsuperadmin-analytics@example.com',
    password: 'Test1234$',
    role: 'delegated-super-admin',
  },
  'school-admin': {
    email: 'schooladmin@example.com',
    password: 'Test1234$',
    role: 'school-admin',
  },
  "delegated-school-admin": {
    email: 'delegatedschoolsdmin@example.com',
    password: 'Test1234$',
    role: 'delegated-school-admin',
  },
  staff: {
    email: 'teacher@example.com',
    password: 'Test1234$',
    role: 'staff',
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
};