import { eq, inArray, like } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { characters, ctfSolves, guests, magicLinks, pointClaims, rsvps } from "@/lib/db/schema";
import { castMemberFor, demoCharacters, normalizePersonName, retiredDemoCharacterNames } from "./cast";

/**
 * Server-only demo data, shared by `scripts/demo-data.ts` (npm run demo:*) and the
 * staff-only `/api/admin/demo` route, so the same seed, reset and clear can be run from
 * a terminal or from buttons on /admin.
 *
 * Demo guests all use the reserved @demo.blackveil.invalid domain, so clearing them can
 * never touch a real RSVP.
 */
type Db = ReturnType<typeof getDb>;

export const DEMO_DOMAIN = "demo.blackveil.invalid";

/**
 * The presenter's own character stays unassigned so the walkthrough can deal it live:
 * the presenter RSVPs under their real name, presses "Assign characters", and is
 * matched to it by name. Every other cast member is seeded as a guest already holding
 * the character based on them.
 */
export const PRESENTER_CHARACTER = "Joseph “Laundry” Landry";

/** Everyone in the program but the presenter, each with the character based on them. */
const seededCast = demoCharacters.filter((character) => character.characterName !== PRESENTER_CHARACTER);

/** Claims awaiting staff review, so /admin has a queue to approve on stage. */
const pendingClaims: [string, string, string][] = [
  ["Aidan Leach", "Found the river door token", "It was taped under the coat-check counter."],
  ["Molly Daniel", "Delivered the sealed letter in character", "Handed to the bartender with the password."],
  ["Kyle Erhabor", "Identified the masked violinist", ""],
];

const emailFor = (name: string) => `${normalizePersonName(name).replace(/ /g, ".")}@${DEMO_DOMAIN}`;
const daysAgo = (days: number, hours = 0) => new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000);

/** Deletes guests and everything that hangs off them (sign-in links, solves, claims), plus RSVP rows by email. */
export async function deleteGuests(db: Db, guestIds: string[], emails: string[]) {
  if (guestIds.length) {
    await db.delete(magicLinks).where(inArray(magicLinks.guestId, guestIds));
    await db.delete(ctfSolves).where(inArray(ctfSolves.guestId, guestIds));
    await db.delete(pointClaims).where(inArray(pointClaims.guestId, guestIds));
    await db.delete(guests).where(inArray(guests.id, guestIds));
  }
  if (emails.length) await db.delete(rsvps).where(inArray(rsvps.email, emails));
}

/** Removes the demo cast, first taking it back from any guest (demo or real) who holds one. */
async function clearDemoCharacters(db: Db) {
  const names = [...demoCharacters.map((character) => character.characterName), ...retiredDemoCharacterNames];
  const rows = await db.select({ id: characters.id }).from(characters).where(inArray(characters.characterName, names));
  const ids = rows.map((row) => row.id);
  if (ids.length) {
    await db.update(guests).set({ characterId: null }).where(inArray(guests.characterId, ids));
    await db.delete(characters).where(inArray(characters.id, ids));
  }
  return ids.length;
}

/** Replaces the cast with a fresh, unassigned copy of the 35 characters. Guests and RSVPs are untouched. */
export async function loadCast(db: Db) {
  await clearDemoCharacters(db);
  // Unassigned on purpose: dealing them out is the "Assign characters" button on /admin.
  await db
    .insert(characters)
    .values(
      // playedBy lives in code only; the table has no column for it.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      demoCharacters.map(({ playedBy, ...character }) => ({ ...character, murderer: !!character.murderer, victim: !!character.victim })),
    );
  return demoCharacters.length;
}

/** Removes every demo guest and the demo cast. */
export async function clearDemo(db: Db) {
  const rows = await db.select({ id: guests.id }).from(guests).where(like(guests.email, `%@${DEMO_DOMAIN}`));
  await deleteGuests(db, rows.map((row) => row.id), []);
  await db.delete(rsvps).where(like(rsvps.email, `%@${DEMO_DOMAIN}`));
  const cast = await clearDemoCharacters(db);
  return { guests: rows.length, characters: cast };
}

/**
 * Replaces every demo guest and the cast: everyone in the program but the presenter goes
 * on the register, attending, holding the character based on them, with no solves yet,
 * so every flag submitted during the demo visibly moves the standings.
 */
export async function seedDemo(db: Db) {
  const removed = await clearDemo(db);
  const cast = await loadCast(db);
  const characterIds = new Map(
    (await db.select({ id: characters.id, name: characters.characterName }).from(characters)).map((row) => [row.name, row.id]),
  );

  const seeded = new Map<string, string>();
  for (const [index, character] of seededCast.entries()) {
    const name = character.playedBy[0];
    const email = emailFor(name);
    const joined = daysAgo(14 - Math.floor(index / 3), index % 24);
    await db.insert(rsvps).values({
      fullName: name,
      email,
      attending: "yes",
      note: "",
      dressAcknowledged: true,
      attendanceStatus: "confirmed",
      recordedAt: joined,
      createdAt: joined,
    });
    const [guest] = await db
      .insert(guests)
      .values({ email, fullName: name, characterId: characterIds.get(character.characterName) ?? null, createdAt: joined })
      .returning();
    seeded.set(name, guest.id);
  }

  for (const [name, label, note] of pendingClaims) {
    const guestId = seeded.get(name);
    if (guestId) await db.insert(pointClaims).values({ guestId, label, note, submittedAt: daysAgo(0, 2) });
  }

  return {
    removedGuests: removed.guests,
    guests: seeded.size,
    pendingClaims: pendingClaims.length,
    characters: cast,
    assigned: seeded.size,
    presenterCharacter: PRESENTER_CHARACTER,
  };
}

/**
 * The character each waiting guest should be dealt by name: the cast member based on
 * them, when that character is in the database and free. Used by "Assign characters".
 */
export function matchByName<G extends { id: string; fullName: string }>(
  waiting: G[],
  free: { id: string; characterName: string }[],
) {
  const freeByName = new Map(free.map((character) => [character.characterName, character.id]));
  const pairs: { guestId: string; characterId: string }[] = [];
  for (const guest of waiting) {
    const member = castMemberFor(guest.fullName);
    const characterId = member ? freeByName.get(member.characterName) : undefined;
    if (characterId) {
      pairs.push({ guestId: guest.id, characterId });
      freeByName.delete(member!.characterName);
    }
  }
  return pairs;
}

/** Forgets one guest entirely: RSVP rows, solves, claims and sign-in links. Returns false if they weren't there. */
export async function resetGuest(db: Db, rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const rows = await db.select({ id: guests.id }).from(guests).where(eq(guests.email, email));
  const rsvpRows = await db.select({ id: rsvps.id }).from(rsvps).where(eq(rsvps.email, email));
  await deleteGuests(db, rows.map((row) => row.id), [email]);
  return { email, found: rows.length > 0 || rsvpRows.length > 0, rsvps: rsvpRows.length };
}
