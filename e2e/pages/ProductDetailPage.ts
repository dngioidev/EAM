import { type Page, type Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly backLink: Locator;
  readonly editButton: Locator;
  readonly importButton: Locator;
  readonly exportButton: Locator;
  readonly transactionList: Locator;
  readonly emptyTransactionState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backLink = page.getByRole('link', { name: /danh sách sản phẩm/i });
    this.editButton = page.getByRole('button', { name: /sửa/i });
    this.importButton = page.getByRole('button', { name: /nhập hàng/i });
    this.exportButton = page.getByRole('button', { name: /xuất hàng/i });
    this.transactionList = page.locator('[data-testid="transaction-list"]');
    this.emptyTransactionState = page.getByText(/chưa có giao dịch nào/i);
  }

  async goto(productId: string) {
    await this.page.goto(`/products/${productId}`);
  }

  async expectLoaded() {
    await expect(this.importButton).toBeVisible({ timeout: 10_000 });
  }

  async openImportModal() {
    await this.importButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async openExportModal() {
    await this.exportButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillStockModal(quantity: number, note?: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Số lượng').fill(String(quantity));
    if (note) {
      await dialog.getByLabel(/ghi chú/i).fill(note);
    }
  }

  async confirmStockModal() {
    await this.page.getByRole('button', { name: /xác nhận/i }).click();
    // Wait for dialog to close
    await expect(this.page.getByRole('dialog')).not.toBeVisible({ timeout: 8_000 });
  }

  async getQuantityDisplayed(): Promise<number> {
    const quantityEl = this.page.locator('p.text-3xl').first();
    const text = await quantityEl.innerText();
    return parseInt(text.trim(), 10);
  }
}
