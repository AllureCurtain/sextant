import { describe, expect, it } from "vitest";
import { articleJsonLd, faqJsonLd, llmsFullTxt, llmsTxt, sitemapXml, type SeoPage } from "./index";

const pages: SeoPage[] = [
  { path: "/", title: "Home", description: "Home page" },
  { path: "/keywords/foo", title: "Foo", description: "Foo desc", body: "Body text" },
];

describe("sitemapXml", () => {
  it("produces a urlset with one url per page", () => {
    const xml = sitemapXml("https://x.dev", pages);
    expect(xml).toContain("<urlset");
    expect((xml.match(/<url>/g) ?? []).length).toBe(2);
    expect(xml).toContain("https://x.dev/keywords/foo");
  });
  it("escapes xml entities", () => {
    const xml = sitemapXml("https://x.dev", [{ path: "/a&b", title: "t", description: "d" }]);
    expect(xml).toContain("/a&amp;b");
  });
  it("is deterministic", () => {
    expect(sitemapXml("https://x.dev", pages)).toBe(sitemapXml("https://x.dev", pages));
  });
});

describe("llmsTxt / llmsFullTxt", () => {
  it("lists each page as a markdown link", () => {
    const txt = llmsTxt("Site", pages);
    expect(txt).toContain("- [Foo](/keywords/foo): Foo desc");
  });
  it("inlines bodies in the full variant", () => {
    const full = llmsFullTxt("Site", pages);
    expect(full).toContain("Body text");
  });
});

describe("jsonLd", () => {
  it("faqJsonLd emits Question entities", () => {
    const ld = faqJsonLd([{ question: "Q", answer: "A" }]) as {
      mainEntity: { name: string }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0].name).toBe("Q");
  });
  it("articleJsonLd emits an Article", () => {
    const ld = articleJsonLd({
      title: "T",
      description: "d",
      url: "https://x.dev/a",
      siteName: "S",
    });
    expect(ld["@type"]).toBe("Article");
  });
});
