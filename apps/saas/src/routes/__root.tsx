import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
  useLoaderData,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import { CrispChat } from "#/components/crisp-chat";
import { LocaleProvider } from "#/lib/i18n";
import { getDocumentLocale, getRequestLocale } from "#/lib/i18n-server";

const SITE_TITLE = "Sextant";
const SITE_DESCRIPTION =
  "Cloudflare-native SaaS starter: auth, Stripe billing, usage credits, API keys, and file storage wired up on Workers + D1 + R2.";

/**
 * Runs before hydration to set the `.dark` class on <html>, avoiding a flash
 * of the wrong theme. Reads the persisted choice ("sextant-theme") and falls
 * back to the OS preference on first visit.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("sextant-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  loader: async () => ({ locale: await getRequestLocale() }),
  shellComponent: RootDocument,
  component: RootComponent,
});

/**
 * Scroll-reveal observer: adds `.is-visible` to `.reveal` elements as they
 * enter the viewport. One shared IntersectionObserver, unobserved after first
 * reveal so each element animates once. Re-scans on route change because the
 * Outlet swaps children without a remount of this component.
 */
function useRevealObserver(dep: unknown) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const scan = () => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => io.observe(el));
    };
    scan();
    // Catch nodes mounted after this effect (client navigations, lazy chunks).
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [dep]);
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());
  const { locale } = useLoaderData({ from: "__root__" });
  useRevealObserver(locale);
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={locale}>
        <Outlet />
        <CrispChat />
      </LocaleProvider>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // The root route's own useLoaderData is typed to its loader return, so this
  // reads `{ locale }` directly without the loose strict:false union. On the
  // client the cookie is re-read so <html lang> always matches the locale the
  // copy was rendered in.
  const { locale } = Route.useLoaderData();
  const lang = getDocumentLocale(locale);
  return (
    <html lang={lang}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body className="bg-page text-ink-1 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
