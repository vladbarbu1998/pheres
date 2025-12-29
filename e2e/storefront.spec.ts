import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Storefront Navigation', () => {
  test('homepage loads with main navigation links', async ({ page }) => {
    await page.goto(routes.home);
    
    // Check page title
    await expect(page).toHaveTitle(/Pheres/i);
    
    // Verify main navigation links are visible (use first() for multiple matches)
    await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /our story/i }).first()).toBeVisible();
  });

  test('navigates to Shop page', async ({ page }) => {
    await page.goto(routes.home);
    const shopLink = page.getByRole('link', { name: /shop/i }).first();
    await shopLink.scrollIntoViewIfNeeded();
    await shopLink.click();
    
    await expect(page).toHaveURL(/\/shop/);
  });

  test('navigates to Our Story page', async ({ page }) => {
    await page.goto(routes.home);
    const storyLink = page.getByRole('link', { name: /our story/i }).first();
    await storyLink.scrollIntoViewIfNeeded();
    await storyLink.click();
    
    await expect(page).toHaveURL(/\/story/);
  });

  test('navigates to Contact page', async ({ page }) => {
    await page.goto(routes.home);
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    await contactLink.scrollIntoViewIfNeeded();
    await contactLink.click();
    
    await expect(page).toHaveURL(/\/contact/);
  });
});

test.describe('Shop Page', () => {
  test('displays products grid or empty state', async ({ page }) => {
    await page.goto(routes.shop);
    await page.waitForLoadState('networkidle');
    
    // Check for product cards using stable data-testid
    const productCards = page.getByTestId('product-card');
    const emptyState = page.getByTestId('empty-state');
    
    // Either products are visible or empty state is shown
    const hasProducts = await productCards.count() > 0;
    const isEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasProducts || isEmpty).toBe(true);
  });
});

test.describe('Footer', () => {
  test('footer is visible', async ({ page }) => {
    await page.goto(routes.home);
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check for footer
    await expect(page.locator('footer')).toBeVisible();
  });
});
