/**
 * Shared SEO / GEO generators.
 *
 * These functions take a flat list of pages and produce the files a content
 * site needs at build time: `sitemap.xml`, `llms.txt`, `llms-full.txt`, and
 * FAQ / Article JSON-LD blocks. They are pure and deterministic — same input,
 * same output — which keeps the generated site reproducible.
 */

/** A single page in the site, as the generators need it. */
export interface SeoPage {
  /** Path relative to the site root, e.g. `/keywords/foo/overview`. */
  path: string;
  /** `<title>` / og:title value. */
  title: string;
  /** Meta description / llms.txt blurb. */
  description: string;
  /** Body text (markdown-ish) used by llms-full.txt. Optional. */
  body?: string;
}

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ESCAPES[ch] ?? ch);
}

/**
 * `sitemap.xml` for a list of pages.
 * `site` is the absolute origin, e.g. `https://example.com`.
 */
export function sitemapXml(site: string, pages: SeoPage[]): string {
  const urls = pages
    .map((page) => `  <url>\n    <loc>${escapeXml(site + page.path)}</loc>\n  </url>`)
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls +
    `\n</urlset>\n`
  );
}

/**
 * `llms.txt` — a curated list of the site's most useful pages for LLM
 * consumers. Ordered, one link per line, in markdown form.
 */
export function llmsTxt(siteName: string, pages: SeoPage[]): string {
  const items = pages
    .map((page) => `- [${page.title}](${page.path}): ${page.description}`)
    .join("\n");
  return `# ${siteName}\n\n## Pages\n\n${items}\n`;
}

/**
 * `llms-full.txt` — the same list as `llms.txt` but with each page's full
 * body inlined, for LLMs that want everything in one request.
 */
export function llmsFullTxt(siteName: string, pages: SeoPage[]): string {
  const sections = pages
    .map((page) => `## ${page.title}\n\n${page.description}\n\n${page.body ?? ""}`.trimEnd())
    .join("\n\n---\n\n");
  return `# ${siteName}\n\n${sections}\n`;
}

/** A single FAQ entry for JSON-LD. */
export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage JSON-LD (schema.org). Render the returned object inside a
 * `<script type="application/ld+json">` tag.
 */
export function faqJsonLd(entries: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/**
 * Article JSON-LD (schema.org) for an overview-style page.
 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  siteName: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    publisher: { "@type": "Organization", name: input.siteName },
  };
}
