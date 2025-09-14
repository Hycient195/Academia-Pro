import { test, expect } from '@playwright/test';

test('simple test that should work', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});