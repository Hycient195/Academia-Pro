// Test users for end-to-end testing
// These credentials match the users seeded by test-users-seeder.ts
// All users have password: 'Pass1234'
//
// Usage in tests:
// - Use getAuthAgent(app, 'super-admin') for super admin authentication
// - Use getAuthAgent(app, 'school-admin') for school admin authentication
// - Use getAuthAgent(app, 'teacher') for teacher authentication
// - Use getAuthAgent(app, 'student') for student authentication
// - Use getAuthAgent(app, 'parent') for parent authentication
//
// Legacy aliases are provided for backward compatibility

export const testUsers = {
  'super-admin': {
    email: 'superadmin@example.com',
    password: 'Pass1234',
    role: 'super-admin'
  },
  'school-admin': {
    email: 'schooladmin@example.com',
    password: 'Pass1234',
    role: 'school-admin'
  },
  // 'teacher': {
  //   email: 'teacher@example.com',
  //   password: 'Pass1234',
  //   role: 'teacher'
  // },
  'student': {
    email: 'student@example.com',
    password: 'Pass1234',
    role: 'student'
  },
  'parent': {
    email: 'parent@example.com',
    password: 'Pass1234',
    role: 'parent'
  },
  'school-admin-test': {
    email: 'schooladmin@test.com',
    password: 'testpassword',
    role: 'school-admin'
  },
  // Legacy aliases for backward compatibility
  'delegated-super-admin': {
    email: 'superadmin@example.com',
    password: 'Pass1234',
    role: 'super-admin'
  },
  staff: {
    email: 'teacher@example.com',
    password: 'Pass1234',
    role: 'teacher'
  },
};