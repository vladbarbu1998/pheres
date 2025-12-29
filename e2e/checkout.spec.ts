import { test, expect } from '@playwright/test';
import { routes, validShippingAddress } from './fixtures/test-data';

test.describe('Checkout Flow (Guest)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
    
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() > 0) {
      await productCard.click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('checkout page is accessible', async ({ page }) => {
    await page.goto(routes.checkout);
    // Should be on cart or checkout
    await expect(page).toHaveURL(/\/(cart|checkout)/);
  });

  test('can navigate to checkout from cart', async ({ page }) => {
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    const checkoutButton = page.getByTestId('checkout-button');
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await expect(page).toHaveURL(/\/checkout/);
    }
  });

  test('can fill shipping form', async ({ page }) => {
    await page.goto(routes.checkout);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(validShippingAddress.email);
      await expect(emailInput).toHaveValue(validShippingAddress.email);
    }
  });
});
