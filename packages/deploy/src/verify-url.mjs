#!/usr/bin/env node
/**
 * Poll a URL until it returns HTTP 200, or give up.
 *
 * Plain Node with no build step so CI can run it directly:
 *
 *   node packages/deploy/src/verify-url.mjs https://example.workers.dev
 */
const url = process.argv[2];
if (!url) {
  console.error("usage: sextant-verify-url <url>");
  process.exit(2);
}

const ATTEMPTS = 30;
const DELAY_MS = 2_000;
const TIMEOUT_MS = 10_000;

let lastError = "unknown error";
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(url, { redirect: "follow", signal: controller.signal });
    clearTimeout(timer);
    if (response.status === 200) {
      console.log(`OK 200 ${url}`);
      process.exit(0);
    }
    lastError = `HTTP ${response.status}`;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
  }
  if (attempt < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}
console.error(`URL did not return 200 after ${ATTEMPTS} attempts: ${url} (${lastError})`);
process.exit(1);
