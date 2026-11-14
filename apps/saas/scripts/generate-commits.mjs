// Writes src/data/commits.json with the latest commits in this repo.
// Runs automatically before `pnpm dev` and `pnpm build` (see package.json
// predev/prebuild). Commit data is baked into the client bundle — Workers
// cannot shell out to `git` at request time.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const outFile = join(here, "..", "src", "data", "commits.json");

const FORMAT = "%H%x1f%s%x1f%cI%x1e"; // hash, subject, ISO date, record sep

let commits = [];
try {
  const raw = execFileSync("git", ["log", "-20", `--pretty=format:${FORMAT}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  commits = raw
    .split("\x1e")
    .map((rec) => rec.trim())
    .filter(Boolean)
    .map((rec) => {
      const [hash, subject, date] = rec.split("\x1f");
      return { hash: hash.slice(0, 7), message: subject, date };
    });
} catch {
  console.warn("generate-commits: `git log` failed — writing an empty list.");
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(commits, null, 2)}\n`);
console.log(`generate-commits: wrote ${commits.length} commits to src/data/commits.json`);
