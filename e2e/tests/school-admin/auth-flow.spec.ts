import { test, expect } from '@playwright/test';
import { fillPhoneInput, fillPhoneInputByLabel, selectRadixOption, AuthHelpers } from '../helpers';

const testSchoolAdminEmail = `schooladmin-${Date.now()}@test.academia-pro.com`;
const testSchoolAdminPassword = 'TempPassword123!';
const testSchoolAdminNewPassword = 'NewSecurePass123!';

test('school admin authentication flow documentation', async ({ page }) => {
  // This test documents the expected flow for school admin authentication
  // Since we don't have test data setup, we'll create a test that demonstrates
  // the expected behavior and can be used as a template

  test.skip('School Admin Authentication Flow - Requires test data setup', async () => {
    // Step 1: Super Admin creates school admin account
    // - Login as super admin
    // - Navigate to Users section
    // - Create new user with school-admin role
    // - User gets email as temporary password

    // Step 2: School Admin first login
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email Address').fill('schooladmin@test.com');
    await page.getByLabel('Password').fill('schooladmin@test.com'); // Email as temp password
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should trigger password reset modal
    await expect(page.locator('text=Set Your Password')).toBeVisible();

    // Step 3: Reset password
    await page.getByLabel('New Password').fill('NewSecurePass123!');
    await page.getByLabel('Confirm Password').fill('NewSecurePass123!');
    await page.getByRole('button', { name: /set password/i }).click();

    // Should redirect to school admin dashboard
    await page.waitForURL(/.*school-admin/);

    // Step 4: Verify access to school admin features
    await page.getByRole('link', { name: /students/i }).click();
    await page.waitForURL(/.*students/);

    // Step 5: Subsequent login with new password
    await page.getByRole('button', { name: /logout/i }).click();
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email Address').fill('schooladmin@test.com');
    await page.getByLabel('Password').fill('NewSecurePass123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should go directly to dashboard
    await page.waitForURL(/.*school-admin/);
  });
});

test('test application loads and basic navigation works', async ({ page }) => {
  // Basic smoke test to ensure the application loads
  await page.goto('/');

  // Check if the application loads
  await expect(page.locator('text=Academia Pro')).toBeVisible();

  // Navigate to sign-in page
  await page.goto('/auth/sign-in');
  await expect(page.locator('text=Sign In')).toBeVisible();
});

test('school admin login with wrong temporary password fails', async ({ page }) => {
  // This test assumes a school admin account was created in a previous test
  // In a real scenario, you'd set up test data

  await page.goto('/auth/sign-in');

  await page.getByLabel('Email Address').fill(testSchoolAdminEmail);
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Should show error message
  await expect(page.locator('text=Invalid credentials')).toBeVisible();
});

test('phone input component interaction example', async ({ page }) => {
  // This test demonstrates how to interact with phone inputs
  // It can be used as a reference for other tests that need phone input

  test.skip('Phone input interaction patterns - for reference', async () => {
    // Example usage of the phone input helper functions from helpers.ts:

    // Method 1: Using the general helper function (default US +1)
    await fillPhoneInput(page, '1234567890');

    // Method 2: Using country-specific phone number
    await fillPhoneInput(page, '2345678901', 'NG'); // Nigeria +234

    // Method 3: Using label-based approach (if multiple phone inputs exist)
    await fillPhoneInputByLabel(page, 'Phone', '3456789012', 'GB'); // UK +44

    // The phone input component structure from phone-input.tsx:
    // <div class="flex items-center gap-0 rounded-md border border-input...">
    //   <Select value="US"> // Country selector with flag and dial code
    //     <SelectTrigger>🇺🇸 +1</SelectTrigger>
    //     <SelectContent> // Dropdown with countries
    //   </Select>
    //   <Input type="tel" placeholder="Enter phone number" />
    // </div>

    // Playwright interaction strategy:
    // 1. Locate the phone input container
    // 2. If country change needed: click combobox → select option
    // 3. Fill the tel input with phone number

    // For Radix UI selects (like role selection):
    await selectRadixOption(page, 'Role', 'School Admin');

    // For authentication helpers:
    await AuthHelpers.loginAsSuperAdmin(page);
  });
});

test('school admin password reset validation', async ({ page }) => {
  // This test would require setting up a first-time login scenario
  // For now, we'll document the expected behavior

  test.skip('Password reset validation - requires test data setup', async () => {
    // Test password requirements (minimum length, etc.)
    // Test password confirmation mismatch
    // Test empty fields validation
  });
});