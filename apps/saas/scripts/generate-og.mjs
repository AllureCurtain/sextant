// Regenerate public/og-image.png from public/og-image.svg.
//
// Usage (from apps/saas):  pnpm generate:og
// Requires `sharp` — install it in the workspace first if it is not present
// (`pnpm -w add -D sharp`, or reuse the copy the content app installs). The
// script resolves it through Node's module lookup, so any workspace copy works.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");
const require = createRequire(import.meta.url);

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error(
    "generate-og: cannot resolve `sharp`. Add it as a devDependency first " +
      "(e.g. pnpm -w add -D sharp) — the OG SVG is also fine on its own for design iteration.",
  );
  process.exit(1);
}

const svg = join(publicDir, "og-image.svg");
const png = join(publicDir, "og-image.png");

await sharp(svg, { density: 96 }).resize(1200, 630).png().toFile(png);
console.log(`wrote ${png} (1200x630)`);
