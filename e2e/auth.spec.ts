import { test, expect } from '@playwright/test';
import { routes, testUser } from './fixtures/test-data';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto(routes.login);
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    await expect(page.getByLabel(/email/i).or(page.locator('input[type="email"]'))).toBeVisible();
    await expect(page.getByLabel(/password/i).or(page.locator('input[type="password"]'))).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in|login/i })).toBeVisible();
  });

  test('register page loads correctly', async ({ page }) => {
    await page.goto(routes.register);
    await page.waitForLoadState('networkidle');
    
    // Check for registration form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('login form validates required fields', async ({ page }) => {
    await page.goto(routes.login);
    await page.waitForLoadState('networkidle');
    
    // Submit empty form
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    
    // Should show validation errors
    await expect(page.locator('text=/required|please enter/i')).toBeVisible({ timeout: 3000 });
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto(routes.login);
    await page.waitForLoadState('networkidle');
    
    // Fill with invalid credentials
    await page.locator('input[type="email"]').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // Submit
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    
    // Should show error message
    await expect(
      page.getByText(/invalid|incorrect|error|failed/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('forgot password link exists', async ({ page }) => {
    await page.goto(routes.login);
    await page.waitForLoadState('networkidle');
    
    // Check for forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
    await expect(forgotLink).toBeVisible();
  });

  test('register link from login page', async ({ page }) => {
    await page.goto(routes.login);
    await page.waitForLoadState('networkidle');
    
    // Find register/signup link
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});

test.describe('Account Area (requires auth)', () => {
  // These tests require a test user to be logged in
  // In a real setup, you would use a fixture to authenticate
  
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto(routes.accountOverview);
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test('account orders page requires auth', async ({ page }) => {
    await page.goto(routes.accountOrders);
    
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test('account addresses page requires auth', async ({ page }) => {
    await page.goto(routes.accountAddresses);
    
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test('account favorites page requires auth', async ({ page }) => {
    await page.goto(routes.accountFavorites);
    
    await expect(page).toHaveURL(/\/login|\/auth/);
  });
});

// Authenticated user tests - would use auth fixture
test.describe('Authenticated Account Features', () => {
  test.skip('account overview shows user info', async ({ page }) => {
    // This test would require authenticated session
    // Implement with auth fixture:
    // test.use({ storageState: 'e2e/.auth/user.json' });
  });

  test.skip('can view order history', async ({ page }) => {
    // Requires authenticated session
  });

  test.skip('can update account details', async ({ page }) => {
    // Requires authenticated session
  });
});
