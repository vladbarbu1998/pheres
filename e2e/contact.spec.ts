import { test, expect } from '@playwright/test';
import { routes, validContactForm } from './fixtures/test-data';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.contact);
    await page.waitForLoadState('networkidle');
  });

  test('contact page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('can fill form with valid data', async ({ page }) => {
    // Fill name - use more specific selector
    const nameInput = page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(validContactForm.name);
    }
    
    // Fill email
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(validContactForm.email);
    }
    
    // Fill message
    const messageInput = page.locator('textarea').first();
    if (await messageInput.isVisible()) {
      await messageInput.fill(validContactForm.message);
      await expect(messageInput).toHaveValue(validContactForm.message);
    }
  });

  test('submitting valid form shows success message', async ({ page }) => {
    // Fill form
    await page.locator('input[name="name"]').first().fill(validContactForm.name);
    await page.locator('input[type="email"]').first().fill(validContactForm.email);
    await page.locator('textarea').first().fill(validContactForm.message);
    
    // Submit
    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();
    
    // Should show success message
    await expect(
      page.getByText(/thank you|message sent|success|received/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
