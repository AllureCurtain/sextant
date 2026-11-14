import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";
import { getPost, formatPostDate } from "#/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <Link
          to="/blog"
          className="text-sm font-medium text-accent-700 transition-colors hover:text-accent-800"
        >
          &larr; All posts
        </Link>
        <article className="mt-8">
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-ink-3">{post.author}</p>
          <div className="post-body mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </main>
    </div>
  );
}
