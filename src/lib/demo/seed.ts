import { eq, inArray, like } from "drizzle-orm";
import { benchLabs, benchSolveId } from "@/data/bench";
import { ctfChallenges } from "@/data/ctf";
import type { getDb } from "@/lib/db/client";
import { characters, ctfSolves, guests, magicLinks, pointClaims, rsvps } from "@/lib/db/schema";
import { demoCharacters, retiredDemoCharacterNames } from "./cast";

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

const trialIds = ctfChallenges.map((challenge) => challenge.id);
const benchIds = benchLabs.map((lab) => benchSolveId(lab.id));

/** [name, trials solved (in order), bench tickets solved (in order), attending]. */
const roster: [string, number, number, "yes" | "no"][] = [
  ["Eleanor Downes", 7, 9, "yes"],
  ["Marcus Whitfield", 7, 6, "yes"],
  ["Priya Raman", 6, 7, "yes"],
  ["Theo Lambert", 6, 4, "yes"],
  ["Sofia Marchetti", 5, 5, "yes"],
  ["Daniel Okafor", 5, 3, "yes"],
  ["Hannah Brooks", 4, 4, "yes"],
  ["Julian Castellanos", 4, 2, "yes"],
  ["Grace Thornton", 4, 1, "yes"],
  ["Owen Fitzgerald", 3, 3, "yes"],
  ["Mei Lin", 3, 2, "yes"],
  ["Isaac Feldman", 3, 0, "yes"],
  ["Charlotte Duval", 2, 2, "yes"],
  ["Ravi Patel", 2, 1, "yes"],
  ["Abigail Morrow", 2, 0, "yes"],
  ["Lucas Bennett", 1, 1, "yes"],
  ["Nora Kowalski", 1, 0, "yes"],
  ["Samuel Pryce", 1, 0, "yes"],
  ["Vivian Ashby", 0, 0, "yes"],
  ["Henry Calloway", 0, 0, "yes"],
  ["Ada Quinlan", 0, 0, "no"],
  ["Felix Moreau", 0, 0, "no"],
];

/** Claims awaiting staff review, so /admin has a queue to approve on stage. */
const pendingClaims: [string, string, string][] = [
  ["Priya Raman", "Found the river door token", "It was taped under the coat-check counter."],
  ["Theo Lambert", "Delivered the sealed letter in character", "Handed to the bartender with the password."],
  ["Mei Lin", "Identified the masked violinist", ""],
];
const approvedClaims: [string, string, number][] = [
  ["Eleanor Downes", "Solved the cigarette-case cipher", 25],
  ["Marcus Whitfield", "Recovered the torn guest card", 15],
  ["Sofia Marchetti", "Matched the 1924 photograph to the dining room", 10],
];

const emailFor = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@${DEMO_DOMAIN}`;
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
    .values(demoCharacters.map((character) => ({ ...character, murderer: !!character.murderer, victim: !!character.victim })));
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

/** Replaces every demo guest, their solves and claims, and the cast. */
export async function seedDemo(db: Db) {
  const removed = await clearDemo(db);
  const cast = await loadCast(db);

  for (const [index, [name, trials, bench, attending]] of roster.entries()) {
    const email = emailFor(name);
    const joined = daysAgo(14 - Math.floor(index / 2), index);
    await db.insert(rsvps).values({
      fullName: name,
      email,
      attending,
      note: "",
      dressAcknowledged: true,
      attendanceStatus: attending === "yes" ? "confirmed" : "declined",
      recordedAt: joined,
      createdAt: joined,
    });
    const [guest] = await db.insert(guests).values({ email, fullName: name, createdAt: joined }).returning();

    const solved = [...trialIds.slice(0, trials), ...benchIds.slice(0, bench)];
    if (solved.length) {
      await db.insert(ctfSolves).values(
        solved.map((challengeId, step) => ({
          guestId: guest.id,
          challengeId,
          solvedAt: new Date(joined.getTime() + (step + 1) * 47 * 60 * 1000),
        })),
      );
    }
  }

  const ids = new Map(
    (await db.select({ id: guests.id, fullName: guests.fullName }).from(guests).where(like(guests.email, `%@${DEMO_DOMAIN}`))).map(
      (row) => [row.fullName, row.id],
    ),
  );
  for (const [name, label, points] of approvedClaims) {
    await db.insert(pointClaims).values({
      guestId: ids.get(name)!,
      label,
      points,
      status: "approved",
      submittedAt: daysAgo(3),
      reviewedAt: daysAgo(2),
      reviewedBy: "staff",
    });
  }
  for (const [name, label, note] of pendingClaims) {
    await db.insert(pointClaims).values({ guestId: ids.get(name)!, label, note, submittedAt: daysAgo(0, 2) });
  }

  return {
    removedGuests: removed.guests,
    guests: roster.length,
    approvedClaims: approvedClaims.length,
    pendingClaims: pendingClaims.length,
    characters: cast,
  };
}

/** Forgets one guest entirely: RSVP rows, solves, claims and sign-in links. Returns false if they weren't there. */
export async function resetGuest(db: Db, rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const rows = await db.select({ id: guests.id }).from(guests).where(eq(guests.email, email));
  const rsvpRows = await db.select({ id: rsvps.id }).from(rsvps).where(eq(rsvps.email, email));
  await deleteGuests(db, rows.map((row) => row.id), [email]);
  return { email, found: rows.length > 0 || rsvpRows.length > 0, rsvps: rsvpRows.length };
}
