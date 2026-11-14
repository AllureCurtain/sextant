import { expect, test } from "@playwright/test";

test.describe("saas app", () => {
  test("landing page returns 200 and renders", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("pricing page returns 200", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);
  });

  test("login page returns 200", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
  });

  test("sign-up page returns 200", async ({ page }) => {
    const response = await page.goto("/signup");
    expect(response?.status()).toBe(200);
  });
});
