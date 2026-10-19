import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { characters, markers, survivorIds, questions, characterById } from "@/data/game";
import { guests, gameSubmissions } from "@/lib/db/schema";
import { correctAnswer, correctMystery } from "./sim";
import {
  adminOverview,
  applyVerdictFile,
  assignVial,
  butlerSell,
  castByName,
  cardFor,
  deriveState,
  dose,
  getState,
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
  it("keeps everything sealed until the flags or the clock say otherwise", () => {
    assert.equal(deriveState({}, BEFORE).identitiesReleased, false);
    assert.equal(deriveState({}, BEFORE).secretsReleased, false);
    const released = deriveState({ identitiesReleased: true }, BEFORE);
    assert.equal(released.identitiesReleased, true);
    assert.equal(released.secretsReleased, false, "the private tab waits for the night");
    const night = deriveState({ identitiesReleased: true }, NIGHT);
    assert.equal(night.secretsReleased, true);
    assert.equal(night.submissionsOpen, true);
  });
  it("lets the game master hold or force each switch", () => {
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: false }, NIGHT).secretsReleased, false);
    assert.equal(deriveState({ identitiesReleased: true, secretsReleased: true }, BEFORE).secretsReleased, true);
    assert.equal(deriveState({ identitiesReleased: true, submissionsClosed: true }, NIGHT).submissionsOpen, false);
    assert.equal(deriveState({ identitiesReleased: true }, LATE).submissionsOpen, false, "the book closes on its own");
    assert.equal(deriveState({ identitiesReleased: true, submissionsClosed: false }, LATE).submissionsOpen, true, "staff can reopen it");
    assert.equal(deriveState({ identitiesReleased: true, resultsPublished: true }, NIGHT).submissionsOpen, false);
  });
});

describe("the guest's card", () => {
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
    const response = await cardFor(ctx.db, await idOf(ctx.db, "sidd"), BEFORE);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    assert.equal(response.card.id, "sidd");
    assert.ok(response.card.publicBio.length > 20);
    assert.ok(response.card.background.history.length > 20);
    assert.deepEqual(response.card.private.objectives, []);
    assert.equal(response.card.private.survivor, undefined);
    assert.equal(response.directory, null);
    const text = JSON.stringify(response);
    for (const secret of ["Marek", "Doorman", "markerCode", "H3T4V", "Quill", "grievance", "airsick"]) assert.ok(!text.includes(secret), `the pre-party card leaked "${secret}"`);
  });

  it("opens the private tab on the night, with errands but never answers", async () => {
    const response = await cardFor(ctx.db, await idOf(ctx.db, "sidd"), NIGHT);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    assert.equal(response.card.private.objectives.length, 5);
    assert.equal(response.card.private.survivor?.veilTitle, "The Doorman");
    assert.equal(response.card.private.survivor?.rivals.length, 4);
    assert.ok(response.directory && response.directory.length === 24);
    const text = JSON.stringify(response);
    assert.ok(!/"check"|"codes"|"motiveKeys"|"alsoFrom"|AJTN9|nux vomica/.test(text), "answer keys must never reach a guest");
    assert.ok(!/"killer"|"buyer"|"soldTo"/.test(text), "the card never carries who bought the vial");
  });

  it("never marks a survivor in the directory", async () => {
    const response = await cardFor(ctx.db, await idOf(ctx.db, "anika"), NIGHT);
    assert.equal(response.status, "ok");
    if (response.status !== "ok") return;
    for (const row of response.directory!) assert.deepEqual(Object.keys(row).sort(), ["circle", "id", "name", "occupation"]);
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
    await writeFlag(ctx.db, "identitiesReleased", true);
  });
  after(async () => ctx.client.close());

  it("refuses answers before the night and after the book closes", async () => {
    const anika = await idOf(ctx.db, "anika");
    const early = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "Sophia" }, BEFORE);
    assert.equal(early.ok, false);
    const late = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "Sophia" }, LATE);
    assert.equal(late.ok, false);
  });

  it("accepts only your own errands, the real questions and well-formed exhibit codes", async () => {
    const anika = await idOf(ctx.db, "anika");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "Sophia" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "molly-2", answer: "x" }, NIGHT)).ok, false, "someone else's errand");
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "nope", answer: "x" }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "old-1", answer: "staged" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "old-1", answer: "  " }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "mystery", itemId: "bogus", answer: "x" }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "exhibit", itemId: "", answer: "ew-wxp" }, NIGHT)).ok, true);
    assert.equal((await submit(ctx.db, anika, { kind: "exhibit", itemId: "", answer: "x" }, NIGHT)).ok, false);
    assert.equal((await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "x".repeat(601) }, NIGHT)).ok, false);
  });

  it("tells a guest nothing but that the answer was received", async () => {
    const anika = await idOf(ctx.db, "anika");
    const right = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "Sophia" }, NIGHT);
    const wrong = await submit(ctx.db, anika, { kind: "objective", itemId: "anika-2", answer: "nonsense" }, NIGHT);
    assert.deepEqual(Object.keys(right).sort(), Object.keys(wrong).sort());
    assert.deepEqual(Object.keys(right).sort(), ["at", "ok"]);
  });

  it("remembers every submission but returns only the newest for each item", async () => {
    const molly = await idOf(ctx.db, "molly");
    await submit(ctx.db, molly, { kind: "objective", itemId: "molly-2", answer: "first" }, new Date(NIGHT.getTime() + 1000));
    await submit(ctx.db, molly, { kind: "objective", itemId: "molly-2", answer: "second" }, new Date(NIGHT.getTime() + 2000));
    const mine = await mySubmissions(ctx.db, molly);
    const entry = mine.find((row) => row.itemId === "molly-2");
    assert.equal(entry?.answer, "second");
    assert.equal(mine.filter((row) => row.itemId === "molly-2").length, 1);
    const all = await ctx.db.select().from(gameSubmissions);
    assert.ok(all.filter((row) => row.itemId === "molly-2").length >= 2, "the history is kept");
  });

  it("stores survivor picks as character ids, ignoring yourself and anything beyond five", async () => {
    const tim = await idOf(ctx.db, "tim");
    await submit(ctx.db, tim, { kind: "survivors", itemId: "ignored", answer: "Judge Li, Duke Palmer, Tim McGinley, Sandbag, J. Bruce Wayne, Air-Wind Arvind, Anika" }, NIGHT);
    const picks = (await mySubmissions(ctx.db, tim)).find((row) => row.kind === "survivors")!;
    assert.deepEqual(JSON.parse(picks.answer), ["eric", "silas", "diwakar", "joel", "sidd"]);
  });

  it("slows a guest who hammers the button", async () => {
    const jack = await idOf(ctx.db, "jack");
    let refused = 0;
    for (let i = 0; i < 45; i += 1) {
      const result = await submit(ctx.db, jack, { kind: "objective", itemId: "jack-2", answer: `try ${i}` }, NIGHT);
      if (!result.ok && result.code === "slow-down") refused += 1;
    }
    assert.ok(refused >= 4);
  });
});

describe("the House: one bottle, one sale", () => {
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  const code = (no: number) => markers.find((marker) => marker.no === no)!.code;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await writeFlag(ctx.db, "identitiesReleased", true);
  });
  after(async () => ctx.client.close());

  it("refuses a code that is not a marker, and names no one when it does", async () => {
    const result = await butlerSell(ctx.db, null, "ABCDE", NIGHT);
    assert.equal(result.status, "unknown");
    assert.doesNotMatch(result.message, /survivor|joel|eric|silas/i);
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
    assert.equal(overview.vial.soldTo?.slug, "eric");
    assert.equal(overview.vial.attempts.length, 3, "every offer is on the House's log");
    assert.equal(overview.killer, "eric");
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
    const buyer = await idOf(ctx.db, "silas");
    const rival = await idOf(ctx.db, "joel");
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
    assert.equal(await assignVial(ctx.db, "diwakar", NIGHT), true);
    assert.equal(await assignVial(ctx.db, "anika", NIGHT), false, "only a survivor can hold the vial");
    assert.equal(await assignVial(ctx.db, "sidd", NIGHT), true);
    assert.equal((await adminOverview(ctx.db)).killer, "sidd");
  });

  it("lets staff override the killer without touching the House log", async () => {
    await writeFlag(ctx.db, "killerOverride", "joel");
    assert.equal((await adminOverview(ctx.db)).killer, "joel");
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
  let ctx: Awaited<ReturnType<typeof freshDb>>;
  before(async () => {
    ctx = await freshDb();
    await seedGuests(ctx.db);
    await writeFlag(ctx.db, "identitiesReleased", true);
    // the night: sidd buys the vial
    await butlerSell(ctx.db, await idOf(ctx.db, "rebecca"), markers.find((marker) => marker.no === 21)!.code, NIGHT);
    for (const id of survivorIds.filter((id) => id !== "sidd")) await butlerSell(ctx.db, null, markers.find((marker) => marker.no === characterById.get(id)!.survivor!.markerNo)!.code, NIGHT);
    // every guest does their errands; a few mystery answers
    for (const character of characters) {
      const guestId = await idOf(ctx.db, character.id);
      for (const objective of character.objectives) {
        if (["hide", "vial-attempt", "butler-sale", "seek"].includes(objective.check.kind)) continue;
        await submit(ctx.db, guestId, { kind: "objective", itemId: objective.id, answer: correctAnswer(character, objective) }, NIGHT);
      }
    }
    const anika = await idOf(ctx.db, "anika");
    for (const question of questions) await submit(ctx.db, anika, { kind: "mystery", itemId: question.id, answer: correctMystery(question, "sidd") }, NIGHT);
    await submit(ctx.db, anika, { kind: "survivors", itemId: "picks", answer: JSON.stringify(survivorIds) }, NIGHT);
  });
  after(async () => ctx.client.close());

  it("grades everyone present and finds the killer from the House's log", async () => {
    const run = await runGrading(ctx.db);
    assert.equal(run.killer, "sidd");
    assert.ok(run.graded > characters.length * 8);
    const { standings } = await standingsNow(ctx.db);
    assert.equal(standings.killer, "sidd");
    const anika = standings.standings.find((row) => row.guest === "anika")!;
    assert.equal(anika.tiers.mysteries, 100);
    assert.equal(anika.tiers.survivors, 20);
    const sidd = standings.standings.find((row) => row.guest === "sidd")!;
    assert.equal(sidd.tiers.poisoner, 6);
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
    assert.equal(packet.truth.killer, "sidd");
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
    assert.equal(results!.killer, characterById.get("sidd")!.name);
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
