import { NextRequest } from "next/server";
import { roster } from "@/data/roster";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { gameDb, json } from "@/lib/game/http";
import { castList, readRosterFlags, setOverride, setReleased } from "@/lib/roster-service";

/** Staff-only: who is coming, which character each guest holds, and the one switch that shows guests their names. */
export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const db = gameDb();
    const flags = await readRosterFlags(db);
    const cast = await castList(db, flags);
    const held = new Set(cast.filter((row) => row.attending !== "no" && row.entry).map((row) => row.entry!.slug));
    return json({
      released: flags.released,
      guests: cast.map((row) => ({
        id: row.guestId,
        fullName: row.fullName,
        email: row.email,
        attending: row.attending,
        slug: row.entry?.slug ?? null,
        character: row.entry ? { name: row.entry.name, role: row.entry.role, background: row.entry.background } : null,
        how: row.how,
      })),
      characters: roster.map((entry) => ({ slug: entry.slug, name: entry.name, role: entry.role, reserve: Boolean(entry.reserve), held: held.has(entry.slug) })),
    });
  } catch (error) {
    return adminDatabaseError("roster", error);
  }
}

/** { released: boolean } shows or hides every character name; { guestId, slug } casts one guest by hand (slug null hands them back to the name match). */
export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  try {
    const db = gameDb();
    if (typeof body?.released === "boolean") {
      await setReleased(db, body.released);
      return json({ ok: true });
    }
    if (typeof body?.guestId === "string" && (typeof body.slug === "string" || body.slug === null)) {
      const result = await setOverride(db, body.guestId, body.slug);
      return json(result, result.ok ? 200 : 400);
    }
    return json({ error: "Nothing to do." }, 400);
  } catch (error) {
    return adminDatabaseError("roster update", error);
  }
}
