import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";
import { listPosts, formatPostDate } from "#/lib/blog";

export const Route = createFileRoute("/blog/")({ component: BlogIndex });

function BlogIndex() {
  const posts = listPosts();
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className="mb-10">
          <p className="rise label-caps text-signal">Blog</p>
          <h1 className="rise stagger-1 mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            Notes from the build
          </h1>
          <p className="rise stagger-2 mt-3 text-ink-2">
            Announcements, engineering notes, and the thinking behind Sextant.
          </p>
        </div>
        <ul className="space-y-5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group block rounded-xl border border-border bg-panel p-6 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3 text-xs text-ink-3">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  {post.tags.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <h2 className="mt-2.5 text-lg font-semibold tracking-tight text-ink-1 transition-colors group-hover:text-accent-700">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{post.excerpt}</p>
                <p className="mt-3 text-xs font-medium text-ink-3">{post.author}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
