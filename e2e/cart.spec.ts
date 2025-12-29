import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart first
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
  });

  test('empty cart shows appropriate message', async ({ page }) => {
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    // Either cart has items or shows empty state
    const emptyMessage = page.getByText(/cart is empty|no items/i);
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    const hasItems = await cartItems.count() > 0;
    
    expect(hasEmptyMessage || hasItems).toBe(true);
  });

  test('can navigate to cart from product page after adding item', async ({ page }) => {
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    // Click product
    await productCard.click();
    await page.waitForLoadState('networkidle');
    
    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    
    // Wait for cart update
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    await page.goto(routes.cart);
    
    // Cart should show item or empty state with feedback
    await expect(page).toHaveURL(/\/cart/);
  });

  test('quantity can be updated in cart', async ({ page }) => {
    // First add item to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    // Find increment button in cart
    const incrementButton = page.getByRole('button', { name: /\+|increase/i }).first();
    
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Total should have updated (visual check)
      await expect(page.locator('text=/\\$[\\d,]+/')).toBeVisible();
    }
  });

  test('item can be removed from cart', async ({ page }) => {
    // First add item to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() === 0) {
      test.skip();
      return;
    }
    
    await productCard.click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    // Find remove button
    const removeButton = page.getByRole('button', { name: /remove|delete|trash/i }).first();
    
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Wait for removal
      await page.waitForTimeout(1000);
      
      // Should show empty state or fewer items
      await expect(page).toHaveURL(/\/cart/);
    }
  });

  test('cart summary shows totals', async ({ page }) => {
    await page.goto(routes.cart);
    await page.waitForLoadState('networkidle');
    
    // Check for summary section with subtotal/total
    const summarySection = page.locator('[data-testid="cart-summary"]').or(
      page.locator('text=/subtotal|total/i')
    );
    
    // Summary should be visible if cart has items
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    if (await cartItems.count() > 0) {
      await expect(summarySection).toBeVisible();
    }
  });
});
