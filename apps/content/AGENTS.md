# apps/content — content / GEO site

Astro, static-first. Turns a keyword table into overview + Q&A pages for search engines and AI answers.

## Rules

- The keyword table (`src/data/keywords.ts`) is the single source of truth. Adding a row adds pages. No hand-written pages for sample content.
- Same input generates the same pages (deterministic build; no timestamps or random ids in output).
- Every page: title, meta description, canonical URL, Open Graph tags, FAQ or Article JSON-LD where applicable.
- Build generates `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`.
- One shared layout, fast (no client JS unless a page needs it). No auth, no billing, no database reads at request time.
- Search is Pagefind, generated at build time.
- Styling: Tailwind CSS v4. No component library in this app; keep markup in Astro components.
- English only. All sample content in English.
- Do not import anything from `apps/saas` or from auth/billing packages.
