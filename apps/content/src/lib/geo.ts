/**
 * Build-time SEO/GEO helpers for the content site.
 *
 * The heavy lifting (sitemap, llms.txt, JSON-LD) lives in `@sextant/seo`;
 * this module adapts the keyword table to that package's `SeoPage` shape so
 * every generated file is derived from the same source of truth.
 */
import { KEYWORDS, PAGE_KINDS, SITE_NAME, type FaqEntry, type KeywordRow } from "../data/keywords";
import {
  articleJsonLd,
  faqJsonLd,
  llmsFullTxt,
  llmsTxt,
  sitemapXml,
  type SeoPage,
} from "@sextant/seo";

export { SITE_NAME };

// Canonical origin for sitemap/JSON-LD/canonical links. Set PUBLIC_SITE_URL
// at build time; falls back to the same placeholder as astro.config.mjs.
const SITE = import.meta.env.PUBLIC_SITE_URL ?? "https://example.com";

/** Path for a keyword page kind, e.g. `/keywords/foo` and `/keywords/foo/questions`. */
export function pagePath(row: KeywordRow, kind: "overview" | "questions"): string {
  return kind === "overview" ? `/keywords/${row.slug}` : `/keywords/${row.slug}/questions`;
}

/** Deterministic slug for a question, used in its page path. */
export function questionSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Path for a single question page, e.g. `/keywords/foo/questions/what-is-x`. */
export function questionPath(row: KeywordRow, question: string): string {
  return `/keywords/${row.slug}/questions/${questionSlug(question)}`;
}

/** Every page on the site as a `SeoPage` — feeds all generated files. */
export function allPages(): SeoPage[] {
  const pages: SeoPage[] = [
    {
      path: "/",
      title: `${SITE_NAME} — Cloudflare-native outbound site template`,
      description:
        "Sextant is a Cloudflare-native template for outbound sites: a content/GEO site and a SaaS app in one repo.",
    },
  ];
  for (const row of KEYWORDS) {
    for (const kind of PAGE_KINDS) {
      const path = pagePath(row, kind);
      if (kind === "overview") {
        pages.push({
          path,
          title: `${row.keyword}: Overview`,
          description: row.description,
          body: row.overview,
        });
      } else {
        pages.push({
          path,
          title: `${row.keyword}: Questions`,
          description: `Common questions about ${row.keyword}.`,
          body: row.faq.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n"),
        });
      }
    }
    // One page per question.
    for (const entry of row.faq) {
      pages.push({
        path: questionPath(row, entry.question),
        title: entry.question,
        description: entry.answer.slice(0, 160),
        body: `**${entry.question}**\n\n${entry.answer}`,
      });
    }
  }
  return pages;
}

export function buildSitemap(): string {
  return sitemapXml(SITE, allPages());
}
export function buildLlmsTxt(): string {
  return llmsTxt(SITE_NAME, allPages());
}
export function buildLlmsFullTxt(): string {
  return llmsFullTxt(SITE_NAME, allPages());
}

export function articleLd(row: KeywordRow): Record<string, unknown> {
  return articleJsonLd({
    title: `${row.keyword}: Overview`,
    description: row.description,
    url: SITE + pagePath(row, "overview"),
    siteName: SITE_NAME,
  });
}
export function faqLd(row: KeywordRow): Record<string, unknown> {
  return faqJsonLd(row.faq);
}

/** FAQ JSON-LD for a single question (used on each per-question page). */
export function faqLdForEntry(entry: FaqEntry): Record<string, unknown> {
  return faqJsonLd([entry]);
}

export function canonical(path: string): string {
  return SITE + path;
}
