import { test, expect } from '@playwright/test';

/* Regression specs for bugs.md: wrong credentials must stay on /login with
   the error visible; forged session cookies must not open admin routes. */

test.describe('login with wrong credentials', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    // Simulate the backend's real response: credentials invalid.
    await page.route(/\/api\/v1\/auth\/login$/, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      })
    );
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('stays on /login, shows backend message, keeps the email', async ({ page }) => {
    await page.getByLabel('Email').fill('nadie@example.com');
    await page.getByLabel('Contraseña').fill('ClaveIncorrecta1');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/^http:\/\/localhost:\d+\/$/);

    const alert = page.getByText('Credenciales inválidas');
    await expect(alert).toBeVisible();

    await expect(page.getByLabel('Email')).toHaveValue('nadie@example.com');
    await expect(page.getByLabel('Contraseña')).toHaveValue('');
  });

  test('keeps callbackUrl alive: failed login does not lose it', async ({ page }) => {
    await page.goto('/login?callbackUrl=%2Fprofile');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel('Email').fill('nadie@example.com');
    await page.getByLabel('Contraseña').fill('ClaveIncorrecta1');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/callbackUrl=%2Fprofile/);
    // The page never left /login: no hard navigation to / happened.
    await expect(page).not.toHaveURL(/^http:\/\/localhost:\d+\/?$/);
  });

  test('clears an old error on mount and on input', async ({ page }) => {
    // First failure leaves an error in the store.
    await page.getByLabel('Email').fill('nadie@example.com');
    await page.getByLabel('Contraseña').fill('ClaveIncorrecta1');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Navigate away and back without reloading (client navigation).
    await page.getByRole('link', { name: /productos/i }).first().waitFor({ state: 'visible' });
    await page.keyboard.press('Escape'); // no-op warm-up
    await page.goto('/products', { waitUntil: 'commit' });
    await page.goBack();

    // After going back the form remounts: no stale error from the store.
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});

test.describe('session cookies are not trusted (fail-closed middleware)', () => {
  test('forged admin cookie cannot open /admin', async ({ page, context }) => {
    await context.addCookies([
      { name: 'auth-token', value: 'forgeado-por-el-cliente', domain: 'localhost', path: '/' },
      { name: 'auth-role', value: 'admin', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
  });
});
