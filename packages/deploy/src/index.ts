/**
 * Shared deploy helpers for CI. `verify-url.mjs` is a self-contained Node
 * script CI runs directly; `verifyUrl` is the typed twin for use from TS code.
 */

export { verifyUrl } from "./verify.js";
