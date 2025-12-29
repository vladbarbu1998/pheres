import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for PHERES e-commerce E2E tests
 * 
 * IMPORTANT: By default, tests run against preview/staging to avoid
 * creating real orders or triggering live Stripe payments.
 * 
 * Environment URLs:
 * - Local dev: E2E_BASE_URL=http://localhost:8080
 * - Preview/Staging (default): Uses the Lovable preview URL
 * - Production: E2E_BASE_URL=https://pheres.lovable.app (use with caution!)
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

// Default to staging/preview URL - NEVER run E2E tests against production by default
const STAGING_URL = 'https://683cf750-62ba-4246-9715-c2d4a806f7f2.lovableproject.com';
const LOCAL_URL = 'http://localhost:8080';

// Use staging by default, allow override via env var
const baseURL = process.env.E2E_BASE_URL || (process.env.CI ? STAGING_URL : LOCAL_URL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Only start local dev server when testing locally (not in CI)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: LOCAL_URL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
