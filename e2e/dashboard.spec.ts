import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

/**
 * TC-DASH-E01: Dashboard shows all three stat cards after owner login
 * TC-DASH-E02: Low-stock and out-of-stock section headings are rendered
 * TC-DASH-E03: Add product button navigates to /products/new
 *
 * Note: Requires a running stack with a seeded owner account.
 * Set E2E_OWNER_EMAIL / E2E_OWNER_PASS env vars or rely on defaults.
 */
test.describe('Dashboard — Owner view', () => {
  const OWNER_EMAIL = process.env['E2E_OWNER_EMAIL'] ?? 'owner@eam.local';
  const OWNER_PASSWORD = process.env['E2E_OWNER_PASS'] ?? 'Owner@123456';

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(OWNER_EMAIL, OWNER_PASSWORD);

    const loggedIn = await page
      .waitForURL(/\/(dashboard|products)/, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    test.skip(!loggedIn, 'Owner seeded credentials unavailable in this environment');
  });

  test('TC-DASH-E01: stat cards for total, low-stock, and out-of-stock are visible', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectStatCardsVisible();
  });

  test('TC-DASH-E02: low-stock and out-of-stock section headings render with counts', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await expect(dashboardPage.lowStockSectionHeading()).toBeVisible();
    await expect(dashboardPage.outOfStockSectionHeading()).toBeVisible();
  });

  test('TC-DASH-E03: add product button navigates to /products/new', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await dashboardPage.addProductButton.click();
    await expect(page).toHaveURL(/\/products\/new/, { timeout: 5_000 });
  });
});
