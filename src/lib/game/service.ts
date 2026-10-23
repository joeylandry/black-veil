/**
 * Everything the game does with the database. Route handlers stay thin and call these, and
 * the tests call them against an in-process Postgres (PGlite), so the rules that matter, such
 * as "only one sale", "latest answer wins" and "no feedback until publication", are proven.
 *
 * SERVER-ONLY: imports the game bible.
 */
import { and, asc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { eventConfig } from "@/config/event";
import {
  buildCard,
  characterById,
  characterForName,
  characters,
  alternateOf,
  listDirectory,
  vialWords,
  objectiveById,
  questionById,
  questions,
  survivors,
} from "@/data/game";
import { glassCode } from "@/data/game/props";
import { characters as characterRows, gameEvents, gameFlags, gameGrades, gameSubmissions, guests, rsvps } from "@/lib/db/schema";
import { autoGrade, parsePicks, raceComplete } from "./grading";
import { buildPacket, parseVerdicts } from "./packet";
import type { Packet } from "./packet";
import { applyOverrides, computeStandings } from "./scoring";
import { setReleased } from "@/lib/roster-service";
import { finalEdition } from "@/data/game/story";
import { normalizeCode } from "./text";
import type { GameEvent, GradeItem, Standings, Submission, SubmissionKind, Truth } from "./types";

export type GameDb = PgDatabase<PgQueryResultHKT, Record<string, never>>;

const MAX_ANSWER = 600;
const MAX_PROOF = 800;
const SUBMISSIONS_PER_MINUTE = 40;

// ---------------------------------------------------------------- flags and state

export type GameState = {
  identitiesReleased: boolean;
  secretsReleased: boolean;
  submissionsOpen: boolean;
  nightcapServed: boolean;
  resultsPublished: boolean;
  absent: string[];
  seed: string;
  killerOverride: string | null;
};

/** What the game master may rewrite on a character from the admin page. Everything else stays in the bible. */
export type CastEdit = { name?: string; occupation?: string; publicBio?: string; history?: string; wardrobe?: string };
const castEditLimits: Record<keyof CastEdit, number> = { name: 80, occupation: 120, publicBio: 600, history: 1500, wardrobe: 400 };
const originals = new Map<string, Required<CastEdit>>();

/**
 * Lays the saved edits over the in-memory bible (and restores the printed text where an edit
 * was removed). Called whenever flags are read, so every request sees the current wording.
 */
export function applyCastEdits(edits: unknown) {
  const saved = edits && typeof edits === "object" ? (edits as Record<string, CastEdit>) : {};
  for (const character of characters) {
    if (!originals.has(character.id)) {
      originals.set(character.id, { name: character.name, occupation: character.occupation, publicBio: character.publicBio, history: character.background.history, wardrobe: character.background.wardrobe });
    }
    const base = originals.get(character.id)!;
    const edit = saved[character.id] ?? {};
    const pick = (key: keyof CastEdit) => (typeof edit[key] === "string" && edit[key]!.trim() ? edit[key]!.trim() : base[key]);
    character.name = pick("name");
    character.occupation = pick("occupation");
    character.publicBio = pick("publicBio");
    character.background = { ...character.background, history: pick("history"), wardrobe: pick("wardrobe") };
  }
}

export function printedCharacter(slug: string): Required<CastEdit> | undefined {
  return originals.get(slug);
}

/** Saves one character's edits (blank fields go back to the printed text), or clears them all when `edit` is null. */
export async function editCharacter(db: GameDb, slug: string, edit: CastEdit | null): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!characterById.has(slug)) return { ok: false, error: "Unknown character." };
  const flags = await readFlags(db);
  const all: Record<string, CastEdit> = flags.castEdits && typeof flags.castEdits === "object" ? { ...(flags.castEdits as Record<string, CastEdit>) } : {};
  if (edit === null) delete all[slug];
  else {
    const clean: CastEdit = {};
    for (const key of Object.keys(castEditLimits) as (keyof CastEdit)[]) {
      const value = edit[key];
      if (typeof value !== "string" || !value.trim()) continue;
      if (value.trim().length > castEditLimits[key]) return { ok: false, error: `${key} is too long (the limit is ${castEditLimits[key]} characters).` };
      clean[key] = value.trim();
    }
    if (Object.keys(clean).length) all[slug] = clean;
    else delete all[slug];
  }
  await writeFlag(db, "castEdits", Object.keys(all).length ? all : null);
  applyCastEdits(Object.keys(all).length ? all : null);
  await seedCast(db);
  return { ok: true };
}

export async function readFlags(db: GameDb): Promise<Record<string, unknown>> {
  const rows = await db.select().from(gameFlags);
  const flags = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  applyCastEdits(flags.castEdits);
  return flags;
}

/** Sets a flag. Writing null (or undefined) clears it, handing the switch back to the clock. */
export async function writeFlag(db: GameDb, key: string, value: unknown) {
  if (value === null || value === undefined) {
    await db.delete(gameFlags).where(eq(gameFlags.key, key));
    return;
  }
  await db
    .insert(gameFlags)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: gameFlags.key, set: { value, updatedAt: new Date() } });
}

/** A switch the game master may force on, force off, or leave to the clock. */
function tri(value: unknown): boolean | undefined {
  return value === true ? true : value === false ? false : undefined;
}

export function deriveState(flags: Record<string, unknown>, now = new Date()): GameState {
  // The game opens by itself at the start time; the Start game button (see startGame) only opens it early.
  const started = now.getTime() >= new Date(eventConfig.secretsReleaseAt).getTime();
  // "Show names" on the cast page (rosterReleased) deals the characters here too; private cards still wait for the start
  const identitiesReleased = eventConfig.charactersReleased || tri(flags.identitiesReleased) === true || flags.rosterReleased === true || started;
  const forcedSecrets = tri(flags.secretsReleased);
  const secretsReleased = identitiesReleased && (forcedSecrets ?? started);
  const forcedClosed = tri(flags.submissionsClosed);
  const closed = forcedClosed ?? now.getTime() >= new Date(eventConfig.submissionsCloseAt).getTime();
  return {
    identitiesReleased,
    secretsReleased,
    submissionsOpen: secretsReleased && !closed && flags.resultsPublished !== true,
    // the House closes by itself at nine o'clock (or when staff say so)
    nightcapServed: flags.nightcapServed === true || now.getTime() >= new Date(eventConfig.nightcapServedAt).getTime(),
    resultsPublished: flags.resultsPublished === true,
    absent: Array.isArray(flags.absentCharacters) ? (flags.absentCharacters as string[]) : [],
    seed: typeof flags.seed === "string" && flags.seed ? flags.seed : "black-veil-1926",
    killerOverride: typeof flags.killerOverride === "string" ? flags.killerOverride : null,
  };
}

/**
 * The one button: releases every guest's public card, private card and objectives, and opens the
 * answer boxes. Safe to press twice. (The book still closes by itself at the closing time.)
 */
export async function startGame(db: GameDb, now = new Date()): Promise<void> {
  // make sure every character exists and every registered guest is dealt theirs by name before the doors open
  await seedCast(db);
  await castMissing(db);
  await writeFlag(db, "identitiesReleased", true);
  await writeFlag(db, "secretsReleased", true);
  await writeFlag(db, "submissionsClosed", null);
  await writeFlag(db, "gameStartedAt", now.toISOString());
  await setReleased(db, true);
}

/** Takes the game back to sealed (for a rehearsal). */
export async function stopGame(db: GameDb): Promise<void> {
  await writeFlag(db, "identitiesReleased", null);
  await writeFlag(db, "secretsReleased", null);
  await writeFlag(db, "gameStartedAt", null);
  await setReleased(db, false);
}

export async function getState(db: GameDb, now = new Date()): Promise<GameState> {
  return deriveState(await readFlags(db), now);
}

// ---------------------------------------------------------------- roster

export type RosterRow = { guestId: string; fullName: string; email: string; slug: string | null };

export async function loadRoster(db: GameDb): Promise<RosterRow[]> {
  return db
    .select({ guestId: guests.id, fullName: guests.fullName, email: guests.email, slug: characterRows.gameKey })
    .from(guests)
    .leftJoin(characterRows, eq(guests.characterId, characterRows.id))
    .orderBy(asc(guests.fullName));
}

function maps(roster: RosterRow[]) {
  const slugOf = new Map<string, string>();
  const guestOf = new Map<string, string>();
  for (const row of roster) {
    if (!row.slug) continue;
    slugOf.set(row.guestId, row.slug);
    guestOf.set(row.slug, row.guestId);
  }
  return { slugOf, guestOf };
}

/**
 * Puts every game character into the `characters` table (so the older guest ledger can show a
 * name and a public line) and returns how many rows were created or refreshed. Private fields
 * stay empty on purpose: the private card is served from the game bible by /api/game/card.
 */
export async function seedCast(db: GameDb): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  for (const character of characters) {
    const values = {
      characterName: character.name,
      occupation: character.occupation,
      publicBiography: character.publicBio,
      // groups are for races and grading only: never written where a guest could read them
      factions: [] as string[],
      privateBiography: "",
      secrets: [] as string[],
      objectives: [] as string[],
      murderer: false,
      victim: false,
      active: true,
      gameKey: character.id,
    };
    // one statement, so twenty-four phones opening at eight o'clock cannot trip over each other
    const [row] = await db
      .insert(characterRows)
      .values(values)
      .onConflictDoUpdate({ target: characterRows.gameKey, set: values })
      .returning({ inserted: sql<boolean>`(xmax = 0)` });
    if (row?.inserted) created += 1;
    else updated += 1;
  }
  return { created, updated };
}

/**
 * Makes sure every character exists and every guest who has no character yet is dealt the one built for their
 * name. It only fills gaps: a guest the host cast by hand is never moved. It runs by itself whenever the game
 * is open, so nobody has to press anything for the cards to appear.
 */
let castQueue: Promise<unknown> = Promise.resolve();
export function castMissing(db: GameDb): Promise<number> {
  // run one at a time within this server, so a rush of first page loads does the work once
  const next = castQueue.then(() => castMissingNow(db));
  castQueue = next.catch(() => undefined);
  return next;
}

async function castMissingNow(db: GameDb): Promise<number> {
  const [uncast] = await db.select({ n: sql<number>`count(*)` }).from(guests).where(isNull(guests.characterId));
  const [seeded] = await db.select({ n: sql<number>`count(*)` }).from(characterRows).where(sql`${characterRows.gameKey} is not null`);
  if (Number(uncast.n) === 0 && Number(seeded.n) >= characters.length) return 0;
  if (Number(seeded.n) < characters.length) await seedCast(db);
  const rows = await db.select({ id: characterRows.id, gameKey: characterRows.gameKey }).from(characterRows);
  const rowBySlug = new Map(rows.filter((row) => row.gameKey).map((row) => [row.gameKey!, row.id]));
  const held = new Set((await db.select({ characterId: guests.characterId }).from(guests)).map((row) => row.characterId).filter(Boolean));
  const waiting = await db.select({ id: guests.id, fullName: guests.fullName }).from(guests).where(isNull(guests.characterId));
  let dealt = 0;
  for (const guest of waiting) {
    const character = characterForName(guest.fullName);
    const rowId = character ? rowBySlug.get(character.id) : undefined;
    if (!rowId || held.has(rowId)) continue;
    await db.update(guests).set({ characterId: rowId }).where(eq(guests.id, guest.id));
    held.add(rowId);
    dealt += 1;
  }
  return dealt;
}

/** Deals each registered guest the character built for their name. Guests whose name matches nobody are reported, not guessed at. */
export async function castByName(db: GameDb): Promise<{ assigned: number; kept: number; unmatchedGuests: string[]; uncastCharacters: string[] }> {
  const rows = await db.select({ id: characterRows.id, gameKey: characterRows.gameKey }).from(characterRows);
  const rowBySlug = new Map(rows.filter((row) => row.gameKey).map((row) => [row.gameKey!, row.id]));
  const all = await db.select({ id: guests.id, fullName: guests.fullName, characterId: guests.characterId }).from(guests);
  let assigned = 0;
  let kept = 0;
  const unmatched: string[] = [];
  const cast = new Set<string>();
  for (const guest of all) {
    const character = characterForName(guest.fullName);
    const rowId = character ? rowBySlug.get(character.id) : undefined;
    if (!character || !rowId) {
      unmatched.push(guest.fullName);
      continue;
    }
    cast.add(character.id);
    if (guest.characterId === rowId) {
      kept += 1;
      continue;
    }
    await db.update(guests).set({ characterId: rowId }).where(eq(guests.id, guest.id));
    assigned += 1;
  }
  return { assigned, kept, unmatchedGuests: unmatched, uncastCharacters: characters.filter((character) => !cast.has(character.id)).map((character) => character.id) };
}

/**
 * Hand-casting: gives a character to a guest, or takes it back when guestId is null. A guest holds
 * one character and a character has one guest, so whoever held either before is released.
 */
export async function assignCharacter(db: GameDb, slug: string, guestId: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  let [row] = await db.select({ id: characterRows.id }).from(characterRows).where(eq(characterRows.gameKey, slug)).limit(1);
  if (!row) {
    await seedCast(db);
    [row] = await db.select({ id: characterRows.id }).from(characterRows).where(eq(characterRows.gameKey, slug)).limit(1);
  }
  if (!row) return { ok: false, error: "That character could not be created." };
  if (guestId !== null) {
    const [guest] = await db.select({ id: guests.id }).from(guests).where(eq(guests.id, guestId)).limit(1);
    if (!guest) return { ok: false, error: "That guest is not on the register." };
  }
  await db.update(guests).set({ characterId: null }).where(eq(guests.characterId, row.id));
  if (guestId !== null) await db.update(guests).set({ characterId: row.id }).where(eq(guests.id, guestId));
  return { ok: true };
}

// ---------------------------------------------------------------- the guest's card

export type CardResponse =
  | { status: "sealed"; message: string }
  | { status: "uncast"; message: string }
  | {
      status: "ok";
      card: NonNullable<ReturnType<typeof buildCard>>;
      secretsReleased: boolean;
      directory: ReturnType<typeof listDirectory> | null;
      /** The final questions: prompts only, never rubrics. */
      questions: { id: string; mystery: string; prompt: string; hint: string; points: number; type: "text" | "guest" }[] | null;
      state: Pick<GameState, "submissionsOpen" | "nightcapServed" | "resultsPublished">;
    };

export async function cardFor(db: GameDb, guestId: string, now = new Date()): Promise<CardResponse> {
  const state = await getState(db, now);
  if (!state.identitiesReleased) return { status: "sealed", message: "Characters coming very soon." };
  await castMissing(db);
  const roster = await loadRoster(db);
  const slug = maps(roster).slugOf.get(guestId);
  if (!slug) return { status: "uncast", message: "Management has not yet chosen who you will be." };
  const full = buildCard(slug)!;
  // the Butler and the one who bought the vial answer the replacement questions instead of "who" and "how"
  const buyer = await db.select({ guestId: gameEvents.guestId }).from(gameEvents).where(eq(gameEvents.kind, "vial-sold")).limit(1);
  const insider = characterById.get(slug)?.role === "butler" || buyer[0]?.guestId === guestId;
  const asked = questions.filter((question) => (question.alternateFor ? insider : !(insider && alternateOf.has(question.id))));
  // before the night the private tab is withheld entirely, never merely hidden by the client
  const card = state.secretsReleased
    ? full
    : {
        ...full,
        // the survivors do not learn what they are until the game starts, so the group is withheld too
        circle: { id: "sealed", name: "", blurb: "" },
        private: { ...full.private, secrets: [], knows: [], habit: undefined, role: undefined, survivor: undefined, objectives: [], carries: [], totalPoints: 0, race: { group: "", title: "", text: "", ask: "", house: true, points: 1, slips: [], closed: false, wonByYou: false } },
      };
  // a group's race point can be won only once: tell the rest of the group it is gone
  if (state.secretsReleased && full.circle.id !== "survivors") {
    const winner = await raceWinner(db, full.circle.id, roster);
    card.private.race = { ...card.private.race, closed: Boolean(winner), wonByYou: winner === slug };
  }
  // the groups are for the races and for grading: the page never names them
  card.circle = { id: "", name: "", blurb: "" };
  card.private.race = { ...card.private.race, group: "" };
  return {
    status: "ok",
    card,
    secretsReleased: state.secretsReleased,
    directory: state.secretsReleased ? listDirectory() : null,
    questions: state.secretsReleased ? asked.map((question) => ({ id: question.id, mystery: question.mystery, prompt: question.prompt, hint: question.hint, points: question.points, type: question.type })) : null,
    state: { submissionsOpen: state.submissionsOpen, nightcapServed: state.nightcapServed, resultsPublished: state.resultsPublished },
  };
}

// ---------------------------------------------------------------- submissions

export type SubmitInput = { kind: SubmissionKind; itemId: string; answer: string; proof?: string };
/** The member of a group who has already finished its race (the earliest complete entry), or null while the point is still open. */
async function raceWinner(db: GameDb, circle: string, roster: RosterRow[]): Promise<string | null> {
  const { slugOf } = maps(roster);
  const rows = await db
    .select({ guestId: gameSubmissions.guestId, answer: gameSubmissions.answer })
    .from(gameSubmissions)
    .where(and(eq(gameSubmissions.kind, "objective"), eq(gameSubmissions.itemId, "race")))
    .orderBy(asc(gameSubmissions.createdAt));
  for (const row of rows) {
    const slug = slugOf.get(row.guestId);
    if (slug && characterById.get(slug)?.circle === circle && raceComplete(row.answer, circle)) return slug;
  }
  return null;
}

/** A standing row as a guest may see it: the groups are for grading only. */
function withoutGroup<T extends { circle: string; circleRank: number }>(row: T): Omit<T, "circle" | "circleRank"> {
  const copy: Partial<T> = { ...row };
  delete copy.circle;
  delete copy.circleRank;
  return copy as Omit<T, "circle" | "circleRank">;
}

export type SubmitResult = { ok: true; at: string } | { ok: false; code: "closed" | "uncast" | "invalid" | "slow-down"; message: string };

/** The only thing a guest ever learns from submitting is that it was received. */
export async function submit(db: GameDb, guestId: string, input: SubmitInput, now = new Date()): Promise<SubmitResult> {
  const state = await getState(db, now);
  if (!state.secretsReleased) return { ok: false, code: "closed", message: "The night has not begun." };
  if (!state.submissionsOpen) return { ok: false, code: "closed", message: "The book is closed. No more answers are being taken." };
  await castMissing(db);
  const roster = await loadRoster(db);
  const slug = maps(roster).slugOf.get(guestId);
  if (!slug) return { ok: false, code: "uncast", message: "You have no character yet." };
  const character = characterById.get(slug)!;

  const answer = (input.answer ?? "").toString().trim();
  const proof = (input.proof ?? "").toString().trim();
  if (answer.length > MAX_ANSWER || proof.length > MAX_PROOF) return { ok: false, code: "invalid", message: `Keep answers under ${MAX_ANSWER} characters and notes under ${MAX_PROOF}.` };

  let itemId = (input.itemId ?? "").toString();
  let stored = answer;
  switch (input.kind) {
    case "objective": {
      // the group race is not one of the five errands; the survivors' race is the vial and takes no answer
      const isRace = itemId === "race" && character.circle !== "survivors";
      // the point is taken once somebody in the group has finished: the box closes for everyone else
      if (isRace) {
        const winner = await raceWinner(db, character.circle, roster);
        if (winner && winner !== slug) return { ok: false, code: "closed", message: "Someone else has already won this point." };
      }
      // everyone reports their bills at the end for the wallet bonus
      const isCash = itemId === "cash";
      if (!isRace && !isCash && (!character.objectives.some((objective) => objective.id === itemId) || !objectiveById.has(itemId))) return { ok: false, code: "invalid", message: "That is not one of your errands." };
      break;
    }
    case "exhibit":
      return { ok: false, code: "invalid", message: "Pages are no longer filed; just use what they tell you." };
    case "mystery":
      if (!questionById.has(itemId)) return { ok: false, code: "invalid", message: "That is not one of the final questions." };
      if (!answer) return { ok: false, code: "invalid", message: "Write an answer first." };
      break;
    case "survivors": {
      itemId = "picks";
      const picks = parsePicks(answer, slug);
      stored = JSON.stringify(picks);
      break;
    }
    default:
      return { ok: false, code: "invalid", message: "Unknown kind of answer." };
  }

  const since = new Date(now.getTime() - 60_000);
  const recent = await db.select({ n: sql<number>`count(*)` }).from(gameSubmissions).where(and(eq(gameSubmissions.guestId, guestId), gte(gameSubmissions.createdAt, since)));
  if (Number(recent[0]?.n ?? 0) >= SUBMISSIONS_PER_MINUTE) return { ok: false, code: "slow-down", message: "Slow down a moment." };

  await db.insert(gameSubmissions).values({ guestId, kind: input.kind, itemId, answer: stored, proof, createdAt: now });
  return { ok: true, at: now.toISOString() };
}

/** The guest's own newest answer for each item, so the form can show what they last wrote. */
export async function mySubmissions(db: GameDb, guestId: string) {
  const rows = await db.select().from(gameSubmissions).where(eq(gameSubmissions.guestId, guestId)).orderBy(asc(gameSubmissions.createdAt));
  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows) latest.set(`${row.kind}|${row.itemId}`, row);
  return [...latest.values()].map((row) => ({ kind: row.kind, itemId: row.itemId, answer: row.answer, proof: row.proof, at: row.createdAt.toISOString() }));
}

// ---------------------------------------------------------------- the House: the Butler's sale and the dose

export type SaleStatus = "sold" | "sold-out" | "unknown" | "closed" | "early";
export type SaleResult = { status: SaleStatus; message: string };

/**
 * A guest says the House's words to the Butler, and the Butler types them and picks who said them.
 * The House answers only after 8:45 p.m., only to the right words, and only for a survivor. Whether
 * it says yes then depends on whether the House still has its bottle: the database's unique index
 * allows exactly one sale, so two phones tapping at once cannot both succeed. Every offer is
 * logged, so a survivor who arrives too late still scores their errand.
 */
export async function butlerSell(db: GameDb, actorGuestId: string | null, words: string, buyerSlug: string, now = new Date()): Promise<SaleResult> {
  const state = await getState(db, now);
  if (state.nightcapServed) return { status: "closed", message: "The nightcap has been served. The House is closed for the night." };
  if (now.getTime() < new Date(eventConfig.vialOpensAt).getTime()) return { status: "early", message: "The House does not see anyone about this before a quarter to nine." };
  const unknown = { status: "unknown" as const, message: "Those are not the House's words, or that guest has no business with the House." };
  if (normalizeCode(words) !== normalizeCode(vialWords)) return unknown;
  const owner = survivors.find((character) => character.id === buyerSlug);
  if (!owner) return unknown;
  if (state.identitiesReleased) await castMissing(db);
  const roster = await loadRoster(db);
  const buyerGuestId = maps(roster).guestOf.get(owner.id);
  if (!buyerGuestId) return unknown;

  return db.transaction(async (tx) => {
    const sale = await tx
      .insert(gameEvents)
      .values({ kind: "vial-sold", guestId: buyerGuestId, byGuestId: actorGuestId, sold: true, createdAt: now })
      .onConflictDoNothing()
      .returning({ id: gameEvents.id });
    const sold = sale.length > 0;
    await tx.insert(gameEvents).values({ kind: "vial-attempt", guestId: buyerGuestId, byGuestId: actorGuestId, sold, createdAt: now });
    return sold
      ? { status: "sold" as const, message: "Sold. Hand over the vial and keep the slip." }
      : { status: "sold-out" as const, message: "The House has none left tonight. Hand the slip back." };
  });
}

/** Staff override: sell the vial to a survivor directly, when the Butler is absent or the phone failed. */
export async function assignVial(db: GameDb, slug: string, now = new Date()): Promise<boolean> {
  const roster = await loadRoster(db);
  const guestId = maps(roster).guestOf.get(slug);
  if (!guestId || !characterById.get(slug)?.survivor) return false;
  await db.delete(gameEvents).where(inArray(gameEvents.kind, ["vial-sold"]));
  await db.insert(gameEvents).values({ kind: "vial-sold", guestId, byGuestId: null, sold: true, createdAt: now });
  await db.insert(gameEvents).values({ kind: "vial-attempt", guestId, byGuestId: null, sold: true, createdAt: now });
  return true;
}

export async function resetVial(db: GameDb) {
  await db.delete(gameEvents);
}

/** The buyer pours the vial into the Keeper's nightcap by typing the code under the glass's coaster. Always answers "noted". */
export async function dose(db: GameDb, guestId: string, rawCode: string, now = new Date()): Promise<void> {
  const state = await getState(db, now);
  if (state.nightcapServed) return;
  if (normalizeCode(rawCode) !== normalizeCode(glassCode)) return;
  const sale = await db.select({ guestId: gameEvents.guestId }).from(gameEvents).where(eq(gameEvents.kind, "vial-sold")).limit(1);
  if (!sale.length || sale[0].guestId !== guestId) return;
  const done = await db.select({ id: gameEvents.id }).from(gameEvents).where(and(eq(gameEvents.kind, "dose"), eq(gameEvents.guestId, guestId))).limit(1);
  if (done.length) return;
  await db.insert(gameEvents).values({ kind: "dose", guestId, byGuestId: null, sold: null, createdAt: now });
}

// ---------------------------------------------------------------- loading the night

export type Night = {
  roster: RosterRow[];
  submissions: Submission[];
  events: GameEvent[];
  truth: Truth;
  guestOf: Map<string, string>;
  slugOf: Map<string, string>;
};

export async function loadNight(db: GameDb): Promise<Night> {
  await castMissing(db);
  const roster = await loadRoster(db);
  const { slugOf, guestOf } = maps(roster);
  const flags = await readFlags(db);
  const state = deriveState(flags);

  const subRows = await db.select().from(gameSubmissions).orderBy(asc(gameSubmissions.createdAt));
  const submissions: Submission[] = [];
  for (const row of subRows) {
    const guest = slugOf.get(row.guestId);
    if (!guest) continue;
    submissions.push({ guest, kind: row.kind, itemId: row.itemId, answer: row.answer, proof: row.proof, at: row.createdAt.getTime() });
  }

  const eventRows = await db.select().from(gameEvents).orderBy(asc(gameEvents.createdAt));
  const events: GameEvent[] = [];
  for (const row of eventRows) {
    const guest = slugOf.get(row.guestId);
    if (!guest) continue;
    const at = row.createdAt.getTime();
    if (row.kind === "vial-attempt") events.push({ kind: "vial-attempt", guest, at, sold: Boolean(row.sold) });
    else if (row.kind === "vial-sold") events.push({ kind: "vial-sold", guest, by: row.byGuestId ? (slugOf.get(row.byGuestId) ?? null) : null, at });
    else events.push({ kind: "dose", guest, at });
  }

  const sale = events.find((event) => event.kind === "vial-sold");
  const killer = state.killerOverride ?? (sale ? sale.guest : null);
  // Nobody has to mark who stayed home: a guest who never typed a single answer and never touched the House did not come.
  const active = new Set<string>(submissions.map((submission) => submission.guest));
  for (const event of events) {
    active.add(event.guest);
    if (event.kind === "vial-sold" && event.by) active.add(event.by);
  }
  const present = [...slugOf.values()].filter((slug) => !state.absent.includes(slug) && active.has(slug));
  return { roster, submissions, events, truth: { killer, present, seed: state.seed }, guestOf, slugOf };
}

// ---------------------------------------------------------------- grading

export type GradeRow = typeof gameGrades.$inferSelect;

function toItem(row: GradeRow, slugOf: Map<string, string>): GradeItem | null {
  const guest = slugOf.get(row.guestId);
  if (!guest) return null;
  return { guest, kind: row.kind as GradeItem["kind"], itemId: row.itemId, verdict: row.verdict, points: row.points, max: row.max, rationale: row.rationale, needsReview: row.needsReview, source: row.source };
}

export async function currentItems(db: GameDb, night?: Night): Promise<GradeItem[]> {
  const loaded = night ?? (await loadNight(db));
  const rows = await db.select().from(gameGrades);
  return rows.map((row) => toItem(row, loaded.slugOf)).filter((item): item is GradeItem => Boolean(item));
}

export type GradeRun = { graded: number; kept: number; removed: number; pending: number; killer: string | null };

/** Re-runs the automatic grader. Decisions by Claude or staff are kept; automatic grades are refreshed. */
export async function runGrading(db: GameDb): Promise<GradeRun> {
  const night = await loadNight(db);
  const items = autoGrade({ submissions: night.submissions, events: night.events, truth: night.truth });
  const existing = await db.select().from(gameGrades);
  const byKey = new Map(existing.map((row) => [`${row.guestId}|${row.kind}|${row.itemId}`, row]));
  let graded = 0;
  let kept = 0;

  await db.transaction(async (tx) => {
    const fresh = new Set<string>();
    for (const item of items) {
      const guestId = night.guestOf.get(item.guest);
      if (!guestId) continue;
      const key = `${guestId}|${item.kind}|${item.itemId}`;
      fresh.add(key);
      const previous = byKey.get(key);
      if (previous && previous.source !== "auto") {
        kept += 1;
        continue;
      }
      const values = { guestId, kind: item.kind, itemId: item.itemId, verdict: item.verdict, points: item.points, max: item.max, rationale: item.rationale, needsReview: item.needsReview, source: "auto" as const, gradedAt: new Date() };
      if (previous) await tx.update(gameGrades).set(values).where(eq(gameGrades.id, previous.id));
      else await tx.insert(gameGrades).values(values);
      graded += 1;
    }
    const stale = existing.filter((row) => row.source === "auto" && !fresh.has(`${row.guestId}|${row.kind}|${row.itemId}`));
    if (stale.length) await tx.delete(gameGrades).where(inArray(gameGrades.id, stale.map((row) => row.id)));
  });

  const current = await currentItems(db, night);
  const removed = existing.filter((row) => row.source === "auto" && !items.some((item) => night.guestOf.get(item.guest) === row.guestId && item.kind === row.kind && item.itemId === row.itemId)).length;
  return { graded, kept, removed, pending: current.filter((item) => item.needsReview && item.source === "auto").length, killer: night.truth.killer };
}

export async function standingsNow(db: GameDb): Promise<{ standings: Standings; night: Night; items: GradeItem[] }> {
  const night = await loadNight(db);
  const items = await currentItems(db, night);
  return { standings: computeStandings(items, night.submissions, night.truth), night, items };
}

export async function makePacket(db: GameDb): Promise<Packet> {
  const { night, items } = await standingsNow(db);
  return buildPacket(items, night.submissions, night.truth);
}

export type VerdictRun = { applied: number; errors: string[]; unmatched: number };

/** Applies a verdicts file (from Claude or staff). Rows that cannot be matched or are out of range are reported, never guessed at. */
export async function applyVerdictFile(db: GameDb, input: unknown, source: "claude" | "staff" = "claude"): Promise<VerdictRun> {
  const parsed = parseVerdicts(input, source);
  const night = await loadNight(db);
  const items = await currentItems(db, night);
  const result = applyOverrides(items, parsed.overrides);
  const changed = result.items.filter((item, index) => item.source !== items[index].source || item.points !== items[index].points || item.verdict !== items[index].verdict || item.rationale !== items[index].rationale);
  await db.transaction(async (tx) => {
    for (const item of changed) {
      const guestId = night.guestOf.get(item.guest);
      if (!guestId) continue;
      await tx
        .update(gameGrades)
        .set({ verdict: item.verdict, points: item.points, rationale: item.rationale, needsReview: false, source: item.source, gradedAt: new Date() })
        .where(and(eq(gameGrades.guestId, guestId), eq(gameGrades.kind, item.kind), eq(gameGrades.itemId, item.itemId)));
    }
  });
  return { applied: changed.length, errors: [...parsed.errors, ...result.invalid], unmatched: result.unmatched.length };
}

export async function resetGrades(db: GameDb, scope: "auto" | "all") {
  if (scope === "all") await db.delete(gameGrades);
  else await db.delete(gameGrades).where(eq(gameGrades.source, "auto"));
}

// ---------------------------------------------------------------- results

export type PublishedResults = {
  publishedAt: string;
  standings: Standings;
  solution: ReturnType<typeof finalEdition>;
};

export async function publishResults(db: GameDb, options: { force?: boolean } = {}): Promise<{ ok: boolean; pending: number; message: string }> {
  const { standings, night } = await standingsNow(db);
  if (!night.truth.killer) return { ok: false, pending: standings.pendingReview, message: "No killer has been determined: nobody bought the vial. Assign it from the game master panel first." };
  if (standings.pendingReview > 0 && !options.force) return { ok: false, pending: standings.pendingReview, message: `${standings.pendingReview} items still need a second look. Import verdicts, or publish with force to accept the automatic grades.` };
  const published: PublishedResults = { publishedAt: new Date().toISOString(), standings, solution: finalEdition(night.truth.killer) };
  await writeFlag(db, "results", published);
  await writeFlag(db, "resultsPublished", true);
  return { ok: true, pending: standings.pendingReview, message: "Results are published." };
}

export async function unpublishResults(db: GameDb) {
  await writeFlag(db, "resultsPublished", false);
}

/** What a guest may see after publication: their own breakdown, the board, the awards and the solution. */
export async function resultsFor(db: GameDb, guestId: string) {
  const flags = await readFlags(db);
  if (flags.resultsPublished !== true || !flags.results) return null;
  const published = flags.results as PublishedResults;
  const roster = await loadRoster(db);
  const slug = maps(roster).slugOf.get(guestId) ?? null;
  const name = (id: string | null) => (id ? characterById.get(id)?.name ?? id : null);
  const mine = slug ? published.standings.standings.find((row) => row.guest === slug) ?? null : null;
  return {
    publishedAt: published.publishedAt,
    you: mine ? withoutGroup(mine) : null,
    board: published.standings.standings.map((row) => ({ guest: row.guest, name: row.name, survivor: row.survivor, total: row.total, rank: row.rank, isYou: row.guest === slug })),
    winner: name(published.standings.winner),
    killer: name(published.standings.killer),
    awards: published.standings.awards.filter((award) => !award.id.startsWith("circle-")).map((award) => ({ ...award, guest: name(award.guest) })),
    solution: published.solution,
  };
}

// ---------------------------------------------------------------- the guest ledger

export type LedgerRow = { name: string; character: string | null; occupation: string | null; points: number; rank: number | null; isYou: boolean };

/**
 * The guest ledger every signed-in guest sees: who is coming and, once the cast is released,
 * who they will be. Everyone starts at 0, and stays at 0 until the host publishes results:
 * there is no live leaderboard, so nothing here reveals who is doing well.
 */
export async function ledgerFor(db: GameDb, guestId: string, now = new Date()): Promise<{ released: boolean; published: boolean; rows: LedgerRow[] }> {
  const flags = await readFlags(db);
  const state = deriveState(flags, now);
  const roster = await db
    .select({ id: guests.id, email: guests.email, fullName: guests.fullName, characterName: characterRows.characterName, occupation: characterRows.occupation, slug: characterRows.gameKey })
    .from(guests)
    .leftJoin(characterRows, eq(guests.characterId, characterRows.id))
    .orderBy(asc(guests.fullName));
  const latest = await db.select({ email: rsvps.email, attending: rsvps.attending, createdAt: rsvps.createdAt }).from(rsvps).orderBy(asc(rsvps.createdAt));
  const attending = new Map<string, string>();
  for (const row of latest) attending.set(row.email, row.attending);

  const published = state.resultsPublished ? (flags.results as PublishedResults | undefined) : undefined;
  const totals = new Map((published?.standings.standings ?? []).map((row) => [row.guest, { total: row.total, rank: row.rank }]));

  const rows = roster
    .filter((row) => attending.get(row.email) !== "no")
    .map((row) => {
      const score = row.slug ? totals.get(row.slug) : undefined;
      return {
        name: row.fullName,
        character: state.identitiesReleased ? row.characterName : null,
        occupation: state.identitiesReleased ? row.occupation : null,
        points: score?.total ?? 0,
        rank: score?.rank ?? null,
        isYou: row.id === guestId,
      };
    });
  if (published) rows.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999) || a.name.localeCompare(b.name));
  return { released: state.identitiesReleased, published: Boolean(published), rows };
}

// ---------------------------------------------------------------- admin overview

export async function adminOverview(db: GameDb) {
  const night = await loadNight(db);
  const flags = await readFlags(db);
  const state = deriveState(flags);
  const grades = await db.select({ source: gameGrades.source, needsReview: gameGrades.needsReview, n: sql<number>`count(*)` }).from(gameGrades).groupBy(gameGrades.source, gameGrades.needsReview);
  const counts = await db.select({ guestId: gameSubmissions.guestId, n: sql<number>`count(*)` }).from(gameSubmissions).groupBy(gameSubmissions.guestId);
  const submitted = new Map(counts.map((row) => [row.guestId, Number(row.n)]));
  const sale = night.events.find((event) => event.kind === "vial-sold");
  const attempts = night.events.filter((event) => event.kind === "vial-attempt");
  const dosed = night.events.some((event) => event.kind === "dose");
  const castSlugs = new Set(night.slugOf.values());
  return {
    state,
    cast: characters.map((character) => {
      const row = night.roster.find((entry) => entry.slug === character.id);
      return {
        slug: character.id,
        name: character.name,
        occupation: character.occupation,
        publicBio: character.publicBio,
        history: character.background.history,
        wardrobe: character.background.wardrobe,
        edited: Boolean((flags.castEdits as Record<string, unknown> | undefined)?.[character.id]),
        printed: printedCharacter(character.id) ?? null,
        circle: character.circle,
        survivor: Boolean(character.survivor),
        markerNo: character.survivor?.markerNo ?? null,
        guest: row ? { id: row.guestId, fullName: row.fullName } : null,
        absent: state.absent.includes(character.id),
        submissions: row ? submitted.get(row.guestId) ?? 0 : 0,
      };
    }),
    uncastGuests: night.roster.filter((row) => !row.slug).map((row) => ({ id: row.guestId, fullName: row.fullName })),
    guests: night.roster.map((row) => ({ id: row.guestId, fullName: row.fullName })),
    created: Number((await db.select({ n: sql<number>`count(*)` }).from(characterRows).where(sql`${characterRows.gameKey} is not null`))[0]?.n ?? 0),
    vial: {
      soldTo: sale ? { slug: sale.guest, name: characterById.get(sale.guest)?.name, marker: characterById.get(sale.guest)?.survivor?.markerNo } : null,
      attempts: attempts.map((event) => ({ slug: event.guest, name: characterById.get(event.guest)?.name, sold: event.kind === "vial-attempt" ? event.sold : false, at: new Date(event.at).toISOString() })),
      dosed,
    },
    killer: night.truth.killer,
    /** The words the host gives out once something has really happened. Staff only. */
    approvals: characters.flatMap((character) =>
      character.objectives
        .filter((objective) => objective.check.kind === "approval")
        .map((objective) => ({ guest: character.name, title: objective.title, word: (objective.check as { word: string }).word })),
    ),
    castCount: castSlugs.size,
    grades: grades.map((row) => ({ source: row.source, needsReview: row.needsReview, count: Number(row.n) })),
    resultsPublished: state.resultsPublished,
  };
}

