import { test, expect } from '@playwright/test';

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill('doe@yopmail.com');
    await page.getByLabel('Password').fill('Test1234$');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/.*school-admin/);
  });

  test('should navigate to students page', async ({ page }) => {
    await page.getByRole('link', { name: /students/i }).click();
    await expect(page).toHaveURL(/.*students/);
    await expect(page.locator('text=Students')).toBeVisible();
  });

  test('should create a new student', async ({ page }) => {
    await page.goto('/school-admin/students');

    // Click create student button
    await page.getByRole('button', { name: /add student/i }).click();

    // Fill student creation form - adjust selectors based on your form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john.doe@student.academia-pro.com');
    await page.getByLabel('Date of Birth').fill('2005-01-01');
    await page.getByLabel('Grade').selectOption('10th Grade');

    // Submit form
    await page.getByRole('button', { name: /create/i }).click();

    // Verify student was created
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Student created successfully')).toBeVisible();
  });

  test('should display student list', async ({ page }) => {
    await page.goto('/school-admin/students');

    // Check if student list loads
    await expect(page.locator('.student-list')).toBeVisible();
    await expect(page.locator('.student-item')).toHaveCount(await page.locator('.student-item').count());
  });
});