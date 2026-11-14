#!/usr/bin/env node
/**
 * sextant-deploy — first-deploy setup for a Sextant project.
 *
 * Provisions the Cloudflare resources the SaaS app needs (D1, R2, KV), writes
 * the real ids into `apps/saas/wrangler.jsonc`, applies local migrations, and
 * optionally deploys both apps.
 *
 * Usage:
 *   sextant-deploy [--dry-run] [--yes]
 *
 *   --dry-run  Print every command and file edit without running or writing.
 *   --yes      Skip the "Deploy now?" prompt (still prompts for project name).
 *
 * Plain Node stdlib only — no dependencies.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const WRANGLER_CONFIG = resolve(REPO_ROOT, "apps/saas/wrangler.jsonc");

const D1_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const ASSUME_YES = args.has("--yes");

if (args.has("--help") || args.has("-h")) {
  console.log("usage: sextant-deploy [--dry-run] [--yes]");
  process.exit(0);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function run(command: string, args: string[], options: { capture?: boolean } = {}): string {
  console.log(`$ ${command} ${args.join(" ")}`);
  if (DRY_RUN) return "";
  try {
    return execFileSync(command, args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: options.capture ? ["inherit", "pipe", "inherit"] : "inherit",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nCommand failed: ${command} ${args.join(" ")}\n${message}`);
    process.exit(1);
  }
}

/** Read wrangler.jsonc as text and apply each replacement, verifying it landed. */
function patchWranglerConfig(edits: Array<{ field: string; from: string; to: string }>): void {
  let text = readFileSync(WRANGLER_CONFIG, "utf8");
  for (const edit of edits) {
    if (!text.includes(edit.from)) {
      if (text.includes(edit.to)) continue; // already applied
      console.error(
        `Could not update ${edit.field} in ${WRANGLER_CONFIG}: ` +
          `expected to find ${JSON.stringify(edit.from)}. Edit the file by hand.`,
      );
      continue;
    }
    text = text.replace(edit.from, edit.to);
    console.log(`  wrangler.jsonc: ${edit.field} -> ${edit.to}`);
  }
  if (DRY_RUN) {
    console.log("  (dry run — wrangler.jsonc not written)");
    return;
  }
  writeFileSync(WRANGLER_CONFIG, text);
}

/** Parse the database_id out of `wrangler d1 create` output. */
function parseD1Id(output: string): string | null {
  const match = output.match(/"database_id"\s*:\s*"([0-9a-f-]{36})"/i);
  return match ? match[1] : null;
}

/** Parse the namespace id out of `wrangler kv namespace create` output. */
function parseKvId(output: string): string | null {
  const match = output.match(/"id"\s*:\s*"([0-9a-f]{32})"/i);
  return match ? match[1] : null;
}

// ── Main ───────────────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });
let stdinClosed = false;
rl.once("close", () => {
  stdinClosed = true;
});

async function ask(question: string, fallback = ""): Promise<string> {
  if (stdinClosed) return fallback;
  const suffix = fallback ? ` [${fallback}]` : "";
  const raw = await Promise.race([
    rl.question(`${question}${suffix}: `),
    // stdin ended (piped input, closed tty): take the default instead of
    // hanging on an unsettled promise.
    new Promise<null>((resolve) => rl.once("close", () => resolve(null))),
  ]);
  const answer = (raw ?? "").trim();
  return answer || fallback;
}

const created: string[] = [];

try {
  console.log(DRY_RUN ? "\nSextant deploy setup (dry run)\n" : "\nSextant deploy setup\n");

  const projectName = await ask("Project name", basename(REPO_ROOT));
  const subdomain = await ask("Cloudflare account subdomain (optional, press Enter to skip)");
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    console.error("Project name must contain at least one letter or digit.");
    process.exit(1);
  }

  const dbName = `${slug}-db`;
  const bucketName = `${slug}-files`;
  const kvName = `${slug}-kv`;

  // 1. D1 ───────────────────────────────────────────────────────────────────
  console.log("\n[1/4] D1 database");
  const d1Out = run("wrangler", ["d1", "create", dbName], { capture: true });
  if (DRY_RUN) {
    console.log(`  (dry run — would parse database_id from output and patch wrangler.jsonc)`);
  }
  process.stdout.write(d1Out);
  const databaseId = DRY_RUN ? "<database-id>" : parseD1Id(d1Out);
  if (!databaseId) {
    console.error("Could not find database_id in wrangler output; edit wrangler.jsonc by hand.");
  } else {
    patchWranglerConfig([
      { field: "d1_databases[0].database_id", from: D1_ID_PLACEHOLDER, to: databaseId },
    ]);
    created.push(`D1 database ${dbName} (${databaseId})`);
  }

  // 2. R2 ───────────────────────────────────────────────────────────────────
  console.log("\n[2/4] R2 bucket");
  run("wrangler", ["r2", "bucket", "create", bucketName]);
  patchWranglerConfig([
    {
      field: "r2_buckets[0].bucket_name",
      from: '"bucket_name": "sextant-saas-files"',
      to: `"bucket_name": "${bucketName}"`,
    },
  ]);
  created.push(`R2 bucket ${bucketName}`);

  // 3. KV ───────────────────────────────────────────────────────────────────
  console.log("\n[3/4] KV namespace");
  const kvOut = run("wrangler", ["kv", "namespace", "create", kvName], { capture: true });
  process.stdout.write(kvOut);
  const kvId = DRY_RUN ? "<kv-namespace-id>" : parseKvId(kvOut);
  const configText = DRY_RUN ? "" : readFileSync(WRANGLER_CONFIG, "utf8");
  if (DRY_RUN || !configText.includes('"kv_namespaces"')) {
    // No kv_namespaces block yet — insert one after the r2_buckets array.
    console.log(
      DRY_RUN
        ? `  (dry run — would add kv_namespaces binding KV with id ${kvId})`
        : `  adding kv_namespaces block (binding KV, id ${kvId ?? "unparsed — fill in by hand"})`,
    );
    patchWranglerConfig([
      {
        field: "kv_namespaces",
        from: "  // Cloudflare Workers AI binding.",
        to:
          `  "kv_namespaces": [\n` +
          `    {\n` +
          `      "binding": "KV",\n` +
          `      "id": "${kvId ?? "TODO-paste-kv-namespace-id"}",\n` +
          `    },\n` +
          `  ],\n` +
          `  // Cloudflare Workers AI binding.`,
      },
    ]);
  }
  if (kvId) created.push(`KV namespace ${kvName} (${kvId})`);

  // 4. Migrate + deploy ─────────────────────────────────────────────────────
  console.log("\n[4/4] Migrations and deploy");
  run("pnpm", ["--filter", "@sextant/saas", "db:migrate:local"]);

  // PUBLIC_SITE_URL hint in wrangler.jsonc when a subdomain was given.
  if (subdomain) {
    patchWranglerConfig([
      {
        field: "vars.PUBLIC_SITE_URL",
        from: '"PUBLIC_SITE_URL": "https://sextant-saas.YOUR-SUBDOMAIN.workers.dev"',
        to: `"PUBLIC_SITE_URL": "https://sextant-saas.${subdomain}.workers.dev"`,
      },
    ]);
  }

  let deploy = ASSUME_YES;
  if (!ASSUME_YES && !DRY_RUN) {
    deploy = (await ask("Deploy now? (y/N)")).toLowerCase() === "y";
  }
  if (deploy) {
    run("pnpm", ["deploy:saas"]);
    run("pnpm", ["deploy:content"]);
  } else {
    console.log(DRY_RUN ? "  (dry run — skipping deploy prompt)" : "  Skipping deploy.");
  }

  // Summary ─────────────────────────────────────────────────────────────────
  console.log("\n── Summary ──────────────────────────────────────────────");
  if (created.length === 0) {
    console.log("No resources recorded (see notes above).");
  } else {
    for (const item of created) console.log(`  created: ${item}`);
  }
  console.log(
    [
      "",
      "Next steps:",
      `  1. Confirm vars.PUBLIC_SITE_URL in apps/saas/wrangler.jsonc matches your`,
      `     deployed URL (https://sextant-saas.<subdomain>.workers.dev or a custom domain).`,
      `  2. Add secrets: cd apps/saas && wrangler secret put BETTER_AUTH_SECRET`,
      `     (and STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY as needed).`,
      `  3. Apply remote migrations: pnpm --filter @sextant/saas db:migrate:remote`,
      `  4. Deploy when ready: pnpm deploy:saas && pnpm deploy:content`,
      "",
    ].join("\n"),
  );
} finally {
  rl.close();
}
