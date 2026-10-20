/**
 * One-click database setup for the game, run from the /admin panel using the site's own
 * database connection. It is the same change as drizzle/0002_game_engine.sql, written so it is
 * safe to run any number of times: every statement checks before it creates.
 *
 * Use it instead of `npm run db:migrate` when you cannot run commands against the database.
 * Do not run both: drizzle would try to create the same tables again.
 */
import { sql } from "drizzle-orm";
import type { GameDb } from "./service";

const guard = (name: string, table: string, definition: string) =>
  `DO $setup$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${name}') THEN ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${definition}; END IF; END $setup$`;

export const setupStatements: string[] = [
  `CREATE TABLE IF NOT EXISTS "game_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "kind" text NOT NULL,
    "guest_id" uuid NOT NULL,
    "by_guest_id" uuid,
    "sold" boolean,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "game_flags" (
    "key" text PRIMARY KEY NOT NULL,
    "value" jsonb NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "game_grades" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "guest_id" uuid NOT NULL,
    "kind" text NOT NULL,
    "item_id" text NOT NULL,
    "verdict" text NOT NULL,
    "points" integer NOT NULL,
    "max" integer NOT NULL,
    "rationale" text DEFAULT '' NOT NULL,
    "needs_review" boolean DEFAULT false NOT NULL,
    "source" text DEFAULT 'auto' NOT NULL,
    "graded_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "game_grades_item_unique" UNIQUE("guest_id","kind","item_id")
  )`,
  `CREATE TABLE IF NOT EXISTS "game_submissions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "guest_id" uuid NOT NULL,
    "kind" text NOT NULL,
    "item_id" text NOT NULL,
    "answer" text NOT NULL,
    "proof" text DEFAULT '' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "game_key" text`,
  guard("game_events_guest_id_guests_id_fk", "game_events", `FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action`),
  guard("game_events_by_guest_id_guests_id_fk", "game_events", `FOREIGN KEY ("by_guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action`),
  guard("game_grades_guest_id_guests_id_fk", "game_grades", `FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action`),
  guard("game_submissions_guest_id_guests_id_fk", "game_submissions", `FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action`),
  `CREATE UNIQUE INDEX IF NOT EXISTS "game_events_one_sale" ON "game_events" USING btree ("kind") WHERE "game_events"."kind" = 'vial-sold'`,
  `CREATE INDEX IF NOT EXISTS "game_events_kind" ON "game_events" USING btree ("kind","created_at")`,
  `CREATE INDEX IF NOT EXISTS "game_submissions_lookup" ON "game_submissions" USING btree ("guest_id","kind","item_id","created_at")`,
  guard("characters_game_key_unique", "characters", `UNIQUE("game_key")`),
];

/** Creates whatever the game still needs. Returns how many statements ran. Safe to run repeatedly. */
export async function setupGameDatabase(db: GameDb): Promise<{ ran: number }> {
  for (const statement of setupStatements) await db.execute(sql.raw(statement));
  return { ran: setupStatements.length };
}
