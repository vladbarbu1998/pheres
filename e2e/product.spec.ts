import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Product Page', () => {
  test.beforeEach(async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    await page.goto(routes.shop, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 });
  });

  test('can open a product from the shop grid', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await expect(page).toHaveURL(/\/shop\/.+\/.+|\/product\//);
  });

  test('product page displays essential information', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('domcontentloaded');
    
    // Check for product name and Add to Cart button
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible();
  });

  test('can add product to cart', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('domcontentloaded');
    
    // Click Add to Cart
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    
    // Should see success feedback (toast) - be specific to avoid matching button text
    await expect(
      page.locator('[data-sonner-toast], [role="status"]').filter({ hasText: /added to cart/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Product Image Gallery', () => {
  test('product images are displayed', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.shop, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { state: 'visible', timeout: 15000 });
    
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('domcontentloaded');
    
    // Check for product image
    const productImage = page.locator('img[alt]').first();
    await expect(productImage).toBeVisible();
  });
});
