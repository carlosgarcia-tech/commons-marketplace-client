import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4000',
    headless: true,
  },
  /* The dev/prod server is expected to be already running on :4000;
     reuse it instead of spawning a second one. */
});
