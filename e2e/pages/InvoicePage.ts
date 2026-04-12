import { type Page, type Locator } from '@playwright/test';

export class InvoicePage {
  readonly page: Page;
  readonly invoiceList: Locator;
  readonly firstInvoiceRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.invoiceList = page.locator('table tbody tr, [data-testid="invoice-row"]');
    this.firstInvoiceRow = this.invoiceList.first();
  }

  async goto() {
    await this.page.goto('/invoices');
  }

  async openFirstInvoice() {
    await this.firstInvoiceRow.click();
  }
}
