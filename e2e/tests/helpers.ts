import { Page } from '@playwright/test';

/**
 * Helper function to fill phone inputs with country selector
 * @param page - Playwright page object
 * @param phoneNumber - Phone number without country code
 * @param countryCode - Two-letter country code (default: 'US')
 */
export async function fillPhoneInput(page: Page, phoneNumber: string, countryCode = 'US') {
  // The PhoneInput component has a specific structure:
  // - A Select for country (with role="combobox")
  // - An Input for phone number (type="tel")

  // First, select the country if not default (US)
  if (countryCode !== 'US') {
    // Click the country selector (SelectTrigger)
    await page.locator('button[role="combobox"]').first().click();

    // Select the country from dropdown
    await page.getByRole('option', { name: new RegExp(countryCode, 'i') }).click();
  }

  // Fill the phone number input
  await page.locator('input[type="tel"]').fill(phoneNumber);
}

/**
 * Alternative approach using more specific selectors based on label
 * @param page - Playwright page object
 * @param labelText - Text of the label associated with the phone input
 * @param phoneNumber - Phone number without country code
 * @param countryCode - Two-letter country code (default: 'US')
 */
export async function fillPhoneInputByLabel(page: Page, labelText: string, phoneNumber: string, countryCode = 'US') {
  // Find the phone input container by its label
  const phoneContainer = page.locator('label').filter({ hasText: labelText }).locator('xpath=following-sibling::*').first();

  // Select country if needed
  if (countryCode !== 'US') {
    await phoneContainer.locator('button[role="combobox"]').click();
    await page.getByRole('option', { name: new RegExp(countryCode, 'i') }).click();
  }

  // Fill phone number
  await phoneContainer.locator('input[type="tel"]').fill(phoneNumber);
}

/**
 * Helper function to select from Radix UI Select components
 * @param page - Playwright page object
 * @param labelText - Text of the label for the select
 * @param optionText - Text of the option to select
 */
export async function selectRadixOption(page: Page, labelText: string, optionText: string) {
  // Click the select trigger
  await page.locator(`label:has-text("${labelText}")`).locator('button').click();

  // Select from dropdown
  await page.getByText(optionText, { exact: true }).click();
}

/**
 * Helper function for common authentication flows
 */
export class AuthHelpers {
  static async loginAsSuperAdmin(page: Page, email = 'superadmin@academia-pro.com', password = 'SuperAdminPass123!') {
    await page.goto('/super-admin/auth/sign-in');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/.*super-admin/);
  }

  static async loginAsSchoolAdmin(page: Page, email: string, password: string) {
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
  }

  static async logout(page: Page) {
    await page.getByRole('button', { name: /logout/i }).click();
  }
}

/**
 * Helper function to wait for application to be ready
 */
export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  // Additional checks can be added here
}