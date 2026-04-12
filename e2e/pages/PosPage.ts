import { type Page, type Locator } from '@playwright/test';

export class PosPage {
  readonly page: Page;
  readonly productSearchInput: Locator;
  readonly cartItems: Locator;
  readonly confirmPaymentButton: Locator;
  readonly invoiceNumberDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productSearchInput = page.getByPlaceholder(/tìm sản phẩm|search product/i);
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.confirmPaymentButton = page.getByRole('button', { name: /xác nhận|confirm|thanh toán/i });
    this.invoiceNumberDisplay = page.locator('[data-testid="invoice-number"], [aria-label*="invoice"]').first();
  }

  async goto() {
    await this.page.goto('/pos');
  }

  async searchProduct(query: string) {
    await this.productSearchInput.fill(query);
  }

  async addFirstResultToCart() {
    await this.page.getByRole('button', { name: /thêm|add/i }).first().click();
  }

  async confirmPayment() {
    await this.confirmPaymentButton.click();
  }
}
