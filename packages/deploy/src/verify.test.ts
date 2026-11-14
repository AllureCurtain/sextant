import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyUrl } from "./verify";

describe("verifyUrl", () => {
  afterEach(() => vi.restoreAllMocks());

  it("resolves on a 200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 })),
    );
    await expect(verifyUrl("https://x.dev", { attempts: 2, delayMs: 0 })).resolves.toBeUndefined();
  });

  it("retries then throws after exhausting attempts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nf", { status: 404 })),
    );
    await expect(verifyUrl("https://x.dev", { attempts: 2, delayMs: 0 })).rejects.toThrow(/200/);
  });
});
