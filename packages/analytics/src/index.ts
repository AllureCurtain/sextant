/**
 * Cloudflare Web Analytics snippet.
 *
 * Cloudflare Web Analytics is cookieless and privacy-friendly: it does not use
 * localStorage, cookies, or fingerprinting. Drop the beacon into a page's
 * `<head>` (or before `</body>`) to start collecting page views.
 *
 * Get your token from the Cloudflare dashboard → Web Analytics → your site.
 * A single token works for any hostname, so the same snippet is safe to reuse
 * across the content site and the SaaS app.
 */

export interface WebAnalyticsOptions {
  /**
   * The site token from the Cloudflare Web Analytics dashboard.
   * Required — without it the snippet renders nothing.
   */
  token: string;
  /**
   * Spa mode adds automatic `history.pushState` tracking for client-side
   * navigation. Enable it in the SaaS app (client-side routing), leave it off
   * for the static content site.
   */
  spa?: boolean;
}

/**
 * Returns the `<script>` tag string for the Cloudflare Web Analytics beacon.
 * Returns an empty string when `token` is empty so templates can interpolate
 * the result unconditionally.
 */
export function cloudflareWebAnalytics({ token, spa = false }: WebAnalyticsOptions): string {
  if (!token) return "";
  const spaAttr = spa ? ` "spa":true` : "";
  return (
    `<!-- Cloudflare Web Analytics -->` +
    `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ` +
    `data-cf-beacon='{"token":"${token}"${spaAttr}}'></script>` +
    `<!-- End Cloudflare Web Analytics -->`
  );
}
