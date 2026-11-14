import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/tools/logo-icon")({ component: LogoIconTool });

const SIZE = 512;

const SHAPES = {
  circle: {
    label: "Circle",
    path: (accent: string) => `<circle cx="256" cy="256" r="220" fill="${accent}"/>`,
  },
  square: {
    label: "Rounded square",
    path: (accent: string) =>
      `<rect x="36" y="36" width="440" height="440" rx="96" fill="${accent}"/>`,
  },
  hexagon: {
    label: "Hexagon",
    path: (accent: string) => {
      const r = 230;
      const cx = 256;
      const cy = 256;
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${points}" fill="${accent}"/>`;
    },
  },
} as const;

const COLORS = {
  teal: { label: "Teal", value: "#176c6b" },
  coral: { label: "Coral", value: "#a94f30" },
  indigo: { label: "Indigo", value: "#4f46a5" },
} as const;

type ShapeId = keyof typeof SHAPES;
type ColorId = keyof typeof COLORS;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function buildSvg(company: string, initials: string, shape: ShapeId, color: ColorId): string {
  const mark = initials || initialsOf(company);
  const accent = COLORS[color].value;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${SHAPES[shape].path(accent)}
  <text x="256" y="292" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="170" font-weight="700" letter-spacing="-4" fill="#ffffff">${escapeXml(mark)}</text>
</svg>`;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function LogoIconTool() {
  const [company, setCompany] = useState("Sextant");
  const [initials, setInitials] = useState("");
  const [shape, setShape] = useState<ShapeId>("circle");
  const [color, setColor] = useState<ColorId>("teal");
  const [error, setError] = useState<string | null>(null);

  const svg = useMemo(
    () => buildSvg(company, initials.trim(), shape, color),
    [company, initials, shape, color],
  );
  const dataUri = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    [svg],
  );

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${(initials || initialsOf(company)).toLowerCase()}-icon.svg`);
    URL.revokeObjectURL(url);
  }

  async function downloadPng() {
    setError(null);
    try {
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not rasterize the preview"));
      });
      img.src = dataUri;
      await loaded;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser");
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) throw new Error("PNG export failed");
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${(initials || initialsOf(company)).toLowerCase()}-icon.png`);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG export failed");
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
            Logo icon generator
          </h1>
          <p className="mt-3 max-w-xl text-ink-2">
            A simple monogram icon for a side project or placeholder brand. Pick a shape and a
            color, download SVG or PNG.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="logo-company" className="mb-1.5 block text-xs font-medium text-ink-2">
                Company name
              </label>
              <input
                id="logo-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={40}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="logo-initials"
                className="mb-1.5 block text-xs font-medium text-ink-2"
              >
                Initials <span className="font-normal text-ink-3">(blank = derived from name)</span>
              </label>
              <input
                id="logo-initials"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                maxLength={3}
                placeholder={initialsOf(company)}
                className={inputClass}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-2">Shape</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SHAPES) as ShapeId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setShape(id)}
                    className={`inline-flex h-9 items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                      shape === id
                        ? "border-accent-600 bg-accent-soft text-accent-700"
                        : "border-border-strong bg-panel text-ink-2 hover:bg-panel-2"
                    }`}
                  >
                    {SHAPES[id].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-2">Accent color</span>
              <div className="flex gap-2">
                {(Object.keys(COLORS) as ColorId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setColor(id)}
                    aria-label={COLORS[id].label}
                    className={`h-9 flex-1 rounded-lg border-2 transition-all ${
                      color === id
                        ? "border-ink-1 ring-2 ring-accent-500/40"
                        : "border-transparent hover:border-border-strong"
                    }`}
                    style={{ backgroundColor: COLORS[id].value }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadSvg}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-strong bg-panel px-4 text-sm font-medium text-ink-1 shadow-xs transition-colors hover:bg-panel-2"
              >
                <Download className="h-4 w-4" /> SVG
              </button>
              <button
                type="button"
                onClick={downloadPng}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 text-sm font-medium text-on-accent shadow-sm transition-all duration-150 hover:bg-accent-700"
              >
                <Download className="h-4 w-4" /> PNG
              </button>
            </div>
            {error && <p className="text-sm text-down">{error}</p>}
          </div>

          <div>
            <div className="flex items-center justify-center overflow-hidden rounded-xl border border-border bg-panel p-10 shadow-xs">
              <img src={dataUri} alt="Logo icon preview" className="h-56 w-56" />
            </div>
            <p className="mt-2 text-center text-xs text-ink-3">
              Live preview — {SIZE}×{SIZE} pixels on export.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
