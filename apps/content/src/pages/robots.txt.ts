import type { APIRoute } from "astro";
import { canonical } from "../lib/geo";

const body = `User-agent: *
Allow: /

Sitemap: ${canonical("/sitemap.xml")}
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
