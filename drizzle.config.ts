import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env.local the way `next dev` does, so without this a
// DATABASE_URL set where the README says to put it would leave `npm run db:migrate`
// with an empty url — and the deployed database silently without any tables.
// Already-exported environment variables win, so CI and one-off overrides still work.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local — expected in CI, where DATABASE_URL comes from the environment.
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example), or export it before running drizzle-kit.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
