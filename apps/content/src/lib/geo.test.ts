import { describe, expect, it } from "vitest";
import { allPages, buildSitemap, questionPath, questionSlug } from "./geo";
import { KEYWORDS } from "../data/keywords";

describe("geo helpers", () => {
  it("questionSlug produces url-safe slugs", () => {
    expect(questionSlug("What is Cloudflare Workers?")).toBe("what-is-cloudflare-workers");
    expect(questionSlug("Does it cost $5/mo?")).toBe("does-it-cost-5mo");
  });

  it("generates one overview + one index + one page per question per keyword", () => {
    const paths = new Set(allPages().map((p) => p.path));
    // 1 home + per keyword: 1 overview + 1 questions + faq.length question pages
    const expected = 1 + KEYWORDS.reduce((n, k) => n + 2 + k.faq.length, 0);
    expect(paths.size).toBe(expected);
    expect(paths.has("/keywords/cloudflare-workers")).toBe(true);
    expect(paths.has(questionPath(KEYWORDS[0], KEYWORDS[0].faq[0].question))).toBe(true);
  });

  it("sitemap has a url per page", () => {
    const xml = buildSitemap();
    expect((xml.match(/<url>/g) ?? []).length).toBe(allPages().length);
  });

  it("build is deterministic", () => {
    expect(buildSitemap()).toBe(buildSitemap());
  });
});
