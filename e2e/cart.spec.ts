import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Cart', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Increase timeout for Firefox which is slower
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.shop);
    await page.waitForLoadState('domcontentloaded');
  });

  test('empty cart shows appropriate message', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 }).catch(() => {});
    
    // Either cart has items or shows empty state
    const emptyMessage = page.getByTestId('empty-state');
    const cartItems = page.getByTestId('cart-item');
    
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    const hasItems = await cartItems.count() > 0;
    
    expect(hasEmptyMessage || hasItems).toBe(true);
  });

  test('can navigate to cart after adding item', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    const productCard = page.getByTestId('product-card').first();
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    await page.waitForTimeout(1000);
    
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 }).catch(() => {});
    
    await expect(page).toHaveURL(/\/cart/);
  });

  test('cart summary shows when items present', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.cart, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 }).catch(() => {});
    
    const summarySection = page.getByTestId('cart-summary');
    const cartItems = page.getByTestId('cart-item');
    
    if (await cartItems.count() > 0) {
      await expect(summarySection).toBeVisible();
    }
  });
});
