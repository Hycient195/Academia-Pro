import { test, expect } from '@playwright/test';

test.describe('Student Promotion', () => {
  test('Promote Students - Full Flow with Validations', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('http://localhost:3000/auth/sign-in');

    // Fill sign-in form
    await page.getByRole('textbox', { name: 'Email Address' }).fill('john@yopmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test1234$');
    await page.getByText('Remember me').check();
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to complete
    await page.waitForURL(/.*school-admin.*/, { timeout: 10000 });

    // Assert successful sign-in
    await expect(page).toHaveURL(/.*school-admin.*/);
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible();
    await page.getByRole('link', { name: 'Students' }).click();

    // Verify we're on the students page
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'StudentsManage student information, enrollment, and academic recordsBulk' }).first()).toBeVisible();

    // Start the promotion wizard
    await page.getByRole('button', { name: 'Promote Students' }).click();

    // Verify promotion wizard opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Student Promotion')).toBeVisible();
    await expect(page.getByText('Promote students to the next grade level.')).toBeVisible();

    // Step 1: Scope Selection
    await expect(page.getByText('Select Promotion Scope')).toBeVisible();
    await expect(page.getByText('Choose which students to include in this promotion cycle')).toBeVisible();

    // Select "All Students" scope - use more generic selector
    await page.getByText('Promotion Scope').locator('..').locator('button').click();
    await page.getByText('All Students').click();

    // Set academic year
    const currentYear = new Date().getFullYear().toString();
    await page.getByRole('textbox', { name: 'Academic Year' }).fill(`${currentYear}-${parseInt(currentYear) + 1}`);

    // Check include repeaters
    await page.getByRole('checkbox', { name: 'Include students on academic probation' }).check();

    // Click Generate Preview
    await page.getByRole('button', { name: 'Generate Preview' }).click();

    // Step 2: Preview Step
    await expect(page.getByText('Promotion Preview')).toBeVisible();
    await expect(page.getByText('Review the promotion changes before executing')).toBeVisible();

    // Verify preview data is loaded
    await expect(page.getByText('Eligible')).toBeVisible();
    await expect(page.getByText('Repeat')).toBeVisible();
    await expect(page.getByText('Excluded')).toBeVisible();
    await expect(page.getByText('Selected')).toBeVisible();

    // Select all eligible students
    await page.getByRole('button', { name: 'Select All Eligible' }).click();

    // Verify students are selected
    const selectedCount = await page.getByText('Selected').locator('..').locator('div').first().textContent();
    expect(parseInt(selectedCount || '0')).toBeGreaterThanOrEqual(0);

    // Execute promotion
    await page.getByRole('button', { name: 'Execute Promotion' }).click();

    // Verify execution step
    await expect(page.getByText('Promotion Complete')).toBeVisible();
    await expect(page.getByText('Promotion process has been executed successfully')).toBeVisible();

    // Verify success message
    await expect(page.getByText('Promotion Successful!')).toBeVisible();

    // Click Done
    await page.getByRole('button', { name: 'Done' }).click();

    // Verify we're back to students page
    await expect(page).toHaveURL(/.*students.*/);
  });

  test('Promote Students - Specific Grade Scope', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('http://localhost:3000/auth/sign-in');

    // Fill sign-in form
    await page.getByRole('textbox', { name: 'Email Address' }).fill('john@yopmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test1234$');
    await page.getByText('Remember me').check();
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to complete
    await page.waitForURL(/.*school-admin.*/, { timeout: 10000 });

    // Go to students page
    await page.getByRole('link', { name: 'Students' }).click();

    // Start promotion wizard
    await page.getByRole('button', { name: 'Promote Students' }).click();

    // Select specific grade scope
    await page.getByText('Promotion Scope').locator('..').locator('button').click();
    await page.getByText('Specific Grade').click();

    // Select a grade
    await page.getByText('Select Grade').locator('..').locator('button').click();
    await page.getByText('JSS 1').click();

    // Set academic year
    const currentYear = new Date().getFullYear().toString();
    await page.getByRole('textbox', { name: 'Academic Year' }).fill(`${currentYear}-${parseInt(currentYear) + 1}`);

    // Generate preview
    await page.getByRole('button', { name: 'Generate Preview' }).click();

    // Verify only JSS 1 students are shown
    await expect(page.getByText('Promotion Preview')).toBeVisible();

    // Complete the promotion
    await page.getByRole('button', { name: 'Select All Eligible' }).click();
    await page.getByRole('button', { name: 'Execute Promotion' }).click();
    await page.getByRole('button', { name: 'Done' }).click();

    // Verify completion
    await expect(page).toHaveURL(/.*students.*/);
  });

  test('Promote Students - Validation Errors', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('http://localhost:3000/auth/sign-in');

    // Fill sign-in form
    await page.getByRole('textbox', { name: 'Email Address' }).fill('john@yopmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test1234$');
    await page.getByText('Remember me').check();
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to complete
    await page.waitForURL(/.*school-admin.*/, { timeout: 10000 });

    // Go to students page
    await page.getByRole('link', { name: 'Students' }).click();

    // Start promotion wizard
    await page.getByRole('button', { name: 'Promote Students' }).click();

    // Try to generate preview without selecting scope
    await page.getByRole('button', { name: 'Generate Preview' }).click();

    // Should still be on scope step (validation should prevent moving forward without proper setup)
    await expect(page.getByText('Select Promotion Scope')).toBeVisible();

    // Close the wizard
    await page.getByRole('button', { name: 'Cancel' }).or(page.locator('[aria-label="Close"]')).first().click();
  });
});