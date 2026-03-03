import { test, expect } from '@playwright/test';

test('Homepage loads and shows title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Express API/);
});