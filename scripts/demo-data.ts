/**
 * Demo data for walkthroughs: fills the register with invented guests so the
 * standings and the staff claim queue look lived-in, and wipes the presenter's own
 * entry so the walkthrough starts from nothing.
 *
 *   npm run demo:seed                    replace every demo guest with a fresh set
 *   npm run demo:reset -- you@email.com  forget one guest entirely (RSVP, solves, claims)
 *   npm run demo:clear                   remove every demo guest and demo character — run before real guests arrive
 *
 * Demo guests all use the reserved @demo.blackveil.invalid domain, so clearing them can
 * never touch a real RSVP. Reads DATABASE_URL the same way drizzle.config.ts does.
 */
import { eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { benchLabs, benchSolveId } from "@/data/bench";
import { ctfChallenges } from "@/data/ctf";
import { scoreForSolvedIds } from "@/lib/ctf-scoring";
import { characters, ctfSolves, guests, magicLinks, pointClaims, rsvps } from "@/lib/db/schema";
import { demoCharacters, retiredDemoCharacterNames } from "./demo-characters";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the error below.
  }
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local, or export it before running this script.");
  process.exit(1);
}

const DEMO_DOMAIN = "demo.blackveil.invalid";
const client = postgres(url, { prepare: false, onnotice: () => {} });
const db = drizzle(client);

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

async function deleteGuests(guestIds: string[], emails: string[]) {
  if (guestIds.length) {
    await db.delete(magicLinks).where(inArray(magicLinks.guestId, guestIds));
    await db.delete(ctfSolves).where(inArray(ctfSolves.guestId, guestIds));
    await db.delete(pointClaims).where(inArray(pointClaims.guestId, guestIds));
    await db.delete(guests).where(inArray(guests.id, guestIds));
  }
  if (emails.length) await db.delete(rsvps).where(inArray(rsvps.email, emails));
}

/** Removes the demo cast, first taking it back from any guest (demo or real) who holds one. */
async function clearDemoCharacters() {
  const names = [...demoCharacters.map((character) => character.characterName), ...retiredDemoCharacterNames];
  const rows = await db.select({ id: characters.id }).from(characters).where(inArray(characters.characterName, names));
  const ids = rows.map((row) => row.id);
  if (ids.length) {
    await db.update(guests).set({ characterId: null }).where(inArray(guests.characterId, ids));
    await db.delete(characters).where(inArray(characters.id, ids));
  }
  return ids.length;
}

async function clearDemo() {
  const rows = await db.select({ id: guests.id }).from(guests).where(like(guests.email, `%@${DEMO_DOMAIN}`));
  await deleteGuests(rows.map((row) => row.id), []);
  await db.delete(rsvps).where(like(rsvps.email, `%@${DEMO_DOMAIN}`));
  const cast = await clearDemoCharacters();
  return { guests: rows.length, characters: cast };
}

async function seed() {
  const removed = await clearDemo();
  if (removed.guests) console.log(`Removed ${removed.guests} earlier demo guests.`);
  // Unassigned on purpose: dealing them out is the "Assign characters" button on /admin.
  await db.insert(characters).values(demoCharacters.map((character) => ({ ...character, murderer: !!character.murderer, victim: !!character.victim })));

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

  const top = roster.slice(0, 3).map(([name, trials, bench]) => {
    const claim = approvedClaims.find(([claimant]) => claimant === name)?.[2] ?? 0;
    return `${name} (${scoreForSolvedIds([...trialIds.slice(0, trials), ...benchIds.slice(0, bench)]) + claim})`;
  });
  console.log(`Seeded ${roster.length} demo guests, ${approvedClaims.length} approved and ${pendingClaims.length} pending claims, ${demoCharacters.length} unassigned characters.`);
  console.log(`Top of the standings: ${top.join(", ")}`);
}

async function resetGuest(rawEmail: string | undefined) {
  const email = rawEmail?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run demo:reset -- you@example.com");
    process.exit(1);
  }
  const rows = await db.select({ id: guests.id }).from(guests).where(eq(guests.email, email));
  const rsvpRows = await db.select({ id: rsvps.id }).from(rsvps).where(eq(rsvps.email, email));
  await deleteGuests(rows.map((row) => row.id), [email]);
  console.log(
    rows.length || rsvpRows.length
      ? `Forgot ${email}: ${rsvpRows.length} RSVP row(s) and all solves, claims and sign-in links removed.`
      : `${email} was not in the register — nothing to remove.`,
  );
}

async function main() {
  const [command, argument] = process.argv.slice(2);
  console.log(`Database: ${new URL(url!).host}${new URL(url!).pathname}`);
  if (command === "seed") await seed();
  else if (command === "reset") await resetGuest(argument);
  else if (command === "clear") {
    const removed = await clearDemo();
    console.log(`Removed ${removed.guests} demo guests and ${removed.characters} demo characters.`);
  }
  else {
    console.error("Usage: tsx scripts/demo-data.ts seed | reset <email> | clear");
    process.exitCode = 1;
  }
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
