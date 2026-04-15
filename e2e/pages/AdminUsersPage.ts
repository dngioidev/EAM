import { type Locator, type Page, expect } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usersTableRows: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Quản lý người dùng' });
    this.usersTableRows = page.locator('tbody tr');
    this.previousPageButton = page.getByRole('button', { name: 'Trước' });
    this.nextPageButton = page.getByRole('button', { name: 'Sau' });
  }

  async goto() {
    await this.page.goto('/admin/users');
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Danh sách người dùng')).toBeVisible();
  }

  async getFirstDisableCandidateEmail(adminEmail: string): Promise<string | null> {
    const candidateRows = this.usersTableRows.filter({ hasText: 'Hoạt động' }).filter({ hasNotText: adminEmail });
    const count = await candidateRows.count();
    if (count === 0) {
      return null;
    }

    const emailCell = candidateRows.first().locator('td').first();
    return (await emailCell.innerText()).trim();
  }

  rowByEmail(email: string): Locator {
    return this.usersTableRows.filter({ hasText: email });
  }

  async disableUserByEmail(email: string) {
    const row = this.rowByEmail(email);
    await row.getByRole('button', { name: 'Vô hiệu' }).click();
    await expect(this.page.getByRole('heading', { name: 'Vô hiệu tài khoản?' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Xác nhận vô hiệu' }).click();
    await expect(this.page.getByRole('heading', { name: 'Vô hiệu tài khoản?' })).not.toBeVisible();
    await expect(this.rowByEmail(email)).toContainText('Đã vô hiệu');
    await expect(this.rowByEmail(email).getByRole('button', { name: 'Kích hoạt' })).toBeVisible();
  }

  async enableUserByEmail(email: string) {
    const row = this.rowByEmail(email);
    await row.getByRole('button', { name: 'Kích hoạt' }).click();
    await expect(this.rowByEmail(email)).toContainText('Hoạt động');
  }
}
