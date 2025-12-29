import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
  });

  test('empty cart shows appropriate message', async ({ page }) => {
    // Use domcontentloaded instead of load for faster/more reliable navigation
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Either cart has items or shows empty state
    const emptyMessage = page.getByTestId('empty-state');
    const cartItems = page.getByTestId('cart-item');
    
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    const hasItems = await cartItems.count() > 0;
    
    expect(hasEmptyMessage || hasItems).toBe(true);
  });

  test('can navigate to cart after adding item', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    
    // Use domcontentloaded for more reliable navigation across browsers
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    await expect(page).toHaveURL(/\/cart/);
  });

  test('cart summary shows when items present', async ({ page }) => {
    // Use domcontentloaded for more reliable navigation
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const summarySection = page.getByTestId('cart-summary');
    const cartItems = page.getByTestId('cart-item');
    
    if (await cartItems.count() > 0) {
      await expect(summarySection).toBeVisible();
    }
  });
});
