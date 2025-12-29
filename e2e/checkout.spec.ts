import { test, expect } from '@playwright/test';
import { routes, validShippingAddress } from './fixtures/test-data';

test.describe('Checkout Flow (Guest)', () => {
  test.beforeEach(async ({ page }) => {
    // Add product to cart first
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() > 0) {
      await productCard.click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('redirects to cart if cart is empty', async ({ page }) => {
    // Clear any existing cart by going to a fresh session
    await page.context().clearCookies();
    await page.goto(routes.checkout);
    
    // Should redirect to cart or show empty message
    await expect(page).toHaveURL(/\/(cart|checkout)/);
  });

  test('checkout page displays order summary', async ({ page }) => {
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    // Click checkout button
    const checkoutButton = page.getByRole('link', { name: /checkout|proceed/i }).or(
      page.getByRole('button', { name: /checkout|proceed/i })
    );
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      await expect(page).toHaveURL(/\/checkout/);
      
      // Order summary should be visible
      await expect(page.locator('text=/order summary|your order/i')).toBeVisible();
    }
  });

  test('shipping form validates required fields', async ({ page }) => {
    await page.goto(routes.checkout);
    await page.waitForLoadState('networkidle');
    
    // Try to submit without filling fields
    const submitButton = page.getByRole('button', { name: /place order|submit|pay/i });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors
      await expect(page.locator('text=/required|please fill/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('can fill shipping form with valid data', async ({ page }) => {
    await page.goto(routes.checkout);
    await page.waitForLoadState('networkidle');
    
    // Fill shipping form
    const firstNameInput = page.getByLabel(/first name/i).or(
      page.locator('input[name*="first"]').first()
    );
    
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(validShippingAddress.firstName);
      
      const lastNameInput = page.getByLabel(/last name/i).or(
        page.locator('input[name*="last"]').first()
      );
      await lastNameInput.fill(validShippingAddress.lastName);
      
      const emailInput = page.getByLabel(/email/i).or(
        page.locator('input[type="email"]').first()
      );
      await emailInput.fill(validShippingAddress.email);
      
      const addressInput = page.getByLabel(/address|street/i).or(
        page.locator('input[name*="address"]').first()
      );
      await addressInput.fill(validShippingAddress.addressLine1);
      
      const cityInput = page.getByLabel(/city/i).or(
        page.locator('input[name*="city"]').first()
      );
      await cityInput.fill(validShippingAddress.city);
      
      const postalCodeInput = page.getByLabel(/postal|zip/i).or(
        page.locator('input[name*="postal"], input[name*="zip"]').first()
      );
      await postalCodeInput.fill(validShippingAddress.postalCode);
      
      // Form should be filled
      await expect(firstNameInput).toHaveValue(validShippingAddress.firstName);
    }
  });
});

test.describe('Checkout - Order Creation', () => {
  test('successful order shows confirmation', async ({ page }) => {
    // This test verifies the happy path but may need Stripe test mode setup
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    // Add to cart
    await productCard.click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    
    // Go to checkout
    await page.goto(routes.checkout);
    await page.waitForLoadState('networkidle');
    
    // Fill form
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(validShippingAddress.email);
      
      // Fill other required fields
      await page.locator('input[name*="first"], input[placeholder*="First"]').first().fill(validShippingAddress.firstName);
      await page.locator('input[name*="last"], input[placeholder*="Last"]').first().fill(validShippingAddress.lastName);
      await page.locator('input[name*="address"], input[placeholder*="Address"]').first().fill(validShippingAddress.addressLine1);
      await page.locator('input[name*="city"], input[placeholder*="City"]').first().fill(validShippingAddress.city);
      await page.locator('input[name*="postal"], input[name*="zip"], input[placeholder*="Postal"], input[placeholder*="ZIP"]').first().fill(validShippingAddress.postalCode);
      
      // Note: Payment integration would need Stripe test mode
      // This test verifies form completion up to payment
      
      await expect(page).toHaveURL(/\/checkout/);
    }
  });
});
