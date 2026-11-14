// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
// `site` drives canonical URLs, the sitemap, and JSON-LD. Set PUBLIC_SITE_URL
// in the environment before building to your deployed URL; the placeholder
// below is only a safe default for local builds.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://example.com",
  output: "static",
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
