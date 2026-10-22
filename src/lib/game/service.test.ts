import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/pglite/migrator";
import { characters, markers, survivorIds, questions, characterById, alternateOf } from "@/data/game";
import { guests, gameSubmissions, rsvps } from "@/lib/db/schema";
import { correctAnswer, correctMystery } from "./sim";
import {
  adminOverview,
  applyVerdictFile,
  assignCharacter,
  assignVial,
  butlerSell,
  castByName,
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
  it("keeps everything sealed until the host starts the game, whatever the clock says", () => {
    assert.equal(deriveState({}, BEFORE).identitiesReleased, false);
    assert.equal(deriveState({}, NIGHT).secretsReleased, false, "nothing opens on a clock");
    assert.equal(deriveState({}, NIGHT).submissionsOpen, false);
    const released = deriveState({ identitiesReleased: true }, NIGHT);
    assert.equal(released.identitiesReleased, true);
    assert.equal(released.secretsReleased, false, "the private tab waits for the start");
    const started = deriveState({ identitiesReleased: true, secretsReleased: true }, NIGHT);
    assert.equal(started.secretsReleased, true);
    assert.equal(started.submissionsOpen, true);
  });
  it("lets the game master hold or close the book", () => {
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: false }, NIGHT).secretsReleased, false);
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true }, BEFORE).secretsReleased, true, "started means started");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, submissionsClosed: true }, NIGHT).submissionsOpen, false);
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true }, LATE).submissionsOpen, false, "the book closes on its own");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, submissionsClosed: false }, LATE).submissionsOpen, true, "staff can reopen it");
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true, resultsPublished: true }, NIGHT).submissionsOpen, false);
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
    assert.equal((await getState(ctx.db, NIGHT)).secretsReleased, false);
    assert.equal((await cardFor(ctx.db, await guestIdFor(ctx.db, "anika@example.test"), NIGHT)).status, "sealed");
    await startGame(ctx.db, NIGHT);
    const state = await getState(ctx.db, NIGHT);
    assert.equal(state.identitiesReleased, true);
    assert.equal(state.secretsReleased, true);
    assert.equal(state.submissionsOpen, true);
    const response = await cardFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT);
    assert.equal(response.status, "ok");
    if (response.status === "ok") {
      assert.equal(response.card.private.objectives.length, 5);
      assert.ok(response.card.private.race.title);
    }
    assert.equal((await castByName(ctx.db)).uncastCharacters.length, 0);
    assert.equal((await readFlags(ctx.db)).rosterReleased, true, "the public cast list opens with it");
  });

  it("is safe to press twice, and can be taken back for a rehearsal", async () => {
    await startGame(ctx.db, NIGHT);
    assert.equal((await getState(ctx.db, NIGHT)).secretsReleased, true);
    await stopGame(ctx.db);
    const state = await getState(ctx.db, NIGHT);
    assert.equal(state.identitiesReleased, false);
    assert.equal(state.secretsReleased, false);
    assert.equal(state.submissionsOpen, false);
    await startGame(ctx.db, NIGHT);
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
    await butlerSell(ctx.db, null, markers.find((marker) => marker.no === characterById.get(SURVIVOR)!.survivor!.markerNo)!.code, NIGHT);
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

  it("refuses answers before the game starts and after the book closes", async () => {
    const anika = await idOf(ctx.db, "anika");
    const early = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT);
    assert.equal(early.ok, false, "even on the night, nothing opens until the host presses start");
    await startGame(ctx.db, NIGHT);
    const late = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, LATE);
    assert.equal(late.ok, false);
  });

  it("accepts only your own objectives, the group race, the real questions, and no more page filing", async () => {
    const anika = await idOf(ctx.db, "anika");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "molly-who", answer: "x" }, NIGHT)).ok, false, "someone else's objective");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "race", answer: "AAAAA BBBBB CCCCC" }, NIGHT)).ok, true, "a group race entry");
    assert.equal((await submit(ctx.db, await idOf(ctx.db, "molly"), { kind: "objective", itemId: "race", answer: "x" }, NIGHT)).ok, false, "the survivors' race is the vial, not a box");
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
  const code = (no: number) => markers.find((marker) => marker.no === no)!.code;
  const survivorAt = (no: number) => survivorIds.find((id) => characterById.get(id)!.survivor!.markerNo === no)!;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await writeFlag(ctx.db, "identitiesReleased", true);
  });
  after(async () => ctx.client.close());

  it("refuses a code that is not a marker, and names no one when it does", async () => {
    const result = await butlerSell(ctx.db, null, "ABCDE", NIGHT);
    assert.equal(result.status, "unknown");
    assert.doesNotMatch(result.message, new RegExp(`survivor|${survivorIds.join("|")}`, "i"));
  });

  it("sells to the first marker and tells everyone after that the House has none left", async () => {
    const rebecca = await idOf(ctx.db, "rebecca");
    const first = await butlerSell(ctx.db, rebecca, code(20), NIGHT);
    assert.equal(first.status, "sold");
    const second = await butlerSell(ctx.db, rebecca, code(22), NIGHT);
    assert.equal(second.status, "sold-out");
    const again = await butlerSell(ctx.db, rebecca, code(20), NIGHT);
    assert.equal(again.status, "sold-out", "even the buyer cannot buy twice");
    const overview = await adminOverview(ctx.db);
    assert.equal(overview.vial.soldTo?.slug, survivorAt(20));
    assert.equal(overview.vial.attempts.length, 3, "every offer is on the House's log");
    assert.equal(overview.killer, survivorAt(20));
  });

  it("allows exactly one sale when five phones tap at once", async () => {
    await resetVial(ctx.db);
    const rebecca = await idOf(ctx.db, "rebecca");
    const results = await Promise.all(markers.map((marker) => butlerSell(ctx.db, rebecca, marker.code, NIGHT)));
    assert.equal(results.filter((result) => result.status === "sold").length, 1);
    assert.equal(results.filter((result) => result.status === "sold-out").length, 4);
    const overview = await adminOverview(ctx.db);
    assert.equal(overview.vial.attempts.length, 5);
    assert.equal(overview.vial.attempts.filter((attempt) => attempt.sold).length, 1);
  });

  it("closes the House once the nightcap is served", async () => {
    await resetVial(ctx.db);
    await writeFlag(ctx.db, "nightcapServed", true);
    const result = await butlerSell(ctx.db, null, code(18), NIGHT);
    assert.equal(result.status, "closed");
    await writeFlag(ctx.db, "nightcapServed", false);
  });

  it("lets only the buyer dose the nightcap, and says nothing either way", async () => {
    await resetVial(ctx.db);
    await butlerSell(ctx.db, null, code(19), NIGHT);
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
    const result = await butlerSell(db, null, code(21), NIGHT);
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
    await butlerSell(ctx.db, await idOf(ctx.db, "rebecca"), markers.find((marker) => marker.no === 21)!.code, NIGHT);
    for (const id of survivorIds.filter((id) => id !== KILLER)) await butlerSell(ctx.db, null, markers.find((marker) => marker.no === characterById.get(id)!.survivor!.markerNo)!.code, NIGHT);
    // every guest does their errands; a few mystery answers
    for (const character of characters) {
      const guestId = await idOf(ctx.db, character.id);
      for (const objective of character.objectives) {
        if (["hide", "vial-attempt", "butler-sale", "seek"].includes(objective.check.kind)) continue;
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
    await butlerSell(ctx.db, null, markers.find((marker) => marker.no === 21)!.code, NIGHT);
    await submit(ctx.db, await idOf(ctx.db, "anika"), { kind: "objective", itemId: "anika-secret", answer: "Sophia" }, NIGHT);
    await runGrading(ctx.db);
    assert.ok((await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT)).rows.every((row) => row.points === 0), "grading alone changes nothing a guest can see");
    await publishResults(ctx.db, { force: true });
    const ledger = await ledgerFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT);
    assert.equal(ledger.published, true);
    assert.equal(ledger.rows[0].rank, 1);
    assert.ok(ledger.rows.some((row) => row.points > 0));
    assert.ok(ledger.rows.every((row, index) => index === 0 || (ledger.rows[index - 1].rank ?? 0) <= (row.rank ?? 0)));
  });
});
