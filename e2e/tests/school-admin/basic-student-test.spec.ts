import { test, expect } from '@playwright/test';

test('basic school admin student page loads', async ({ page }) => {
  // Simple test to check if the student page loads
  await page.goto('http://localhost:3000');

  // Check if the page loads
  await expect(page.locator('text=Academia Pro')).toBeVisible();
});