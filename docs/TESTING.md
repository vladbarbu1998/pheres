# Automated Testing Guide

This document describes how to run the automated test suite for the PHERES e-commerce application.

## Test Stack Overview

- **E2E Tests**: Playwright - Browser automation for full user flow testing
- **Unit/Integration Tests**: Vitest + React Testing Library - Component and logic testing
- **API Mocking**: MSW (Mock Service Worker) - Network request mocking

## Quick Start

```bash
# Install dependencies (including test frameworks)
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Run all unit/integration tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test` | Run Vitest unit/integration tests |
| `npm run test:ui` | Run Vitest with interactive UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright with interactive UI |
| `npm run test:e2e:headed` | Run E2E tests in headed browser mode |
| `npm run test:all` | Run both unit and E2E tests |

## Test Structure

```
├── e2e/                          # Playwright E2E tests
│   ├── fixtures/
│   │   └── test-data.ts          # Shared test data and fixtures
│   ├── storefront.spec.ts        # Navigation and storefront tests
│   ├── product.spec.ts           # Product page tests
│   ├── cart.spec.ts              # Cart functionality tests
│   ├── checkout.spec.ts          # Checkout flow tests
│   ├── contact.spec.ts           # Contact form tests
│   └── auth.spec.ts              # Authentication tests
│
├── src/
│   ├── test/
│   │   ├── setup.ts              # Vitest setup with MSW
│   │   ├── test-utils.tsx        # Custom render with providers
│   │   ├── mocks/
│   │   │   └── handlers.ts       # MSW request handlers
│   │   └── api/
│   │       ├── edge-functions.test.ts  # Edge function tests
│   │       └── security.test.ts        # Security validation tests
│   │
│   ├── components/
│   │   └── shop/__tests__/       # Component tests
│   │
│   └── pages/__tests__/          # Page-level tests
```

## Environment Variables

For E2E testing against different environments:

```bash
# Test against local dev server (default)
npm run test:e2e

# Test against preview/staging
E2E_BASE_URL=https://your-preview.lovable.app npm run test:e2e

# Test against production
E2E_BASE_URL=https://pheres.lovable.app npm run test:e2e
```

### Test User Credentials

For authenticated tests, set these environment variables:

```bash
E2E_TEST_USER_EMAIL=test@pheres.com
E2E_TEST_USER_PASSWORD=TestPassword123!
```

## Writing Tests

### Unit/Integration Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductCard } from '@/components/shop/ProductCard';

describe('ProductCard', () => {
  it('displays product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Diamond Ring')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('can add product to cart', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('[data-testid="product-card"]').first().click();
  await page.getByRole('button', { name: /add to cart/i }).click();
  
  await expect(page.getByText(/added to cart/i)).toBeVisible();
});
```

## Test Data Attributes

For reliable E2E selectors, add `data-testid` attributes:

- `data-testid="product-card"` - Product cards in grid
- `data-testid="cart-item"` - Cart item rows
- `data-testid="cart-summary"` - Cart summary section
- `data-testid="quantity-input"` - Quantity input fields
- `data-testid="empty-state"` - Empty state messages

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm run test -- src/components/shop/__tests__/ProductCard.test.tsx

# Run tests matching pattern
npm run test -- --grep "cart"

# Run with verbose output
npm run test -- --reporter=verbose
```

### Playwright

```bash
# Run specific test file
npx playwright test e2e/cart.spec.ts

# Run in debug mode
npx playwright test --debug

# Show test report
npx playwright show-report
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test
    - run: npm run test:e2e
```

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Determinism**: Avoid flaky tests by using proper waits
3. **Data**: Use fixtures for consistent test data
4. **Selectors**: Prefer `data-testid` for E2E, role queries for unit tests
5. **Mocking**: Mock external APIs in unit tests, use real APIs in E2E

## Troubleshooting

### Common Issues

**Playwright browsers not installed**
```bash
npx playwright install
```

**MSW not intercepting requests**
- Ensure handlers are properly configured
- Check that URLs match your Supabase project

**Tests timing out**
- Increase timeout in playwright.config.ts
- Check for network issues or slow responses

**Flaky tests**
- Use `waitForLoadState('networkidle')`
- Add explicit waits for async operations
