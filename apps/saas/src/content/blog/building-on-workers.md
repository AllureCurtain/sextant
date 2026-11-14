---
title: "Building a SaaS on Cloudflare Workers"
date: "2026-11-10"
excerpt: "What we learned wiring auth, billing, and file storage into a serverless edge runtime — and where the sharp edges are."
author: "Sextant Team"
slug: "building-on-workers"
tags: ["engineering", "cloudflare"]
---

Cloudflare Workers runs V8 isolates instead of containers. That's what makes it fast — and it's also what breaks most of the assumptions baked into Node frameworks.

## What works beautifully

D1 is SQLite at the edge. Drizzle ORM generates migrations you apply with `wrangler d1 migrations apply`, and the driver is a first-party binding — no connection pool, no cold-start penalty, no TCP socket to manage.

R2 is S3 without the egress fees. The binding shows up as `env.BUCKET` in your worker, and uploads stream through the request body without buffering.

Better Auth handles sessions, OAuth, and password reset with a D1 adapter. We didn't write a single session middleware.

## Where the sharp edges are

**No Node built-ins in production.** `crypto`, `fs`, `path` work in dev via `workerd` but aren't all available at runtime. Stripe's SDK uses `crypto.subtle`, which works — but `crypto.createHmac` doesn't. Check before you ship.

**Background jobs are cron + queues.** There's no `setInterval`, no in-process worker pool. Scheduled work goes through Cron Triggers; async fan-out goes through Queues. For most SaaS workloads that's enough — long-running jobs aren't a Workers thing.

**D1 is eventually consistent for reads.** Replicas serve reads; writes go to the primary. If you write a row and immediately read it on another request, you might get a stale answer. For our use case — entitlements, credits, file metadata — it's fine. Don't put strongly-consistent counters on D1.

## The honest trade-off

Workers is the right target when your app is I/O-bound, your latency matters, and you don't want to run servers. It's the wrong target when you need long-running connections, heavy compute, or a stateful in-memory cache that survives across requests.

For the 90% case — a SaaS that signs users up, charges them, and serves them a UI — it's the best deployment target we've used.
