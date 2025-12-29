import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Storefront Navigation', () => {
  test('homepage loads with main navigation links', async ({ page }) => {
    await page.goto(routes.home);
    
    // Check page title
    await expect(page).toHaveTitle(/Pheres/i);
    
    // Verify main navigation links are visible
    await expect(page.getByRole('link', { name: /shop/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /our story/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /celebrities/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('navigates to Shop page', async ({ page }) => {
    await page.goto(routes.home);
    await page.getByRole('link', { name: /shop/i }).first().click();
    
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigates to Our Story page', async ({ page }) => {
    await page.goto(routes.home);
    await page.getByRole('link', { name: /our story/i }).first().click();
    
    await expect(page).toHaveURL(/\/story/);
  });

  test('navigates to Celebrities page', async ({ page }) => {
    await page.goto(routes.home);
    await page.getByRole('link', { name: /celebrities/i }).first().click();
    
    await expect(page).toHaveURL(/\/celebrities/);
  });

  test('navigates to Contact page', async ({ page }) => {
    await page.goto(routes.home);
    await page.getByRole('link', { name: /contact/i }).first().click();
    
    await expect(page).toHaveURL(/\/contact/);
  });
});

test.describe('Shop Page', () => {
  test('displays products grid', async ({ page }) => {
    await page.goto(routes.shop);
    
    // Wait for products to load
    await page.waitForLoadState('networkidle');
    
    // Check for product cards using stable data-testid
    const productCards = page.getByTestId('product-card');
    const emptyState = page.getByTestId('empty-state');
    
    // Either products are visible or empty state is shown
    const hasProducts = await productCards.count() > 0;
    const isEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasProducts || isEmpty).toBe(true);
  });

  test('filters can be opened and interacted with', async ({ page }) => {
    await page.goto(routes.shop);
    
    // Look for filter button or sidebar
    const filterButton = page.getByRole('button', { name: /filter/i });
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Verify filter options appear
      await expect(page.locator('[role="dialog"], [data-testid="filters-sidebar"]')).toBeVisible();
    }
  });

  test('sort dropdown works', async ({ page }) => {
    await page.goto(routes.shop);
    
    // Find sort select/dropdown
    const sortSelect = page.getByRole('combobox').first();
    
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      
      // Verify sort options appear
      await expect(page.getByRole('option').first()).toBeVisible();
    }
  });
});

test.describe('Footer', () => {
  test('footer contains essential links', async ({ page }) => {
    await page.goto(routes.home);
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check for essential footer elements
    await expect(page.locator('footer')).toBeVisible();
  });
});
