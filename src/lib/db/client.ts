import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type Db = PostgresJsDatabase;

let cached: Promise<Db> | null = null;

/**
 * The database, created on first use so importing this module never needs DATABASE_URL.
 *
 * DATABASE_URL is a Postgres connection string in production. For local work with no
 * database at all, set it to `pglite:./.pglite` (or `pglite:memory`): an embedded Postgres
 * starts in-process and the migrations in drizzle/ are applied to it automatically.
 */
export function getDb(): Promise<Db> {
  if (!cached) {
    cached = open().catch((error) => {
      cached = null;
      throw error;
    });
  }
  return cached;
}

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  if (url.startsWith("pglite:")) {
    const target = url.slice("pglite:".length);
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle: drizzleLite } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = target === "memory" || !target ? new PGlite() : new PGlite(target);
    const db = drizzleLite(client);
    await migrate(db, { migrationsFolder: "drizzle" });
    // Same query builder; only the driver underneath differs.
    return db as unknown as Db;
  }
  return drizzle(postgres(url, { prepare: false }));
}
