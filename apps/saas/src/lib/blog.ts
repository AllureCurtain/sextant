import { marked } from "marked";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  html: string;
};

type Frontmatter = {
  title?: string;
  date?: string;
  excerpt?: string;
  author?: string;
  slug?: string;
  tags?: string[];
};

const files = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/**
 * Tiny frontmatter parser — `gray-matter` pulls in `Buffer` (Node-only) and
 * breaks the client bundle. Supports `key: scalar` and `key: [a, b, c]`.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
    } else {
      data[key] = value.trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return { data: data as Frontmatter, content: raw.slice(match[0].length) };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const posts: BlogPost[] = Object.entries(files)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = data.slug ?? path.split("/").pop()?.replace(/\.md$/, "") ?? "";
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      author: data.author ?? "",
      tags: data.tags ?? [],
      html: marked.parse(content, { async: false }) as string,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function listPosts(): BlogPost[] {
  return posts;
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return formatDate(iso);
}
