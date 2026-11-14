import { expect, test } from "@playwright/test";

test.describe("content site", () => {
  test("home page returns 200 and renders", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("a generated keyword page returns 200", async ({ page }) => {
    const response = await page.goto("/keywords/cloudflare-workers");
    expect(response?.status()).toBe(200);
  });

  test("sitemap.xml is served", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<urlset");
  });

  test("llms.txt is served", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
  });
});
