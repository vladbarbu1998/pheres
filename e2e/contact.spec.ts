import { test, expect } from '@playwright/test';
import { routes, validContactForm, invalidContactForm } from './fixtures/test-data';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.contact);
    await page.waitForLoadState('networkidle');
  });

  test('contact page loads correctly', async ({ page }) => {
    // Check for heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for form
    await expect(page.locator('form')).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=/required|please/i')).toBeVisible({ timeout: 3000 });
  });

  test('can fill form with valid data', async ({ page }) => {
    // Fill name
    const nameInput = page.getByLabel(/name/i).first().or(
      page.locator('input[name="name"]')
    );
    await nameInput.fill(validContactForm.name);
    
    // Fill email
    const emailInput = page.getByLabel(/email/i).or(
      page.locator('input[type="email"]')
    );
    await emailInput.fill(validContactForm.email);
    
    // Fill message
    const messageInput = page.getByLabel(/message/i).or(
      page.locator('textarea')
    );
    await messageInput.fill(validContactForm.message);
    
    // Verify fields are filled
    await expect(nameInput).toHaveValue(validContactForm.name);
    await expect(emailInput).toHaveValue(validContactForm.email);
    await expect(messageInput).toHaveValue(validContactForm.message);
  });

  test('submitting valid form shows success message', async ({ page }) => {
    // Fill form
    await page.getByLabel(/name/i).first().or(page.locator('input[name="name"]')).fill(validContactForm.name);
    await page.getByLabel(/email/i).or(page.locator('input[type="email"]')).fill(validContactForm.email);
    await page.getByLabel(/message/i).or(page.locator('textarea')).fill(validContactForm.message);
    
    // Submit
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Should show success message or confirmation
    await expect(
      page.getByText(/thank you|message sent|success|received/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('displays contact information', async ({ page }) => {
    // Check for contact details section
    await expect(page.locator('text=/email|phone|address/i')).toBeVisible();
  });
});

test.describe('Contact Form - Email Validation', () => {
  test('rejects invalid email format', async ({ page }) => {
    await page.goto(routes.contact);
    await page.waitForLoadState('networkidle');
    
    // Fill with invalid email
    await page.getByLabel(/name/i).first().or(page.locator('input[name="name"]')).fill('Test User');
    await page.getByLabel(/email/i).or(page.locator('input[type="email"]')).fill('invalid-email');
    await page.getByLabel(/message/i).or(page.locator('textarea')).fill('Test message');
    
    // Submit
    await page.getByRole('button', { name: /send|submit/i }).click();
    
    // Should show email validation error
    await expect(page.locator('text=/valid email|invalid email/i')).toBeVisible({ timeout: 3000 });
  });
});
