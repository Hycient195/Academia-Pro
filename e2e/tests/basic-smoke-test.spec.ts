import { test, expect } from '@playwright/test';

test('application loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Academia Pro')).toBeVisible();
});

test('sign-in page loads', async ({ page }) => {
  await page.goto('/auth/sign-in');
  await expect(page.locator('text=Sign In')).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});