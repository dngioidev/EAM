import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly totalProductsLabel: Locator;
  readonly lowStockLabel: Locator;
  readonly outOfStockLabel: Locator;
  readonly addProductButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Tổng quan kho hàng' });
    this.totalProductsLabel = page.getByText('Tổng sản phẩm');
    this.lowStockLabel = page.getByText('Sắp hết hàng').first();
    this.outOfStockLabel = page.getByText('Hết hàng').first();
    this.addProductButton = page.getByRole('link', { name: /thêm sản phẩm/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async expectStatCardsVisible() {
    await expect(this.totalProductsLabel).toBeVisible();
    await expect(this.lowStockLabel).toBeVisible();
    await expect(this.outOfStockLabel).toBeVisible();
  }

  /** Returns the numeric value displayed inside the stat card for a given label. */
  async getStatValue(label: string): Promise<number> {
    const card = this.page.locator('[class*="Card"]').filter({ hasText: label });
    const valueText = await card.locator('p[class*="text-2xl"]').innerText();
    return parseInt(valueText.trim(), 10);
  }

  /** Returns the count shown in the low-stock section heading e.g. "Sắp hết hàng (3)" */
  lowStockSectionHeading(): Locator {
    return this.page.getByText(/sắp hết hàng \(\d+\)/i).first();
  }

  /** Returns the count shown in the out-of-stock section heading e.g. "Hết hàng (1)" */
  outOfStockSectionHeading(): Locator {
    return this.page.getByText(/hết hàng \(\d+\)/i).first();
  }
}
