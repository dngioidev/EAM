import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PosPage } from './pages/PosPage';

/**
 * TC-ORDER-E01 (P0): Cashier full POS flow
 * Login → /pos → search product → add to cart → confirm payment → invoice number visible
 *
 * Note: Requires a running stack (docker-compose up -d) and seeded DB.
 * Run: npx playwright test e2e/pos.spec.ts --project=chromium
 */
test.describe('POS Flow — TC-ORDER-E01', () => {
  const CASHIER_EMAIL = process.env['E2E_CASHIER_EMAIL'] ?? 'cashier@eam.local';
  const CASHIER_PASSWORD = process.env['E2E_CASHIER_PASS'] ?? 'Cashier@123';

  test('cashier can complete a full sale and see invoice number', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const posPage = new PosPage(page);

    // Step 1: Login as cashier
    await loginPage.goto();
    await loginPage.login(CASHIER_EMAIL, CASHIER_PASSWORD);

    // Should be redirected to /pos after login (role-based landing)
    await expect(page).toHaveURL(/\/pos/, { timeout: 10_000 });

    // Step 2: Search for a product
    await posPage.searchProduct('Sản phẩm');

    // Step 3: Add first result to cart
    await posPage.addFirstResultToCart();
    await expect(posPage.cartItems).toHaveCount(1, { timeout: 5_000 });

    // Step 4: Confirm payment
    await posPage.confirmPayment();

    // Step 5: Invoice number displayed after sale
    await expect(posPage.invoiceNumberDisplay).toBeVisible({ timeout: 10_000 });
  });
});
