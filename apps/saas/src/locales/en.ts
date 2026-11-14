/**
 * English dictionary — the source of truth for message keys. Every other
 * locale file must satisfy this shape (enforced by `Messages = typeof en`).
 */
export const en = {
  nav: {
    blog: "Blog",
    docs: "Docs",
    changelog: "Changelog",
    showcase: "Showcase",
    tools: "Tools",
    commits: "Commits",
    pricing: "Pricing",
    login: "Log in",
    getStarted: "Get started",
  },
  home: {
    hero: {
      badge: "Cloudflare-native SaaS starter",
      titleA: "Ship your SaaS",
      titleB: "on the edge.",
      subtitle:
        "Sign up, subscribe, and consume credits. Auth, billing, AI playground, file storage, and database already wired up on Cloudflare Workers.",
      getStarted: "Get started",
      viewPricing: "View pricing",
      haveAccount: "Already have an account?",
      login: "Log in",
      socialProof: "Trusted by builders shipping on the edge",
    },
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading…",
  },
};
