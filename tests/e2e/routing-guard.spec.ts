import { test, expect } from '@playwright/test';

test.describe('routing guard', () => {
  test('unknown route shows the 404 page, not the login', async ({ page }) => {
    await page.goto('/ruta-inexistente');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText('Página no encontrada')).toBeVisible();
    await expect(page.getByRole('link', { name: /volver al inicio/i })).toBeVisible();
  });

  test('account-gated route redirects to login with callbackUrl', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile/);
  });

  test('public route stays public', async ({ page }) => {
    await page.goto('/products');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
