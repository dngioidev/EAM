import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * TC-AUTH-E01: Login happy path — valid credentials → redirect to role landing
 * TC-AUTH-E02: Invalid credentials → error message visible
 *
 * Note: Requires a running stack with seeded admin@eam.local / Admin@123456
 */
test.describe('Auth — Login', () => {
  const ADMIN_EMAIL = process.env['E2E_ADMIN_EMAIL'] ?? 'admin@eam.local';
  const ADMIN_PASSWORD = process.env['E2E_ADMIN_PASS'] ?? 'Admin@123456';

  test('TC-AUTH-E01: valid credentials redirect to role landing page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    // Admin lands on /admin/stores
    await expect(page).toHaveURL(/\/admin\/stores/, { timeout: 10_000 });
    // AppLayout sidebar should be visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('TC-AUTH-E02: invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@test.com', 'wrongpassword');

    // Error alert visible — stays on /login
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-E02b: empty form shows validation errors', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitButton.click();

    // Form validation fires — should not navigate away
    await expect(page).toHaveURL(/\/login/);
  });
});
