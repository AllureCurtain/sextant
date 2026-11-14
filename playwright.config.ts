import { defineConfig } from "@playwright/test";

/**
 * Playwright smoke tests run against the already-running dev/preview servers.
 * Start the apps first (pnpm dev:content / pnpm dev:saas) or use the URLs
 * below via env vars for CI.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "content",
      use: { baseURL: process.env.CONTENT_SITE_URL ?? "http://localhost:4321" },
      testMatch: /content\.spec\.ts/,
    },
    {
      name: "saas",
      use: { baseURL: process.env.SAAS_SITE_URL ?? "http://localhost:3000" },
      testMatch: /saas\.spec\.ts/,
    },
  ],
});
