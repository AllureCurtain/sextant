# @sextant/content

The content / GEO site. Astro, static-first, deploys to Cloudflare Workers.

A keyword table (`src/data/keywords.ts`) is the single source of truth: each row
becomes an overview page, a Q&A index, and one page per question. Build-time
output includes `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, and a
Pagefind search index.

## Commands

```bash
pnpm dev        # http://localhost:4321
pnpm build      # astro build + pagefind index
pnpm check      # astro check (typecheck)
pnpm deploy     # wrangler deploy
```

Rules for this app live in `AGENTS.md` in this directory.
