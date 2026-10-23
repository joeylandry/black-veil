import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/pglite/migrator";
import { characters, circles, vialWords, survivorIds, questions, characterById, alternateOf, races } from "@/data/game";
import { propById } from "@/data/game/props";
import { guests, gameSubmissions, rsvps } from "@/lib/db/schema";
import { correctAnswer, correctMystery } from "./sim";
import {
  adminOverview,
  applyVerdictFile,
  assignCharacter,
  assignVial,
  butlerSell,
  castByName,
  castMissing,
  editCharacter,
  readFlags,
  cardFor,
  deriveState,
  dose,
  getState,
  ledgerFor,
  loadRoster,
  makePacket,
  mySubmissions,
  publishResults,
  resetGrades,
  resetVial,
  resultsFor,
  runGrading,
  seedCast,
  standingsNow,
  startGame,
  stopGame,
  submit,
  unpublishResults,
  writeFlag,
  type GameDb,
} from "./service";

const BEFORE = new Date("2026-10-20T12:00:00-04:00");
const NIGHT = new Date("2026-10-23T20:10:00-04:00");
const SALE = new Date("2026-10-23T20:50:00-04:00");
const holderOf = (no: number) => survivorIds.find((id) => characterById.get(id)!.survivor!.markerNo === no)!;
const LATE = new Date("2026-10-23T23:30:00-04:00");

async function freshDb() {
  const client = new PGlite();
  const db = drizzle(client) as unknown as GameDb;
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  return { db, client };
}

async function seedGuests(db: GameDb) {
  for (const character of characters) {
    await db.insert(guests).values({ email: `${character.id}@example.test`, fullName: character.realNames[0] });
  }
  await seedCast(db);
  return castByName(db);
}

async function idOf(db: GameDb, slug: string) {
  const row = (await loadRoster(db)).find((entry) => entry.slug === slug);
  assert.ok(row, `${slug} is not cast`);
  return row.guestId;
}

describe("the cast", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
  });
  after(async () => ctx.client.close());

  it("seeds every character once and deals each registered guest the character for their name", async () => {
    await db_insert_extra(ctx.db);
    const first = await seedGuestsOnce(ctx.db);
    assert.equal(first.assigned, characters.length);
    assert.deepEqual(first.unmatchedGuests, ["Somebody Unexpected"]);
    assert.deepEqual(first.uncastCharacters, []);
    const again = await castByName(ctx.db);
    assert.equal(again.assigned, 0);
    assert.equal(again.kept, characters.length);
    const seeded = await seedCast(ctx.db);
    assert.equal(seeded.created, 0);
    assert.equal(seeded.updated, characters.length);
  });

  it("lets the game master recast by hand, one guest per character", async () => {
    const molly = await idOf(ctx.db, "molly");
    const luke = await idOf(ctx.db, "luke");
    assert.deepEqual(await assignCharacter(ctx.db, "luke", molly), { ok: true });
    const roster = await loadRoster(ctx.db);
    assert.equal(roster.find((row) => row.guestId === molly)?.slug, "luke");
    assert.equal(roster.find((row) => row.guestId === luke)?.slug, null);
    assert.ok(!roster.some((row) => row.slug === "molly"));
    assert.deepEqual(await assignCharacter(ctx.db, "luke", null), { ok: true });
    assert.ok(!(await loadRoster(ctx.db)).some((row) => row.slug === "luke"));
    assert.equal((await assignCharacter(ctx.db, "luke", "00000000-0000-0000-0000-000000000000")).ok, false);
    await castByName(ctx.db);
    assert.equal((await adminOverview(ctx.db)).castCount, characters.length);
  });

  it("lets the game master rename a character and restore the printed text", async () => {
    const printed = characterById.get("anika")!.name;
    assert.deepEqual(await editCharacter(ctx.db, "anika", { name: "Miss Annie Manor", occupation: "Heiress" }), { ok: true });
    await readFlags(ctx.db);
    assert.equal(characterById.get("anika")!.name, "Miss Annie Manor");
    assert.equal(characterById.get("anika")!.occupation, "Heiress");
    assert.equal((await editCharacter(ctx.db, "anika", { name: "x".repeat(81) })).ok, false);
    assert.deepEqual(await editCharacter(ctx.db, "anika", null), { ok: true });
    await readFlags(ctx.db);
    assert.equal(characterById.get("anika")!.name, printed);
  });

  it("carries nothing private into the characters table", async () => {
    const { characters: table } = await import("@/lib/db/schema");
    const rows = await ctx.db.select().from(table);
    for (const row of rows) {
      assert.equal(row.privateBiography, "");
      assert.deepEqual(row.secrets, []);
      assert.deepEqual(row.objectives, []);
      assert.equal(row.murderer, false);
    }
  });
});

async function db_insert_extra(db: GameDb) {
  await db.insert(guests).values({ email: "extra@example.test", fullName: "Somebody Unexpected" });
}
async function seedGuestsOnce(db: GameDb) {
  return seedGuests(db);
}

describe("release flags", () => {
  it("keeps everything sealed until eight o'clock on the night, then opens it all by itself", () => {
    assert.equal(deriveState({}, BEFORE).identitiesReleased, false);
    assert.equal(deriveState({}, BEFORE).secretsReleased, false);
    assert.equal(deriveState({}, BEFORE).submissionsOpen, false);
    // "Show names" on the cast page deals the characters, but private cards stay sealed until the start
    const shown = deriveState({ rosterReleased: true }, BEFORE);
    assert.equal(shown.identitiesReleased, true);
    assert.equal(shown.secretsReleased, false);
    const early = deriveState({}, new Date("2026-10-23T19:59:00-04:00"));
    assert.equal(early.secretsReleased, false);
    const doors = deriveState({}, new Date("2026-10-23T20:00:00-04:00"));
    assert.equal(doors.identitiesReleased, true);
    assert.equal(doors.secretsReleased, true);
    assert.equal(doors.submissionsOpen, true, "nobody has to log in to start the night");
    assert.equal(deriveState({ identitiesReleased: true }, BEFORE).secretsReleased, false, "releasing the cast early does not open the private tab");
  });
  it("lets the host start early, hold, or close the book", () => {
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true }, BEFORE).secretsReleased, true, "started early means started");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: false }, NIGHT).secretsReleased, false, "staff can hold it");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, submissionsClosed: true }, NIGHT).submissionsOpen, false);
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true }, LATE).submissionsOpen, false, "the book closes on its own at 10:30");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, submissionsClosed: false }, LATE).submissionsOpen, true, "staff can reopen it");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, resultsPublished: true }, NIGHT).submissionsOpen, false);
  });
  it("closes the House by itself at nine o'clock", () => {
    assert.equal(deriveState({}, new Date("2026-10-23T20:59:00-04:00")).nightcapServed, false);
    assert.equal(deriveState({}, new Date("2026-10-23T21:00:00-04:00")).nightcapServed, true);
    assert.equal(deriveState({ nightcapServed: true }, NIGHT).nightcapServed, true);
  });
});

describe("the start button", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    for (const character of characters) await ctx.db.insert(guests).values({ email: `${character.id}@example.test`, fullName: character.realNames[0] });
  });
  after(async () => ctx.client.close());

  it("starts as sealed, and one press releases every card, deals every character and opens the answer boxes", async () => {
    assert.equal((await getState(ctx.db, BEFORE)).secretsReleased, false);
    assert.equal((await cardFor(ctx.db, await guestIdFor(ctx.db, "anika@example.test"), BEFORE)).status, "sealed");
    await startGame(ctx.db, BEFORE);
    const state = await getState(ctx.db, BEFORE);
    assert.equal(state.identitiesReleased, true);
    assert.equal(state.secretsReleased, true);
    assert.equal(state.submissionsOpen, true);
    const response = await cardFor(ctx.db, await idOf(ctx.db, "anika"), BEFORE);
    assert.equal(response.status, "ok");
    if (response.status === "ok") {
      assert.equal(response.card.private.objectives.length, 5);
      assert.ok(response.card.private.race.title);
    }
    assert.equal((await castByName(ctx.db)).uncastCharacters.length, 0);
    assert.equal((await readFlags(ctx.db)).rosterReleased, true, "the public cast list opens with it");
  });

  it("is not needed: the same cards open by themselves at eight o'clock", async () => {
    const { db, client } = await freshDb();
    // guests have only registered: nobody has seeded the cast or dealt a single character
    for (const character of characters) await db.insert(guests).values({ email: `${character.id}@example.test`, fullName: character.realNames[0] });
    const [anikaRow] = await db.select({ id: guests.id }).from(guests).where(eq(guests.email, "anika@example.test"));
    assert.equal((await cardFor(db, anikaRow.id, BEFORE)).status, "sealed");
    const response = await cardFor(db, anikaRow.id, NIGHT);
    assert.equal(response.status, "ok");
    if (response.status === "ok") assert.equal(response.card.private.objectives.length, 5);
    await client.close();
  });

  it("survives all twenty-four phones opening at the same second, with nothing seeded", async () => {
    const { db, client } = await freshDb();
    for (const character of characters) await db.insert(guests).values({ email: `${character.id}@example.test`, fullName: character.realNames[0] });
    const rows = await db.select({ id: guests.id }).from(guests);
    const replies = await Promise.all(rows.map((row) => cardFor(db, row.id, NIGHT)));
    assert.ok(replies.every((reply) => reply.status === "ok"), "every guest got their card");
    await Promise.all([seedCast(db), seedCast(db), castMissing(db)]);
    const table = await db.select().from((await import("@/lib/db/schema")).characters);
    assert.equal(table.length, characters.length, "one row per character, never a duplicate");
    await client.close();
  });

  it("is safe to press twice, and can be taken back for a rehearsal", async () => {
    await startGame(ctx.db, BEFORE);
    assert.equal((await getState(ctx.db, BEFORE)).secretsReleased, true);
    await stopGame(ctx.db);
    const state = await getState(ctx.db, BEFORE);
    assert.equal(state.identitiesReleased, false);
    assert.equal(state.secretsReleased, false);
    assert.equal(state.submissionsOpen, false);
    await startGame(ctx.db, BEFORE);
  });
});

async function guestIdFor(db: GameDb, email: string) {
  const [row] = await db.select({ id: guests.id }).from(guests).where(eq(guests.email, email));
  return row.id;
}

describe("the guest's card", () => {
  const SURVIVOR = survivorIds[3]; // adam, marker 21, the Doorman
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
  });
  after(async () => ctx.client.close());

  it("says 'coming very soon' while the cast is sealed, and shows nothing", async () => {
    const response = await cardFor(ctx.db, await idOf(ctx.db, "anika"), BEFORE);
    assert.equal(response.status, "sealed");
    assert.match(JSON.stringify(response), /coming very soon/i);
    assert.doesNotMatch(JSON.stringify(response), /anika|mahns/i);
  });

  it("shows the public and background tabs once identities are released, with the private tab empty", async () => {
    await writeFlag(ctx.db, "identitiesReleased", true);
    const response = await cardFor(ctx.db, await idOf(ctx.db, SURVIVOR), BEFORE);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    assert.equal(response.card.id, SURVIVOR);
    assert.ok(response.card.publicBio.length > 20);
    assert.ok(response.card.background.history.length > 20);
    assert.deepEqual(response.card.private.objectives, []);
    assert.equal(response.card.private.survivor, undefined);
    assert.equal(response.directory, null);
    const text = JSON.stringify(response);
    const info = characterById.get(SURVIVOR)!.survivor!;
    for (const secret of [info.veilTitle, info.markerCode, info.realStory, info.grievance, info.escape, "markerCode", "Quill", "The Survivors"]) assert.ok(!text.includes(secret), `the pre-party card leaked "${secret}"`);
  });

  it("opens the private tab when the game starts, with objectives but never answers", async () => {
    await startGame(ctx.db, NIGHT);
    const response = await cardFor(ctx.db, await idOf(ctx.db, SURVIVOR), NIGHT);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    assert.equal(response.card.private.objectives.length, 5);
    assert.equal(response.card.private.survivor?.veilTitle, characterById.get(SURVIVOR)!.survivor!.veilTitle);
    assert.deepEqual(response.card.private.survivor?.rivals, [], "survivors do not know each other");
    assert.ok(response.directory && response.directory.length === 24);
    const text = JSON.stringify(response);
    assert.ok(!/"check"|"codes"|"motiveKeys"|"alsoFrom"|AJTN9/.test(text), "answer keys must never reach a guest");
    const approvalWords = characters.flatMap((character) => character.objectives.filter((objective) => objective.check.kind === "approval").map((objective) => (objective.check as { word: string }).word));
    for (const word of approvalWords) assert.ok(!text.includes(word), `the host's approval word "${word}" reached a guest`);
    assert.ok(!/"killer"|"buyer"|"soldTo"/.test(text), "the card never carries who bought the vial");
  });

  it("asks the nine counted questions of most guests, and the two replacements of the Butler and the vial buyer", async () => {
    const counted = questions.filter((question) => !question.alternateFor).map((question) => question.id);
    const replacements = [...alternateOf.values()];
    const replaced = [...alternateOf.keys()];
    assert.equal(counted.length, 9);
    assert.deepEqual(replacements.sort(), ["alt-1", "alt-2"]);
    assert.deepEqual(replaced.sort(), ["new-1", "new-2"]);
    const asked = async (slug: string) => {
      const response = await cardFor(ctx.db, await idOf(ctx.db, slug), NIGHT);
      assert.equal(response.status, "ok");
      if (response.status !== "ok") throw new Error("no card");
      return response.questions!.map((question) => question.id);
    };
    // before any sale only the Butler is an insider
    assert.deepEqual((await asked("anika")).sort(), [...counted].sort());
    const butler = await asked("rebecca");
    for (const id of replacements) assert.ok(butler.includes(id), `the Butler is asked ${id}`);
    for (const id of replaced) assert.ok(!butler.includes(id), `the Butler is not asked ${id}`);
    assert.equal(butler.length, counted.length);
    // the vial buyer joins them
    await butlerSell(ctx.db, null, vialWords, SURVIVOR, SALE);
    const buyer = await asked(SURVIVOR);
    for (const id of replacements) assert.ok(buyer.includes(id), `the buyer is asked ${id}`);
    for (const id of replaced) assert.ok(!buyer.includes(id), `the buyer is not asked ${id}`);
    const other = await asked(survivorIds[0]);
    assert.deepEqual([...other].sort(), [...counted].sort(), "a survivor who did not buy is asked the counted nine");
    for (const id of replacements) assert.ok(!(await asked("anika")).includes(id));
    await resetVial(ctx.db);
  });

  it("never marks a survivor in the directory", async () => {
    const response = await cardFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    for (const row of response.directory!) assert.deepEqual(Object.keys(row).sort(), ["id", "name", "occupation"]);
  });

  it("tells an uncast guest they have no character yet", async () => {
    const [extra] = await ctx.db.insert(guests).values({ email: "late@example.test", fullName: "Late Arrival" }).returning();
    const response = await cardFor(ctx.db, extra.id, NIGHT);
    assert.equal(response.status, "uncast");
  });
});

describe("submissions", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
  });
  after(async () => ctx.client.close());

  it("refuses answers before eight o'clock and after the book closes", async () => {
    const anika = await idOf(ctx.db, "anika");
    const early = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, BEFORE);
    assert.equal(early.ok, false, "nothing opens before eight o'clock on the night");
    const doors = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT);
    assert.equal(doors.ok, true, "and it opens by itself at eight, with nobody logged in");
    const late = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, LATE);
    assert.equal(late.ok, false);
  });

  it("never names a guest's group on the page", async () => {
    for (const slug of ["anika", "mihir", "arjun"]) {
      const response = JSON.stringify(await cardFor(ctx.db, await idOf(ctx.db, slug), NIGHT));
      for (const circle of circles) assert.ok(!response.includes(circle.name), `${slug}'s card names "${circle.name}"`);
    }
  });

  it("closes a group's race once somebody has won it, and only that group's", async () => {
    const circle = characterById.get("arjun")!.circle;
    const race = races.find((entry) => entry.circle === circle)!;
    const codes = race.tokens.map((token) => propById.get(token)!.code);
    const mates = characters.filter((entry) => entry.circle === circle && entry.id !== "arjun").map((entry) => entry.id);
    const [first, second] = [await idOf(ctx.db, mates[0]), await idOf(ctx.db, mates[1])];
    const otherCircle = characters.find((entry) => entry.circle !== circle && entry.circle !== "survivors" && entry.id !== "anika")!;
    const other = await idOf(ctx.db, otherCircle.id);
    const otherRace = races.find((entry) => entry.circle === otherCircle.circle)!;
    const otherCodes = otherRace.tokens.map((token) => propById.get(token)!.code);

    assert.equal((await submit(ctx.db, first, { kind: "objective", itemId: "race", answer: `${codes[0]} ${codes[1]}` }, NIGHT)).ok, true, "two of three codes is only an attempt");
    assert.equal((await submit(ctx.db, second, { kind: "objective", itemId: "race", answer: `${codes[2]} ${codes[3]} ${codes[4]}` }, NIGHT)).ok, true, "the first complete entry wins and is accepted");
    const late = await submit(ctx.db, first, { kind: "objective", itemId: "race", answer: `${codes[0]} ${codes[1]} ${codes[2]}` }, NIGHT);
    assert.equal(late.ok, false, "a complete entry after the win is refused");
    assert.match((late as { message: string }).message, /already won/);
    assert.equal((await submit(ctx.db, second, { kind: "objective", itemId: "race", answer: `${codes[0]} ${codes[1]} ${codes[2]}` }, NIGHT)).ok, true, "the winner may still resubmit");

    const card = await cardFor(ctx.db, first, NIGHT);
    assert.equal(card.status === "ok" && card.card.private.race.closed, true, "the card tells the rest of the group it is closed");
    assert.equal(card.status === "ok" && card.card.private.race.wonByYou, false);
    const winnerCard = await cardFor(ctx.db, second, NIGHT);
    assert.equal(winnerCard.status === "ok" && winnerCard.card.private.race.wonByYou, true);

    assert.equal((await submit(ctx.db, other, { kind: "objective", itemId: "race", answer: `${otherCodes[0]} ${otherCodes[1]} ${otherCodes[2]}` }, NIGHT)).ok, true, "another group's race is still open");
  });

  it("accepts only your own objectives, the group race, the real questions, and no more page filing", async () => {
    const anika = await idOf(ctx.db, "anika");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "molly-who", answer: "x" }, NIGHT)).ok, false, "someone else's objective");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "race", answer: "AAAAA BBBBB CCCCC" }, NIGHT)).ok, true, "a group race entry");
    assert.equal((await submit(ctx.db, await idOf(ctx.db, "molly"), { kind: "objective", itemId: "race", answer: "x" }, NIGHT)).ok, false, "the survivors' race is the vial, not a box");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "cash", answer: "3200" }, NIGHT)).ok, true, "everyone reports their bills");
    assert.equal((await submit(ctx.db, await idOf(ctx.db, "molly"), { kind: "objective", itemId: "cash", answer: "900" }, NIGHT)).ok, true, "survivors report their bills too");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "nope", answer: "x" }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "old-1", answer: "staged" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "old-1", answer: "  " }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "bogus", answer: "x" }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "exhibit", itemId: "", answer: "ew-wxp" }, NIGHT)).ok, false, "pages are no longer filed");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "x".repeat(601) }, NIGHT)).ok, false);
  });

  it("tells a guest nothing but that the answer was received", async () => {
    const anika = await idOf(ctx.db, "anika");
    const right = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT);
    const wrong = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "nonsense" }, NIGHT);
    assert.deepEqual(Object.keys(right).sort(), Object.keys(wrong).sort());
    assert.deepEqual(Object.keys(right).sort(), ["at", "ok"]);
  });

  it("remembers every submission but returns only the newest for each item", async () => {
    const molly = await idOf(ctx.db, "molly");
    await submit(ctx.db, molly, { kind: "objective", itemId: "molly-who", answer: "first" }, new Date(NIGHT.getTime() + 1000));
    await submit(ctx.db, molly, { kind: "objective", itemId: "molly-who", answer: "second" }, new Date(NIGHT.getTime() + 2000));
    const mine = await mySubmissions(ctx.db, molly);
    const entry = mine.find((row) => row.itemId === "molly-who");
    assert.equal(entry?.answer, "second");
    assert.equal(mine.filter((row) => row.itemId === "molly-who").length, 1);
    const all = await ctx.db.select().from(gameSubmissions);
    assert.ok(all.filter((row) => row.itemId === "molly-who").length >= 2, "the history is kept");
  });

  it("stores survivor picks as character ids, ignoring yourself and anything beyond four", async () => {
    const tim = await idOf(ctx.db, "tim");
    const name = (id: string) => characterById.get(id)!.name;
    const [a, b, c, d, e] = survivorIds;
    // yourself is skipped, and the fifth and later names fall beyond the four
    const answer = [name(a), name(b), name("tim"), name(c), name(d), name(e), name("anika")].join(", ");
    await submit(ctx.db, tim, { kind: "survivors", itemId: "ignored", answer }, NIGHT);
    const picks = (await mySubmissions(ctx.db, tim)).find((row) => row.kind === "survivors")!;
    assert.deepEqual(JSON.parse(picks.answer), [a, b, c, d]);
  });

  it("slows a guest who hammers the button", async () => {
    const hammerer = await idOf(ctx.db, "leon");
    const errand = characterById.get("leon")!.objectives[1].id;
    let refused = 0;
    for (let i = 0; i < 45; i += 1) {
      const result = await submit(ctx.db, hammerer, { kind: "objective", itemId: errand, answer: `try ${i}` }, NIGHT);
      if (!result.ok && result.code === "slow-down") refused += 1;
    }
    assert.ok(refused >= 4);
  });
});

describe("the House: one bottle, one sale", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  const survivorAt = (no: number) => survivorIds.find((id) => characterById.get(id)!.survivor!.markerNo === no)!;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await writeFlag(ctx.db, "identitiesReleased", true);
  });
  after(async () => ctx.client.close());

  it("refuses wrong words, a guest who is not a survivor, and a visit before 8:45, and names no one", async () => {
    const wrong = await butlerSell(ctx.db, null, "ABCDE", survivorAt(20), SALE);
    assert.equal(wrong.status, "unknown");
    assert.doesNotMatch(wrong.message, new RegExp(`survivor|${survivorIds.join("|")}`, "i"));
    assert.equal((await butlerSell(ctx.db, null, vialWords, "anika", SALE)).status, "unknown", "only a survivor can buy");
    assert.equal((await butlerSell(ctx.db, null, vialWords, survivorAt(20), NIGHT)).status, "early", "nothing is sold before a quarter to nine");
    assert.equal((await butlerSell(ctx.db, null, "the butler knows who did it", survivorAt(20), SALE)).status, "sold", "the words are read loosely");
    await resetVial(ctx.db);
  });

  it("sells to the first marker and tells everyone after that the House has none left", async () => {
    const rebecca = await idOf(ctx.db, "rebecca");
    const first = await butlerSell(ctx.db, rebecca, vialWords, survivorAt(20), SALE);
    assert.equal(first.status, "sold");
    const second = await butlerSell(ctx.db, rebecca, vialWords, survivorAt(22), SALE);
    assert.equal(second.status, "sold-out");
    const again = await butlerSell(ctx.db, rebecca, vialWords, survivorAt(20), SALE);
    assert.equal(again.status, "sold-out", "even the buyer cannot buy twice");
    const overview = await adminOverview(ctx.db);
    assert.equal(overview.vial.soldTo?.slug, survivorAt(20));
    assert.equal(overview.vial.attempts.length, 3, "every offer is on the House's log");
    assert.equal(overview.killer, survivorAt(20));
  });

  it("allows exactly one sale when five phones tap at once", async () => {
    await resetVial(ctx.db);
    const rebecca = await idOf(ctx.db, "rebecca");
    const results = await Promise.all([18, 19, 20, 21, 22].map((no) => butlerSell(ctx.db, rebecca, vialWords, survivorAt(no), SALE)));
    assert.equal(results.filter((result) => result.status === "sold").length, 1);
    assert.equal(results.filter((result) => result.status === "sold-out").length, 4);
    const overview = await adminOverview(ctx.db);
    assert.equal(overview.vial.attempts.length, 5);
    assert.equal(overview.vial.attempts.filter((attempt) => attempt.sold).length, 1);
  });

  it("closes the House once the nightcap is served", async () => {
    await resetVial(ctx.db);
    await writeFlag(ctx.db, "nightcapServed", true);
    const result = await butlerSell(ctx.db, null, vialWords, survivorAt(18), SALE);
    assert.equal(result.status, "closed");
    await writeFlag(ctx.db, "nightcapServed", false);
  });

  it("lets only the buyer dose the nightcap, and says nothing either way", async () => {
    await resetVial(ctx.db);
    await butlerSell(ctx.db, null, vialWords, survivorAt(19), SALE);
    const buyer = await idOf(ctx.db, survivorAt(19));
    const rival = await idOf(ctx.db, survivorAt(18));
    await dose(ctx.db, rival, "8YUR2", NIGHT);
    assert.equal((await adminOverview(ctx.db)).vial.dosed, false);
    await dose(ctx.db, buyer, "WRONG", NIGHT);
    assert.equal((await adminOverview(ctx.db)).vial.dosed, false);
    await dose(ctx.db, buyer, "8yu-r2", NIGHT);
    assert.equal((await adminOverview(ctx.db)).vial.dosed, true);
    await dose(ctx.db, buyer, "8YUR2", NIGHT);
  });

  it("lets staff assign the vial when the Butler is absent, replacing any earlier sale", async () => {
    await resetVial(ctx.db);
    assert.equal(await assignVial(ctx.db, survivorAt(18), NIGHT), true);
    assert.equal(await assignVial(ctx.db, "anika", NIGHT), false, "only a survivor can hold the vial");
    assert.equal(await assignVial(ctx.db, survivorAt(21), NIGHT), true);
    assert.equal((await adminOverview(ctx.db)).killer, survivorAt(21));
  });

  it("lets staff override the killer without touching the House log", async () => {
    await writeFlag(ctx.db, "killerOverride", survivorAt(22));
    assert.equal((await adminOverview(ctx.db)).killer, survivorAt(22));
    await writeFlag(ctx.db, "killerOverride", null);
  });

  it("treats a survivor who never registered as unknown, never as a crash", async () => {
    const { db, client } = await freshDb();
    await seedCast(db);
    const result = await butlerSell(db, null, vialWords, holderOf(21), SALE);
    assert.equal(result.status, "unknown");
    await client.close();
  });
});

describe("grading the night, end to end", () => {
  const KILLER = survivorIds.find((id) => characterById.get(id)!.survivor!.markerNo === 21)!;
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await startGame(ctx.db, NIGHT);
    // the night: the Doorman (marker 21) buys the vial
    await butlerSell(ctx.db, await idOf(ctx.db, "rebecca"), vialWords, holderOf(21), SALE);
    for (const id of survivorIds.filter((id) => id !== KILLER)) await butlerSell(ctx.db, null, vialWords, id, SALE);
    // every guest does their errands; a few mystery answers
    for (const character of characters) {
      const guestId = await idOf(ctx.db, character.id);
      for (const objective of character.objectives) {
        if (["vial-attempt", "butler-sale"].includes(objective.check.kind)) continue;
        await submit(ctx.db, guestId, { kind: "objective", itemId: objective.id, answer: correctAnswer(character, objective) }, NIGHT);
      }
    }
    const anika = await idOf(ctx.db, "anika");
    for (const question of questions) await submit(ctx.db, anika, { kind: "mystery", itemId: question.id, answer: correctMystery(question, KILLER) }, NIGHT);
    await submit(ctx.db, anika, { kind: "survivors", itemId: "picks", answer: JSON.stringify(survivorIds) }, NIGHT);
  });
  after(async () => ctx.client.close());

  it("grades everyone present and finds the killer from the House's log", async () => {
    const run = await runGrading(ctx.db);
    assert.equal(run.killer, KILLER);
    assert.ok(run.graded > characters.length * 8);
    const { standings } = await standingsNow(ctx.db);
    assert.equal(standings.killer, KILLER);
    const anika = standings.standings.find((row) => row.guest === "anika")!;
    assert.equal(anika.tiers.mysteries, 10);
    assert.equal(anika.tiers.survivors, 4);
    const killer = standings.standings.find((row) => row.guest === KILLER)!;
    assert.equal(killer.tiers.race, 1, "the vial is the survivors' race");
    assert.equal(standings.winner, "anika");
  });

  it("flags the free-text answers for a second look and refuses to publish until they are decided", async () => {
    const { standings } = await standingsNow(ctx.db);
    assert.ok(standings.pendingReview >= 8);
    const blocked = await publishResults(ctx.db);
    assert.equal(blocked.ok, false);
    assert.match(blocked.message, /second look/);
    assert.equal(await resultsFor(ctx.db, await idOf(ctx.db, "anika")), null, "nothing is visible before publication");
  });

  it("exports a packet with the answer key, and keeps Claude's verdicts through a re-grade", async () => {
    const packet = await makePacket(ctx.db);
    assert.equal(packet.truth.killer, KILLER);
    assert.ok(packet.items.length >= 8);
    const item = packet.items.find((entry) => entry.itemId === "old-3")!;
    assert.match(item.answerKey, /kit/i);
    assert.ok(item.answer.length > 0);

    const verdicts = packet.items.map((entry) => ({ key: entry.key, verdict: entry.auto.points >= entry.auto.max ? "accept" : "partial", points: entry.auto.points, rationale: "Checked against the key." }));
    verdicts[0] = { ...verdicts[0], verdict: "reject", points: 0, rationale: "Contradicted itself." };
    const applied = await applyVerdictFile(ctx.db, verdicts, "claude");
    assert.deepEqual(applied.errors, []);
    assert.equal(applied.applied, verdicts.length);

    const rerun = await runGrading(ctx.db);
    assert.ok(rerun.kept >= verdicts.length, "the re-grade kept Claude's decisions");
    const after = await makePacket(ctx.db);
    assert.equal(after.items.length, 0, "nothing is left to review");
    const { items } = await standingsNow(ctx.db);
    const decided = items.find((entry) => `${entry.guest}|${entry.kind}|${entry.itemId}` === packet.items[0].key)!;
    assert.equal(decided.points, 0);
    assert.equal(decided.source, "claude");
  });

  it("rejects a malformed verdicts file without touching anything", async () => {
    const bad = await applyVerdictFile(ctx.db, [{ guest: "anika", kind: "mystery", itemId: "old-1", verdict: "accept", points: 99, rationale: "too many" }, { nonsense: true }], "claude");
    assert.equal(bad.applied, 0);
    assert.ok(bad.errors.length >= 2);
    const none = await applyVerdictFile(ctx.db, "not json", "claude");
    assert.equal(none.applied, 0);
  });

  it("publishes, and then shows each guest their own breakdown, the board and the solution", async () => {
    const published = await publishResults(ctx.db);
    assert.equal(published.ok, true);
    const results = await resultsFor(ctx.db, await idOf(ctx.db, "anika"));
    assert.ok(results);
    assert.equal(results!.winner, characterById.get("anika")!.name);
    assert.equal(results!.killer, characterById.get(KILLER)!.name);
    assert.equal(results!.you?.guest, "anika");
    const shown = JSON.stringify(results);
    for (const circle of circles) assert.ok(!shown.includes(circle.name), `the results name "${circle.name}"`);
    assert.ok(!("circleChampions" in results!) && !("circleRank" in results!.you!), "no group standings reach the guest");
    assert.ok(results!.you!.items.length > 10);
    assert.equal(results!.board.length, characters.length);
    assert.equal(results!.board.filter((row) => row.isYou).length, 1);
    assert.ok(results!.solution.paragraphs.length >= 5);
    const state = await getState(ctx.db, NIGHT);
    assert.equal(state.submissionsOpen, false, "no answers once results are out");
    const late = await submit(ctx.db, await idOf(ctx.db, "anika"), { kind: "mystery", itemId: "old-1", answer: "changed my mind" }, NIGHT);
    assert.equal(late.ok, false);
  });

  it("can be unpublished, and another guest sees only their own items", async () => {
    const theirs = await resultsFor(ctx.db, await idOf(ctx.db, "molly"));
    assert.equal(theirs!.you?.guest, "molly");
    assert.ok(theirs!.you!.items.every((item) => item.guest === "molly"));
    await unpublishResults(ctx.db);
    assert.equal(await resultsFor(ctx.db, await idOf(ctx.db, "molly")), null);
  });

  it("drops a no-show from the grading", async () => {
    await writeFlag(ctx.db, "absentCharacters", ["luke"]);
    await resetGrades(ctx.db, "auto");
    await runGrading(ctx.db);
    const { standings } = await standingsNow(ctx.db);
    assert.ok(!standings.standings.some((row) => row.guest === "luke"));
    assert.equal(standings.standings.length, characters.length - 1);
    await writeFlag(ctx.db, "absentCharacters", []);
  });

  it("publishes with force when staff accept the automatic grades", async () => {
    await resetGrades(ctx.db, "all");
    await runGrading(ctx.db);
    assert.equal((await publishResults(ctx.db)).ok, false);
    assert.equal((await publishResults(ctx.db, { force: true })).ok, true);
  });
});

describe("guests who stayed home", () => {
  it("are not graded: a guest who never answered anything and never touched the House did not come, and nobody has to mark it", async () => {
    const { db, client } = await freshDb();
    await seedGuests(db);
    await startGame(db, NIGHT);
    await submit(db, await idOf(db, "anika"), { kind: "objective", itemId: "anika-find", answer: "A8NKR" }, NIGHT);
    await butlerSell(db, await idOf(db, "rebecca"), vialWords, holderOf(21), SALE);
    await runGrading(db);
    const { standings } = await standingsNow(db);
    const graded = standings.standings.map((row) => row.guest).sort();
    assert.deepEqual(graded, ["adam", "anika", "rebecca"], "anika answered, adam bought the vial, and Rebecca sold it");
    await client.close();
  });
});

describe("refuses to publish without a killer", () => {
  it("asks staff to decide first", async () => {
    const { db, client } = await freshDb();
    await seedGuests(db);
    await runGrading(db);
    const result = await publishResults(db, { force: true });
    assert.equal(result.ok, false);
    assert.match(result.message, /killer/i);
    await client.close();
  });
});

describe("the guest ledger", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await ctx.db.insert(rsvps).values(characters.map((character) => ({ fullName: character.realNames[0], email: `${character.id}@example.test`, attending: "yes" as const, recordedAt: new Date() })));
    // Luke changed his mind
    await ctx.db.insert(rsvps).values({ fullName: characterById.get("luke")!.realNames[0], email: "luke@example.test", attending: "no", recordedAt: new Date() });
  });
  after(async () => ctx.client.close());

  it("lists every attending guest at zero, with no characters, before the cast is released", async () => {
    const ledger = await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), BEFORE);
    assert.equal(ledger.released, false);
    assert.equal(ledger.rows.length, characters.length - 1, "a guest whose latest RSVP is no is left off");
    assert.ok(!ledger.rows.some((row) => row.name === characterById.get("luke")!.realNames[0]));
    for (const row of ledger.rows) {
      assert.equal(row.points, 0);
      assert.equal(row.character, null);
      assert.equal(row.rank, null);
    }
    assert.equal(ledger.rows.filter((row) => row.isYou).length, 1);
    assert.doesNotMatch(JSON.stringify(ledger), /survivor|marker|killer/i);
  });

  it("shows each guest's character once the cast is released, still at zero", async () => {
    await writeFlag(ctx.db, "identitiesReleased", true);
    const ledger = await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), BEFORE);
    assert.equal(ledger.released, true);
    const sidd = ledger.rows.find((row) => row.name === characterById.get("sidd")!.realNames[0])!;
    assert.equal(sidd.character, characterById.get("sidd")!.name);
    assert.equal(sidd.points, 0);
    for (const row of ledger.rows) assert.equal(row.points, 0);
  });

  it("stays at zero while the night is graded, and shows final scores only once published", async () => {
    await butlerSell(ctx.db, null, vialWords, holderOf(21), SALE);
    await submit(ctx.db, await idOf(ctx.db, "anika"), { kind: "objective", itemId: "anika-find", answer: "A8NKR" }, NIGHT);
    await runGrading(ctx.db);
    assert.ok((await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT)).rows.every((row) => row.points === 0), "grading alone changes nothing a guest can see");
    await publishResults(ctx.db, { force: true });
    const ledger = await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT);
    assert.equal(ledger.published, true);
    assert.equal(ledger.rows[0].rank, 1);
    assert.ok(ledger.rows.some((row) => row.points > 0));
    assert.ok(ledger.rows.every((row, index) => index === 0 || (ledger.rows[index - 1].rank ?? 999) <= (row.rank ?? 999)), "ranked guests first, in order; guests who stayed home follow");
  });
});
