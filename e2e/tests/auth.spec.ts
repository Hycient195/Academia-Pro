import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Academia Pro/);
  });

  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto('/');
    // Assuming there's a link to sign-in, adjust selector as needed
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should sign in successfully', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Fill in credentials - adjust based on your form
    await page.getByLabel('Email').fill('admin@academia-pro.com');
    await page.getByLabel('Password').fill('password123');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to dashboard or home
    await page.waitForURL(/.*(dashboard|home|admin)/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in');

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});