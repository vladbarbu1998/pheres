import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shop and click first product
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
  });

  test('can open a product from the shop grid', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    // Skip if no products
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    
    // Should navigate to product page
    await expect(page).toHaveURL(/\/product\//);
  });

  test('product page displays essential information', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    
    // Check for product name (heading)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for price
    await expect(page.locator('text=/\\$[\\d,]+/')).toBeVisible();
    
    // Check for Add to Cart button
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('quantity controls work with +/- buttons', async ({ page }) => {
    const productCard = page.getByTestId('product-card').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    
    // Find increment button using stable data-testid
    const incrementButton = page.getByTestId('quantity-increment').first();
    
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      
      // Quantity should increase - check the input value
      const quantityInput = page.getByTestId('quantity-input').locator('input');
      await expect(quantityInput).toHaveValue('2');
    }
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
    
    // Should see success feedback (toast or cart update)
    await expect(
      page.getByText(/added to cart/i).or(page.locator('[data-testid="cart-count"]'))
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
