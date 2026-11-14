import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";
import { DocsNav } from "#/components/docs-nav";

/**
 * Layout route for `/docs/*`. Renders the persistent docs sidebar and the
 * active doc page via `<Outlet />`. The quickstart content lives in
 * `docs/index.tsx`; topic pages are sibling files under `docs/`.
 */
export const Route = createFileRoute("/docs")({ component: DocsLayout });

function DocsLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <DocsNav />
          </aside>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
