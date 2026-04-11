# Playwright Setup and Page Objects

## Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'e2e/reports' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Page Object Pattern

```typescript
// e2e/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Auth Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
  authenticatedPage: { page: LoginPage['page'] };
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.E2E_USER_EMAIL ?? 'cashier@test.com',
      process.env.E2E_USER_PASSWORD ?? 'testpassword'
    );
    await page.waitForURL('/');
    await use({ page });
  },
});

export { expect } from '@playwright/test';
```

## E2E Test Pattern

```typescript
// e2e/orders/create-order.spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Create Order Flow', () => {
  test('cashier can create an order with items', async ({ authenticatedPage: { page } }) => {
    await page.goto('/orders/new');
    
    await page.getByLabel('Khách hàng').fill('Nguyễn');
    await page.getByText('Nguyễn Văn A').click(); // autocomplete select
    
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.getByLabel('Sản phẩm').fill('Bia');
    await page.getByText('Bia Heineken 330ml').click();
    
    await page.getByRole('button', { name: 'Tạo đơn hàng' }).click();
    
    await expect(page.getByRole('alert')).toContainText('Đơn hàng đã được tạo');
    await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+/);
  });
});
```
