import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/tools/og-image")({ component: OgImageTool });

const WIDTH = 1200;
const HEIGHT = 630;

const THEMES = {
  teal: {
    label: "Teal",
    bg0: "#0d3837",
    bg1: "#176c6b",
    accent: "#82bab8",
    title: "#f1f5f4",
    subtitle: "#b5d8d7",
  },
  coral: {
    label: "Coral",
    bg0: "#a94f30",
    bg1: "#c4633f",
    accent: "#f5ddd0",
    title: "#ffffff",
    subtitle: "#f5ddd0",
  },
} as const;

type ThemeId = keyof typeof THEMES;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg(title: string, subtitle: string, theme: ThemeId): string {
  const t = THEMES[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg0}"/>
      <stop offset="1" stop-color="${t.bg1}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0" r="0.9">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="48" y="48" width="${WIDTH - 96}" height="${HEIGHT - 96}" rx="20" fill="none" stroke="${t.accent}" stroke-opacity="0.4" stroke-width="2"/>
  <text x="80" y="118" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" font-weight="600" letter-spacing="4" fill="${t.accent}">SEXTANT</text>
  <text x="80" y="${HEIGHT / 2 - 20}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="700" letter-spacing="-1.5" fill="${t.title}">${escapeXml(title)}</text>
  <text x="80" y="${HEIGHT / 2 + 52}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" fill="${t.subtitle}">${escapeXml(subtitle)}</text>
  <circle cx="${WIDTH - 110}" cy="${HEIGHT - 110}" r="34" fill="none" stroke="${t.accent}" stroke-width="3"/>
  <line x1="${WIDTH - 110}" y1="${HEIGHT - 110}" x2="${WIDTH - 86}" y2="${HEIGHT - 134}" stroke="${t.accent}" stroke-width="3"/>
</svg>`;
}

function OgImageTool() {
  const [title, setTitle] = useState("Ship your SaaS on the edge");
  const [subtitle, setSubtitle] = useState("Auth, billing, and database already wired up");
  const [theme, setTheme] = useState<ThemeId>("teal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const svg = useMemo(() => buildSvg(title, subtitle, theme), [title, subtitle, theme]);
  const previewUri = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    [svg],
  );

  async function downloadPng() {
    setBusy(true);
    setError(null);
    try {
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not rasterize the preview"));
      });
      img.src = previewUri;
      await loaded;
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser");
      ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) throw new Error("PNG export failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `og-image-${theme}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG export failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border-strong bg-panel px-3 text-sm text-ink-1 placeholder:text-ink-3 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 focus:outline-none";

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-4xl flex-1 px-4 py-16">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All tools
        </Link>
        <div className="mt-4 mb-8">
          <p className="text-xs font-medium tracking-wide text-accent-700 uppercase">
            Free tool — runs in your browser
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            OG image generator
          </h1>
          <p className="mt-3 max-w-xl text-ink-2">
            Compose a 1200×630 social card and download it as a PNG. Nothing is uploaded — the image
            is drawn on a local canvas.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="og-title" className="mb-1.5 block text-xs font-medium text-ink-2">
                Title
              </label>
              <input
                id="og-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="og-subtitle" className="mb-1.5 block text-xs font-medium text-ink-2">
                Subtitle
              </label>
              <input
                id="og-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={90}
                className={inputClass}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-2">Theme</span>
              <div className="flex gap-2">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      theme === id
                        ? "border-accent-600 bg-accent-soft text-accent-700"
                        : "border-border-strong bg-panel text-ink-2 hover:bg-panel-2"
                    }`}
                  >
                    {THEMES[id].label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={downloadPng}
              disabled={busy}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 text-sm font-medium text-on-accent shadow-sm transition-all duration-150 hover:bg-accent-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {busy ? "Rendering…" : "Download PNG"}
            </button>
            {error && <p className="text-sm text-down">{error}</p>}
          </div>

          <div>
            <div className="overflow-hidden rounded-xl border border-border bg-panel shadow-xs">
              <img
                src={previewUri}
                alt="OG image preview"
                className="block aspect-[1200/630] w-full"
              />
            </div>
            <p className="mt-2 text-xs text-ink-3">
              Live preview — {WIDTH}×{HEIGHT} pixels.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
