# Academia Pro End-to-End Tests

This directory contains end-to-end tests for the Academia Pro application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   cd e2e
   pnpm install
   ```

2. Install Playwright browsers:
   ```bash
   pnpm run install-browsers
   ```

## Running Tests

### Prerequisites
- Ensure PostgreSQL and Redis are running (via Docker Compose):
  ```bash
  docker-compose up postgres redis -d
  ```

### Run all tests
```bash
pnpm test
```

### Run tests with UI mode (interactive)
```bash
pnpm test:ui
```

### Run tests in headed mode (visible browser)
```bash
pnpm test:headed
```

### Debug tests
```bash
pnpm test:debug
```

### View test reports
```bash
pnpm report
```

## TDD Watch Mode

For test-driven development with automatic test execution on file changes:

### Watch mode (auto-run tests on file changes)
```bash
pnpm watch:test
```

### Interactive UI with watch mode
```bash
pnpm watch:ui
```

### Full TDD development mode (with visible browser)
```bash
pnpm dev:tdd
```

This command runs tests with a **visible browser window** so you can watch the tests execute in real-time as you develop. Perfect for understanding test flow and debugging interactions.

### Alternative watch modes

**Headless watch mode** (faster, no browser visible):
```bash
pnpm watch:test
```

**Interactive UI mode** (Playwright's test UI):
```bash
pnpm watch:ui
```

The watch mode monitors:
- `../client/src/**/*` - Frontend source files
- `../server/src/**/*` - Backend source files
- `./tests/**/*` - Test files

Tests automatically run when you save changes to TypeScript/JavaScript files.
```

## Test Structure

- `tests/auth.spec.ts` - Authentication flow tests
- `tests/students.spec.ts` - Student management tests

## Configuration

The tests are configured in `playwright.config.ts` to:
- Automatically start the backend and frontend servers before running tests
- Run tests in parallel across multiple browsers (Chromium, Firefox, WebKit)
- Generate HTML and JUnit reports
- Capture screenshots and videos on failure

## Environment Variables

- `BASE_URL` - Override the base URL for tests (default: http://localhost:3000)
- `CI` - Set to `true` for CI environment (disables server reuse, changes retry behavior)

## Writing Tests

Tests should simulate real user interactions through the UI. Use Playwright's locators and assertions to interact with and verify the application.

### Basic Test Example
```typescript
test('should perform user action', async ({ page }) => {
  await page.goto('/some-page');
  await page.getByRole('button', { name: 'Click me' }).click();
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Handling Phone Inputs with Country Selectors

For phone inputs that include country code selection, use the provided helper functions:

```typescript
import { fillPhoneInput, fillPhoneInputByLabel } from './path/to/helpers';

// Method 1: General phone input filling (default US)
await fillPhoneInput(page, '1234567890');

// Method 2: Phone input with specific country
await fillPhoneInput(page, '2345678901', 'NG'); // Nigeria

// Method 3: Phone input by label (when multiple phone inputs exist)
await fillPhoneInputByLabel(page, 'Phone Number', '3456789012', 'GB');
```

### Handling Radix UI Select Components

For custom select components (like role selection), use this pattern:

```typescript
// Click the select trigger
await page.locator('label:has-text("Role")').locator('button').click();

// Select from dropdown
await page.getByText('School Admin', { exact: true }).click();
```

### Test Data Management

For tests requiring specific data, consider:

```typescript
// Option 1: API setup before tests
test.beforeAll(async () => {
  // Create test user via API
});

// Option 2: UI-based setup
test('setup test data', async ({ page }) => {
  // Create user through UI
  // Then use in subsequent tests
});
```

## CI/CD Integration

For CI pipelines, ensure browsers are installed and the database is available. Example GitHub Actions step:

```yaml
- name: Run E2E Tests
  run: |
    cd e2e
    npm install
    npx playwright install
    npm test
  env:
    CI: true