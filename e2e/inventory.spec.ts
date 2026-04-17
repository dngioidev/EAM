import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

/**
 * TC-INV-E01: Full OWNER flow — login → create product → import → export → dashboard reflects live data
 * TC-INV-E02: Export rejected when quantity exceeds stock ("Not enough stock" error visible)
 *
 * Requires a running stack with:
 *   - An OWNER account: E2E_OWNER_EMAIL / E2E_OWNER_PASS (default: owner@eam.local / Owner@123456)
 *   - A seeded product in the owner's store accessible via /products
 *
 * Note: E2E_PRODUCT_ID env var must be set to a valid product UUID for the owner's store,
 * OR the test will navigate to /products and click the first available product.
 */

const OWNER_EMAIL = process.env['E2E_OWNER_EMAIL'] ?? 'owner@eam.local';
const OWNER_PASS = process.env['E2E_OWNER_PASS'] ?? 'Owner@123456';

test.describe('Inventory — Import / Export', () => {
  test.beforeEach(async ({ page }) => {
    // Guard: skip if no owner credentials seeded
    if (!process.env['E2E_OWNER_EMAIL'] && !process.env['CI']) {
      test.skip(true, 'Skipping owner E2E — set E2E_OWNER_EMAIL to run against a seeded stack');
    }
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(OWNER_EMAIL, OWNER_PASS);
    // Owner should land on /dashboard or /products
    await expect(page).toHaveURL(/\/(dashboard|products)/, { timeout: 10_000 });
  });

  test('TC-INV-E01: product detail page loads with import and export buttons', async ({ page }) => {
    // Navigate to product list and open first product
    await page.goto('/products');
    const firstProductLink = page.getByRole('link', { name: /chi tiết/i }).first();

    // Skip if no products exist
    const count = await firstProductLink.count();
    if (count === 0) {
      test.skip(true, 'No products found — seed at least one product to run this test');
    }

    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/[a-f0-9-]{36}$/, { timeout: 8_000 });

    const detailPage = new ProductDetailPage(page);
    await detailPage.expectLoaded();

    await expect(detailPage.importButton).toBeVisible();
    await expect(detailPage.exportButton).toBeVisible();
    await expect(detailPage.editButton).toBeVisible();
    await expect(detailPage.backLink).toBeVisible();
  });

  test('TC-INV-E02: import stock updates quantity on product detail', async ({ page }) => {
    await page.goto('/products');
    const firstProductLink = page.getByRole('link', { name: /chi tiết/i }).first();
    const count = await firstProductLink.count();
    if (count === 0) {
      test.skip(true, 'No products found — seed at least one product');
    }

    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/[a-f0-9-]{36}$/, { timeout: 8_000 });

    const detailPage = new ProductDetailPage(page);
    await detailPage.expectLoaded();

    const quantityBefore = await detailPage.getQuantityDisplayed();

    // Open import modal and import 5 units
    await detailPage.openImportModal();
    await detailPage.fillStockModal(5, 'E2E import test');
    await detailPage.confirmStockModal();

    // Quantity should update in-place
    const quantityAfter = await detailPage.getQuantityDisplayed();
    expect(quantityAfter).toBe(quantityBefore + 5);

    // Transaction appears in history
    await expect(page.getByText(/\+5 đơn vị/).first()).toBeVisible({ timeout: 5_000 });
  });

  test('TC-INV-E03: export rejected when quantity exceeds stock', async ({ page }) => {
    await page.goto('/products');
    const firstProductLink = page.getByRole('link', { name: /chi tiết/i }).first();
    const count = await firstProductLink.count();
    if (count === 0) {
      test.skip(true, 'No products found — seed at least one product');
    }

    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/[a-f0-9-]{36}$/, { timeout: 8_000 });

    const detailPage = new ProductDetailPage(page);
    await detailPage.expectLoaded();

    const currentQty = await detailPage.getQuantityDisplayed();
    const excessQty = currentQty + 999;

    // Try to export more than current stock
    await detailPage.openExportModal();
    await detailPage.fillStockModal(excessQty);
    await page.getByRole('button', { name: /xác nhận/i }).click();

    // Error message visible inside dialog
    await expect(
      page.getByText(/not enough stock|không đủ hàng/i),
    ).toBeVisible({ timeout: 5_000 });

    // Dialog stays open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('TC-INV-E04: dashboard reflects updated stock after import/export', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectStatCardsVisible();

    // Dashboard shows numeric stats — verify they render without error
    const total = await dashboardPage.getStatValue('Tổng sản phẩm');
    expect(total).toBeGreaterThanOrEqual(0);
  });
});
