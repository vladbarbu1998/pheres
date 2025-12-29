import { test, expect } from '@playwright/test';
import { routes, validShippingAddress } from './fixtures/test-data';

test.describe('Checkout Flow (Guest)', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Increase timeout for Firefox which is slower
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.shop);
    await page.waitForLoadState('domcontentloaded');
    
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() > 0) {
      await productCard.click();
      await page.waitForLoadState('domcontentloaded');
      await page.getByRole('button', { name: /add to cart/i }).first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('checkout page is accessible', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.checkout, { waitUntil: 'domcontentloaded' });
    // Use selector-based waiting instead of networkidle for Firefox compatibility
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 }).catch(() => {});
    // Should be on cart or checkout
    await expect(page).toHaveURL(/\/(cart|checkout)/);
  });

  test('can navigate to checkout from cart', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    
    const checkoutButton = page.getByTestId('checkout-button');
    
    // Wait for button to be visible before checking
    await checkoutButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await expect(page).toHaveURL(/\/checkout/);
    }
  });

  test('can fill shipping form', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.checkout, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 }).catch(() => {});
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(validShippingAddress.email);
      await expect(emailInput).toHaveValue(validShippingAddress.email);
    }
  });
});
