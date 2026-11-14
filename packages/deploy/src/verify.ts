/**
 * Poll a URL until it returns an HTTP 200, or time out.
 *
 * Used by CI right after `wrangler deploy` — a fresh Workers deployment is
 * usually live within a second or two, but the edge can take a few seconds to
 * converge, so we retry rather than assert on the first request.
 */
export async function verifyUrl(
  url: string,
  options: { attempts?: number; delayMs?: number; timeoutMs?: number } = {},
): Promise<void> {
  const attempts = options.attempts ?? 30;
  const delayMs = options.delayMs ?? 2_000;
  const timeoutMs = options.timeoutMs ?? 10_000;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.status === 200) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`URL did not return 200 after ${attempts} attempts: ${url}`, {
    cause: lastError,
  });
}
