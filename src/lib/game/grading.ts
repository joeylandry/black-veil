/**
 * The automatic grader. SERVER-ONLY (it reads the game bible, which holds the answers).
 *
 * Everything that can be decided exactly is decided exactly: printed codes, names, numbers,
 * clock times and the Butler's own log. Free text is graded against a rubric of AND-of-OR
 * patterns and then flagged for a second look by Claude or staff, because a rubric cannot
 * tell "it was Kit, not Cassie" from "it was Cassie, not Kit". Guests never see any of this
 * until results are published, so there is nothing to brute-force.
 */
import { characterById, characters, exhibits, findGuests, questions, survivorIds } from "@/data/game";
import type { Check, Objective, Question, RubricElement } from "@/data/game";
import { matchesAny, matchesPattern, normalizeCode, parseClock, parseMoney } from "./text";
import type { GameEvent, GradeItem, Submission, Truth, Verdict } from "./types";

export const POINTS = {
  exhibit: 2,
  exhibitCap: 12,
  pickRight: 4,
  pickWrong: -2,
  pickMin: -10,
  pickMax: 20,
  coverMax: 20,
  coverPerAccuser: 2,
  poisoner: 6,
  hideLoss: 6,
  maxPicks: 5,
  longAnswer: 500,
  /** Share of a point a survivor (or the Butler) earns on an answer they already knew from the inside. */
  insiderCredit: 0.7,
} as const;

export type GradingInput = { submissions: Submission[]; events: GameEvent[]; truth: Truth };

const key = (guest: string, kind: string, itemId: string) => `${guest}|${kind}|${itemId}`;

/** The newest submission for each (guest, kind, item). Ties go to the one that arrived later in the list. */
export function latestSubmissions(submissions: Submission[]): Map<string, Submission> {
  const latest = new Map<string, Submission>();
  submissions.forEach((submission) => {
    const id = key(submission.guest, submission.kind, submission.itemId);
    const previous = latest.get(id);
    if (!previous || submission.at >= previous.at) latest.set(id, submission);
  });
  return latest;
}

function item(guest: string, kind: GradeItem["kind"], itemId: string, verdict: Verdict, points: number, max: number, rationale: string, needsReview = false): GradeItem {
  return { guest, kind, itemId, verdict, points, max, rationale, needsReview, source: "auto" };
}

const none = (guest: string, kind: GradeItem["kind"], itemId: string, max: number, why = "No answer was submitted.") => item(guest, kind, itemId, "reject", 0, max, why);

// ---------------------------------------------------------------- objectives

type Context = {
  latest: Map<string, Submission>;
  events: GameEvent[];
  truth: Truth;
  /** pair key → distinct seekers whose accepted answer named it */
  seekHits: Map<string, Set<string>>;
};

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

function seekOutcome(check: Extract<Check, { kind: "seek" }>, answer: string): { verdict: Verdict; pair: string | null; review: boolean; why: string } {
  const named = findGuests(answer);
  const truePairs = new Set(check.pairs.map(([a, b]) => pairKey(a, b)));
  if (named.length === 2) {
    const pair = pairKey(named[0], named[1]);
    return truePairs.has(pair) ? { verdict: "accept", pair, review: false, why: "Named a true secret pair." } : { verdict: "reject", pair: null, review: false, why: "Named two guests who are not a secret pair." };
  }
  if (named.length > 2) {
    for (let i = 0; i < named.length; i += 1) {
      for (let j = i + 1; j < named.length; j += 1) {
        if (truePairs.has(pairKey(named[i], named[j]))) return { verdict: "reject", pair: null, review: true, why: `Named ${named.length} guests including a true pair; probably guessing broadly.` };
      }
    }
    return { verdict: "reject", pair: null, review: false, why: "Named many guests and no true pair." };
  }
  return { verdict: "reject", pair: null, review: false, why: named.length === 1 ? "Named only one guest." : "No guests could be recognised in the answer." };
}

function gradeObjective(guest: string, objective: Objective, context: Context): GradeItem {
  const submission = context.latest.get(key(guest, "objective", objective.id));
  const answer = submission?.answer ?? "";
  const proof = submission?.proof ?? "";
  const max = objective.points;
  const check = objective.check;
  const id = objective.id;

  switch (check.kind) {
    case "vial-attempt": {
      const attempts = context.events.filter((event) => event.kind === "vial-attempt" && event.guest === guest).length;
      return attempts > 0
        ? item(guest, "objective", id, "accept", max, max, `The House recorded ${attempts} offer${attempts === 1 ? "" : "s"}.`)
        : item(guest, "objective", id, "reject", 0, max, "The House has no record of an offer from this guest.");
    }
    case "butler-sale": {
      const sale = context.events.find((event) => event.kind === "vial-sold");
      return sale ? item(guest, "objective", id, "accept", max, max, "The House made its one sale.") : item(guest, "objective", id, "reject", 0, max, "The House made no sale.");
    }
    case "hide": {
      const pair = pairKey(guest, check.partner);
      const hits = context.seekHits.get(pair)?.size ?? 0;
      const points = Math.max(0, max - POINTS.hideLoss * hits);
      const verdict: Verdict = hits === 0 ? "accept" : points > 0 ? "partial" : "reject";
      return item(guest, "objective", id, verdict, points, max, hits === 0 ? "Nobody named the pair." : `${hits} seeker${hits === 1 ? "" : "s"} named the pair.`);
    }
    default:
      break;
  }

  if (!submission || !answer.trim()) return none(guest, "objective", id, max);

  switch (check.kind) {
    case "code": {
      const wanted = new Set(check.codes.map(normalizeCode));
      return wanted.has(normalizeCode(answer))
        ? item(guest, "objective", id, "accept", max, max, "The code matches.")
        : item(guest, "objective", id, "reject", 0, max, "That is not the code printed on the tag.");
    }
    case "pattern": {
      if (matchesPattern(answer, check.all)) {
        if (check.forbid && matchesAny(answer, check.forbid)) return item(guest, "objective", id, "partial", 0, max, "Matched the answer but also a contradicting term.", true);
        return item(guest, "objective", id, "accept", max, max, "The answer matches.");
      }
      if (proof && matchesPattern(proof, check.all)) return item(guest, "objective", id, "reject", 0, max, "The answer box is wrong, but the proof note contains the answer.", true);
      const partial = check.all.some((group) => matchesAny(answer, group));
      return item(guest, "objective", id, "reject", 0, max, partial ? "Only part of the answer is there." : "The answer does not match.", partial && check.all.length > 1);
    }
    case "guest": {
      const named = findGuests(answer);
      if (named.length === 1 && named[0] === check.guest) return item(guest, "objective", id, "accept", max, max, "Named the right guest.");
      if (named.includes(check.guest)) return item(guest, "objective", id, "reject", 0, max, "Named several guests.", true);
      return item(guest, "objective", id, "reject", 0, max, "Named the wrong guest.");
    }
    case "money": {
      const amount = parseMoney(answer);
      if (amount === null) return item(guest, "objective", id, "reject", 0, max, "No dollar amount could be read.");
      const ceiling = characters.filter((c) => context.truth.present.includes(c.id)).reduce((sum, c) => sum + c.startingCash, 0);
      if (amount > ceiling) return item(guest, "objective", id, "reject", 0, max, `$${amount} is more money than the whole room started with.`, true);
      return amount >= check.min
        ? item(guest, "objective", id, "accept", max, max, `Reported $${amount}, target $${check.min}. Staff may ask to see the bills.`)
        : item(guest, "objective", id, "reject", 0, max, `Reported $${amount}, short of the $${check.min} target.`);
    }
    case "clock": {
      const minutes = parseClock(answer);
      if (minutes === null) return item(guest, "objective", id, "reject", 0, max, "No time could be read.");
      const [fromH, fromM] = check.from.split(":").map(Number);
      const [toH, toM] = check.to.split(":").map(Number);
      return minutes >= fromH * 60 + fromM && minutes <= toH * 60 + toM
        ? item(guest, "objective", id, "accept", max, max, "The time is inside the window.")
        : item(guest, "objective", id, "reject", 0, max, "The time is outside the window.");
    }
    case "seek": {
      const outcome = seekOutcome(check, answer);
      return item(guest, "objective", id, outcome.verdict, outcome.verdict === "accept" ? max : 0, max, outcome.why, outcome.review);
    }
    case "manual":
      return item(guest, "objective", id, "reject", 0, max, check.rubric, true);
    default:
      return none(guest, "objective", id, max);
  }
}

// ---------------------------------------------------------------- mysteries

/** The rubric for a question. "Why did the killer do it" is built from the killer's own card. */
export function rubricFor(question: Question, truth: Truth): RubricElement[] {
  if (!question.fromKillerMotive) return question.rubric;
  const killer = truth.killer ? characterById.get(truth.killer) : undefined;
  const info = killer?.survivor;
  if (!info) return [];
  const [what, whom] = info.motiveKeys;
  return [
    { id: "what", label: "What the Keeper did", points: question.points / 2, all: [what], survivorKnows: "killer" },
    { id: "whom", label: "To whom it was done", points: question.points / 2, all: [whom], survivorKnows: "killer" },
  ];
}

function gradeMystery(guest: string, question: Question, context: Context): GradeItem {
  const submission = context.latest.get(key(guest, "mystery", question.id));
  const answer = submission?.answer ?? "";
  const max = question.points;
  if (!answer.trim()) return none(guest, "mystery", question.id, max);

  if (question.type === "guest") {
    const killer = context.truth.killer;
    if (!killer) return item(guest, "mystery", question.id, "reject", 0, max, "No killer has been determined yet.", true);
    const named = findGuests(answer);
    if (named.length === 1 && named[0] === killer) {
      if (question.butlerKnows && characterById.get(guest)?.role === "butler") {
        const credited = Math.round(max * POINTS.insiderCredit);
        return item(guest, "mystery", question.id, "partial", credited, max, `Named the killer, but the Butler saw the sale, so it counts for ${Math.round(POINTS.insiderCredit * 100)}%.`);
      }
      return item(guest, "mystery", question.id, "accept", max, max, "Named the killer.");
    }
    if (named.includes(killer)) return item(guest, "mystery", question.id, "reject", 0, max, "Named several guests, one of them the killer.", true);
    return item(guest, "mystery", question.id, "reject", 0, max, "Named someone else.");
  }

  const rubric = rubricFor(question, context.truth);
  if (!rubric.length) return item(guest, "mystery", question.id, "reject", 0, max, "No rubric is available (the killer is not known yet).", true);
  const earned = rubric.filter((element) => matchesPattern(answer, element.all) && !(element.forbid && matchesAny(answer, element.forbid)));
  const isSurvivor = Boolean(characterById.get(guest)?.survivor);
  let discounted = 0;
  const worth = (element: RubricElement) => {
    const lived = isSurvivor && (element.survivorKnows === true || (element.survivorKnows === "killer" && context.truth.killer === guest));
    if (!lived) return element.points;
    discounted += 1;
    return Math.round(element.points * POINTS.insiderCredit);
  };
  const points = earned.reduce((sum, element) => sum + worth(element), 0);
  const long = answer.length > POINTS.longAnswer;
  const cap = long ? Math.floor(max / 2) : max;
  const given = Math.min(points, cap);
  const verdict: Verdict = given >= max ? "accept" : given > 0 ? "partial" : "reject";
  const why = earned.length
    ? `Matched: ${earned.map((element) => element.label).join("; ")}.${discounted ? ` ${discounted} of those you lived through, so they count for ${Math.round(POINTS.insiderCredit * 100)}%.` : ""}${long ? " The answer is very long, so credit is capped until someone reads it." : ""}`
    : "Nothing in the answer matched the rubric.";
  // Free text always gets a second look: a rubric cannot read negation or nonsense.
  return item(guest, "mystery", question.id, verdict, given, max, why, true);
}

// ---------------------------------------------------------------- survivors tier

export function parsePicks(answer: string, exclude?: string): string[] {
  let candidates: string[] = [];
  try {
    const parsed = JSON.parse(answer);
    if (Array.isArray(parsed)) candidates = parsed.map(String);
  } catch {
    candidates = answer.split(/[\n,;]+/);
  }
  const picks: string[] = [];
  for (const candidate of candidates) {
    const named = findGuests(candidate);
    const id = named.length === 1 ? named[0] : characterById.has(candidate.trim()) ? candidate.trim() : null;
    if (id && id !== exclude && !picks.includes(id)) picks.push(id);
  }
  return picks.slice(0, POINTS.maxPicks);
}

// ---------------------------------------------------------------- the whole night

/** Grades every present guest. Pure: the same input always gives the same items, in the same order. */
export function autoGrade(input: GradingInput): GradeItem[] {
  const latest = latestSubmissions(input.submissions);
  const present = characters.filter((character) => input.truth.present.includes(character.id));
  const context: Context = { latest, events: input.events, truth: input.truth, seekHits: new Map() };

  // the seekers first: their accepted answers decide whether the hiders were found
  for (const character of present) {
    for (const objective of character.objectives) {
      if (objective.check.kind !== "seek") continue;
      const submission = latest.get(key(character.id, "objective", objective.id));
      if (!submission?.answer.trim()) continue;
      const outcome = seekOutcome(objective.check, submission.answer);
      if (outcome.verdict === "accept" && outcome.pair) {
        const seekers = context.seekHits.get(outcome.pair) ?? new Set<string>();
        seekers.add(character.id);
        context.seekHits.set(outcome.pair, seekers);
      }
    }
  }

  // who named each survivor (non-survivors only; survivors know each other)
  const accusers = new Map<string, number>();
  const picksBy = new Map<string, string[]>();
  for (const character of present) {
    if (character.survivor) continue;
    const submission = latest.get(key(character.id, "survivors", "picks"));
    const picks = submission ? parsePicks(submission.answer, character.id) : [];
    picksBy.set(character.id, picks);
    for (const pick of picks) if (survivorIds.includes(pick)) accusers.set(pick, (accusers.get(pick) ?? 0) + 1);
  }

  const items: GradeItem[] = [];
  for (const character of present) {
    const guest = character.id;

    for (const objective of character.objectives) items.push(gradeObjective(guest, objective, context));

    // exhibits: two points each, six at most, never for a page you were handed or already earned by an objective
    const ownCodes = new Set(
      character.objectives.flatMap((objective) => (objective.check.kind === "code" ? objective.check.codes.map(normalizeCode) : [])),
    );
    const filed = new Map<string, Submission>();
    for (const submission of latest.values()) {
      if (submission.guest === guest && submission.kind === "exhibit") filed.set(normalizeCode(submission.answer), submission);
    }
    let earnedExhibits = 0;
    const exhibitItems: GradeItem[] = [];
    for (const [code, submission] of [...filed.entries()].sort((a, b) => a[1].at - b[1].at)) {
      const exhibit = exhibits.find((candidate) => normalizeCode(candidate.code) === code);
      if (!exhibit) {
        exhibitItems.push(item(guest, "exhibit", code || submission.itemId, "reject", 0, POINTS.exhibit, "That code is not on any exhibit."));
        continue;
      }
      if (exhibit.heldBy === guest) {
        exhibitItems.push(item(guest, "exhibit", exhibit.id, "reject", 0, POINTS.exhibit, "You were handed this page; filing it earns nothing."));
        continue;
      }
      if (ownCodes.has(code)) {
        exhibitItems.push(item(guest, "exhibit", exhibit.id, "reject", 0, POINTS.exhibit, "This code already earned you an objective."));
        continue;
      }
      if (earnedExhibits * POINTS.exhibit >= POINTS.exhibitCap) {
        exhibitItems.push(item(guest, "exhibit", exhibit.id, "reject", 0, POINTS.exhibit, "You are past the six-exhibit cap."));
        continue;
      }
      earnedExhibits += 1;
      exhibitItems.push(item(guest, "exhibit", exhibit.id, "accept", POINTS.exhibit, POINTS.exhibit, `Filed "${exhibit.title}".`));
    }
    items.push(...exhibitItems);

    // the survivors tier
    if (character.survivor) {
      const named = accusers.get(guest) ?? 0;
      const points = Math.max(0, POINTS.coverMax - POINTS.coverPerAccuser * named);
      items.push(item(guest, "survivors", "cover", points >= POINTS.coverMax ? "accept" : points > 0 ? "partial" : "reject", points, POINTS.coverMax, `${named} guest${named === 1 ? "" : "s"} named you as a survivor.`));
    } else {
      const picks = picksBy.get(guest) ?? [];
      if (!picks.length) items.push(none(guest, "survivors", "picks", POINTS.pickMax, "No survivors were named."));
      else {
        const right = picks.filter((pick) => survivorIds.includes(pick)).length;
        const wrong = picks.length - right;
        const raw = right * POINTS.pickRight + wrong * POINTS.pickWrong;
        const points = Math.max(POINTS.pickMin, Math.min(POINTS.pickMax, raw));
        items.push(item(guest, "survivors", "picks", right === picks.length && right > 0 ? (right === survivorIds.length ? "accept" : "partial") : right > 0 ? "partial" : "reject", points, POINTS.pickMax, `${right} right, ${wrong} wrong of ${picks.length} named.`));
      }
    }

    // the three mysteries
    for (const question of questions) items.push(gradeMystery(guest, question, context));

    // the poisoner's bonus
    if (input.truth.killer === guest) items.push(item(guest, "bonus", "poisoner", "accept", POINTS.poisoner, POINTS.poisoner, "Bought the House's vial and poisoned the Keeper."));
  }
  return items;
}

/** Objective ids that still need a human or Claude, for the packet and the admin count. */
export function pendingItems(items: GradeItem[]): GradeItem[] {
  return items.filter((entry) => entry.needsReview && entry.source === "auto");
}
