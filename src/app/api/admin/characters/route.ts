import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { characters, guests, rsvps } from "@/lib/db/schema";
import { adminGuard } from "@/lib/auth/admin";
import { matchByName } from "@/lib/demo/seed";

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/**
 * action "assign": give every attending guest without a character one. A guest whose name
 * matches a cast member gets the character based on them; the rest are dealt what's left
 * at random. Guests already holding a character keep it.
 * action "clear": take every character back, so the deal can be run again.
 */
export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const db = getDb();

  if (action === "clear") {
    const cleared = await db.update(guests).set({ characterId: null }).where(isNotNull(guests.characterId)).returning({ id: guests.id });
    return NextResponse.json({ ok: true, cleared: cleared.length });
  }
  if (action !== "assign") {
    return NextResponse.json({ error: 'action must be "assign" or "clear".' }, { status: 400 });
  }

  const [guestRows, rsvpRows, characterRows] = await Promise.all([
    db.select({ id: guests.id, email: guests.email, fullName: guests.fullName, characterId: guests.characterId }).from(guests),
    db.select({ email: rsvps.email, attending: rsvps.attending }).from(rsvps).orderBy(desc(rsvps.createdAt)),
    db.select({ id: characters.id, characterName: characters.characterName }).from(characters).where(eq(characters.active, true)),
  ]);

  const attendingByEmail = new Map<string, string>();
  for (const row of rsvpRows) if (!attendingByEmail.has(row.email)) attendingByEmail.set(row.email, row.attending);

  const taken = new Set(guestRows.map((guest) => guest.characterId).filter(Boolean));
  const free = characterRows.filter((row) => !taken.has(row.id));
  const waiting = guestRows.filter((guest) => !guest.characterId && attendingByEmail.get(guest.email) === "yes");

  // A guest named in the cast gets the character based on them; everyone else is dealt
  // one of what remains at random.
  const matched = matchByName(waiting, free);
  const matchedGuests = new Set(matched.map((pair) => pair.guestId));
  const matchedCharacters = new Set(matched.map((pair) => pair.characterId));
  const rest = shuffle(waiting.filter((guest) => !matchedGuests.has(guest.id)));
  const leftover = shuffle(free.filter((row) => !matchedCharacters.has(row.id)));
  const pairs = [
    ...matched,
    ...rest.slice(0, leftover.length).map((guest, index) => ({ guestId: guest.id, characterId: leftover[index].id })),
  ];
  for (const pair of pairs) {
    await db.update(guests).set({ characterId: pair.characterId }).where(eq(guests.id, pair.guestId));
  }

  return NextResponse.json({ ok: true, assigned: pairs.length, byName: matched.length, stillWaiting: waiting.length - pairs.length });
}
