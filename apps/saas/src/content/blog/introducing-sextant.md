---
title: "Introducing Sextant: a Cloudflare-native SaaS starter"
date: "2026-11-14"
excerpt: "One repo, two decoupled apps, all the plumbing already wired. Sextant ships a working SaaS on Cloudflare Workers so you can start from code, not a tutorial."
author: "Sextant Team"
slug: "introducing-sextant"
tags: ["announcement", "release"]
---

Every side project starts the same way: pick a stack, wire up auth, pick a database, figure out billing, set up email, fight the deployment target. Two weeks later you have infrastructure, not a product.

Sextant is our answer to that. It's a template repo with two decoupled apps — a content site for SEO/GEO and a SaaS app for the actual product — that deploys to Cloudflare Workers with zero config.

## What's in the box

- **Auth** — email/password and Google OAuth on Better Auth, sessions on D1.
- **Billing** — Stripe Checkout, webhooks, and a billing portal in test mode.
- **Usage credits** — integer credit balances with a paywalled action ready to make your own.
- **File storage** — R2 bucket with per-user namespacing.
- **Rate limiting** — Cloudflare's `RATE_LIMITER` binding in production, in-memory fallback in dev.

## Why Cloudflare Workers

Workers cold-start in milliseconds, scale to zero cost when idle, and sit within 50ms of most of the internet. The free tier is generous enough to run a real product for months before you spend a dollar.

## Get started

```bash
git clone https://github.com/your-org/sextant.git
cd sextant
pnpm install
pnpm dev:saas
```

The full walkthrough is in the [docs](/docs). Issues and feature requests go to the tracker.
