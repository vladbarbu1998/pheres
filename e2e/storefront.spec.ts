import { test, expect } from '@playwright/test';
import { routes } from './fixtures/test-data';

test.describe('Storefront Navigation', () => {
  test.beforeEach(async ({ browserName }) => {
    // Increase timeout for Firefox which is slower
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
  });

  test('homepage loads with main navigation links', async ({ page }) => {
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
    
    // Check page title
    await expect(page).toHaveTitle(/Pheres/i);
    
    // Verify main navigation links are visible (use first() for multiple matches)
    await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /our story/i }).first()).toBeVisible();
  });

  test('navigates to Shop page', async ({ page, isMobile }) => {
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('nav', { state: 'visible', timeout: 15000 });
    
    if (isMobile) {
      // Open mobile menu first
      await page.getByRole('button', { name: /toggle menu/i }).click();
      // Wait for menu animation
      await page.waitForTimeout(350);
    }
    
    const shopLink = page.getByRole('link', { name: /shop/i }).first();
    await shopLink.click();
    
    await expect(page).toHaveURL(/\/shop/);
  });

  test('navigates to Our Story page', async ({ page, isMobile }) => {
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('nav', { state: 'visible', timeout: 15000 });
    
    if (isMobile) {
      // Open mobile menu first
      await page.getByRole('button', { name: /toggle menu/i }).click();
      // Wait for menu animation
      await page.waitForTimeout(350);
    }
    
    const storyLink = page.getByRole('link', { name: /our story/i }).first();
    await storyLink.click();
    
    await expect(page).toHaveURL(/\/story/);
  });

  test('navigates to Contact page', async ({ page, isMobile }) => {
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('nav', { state: 'visible', timeout: 15000 });
    
    if (isMobile) {
      // Open mobile menu first
      await page.getByRole('button', { name: /toggle menu/i }).click();
      // Wait for menu animation
      await page.waitForTimeout(350);
    }
    
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    await contactLink.click();
    
    await expect(page).toHaveURL(/\/contact/);
  });
});

test.describe('Shop Page', () => {
  test('displays products grid or empty state', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.setTimeout(60000);
    }
    
    await page.goto(routes.shop, { waitUntil: 'domcontentloaded' });
    
    // Wait for either products to load OR empty state to appear
    // This handles the loading state properly
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 }).catch(() => null),
      page.waitForSelector('[data-testid="empty-state"]', { timeout: 20000 }).catch(() => null),
      // Also wait for potential loading skeleton to disappear
      page.waitForSelector('[data-testid="product-skeleton"]', { state: 'hidden', timeout: 20000 }).catch(() => null),
    ]);
    
    // Give a moment for any animations/transitions
    await page.waitForTimeout(500);
    
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
