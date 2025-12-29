import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Product Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
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
    await page.waitForLoadState('networkidle');
    
    // Check for product name and Add to Cart button
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('can add product to cart', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    
    // Click Add to Cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    
    // Should see success feedback (toast) - be specific to avoid matching button text
    await expect(
      page.locator('[data-sonner-toast], [role="status"]').filter({ hasText: /added to cart/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Product Image Gallery', () => {
  test('product images are displayed', async ({ page }) => {
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
    
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    
    // Check for product image
    const productImage = page.locator('img[alt]').first();
    await expect(productImage).toBeVisible();
  });
});
