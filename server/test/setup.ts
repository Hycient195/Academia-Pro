global.beforeAll(async () => {
  // Global test container setup if needed
  console.log('Setting up test environment...');
});

global.afterAll(async () => {
  // Cleanup global resources
  console.log('Cleaning up test environment...');
});

// Increase timeout for container startup
jest.setTimeout(60000);