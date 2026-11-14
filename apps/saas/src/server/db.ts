import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { getEnv } from "./env";

/**
 * Drizzle client bound to the `DB` D1 binding. Server-only — import from
 * server functions / API routes, never the client bundle.
 */
export function getDb() {
  return drizzle(getEnv().DB, { schema });
}

export { schema };
