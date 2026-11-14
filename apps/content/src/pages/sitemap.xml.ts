import type { APIRoute } from "astro";
import { buildSitemap } from "../lib/geo";

export const GET: APIRoute = () =>
  new Response(buildSitemap(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
