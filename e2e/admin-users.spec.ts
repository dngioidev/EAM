import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

/**
 * TC-ADMIN-E01: Admin user list page renders with stats and pagination controls
 * TC-ADMIN-E02: Admin can disable and re-enable a non-admin account
 *
 * Note: Requires a running stack with seeded admin credentials.
 */
test.describe('Admin Users Flow — Sprint 7', () => {
  const ADMIN_EMAIL = process.env['E2E_ADMIN_EMAIL'] ?? 'admin@eam.local';
  const ADMIN_PASSWORD = process.env['E2E_ADMIN_PASS'] ?? 'Admin@123456';

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const loggedIn = await page
      .waitForURL(/\/admin\/stores/, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    test.skip(!loggedIn, 'Admin seeded credentials unavailable in this environment');
  });

  test('TC-ADMIN-E01: list, stats, and pagination are visible', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page);

    await adminUsersPage.goto();
    await adminUsersPage.expectLoaded();

    await expect(page.getByText('Tổng người dùng')).toBeVisible();
    await expect(page.getByText('Người dùng bị khóa')).toBeVisible();
    await expect(page.getByText('Tổng sản phẩm')).toBeVisible();
    await expect(page.getByText('Tổng giao dịch')).toBeVisible();

    await expect(adminUsersPage.previousPageButton).toBeVisible();
    await expect(adminUsersPage.nextPageButton).toBeVisible();

    const rowCount = await adminUsersPage.usersTableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('TC-ADMIN-E02: disable and re-enable user account', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page);

    await adminUsersPage.goto();
    await adminUsersPage.expectLoaded();

    const candidateEmail = await adminUsersPage.getFirstDisableCandidateEmail(ADMIN_EMAIL);
    test.skip(!candidateEmail, 'No non-admin active user available to toggle status');

    await adminUsersPage.disableUserByEmail(candidateEmail!);
    await adminUsersPage.enableUserByEmail(candidateEmail!);
  });
});
