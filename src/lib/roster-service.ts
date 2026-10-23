/**
 * Who is coming and who they will be. A guest's character is found by the name they registered
 * under (see src/data/roster.ts), unless the host has cast them by hand. Nothing about a character
 * leaves the server until the host releases character names.
 *
 * The two switches live in the game_flags table: `rosterReleased` and `rosterOverrides`.
 */
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { eventConfig } from "@/config/event";
import { gameFlags, guests, rsvps } from "@/lib/db/schema";
import { roster, rosterBySlug, rosterForName, type RosterEntry } from "@/data/roster";
import type { GameDb } from "@/lib/game/service";

const RELEASED = "rosterReleased";
const OVERRIDES = "rosterOverrides";

export type RosterFlags = { released: boolean; overrides: Record<string, string> };

/** The flags table is part of the game setup; this makes the roster work even if that was never run. */
async function ensureFlagsTable(db: GameDb) {
  await db.execute(
    sql`CREATE TABLE IF NOT EXISTS "game_flags" ("key" text PRIMARY KEY NOT NULL, "value" jsonb NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL)`,
  );
}

export async function readRosterFlags(db: GameDb, now = new Date()): Promise<RosterFlags> {
  try {
    const rows = await db.select().from(gameFlags).where(inArray(gameFlags.key, [RELEASED, OVERRIDES]));
    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    const overrides = byKey.get(OVERRIDES);
    return {
      // the cast opens by itself at the start time, like the game itself
      released: byKey.get(RELEASED) === true || now.getTime() >= new Date(eventConfig.secretsReleaseAt).getTime(),
      overrides: overrides && typeof overrides === "object" && !Array.isArray(overrides) ? (overrides as Record<string, string>) : {},
    };
  } catch {
    // no flags table yet: nothing has been released
    return { released: false, overrides: {} };
  }
}

async function writeFlag(db: GameDb, key: string, value: unknown) {
  await ensureFlagsTable(db);
  if (value === null) {
    await db.delete(gameFlags).where(eq(gameFlags.key, key));
    return;
  }
  await db
    .insert(gameFlags)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: gameFlags.key, set: { value, updatedAt: new Date() } });
}

export async function setReleased(db: GameDb, released: boolean) {
  await writeFlag(db, RELEASED, released ? true : null);
}

/** Casts a guest as a character by hand (slug), or hands them back to the name match (null). */
export async function setOverride(db: GameDb, guestId: string, slug: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  if (slug !== null && !rosterBySlug.has(slug)) return { ok: false, error: "Unknown character." };
  const [guest] = await db.select({ id: guests.id }).from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest) return { ok: false, error: "That guest is not on the register." };
  const { overrides } = await readRosterFlags(db);
  const next = { ...overrides };
  if (slug === null) delete next[guestId];
  else next[guestId] = slug;
  await writeFlag(db, OVERRIDES, Object.keys(next).length ? next : null);
  return { ok: true };
}

export type CastRow = {
  guestId: string;
  fullName: string;
  email: string;
  attending: "yes" | "no" | null;
  entry: RosterEntry | null;
  /** How the character was found: by the registered name, or cast by hand. */
  how: "name" | "hand" | null;
};

/** Every guest on the register with the character they hold. */
export async function castList(db: GameDb, flags?: RosterFlags): Promise<CastRow[]> {
  const { overrides } = flags ?? (await readRosterFlags(db));
  const guestRows = await db.select({ id: guests.id, fullName: guests.fullName, email: guests.email }).from(guests).orderBy(asc(guests.fullName));
  const rsvpRows = await db.select({ email: rsvps.email, attending: rsvps.attending }).from(rsvps).orderBy(desc(rsvps.createdAt));
  // newest first, so the first answer seen for an email is the current one
  const attendingByEmail = new Map<string, "yes" | "no">();
  for (const row of rsvpRows) if (!attendingByEmail.has(row.email)) attendingByEmail.set(row.email, row.attending);

  return guestRows.map((guest) => {
    const hand = overrides[guest.id] ? rosterBySlug.get(overrides[guest.id]) : undefined;
    const byName = hand ? undefined : rosterForName(guest.fullName);
    return {
      guestId: guest.id,
      fullName: guest.fullName,
      email: guest.email,
      attending: attendingByEmail.get(guest.email) ?? null,
      entry: hand ?? byName ?? null,
      how: hand ? "hand" : byName ? "name" : null,
    };
  });
}

export type PublicCard = { name: string; role: string; background: string };
/**
 * `name` is the guest's real name before release and the character's name after, so a guest can
 * never match a real name to a character. `role` and `background` are null until release.
 */
export type RosterView = {
  released: boolean;
  /** True once private cards and objectives are open (8:00 p.m. or the Start button). */
  started: boolean;
  you: PublicCard | null;
  rows: { name: string; role: string | null; background: string | null; isYou: boolean }[];
};

const publicCard = (entry: RosterEntry): PublicCard => ({ name: entry.name, role: entry.role, background: entry.background });

/** The guest ledger a signed-in guest sees. Before release it lists real names only; after, character names only. */
export async function rosterViewFor(db: GameDb, guestId: string, now = new Date()): Promise<RosterView> {
  const flags = await readRosterFlags(db, now);
  const cast = await castList(db, flags);
  const coming = cast.filter((row) => row.attending !== "no");
  let rows: RosterView["rows"];
  if (!flags.released) {
    rows = coming.map((row) => ({ name: row.fullName, role: null, background: null, isYou: row.guestId === guestId }));
  } else {
    // one row per character: two guests who share a character (or the host, once registered) never list it twice
    const bySlug = new Map<string, RosterView["rows"][number]>();
    const unmatched: RosterView["rows"] = [];
    for (const row of coming) {
      const isYou = row.guestId === guestId;
      if (!row.entry) {
        unmatched.push({ name: "A character still to be chosen", role: null, background: null, isYou });
        continue;
      }
      const seen = bySlug.get(row.entry.slug);
      if (seen) seen.isYou ||= isYou;
      else bySlug.set(row.entry.slug, { name: row.entry.name, role: row.entry.role, background: row.entry.background, isYou });
    }
    for (const entry of roster) {
      if (entry.host && !bySlug.has(entry.slug)) bySlug.set(entry.slug, { name: entry.name, role: entry.role, background: entry.background, isYou: false });
    }
    // after release the order follows the characters, so it can never spell out who is who
    rows = [...bySlug.values(), ...unmatched].sort((a, b) => a.name.localeCompare(b.name));
  }
  const mine = cast.find((row) => row.guestId === guestId);
  const { getState } = await import("@/lib/game/service");
  const started = (await getState(db, now)).secretsReleased;
  return { released: flags.released, started, you: flags.released && mine?.entry ? publicCard(mine.entry) : null, rows };
}

export { roster };
