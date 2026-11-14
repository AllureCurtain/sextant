---
title: "Why Sextant is two apps, not one"
date: "2026-11-05"
excerpt: "The content site and the SaaS app share a repo and some plumbing but deploy independently. That split is deliberate — here's why."
author: "Sextant Team"
slug: "why-two-apps"
tags: ["engineering", "architecture"]
---

Most starters put the marketing site and the app in the same codebase, behind the same router. That works until it doesn't — the marketing pages want to be static, crawlable, and cheap; the app wants sessions, personalization, and a deployment story that doesn't regress SEO when you ship a bug.

Sextant splits them.

## apps/content — the GEO machine

The content site is Astro. It renders keyword-targeted overview and Q&A pages at build time, ships them as static HTML, and scores them with Pagefind for search. There's no auth here, no billing, no session state — just fast, cacheable content tuned for both search engines and LLM answers.

You can have a hundred pages and pay nothing to serve them. You can also regenerate the whole site on a schedule without touching the app.

## apps/saas — the product

The SaaS app is TanStack Start + Hono on a Worker. This is where users sign up, pay, consume credits, manage API keys, and upload files. The routes are server-rendered and session-aware; the data lives on D1 and R2.

Because it's a separate Worker, a deploy to the SaaS app can't break the marketing pages. A spike of sign-ups doesn't slow down the content site. You can roll back one without rolling back the other.

## Shared plumbing, not shared code

Both apps share a small set of packages — email templates, the analytics snippet, SEO generators, deploy helpers — published through the pnpm workspace. They don't share a database, a runtime, or a deploy pipeline.

That's the split that matters. Coupling deploys is the thing that actually hurts; coupling packages doesn't.
