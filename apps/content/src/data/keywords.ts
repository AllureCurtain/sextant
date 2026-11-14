/**
 * The keyword table — single source of truth for the content site.
 *
 * Each row is one search intent. The build turns every row into a set of
 * pages: an overview, a Q&A index, and one page per question. Adding a row or
 * a question adds pages; no hand-written sample pages exist.
 *
 * Keep entries deterministic: no timestamps or random values — the same table
 * must always produce the same site.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface KeywordRow {
  /** URL-safe slug used in the page path, e.g. `/keywords/<slug>`. */
  slug: string;
  /** The search term / topic, human-readable. */
  keyword: string;
  /** One-line description used in listings and meta descriptions. */
  description: string;
  /** Q&A pairs. Each becomes its own page plus an entry on the Q&A index. */
  faq: FaqEntry[];
  /** Short body copy for the overview page (plain text). */
  overview: string;
}

export const SITE_NAME = "Sextant";

function faq(question: string, answer: string): FaqEntry {
  return { question, answer };
}

/**
 * Ten sample keywords, each with eight Q&A entries — yielding one overview
 * page, one Q&A index, and eight question pages per keyword (100 keyword pages
 * plus the site index pages). Replace with a real table when starting a site.
 */
export const KEYWORDS: KeywordRow[] = [
  {
    slug: "cloudflare-workers",
    keyword: "Cloudflare Workers",
    description: "What Cloudflare Workers is and when to use it for edge compute.",
    overview:
      "Cloudflare Workers is a serverless platform that runs JavaScript, TypeScript, and WebAssembly on Cloudflare's global edge network. Code executes in data centres close to the user, which keeps latency low and removes the need to manage origin servers. It is well suited to APIs, redirects, auth checks, and lightweight rendering.",
    faq: [
      faq(
        "What is Cloudflare Workers?",
        "Cloudflare Workers is a serverless compute platform that runs code on Cloudflare's edge network, close to end users, with no servers to manage.",
      ),
      faq(
        "When should I use Cloudflare Workers?",
        "Use it for low-latency APIs, edge middleware, redirects, auth, and anywhere you want code to run near your users instead of in one region.",
      ),
      faq(
        "Does Cloudflare Workers have a free tier?",
        "Yes — the free tier includes a generous daily request allowance, enough for small sites and templates like this one.",
      ),
      faq(
        "How do I deploy a Cloudflare Worker?",
        "Deploy with Wrangler: run `wrangler deploy` in a project with a wrangler config, or let CI do it on push to main.",
      ),
      faq(
        "What languages run on Workers?",
        "JavaScript and TypeScript natively, plus Rust, C, and others compiled to WebAssembly.",
      ),
      faq(
        "How fast are Workers cold starts?",
        "Workers run in V8 isolates, not containers, so cold starts are effectively zero — measured in milliseconds.",
      ),
      faq(
        "Can Workers talk to a database?",
        "Yes — Workers connect to D1 (SQLite), KV, Durable Objects, R2, and external databases over HTTP or TCP.",
      ),
      faq(
        "Is Cloudflare Workers good for a SaaS backend?",
        "Yes — it scales automatically and pairs well with D1, R2, and Queues for a full SaaS backend.",
      ),
    ],
  },
  {
    slug: "astro-framework",
    keyword: "Astro framework",
    description: "Why Astro is a good fit for content-driven and GEO sites.",
    overview:
      "Astro is a web framework built for content-driven sites. It ships zero JavaScript by default, renders pages to static HTML at build time, and lets you pull content from collections, Markdown, or data files. That makes it a natural fit for generating hundreds of SEO- and GEO-friendly pages from a keyword table.",
    faq: [
      faq(
        "What is Astro?",
        "Astro is a web framework for content-driven sites that renders pages to static HTML and ships no JavaScript unless you add it.",
      ),
      faq(
        "Why use Astro for a content site?",
        "Astro builds fast, static pages from data or collections, which is exactly what a keyword-table-driven GEO site needs.",
      ),
      faq(
        "Does Astro work on Cloudflare?",
        "Yes — the @astrojs/cloudflare adapter deploys Astro sites to Cloudflare Workers.",
      ),
      faq(
        "What are Astro content collections?",
        "Content collections are a typed way to organise Markdown, MDX, or data in Astro, with schema validation via Zod.",
      ),
      faq(
        "Does Astro ship JavaScript to the browser?",
        "Not by default — Astro renders HTML at build time and only hydrates interactive islands you opt into.",
      ),
      faq(
        "Can Astro generate many pages from data?",
        "Yes — `getStaticPaths` lets you generate one page per data row, ideal for a keyword table.",
      ),
      faq(
        "Is Astro good for SEO?",
        "Yes — static HTML, full meta control, and easy JSON-LD make Astro strong for SEO and GEO.",
      ),
      faq(
        "How does Astro compare to Next.js?",
        "Astro is lighter for content sites and ships less JavaScript; Next.js is a larger React meta-framework.",
      ),
    ],
  },
  {
    slug: "tanstack-start",
    keyword: "TanStack Start",
    description: "What TanStack Start is and why it suits a small SaaS app.",
    overview:
      "TanStack Start is a full-stack React framework built on TanStack Router and Vite. It gives a small SaaS app type-safe routing, server functions, and SSR out of the box, and it deploys cleanly to Cloudflare Workers. For a template like Sextant it is a lean alternative to heavier meta-frameworks.",
    faq: [
      faq(
        "What is TanStack Start?",
        "TanStack Start is a full-stack React framework with type-safe file-based routing, SSR, and server functions, built on TanStack Router and Vite.",
      ),
      faq(
        "Can TanStack Start run on Cloudflare Workers?",
        "Yes — it uses the Cloudflare Vite plugin and deploys to Workers as the official recipe.",
      ),
      faq(
        "Is TanStack Start good for a SaaS app?",
        "Yes — it covers routing, server logic, and React 19 without a large framework footprint.",
      ),
      faq(
        "What are server functions?",
        "Server functions are isomorphic functions that run on the server but are callable from the client, typed end to end.",
      ),
      faq(
        "How does routing work in TanStack Start?",
        "It uses TanStack Router's file-based routing: files under src/routes become routes with type-safe params and search.",
      ),
      faq(
        "Does TanStack Start support SSR?",
        "Yes — SSR and streaming are built in and can be toggled per route.",
      ),
      faq(
        "Is TanStack Start production-ready?",
        "It is stable and used in production; the API has converged around the 1.x releases.",
      ),
      faq(
        "How do I deploy TanStack Start?",
        "Use the Cloudflare Vite plugin and `wrangler deploy`, or another supported adapter.",
      ),
    ],
  },
  {
    slug: "d1-database",
    keyword: "Cloudflare D1",
    description: "What Cloudflare D1 is and how it pairs with Drizzle ORM.",
    overview:
      "Cloudflare D1 is a serverless SQLite database that runs on Cloudflare's edge network. Paired with Drizzle ORM it gives a SaaS app typed queries, migrations, and a database that scales without managing servers. Each Sextant app gets its own D1 database.",
    faq: [
      faq(
        "What is Cloudflare D1?",
        "Cloudflare D1 is a serverless SQLite database that runs on Cloudflare's edge network.",
      ),
      faq(
        "How do I query D1?",
        "Use the D1 binding in a Worker directly, or Drizzle ORM for typed queries and migrations.",
      ),
      faq(
        "Does D1 support migrations?",
        "Yes — Drizzle Kit generates SQL migrations and `wrangler d1 migrations apply` runs them.",
      ),
      faq("Is D1 SQLite?", "Yes — D1 is built on SQLite and speaks the SQLite dialect of SQL."),
      faq(
        "How do I set up Drizzle with D1?",
        "Point drizzle-orm/d1 at the DB binding in a Worker and configure drizzle-kit with the sqlite dialect.",
      ),
      faq("Does D1 have a free tier?", "Yes — D1 includes a free daily read and write allowance."),
      faq(
        "When should I not use D1?",
        "Avoid it for very large datasets, heavy joins, or when you need a full Postgres feature set.",
      ),
      faq(
        "Can two apps share a D1 database?",
        "They can, but Sextant gives each app its own database so deleting one app never breaks the other.",
      ),
    ],
  },
  {
    slug: "better-auth",
    keyword: "Better Auth",
    description: "Auth for the SaaS app: email/password, OAuth, and sessions on D1.",
    overview:
      "Better Auth is a TypeScript-first authentication library. Sextant uses it for email-and-password sign-up and login, Google OAuth, and session storage on D1. It runs inside the SaaS worker and keeps auth close to the database.",
    faq: [
      faq(
        "What is Better Auth?",
        "Better Auth is a TypeScript authentication library with built-in email/password, OAuth, and session management.",
      ),
      faq(
        "Does Better Auth work on Cloudflare Workers?",
        "Yes — it runs in the Worker and stores sessions in D1.",
      ),
      faq(
        "Does Better Auth support Google login?",
        "Yes — it has a Google OAuth provider that this template wires in.",
      ),
      faq(
        "Where are sessions stored?",
        "Sessions live in the D1 database via the Drizzle adapter — no separate session store needed.",
      ),
      faq(
        "Does Better Auth do password reset?",
        "Yes — it has a request-password-reset flow; this template sends the email through Resend.",
      ),
      faq("Is Better Auth free?", "Yes — it is open source (MIT) and free to self-host."),
      faq(
        "How do I add an admin role?",
        "Enable the admin plugin and assign users the admin role; the template's admin console uses it.",
      ),
      faq(
        "Can Better Auth run on the edge?",
        "Yes — it is designed to run in serverless and edge runtimes, including Workers.",
      ),
    ],
  },
  {
    slug: "stripe-billing",
    keyword: "Stripe billing",
    description: "How the SaaS app bills in test mode with Stripe Checkout and webhooks.",
    overview:
      "Stripe handles payments for the SaaS app. Sextant wires Stripe Checkout for the sample plan, a webhook that verifies signatures and updates entitlements, and a billing portal link — all in test mode by default so the template works without real money.",
    faq: [
      faq(
        "How does the SaaS app take payments?",
        "It uses Stripe Checkout for the sample plan and a webhook to update the account.",
      ),
      faq(
        "Is Stripe in test mode?",
        "Yes — test mode is the default; switch to live keys when launching a real site.",
      ),
      faq(
        "How are Stripe webhooks handled?",
        "The handler verifies the signature, deduplicates by event id, and applies one entitlement change.",
      ),
      faq(
        "What is Stripe Checkout?",
        "Stripe Checkout is a hosted payment page — the app redirects to it rather than building card forms.",
      ),
      faq(
        "How do I let users manage billing?",
        "The Stripe Billing Portal gives users a hosted page to update cards and cancel; the app links to it.",
      ),
      faq(
        "How are credits charged?",
        "Credits are integers in minor units; a paywalled action checks entitlement then consumes credits.",
      ),
      faq(
        "Do I need real money to test?",
        "No — Stripe test mode cards simulate the whole flow without charging anything.",
      ),
      faq(
        "What events does the webhook handle?",
        "Checkout completion, subscription create/update/delete, and renewal invoices.",
      ),
    ],
  },
  {
    slug: "r2-storage",
    keyword: "Cloudflare R2",
    description: "Object storage on Cloudflare for files and uploads.",
    overview:
      "Cloudflare R2 is object storage on Cloudflare's network, S3-compatible and without egress fees. Sextant reserves it for file storage needs in the SaaS app — uploads, exports, or any binary data that does not belong in D1.",
    faq: [
      faq(
        "What is Cloudflare R2?",
        "R2 is S3-compatible object storage on Cloudflare with no egress fees, used for files and uploads.",
      ),
      faq(
        "How is R2 different from D1?",
        "D1 is a relational SQL database; R2 stores files and objects, not rows.",
      ),
      faq(
        "Does R2 have a free tier?",
        "Yes — R2 includes a free monthly storage and request allowance.",
      ),
      faq(
        "Is R2 S3-compatible?",
        "Yes — it implements the S3 API, so existing S3 tools and SDKs work with it.",
      ),
      faq(
        "When should I use R2?",
        "Use it for uploads, exports, backups, and any binary data that is too big or unstructured for D1.",
      ),
      faq(
        "How do Workers access R2?",
        "Through an R2 bucket binding declared in wrangler config, exposed to the Worker at runtime.",
      ),
      faq(
        "Does R2 charge for egress?",
        "No — one of R2's main selling points is zero egress fees.",
      ),
      faq(
        "Can R2 serve public files?",
        "Yes — buckets can be exposed publicly or served through a Worker for controlled access.",
      ),
    ],
  },
  {
    slug: "pagefind-search",
    keyword: "Pagefind",
    description: "Build-time search for the content site with Pagefind.",
    overview:
      "Pagefind adds search to a static site without a backend. It indexes the built HTML at build time and serves a small client-side search bundle. For the content site that means search works with zero servers and zero client JavaScript unless someone searches.",
    faq: [
      faq(
        "What is Pagefind?",
        "Pagefind is a build-time search library for static sites — it indexes built HTML and serves client-side search with no backend.",
      ),
      faq(
        "Does Pagefind need a server?",
        "No — it runs fully in the browser against a static index generated at build time.",
      ),
      faq("Is Pagefind fast?", "Yes — the index is chunked and only loads what a search needs."),
      faq(
        "How do I add Pagefind to Astro?",
        "Build the site, run `pagefind --site dist`, then include the Pagefind UI bundle on a search page.",
      ),
      faq("Does Pagefind cost anything?", "No — Pagefind is free and open source."),
      faq(
        "Does Pagefind work without JavaScript?",
        "The index is built at build time; the search UI is progressive enhancement, so the site works without it.",
      ),
      faq(
        "How big is the Pagefind index?",
        "It is chunked and compressed; only the fragments a query needs are downloaded.",
      ),
      faq(
        "Can Pagefind search a generated site?",
        "Yes — that is exactly its purpose for a large generated site like the content app.",
      ),
    ],
  },
  {
    slug: "geo-optimization",
    keyword: "GEO optimization",
    description: "Generative engine optimization — being findable by AI answers.",
    overview:
      "GEO (generative engine optimization) is the practice of structuring content so AI assistants and answer engines can find and cite it. Sextant's content app produces many focused overview and Q&A pages from a keyword table, plus llms.txt and structured data, to give AI answers clean material to work with.",
    faq: [
      faq(
        "What is GEO?",
        "GEO is generative engine optimization — structuring content so AI answer engines can find, understand, and cite it.",
      ),
      faq(
        "How is GEO different from SEO?",
        "SEO targets search-engine rankings; GEO targets inclusion in AI-generated answers, using Q&A formats and llms.txt.",
      ),
      faq(
        "How does Sextant help with GEO?",
        "It generates many focused overview and Q&A pages from a keyword table, with llms.txt and FAQ structured data built in.",
      ),
      faq(
        "Why Q&A pages for GEO?",
        "AI answers often respond to questions; dedicated Q&A pages give them a clean, citable source.",
      ),
      faq(
        "Does structured data help GEO?",
        "Yes — FAQ and Article JSON-LD help engines understand and attribute your content.",
      ),
      faq(
        "What is llms.txt for?",
        "llms.txt gives AI consumers a curated, markdown entry point to a site's most useful pages.",
      ),
      faq(
        "How many pages should a GEO site have?",
        "Many focused pages — one clear intent per page — tends to outperform a few broad pages.",
      ),
      faq(
        "Is GEO only about content?",
        "Mostly, but speed, clean HTML, and machine-readable metadata all help engines ingest the site.",
      ),
    ],
  },
  {
    slug: "llms-txt",
    keyword: "llms.txt",
    description: "The llms.txt convention for making a site readable to LLMs.",
    overview:
      "llms.txt is an emerging convention: a markdown file at a site's root that lists the most useful pages for large language models, with an optional llms-full.txt containing the full text. Sextant generates both at build time so AI consumers can read the site in one request.",
    faq: [
      faq(
        "What is llms.txt?",
        "llms.txt is a markdown file at a site root listing key pages for LLMs, paired with llms-full.txt for the full content.",
      ),
      faq(
        "Why add llms.txt?",
        "It gives AI assistants a clean, curated entry point to a site instead of crawling raw HTML.",
      ),
      faq(
        "Does Sextant generate llms.txt?",
        "Yes — the content app builds llms.txt and llms-full.txt from the page list.",
      ),
      faq("Where does llms.txt live?", "At the site root — `https://example.com/llms.txt`."),
      faq(
        "What goes in llms.txt?",
        "A short site description plus a markdown list of the most useful pages with one-line summaries.",
      ),
      faq(
        "What is llms-full.txt?",
        "llms-full.txt inlines each page's full text so an LLM can read the whole site in one request.",
      ),
      faq(
        "Is llms.txt a standard?",
        "It is a widely adopted convention, not a formal standard — but cheap to provide and useful.",
      ),
      faq(
        "Does llms.txt replace sitemap.xml?",
        "No — they serve different audiences; provide both (search engines vs LLMs).",
      ),
    ],
  },
];

/** The page kinds each keyword produces (besides the per-question pages). */
export type PageKind = "overview" | "questions";
export const PAGE_KINDS: PageKind[] = ["overview", "questions"];
