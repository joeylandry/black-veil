import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let cachedDb: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily initialized so importing this module (e.g. during Next.js's build-time
 * route collection) never requires DATABASE_URL — only calling getDb() at request time does.
 */
export function getDb() {
  if (cachedDb) return cachedDb;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  cachedDb = drizzle(postgres(connectionString, { prepare: false }));
  return cachedDb;
}
