/**
 * The automatic grader. SERVER-ONLY (it reads the game bible, which holds the answers).
 *
 * Everything that can be decided exactly is decided exactly: printed codes, names, numbers,
 * clock times and the Butler's own log. Free text is graded against a rubric of AND-of-OR
 * patterns and then flagged for a second look by Claude or staff, because a rubric cannot
 * tell "it was Kit, not Cassie" from "it was Cassie, not Kit". Guests never see any of this
 * until results are published, so there is nothing to brute-force.
 */
import { alternateOf, characterById, characters, findGuests, objectiveById, questions, races, survivorIds } from "@/data/game";
import { propById } from "@/data/game/props";
import type { Objective, Question, RubricElement } from "@/data/game";
import { matchesAny, matchesPattern, normalize, normalizeCode, parseClock, parseMoney, round2 } from "./text";
import type { GameEvent, GradeItem, Submission, Truth, Verdict } from "./types";

export const POINTS = {
  /** Every guest, survivors included, names up to four survivors: +1 for each right, -0.5 for each wrong, never below zero. */
  pickRight: 1,
  pickWrong: -0.5,
  maxPicks: 4,
  /** The first member of each group to finish its race earns one point. */
  race: 1,
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
};

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
    case "keep": {
      // scored from the two seekers' own answers: the one you chose learned it, the rival did not
      const present = new Set(context.truth.present);
      const seekerObjective = objectiveById.get(check.seekerObjective);
      const rivalObjective = objectiveById.get(check.rivalObjective);
      if (!seekerObjective || !rivalObjective) return item(guest, "objective", id, "reject", 0, max, "The seekers' objectives could not be found.", true);
      // two halves: the seeker you chose learned it (half a point), and the rival you were to keep it from did not (half a point)
      const told = !present.has(check.seeker) || gradeObjective(check.seeker, seekerObjective, context).verdict === "accept";
      const leaked = present.has(check.rival) && gradeObjective(check.rival, rivalObjective, context).verdict === "accept";
      const points = round2((told ? max / 2 : 0) + (leaked ? 0 : max / 2));
      const why = `${told ? (present.has(check.seeker) ? "The seeker you chose learned it (half a point)." : "Your chosen seeker did not come, so that half is yours.") : "The seeker you were to tell never learned it."} ${leaked ? "The rival learned it too." : "The rival never did (half a point)."}`;
      return item(guest, "objective", id, points >= max ? "accept" : points > 0 ? "partial" : "reject", points, max, why);
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
    case "approval":
      return normalize(answer) === normalize(check.word)
        ? item(guest, "objective", id, "accept", max, max, "The host confirmed it and gave the approval word.")
        : item(guest, "objective", id, "reject", 0, max, "That is not the host's approval word.");
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
    return round2(element.points * POINTS.insiderCredit);
  };
  const points = round2(earned.reduce((sum, element) => sum + worth(element), 0));
  const long = answer.length > POINTS.longAnswer;
  const cap = long ? round2(max / 2) : max;
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

/** Every code in a free-text answer, normalised: "kk8hx, pjypa tdr9h" gives three codes. */
function codesIn(answer: string): Set<string> {
  return new Set(answer.split(/[^A-Za-z0-9]+/).map(normalizeCode).filter(Boolean));
}

/**
 * The race for the extra point: the first member of each group to finish it. The survivors race for
 * the vial, which the House's log decides; the others must submit three different valid codes from their group's race,
 * and the earliest such submission (by any member, looking at every attempt, not just the newest) wins.
 */
function gradeRaces(input: GradingInput, presentIds: Set<string>): GradeItem[] {
  const items: GradeItem[] = [];
  for (const race of races) {
    if (race.circle === "survivors") {
      const winner = input.truth.killer;
      if (winner && presentIds.has(winner)) items.push(item(winner, "bonus", "race", "accept", POINTS.race, POINTS.race, "Bought the House's vial first."));
      continue;
    }
    const wanted = new Set(race.tokens.map((token) => normalizeCode(propById.get(token)?.code ?? "")));
    let best: Submission | null = null;
    for (const submission of input.submissions) {
      if (submission.kind !== "objective" || submission.itemId !== "race") continue;
      const owner = characterById.get(submission.guest);
      if (!owner || owner.circle !== race.circle || !presentIds.has(owner.id)) continue;
      const have = codesIn(submission.answer);
      if ([...wanted].filter((code) => have.has(code)).length < race.need) continue;
      if (!best || submission.at < best.at) best = submission;
    }
    if (best) items.push(item(best.guest, "bonus", "race", "accept", POINTS.race, POINTS.race, `First in the group to finish "${race.title}".`));
  }
  return items;
}

/** Grades every present guest. Pure: the same input always gives the same items, in the same order. */
export function autoGrade(input: GradingInput): GradeItem[] {
  const latest = latestSubmissions(input.submissions);
  const present = characters.filter((character) => input.truth.present.includes(character.id));
  const context: Context = { latest, events: input.events, truth: input.truth };

  const items: GradeItem[] = [];
  for (const character of present) {
    const guest = character.id;

    for (const objective of character.objectives) items.push(gradeObjective(guest, objective, context));

    // the survivors tier: everyone, survivors too, names up to four
    const submission = latest.get(key(guest, "survivors", "picks"));
    const picks = submission ? parsePicks(submission.answer, guest) : [];
    const pickMax = POINTS.maxPicks * POINTS.pickRight;
    if (!picks.length) items.push(none(guest, "survivors", "picks", pickMax, "No survivors were named."));
    else {
      const right = picks.filter((pick) => survivorIds.includes(pick)).length;
      const wrong = picks.length - right;
      const points = Math.max(0, round2(right * POINTS.pickRight + wrong * POINTS.pickWrong));
      items.push(item(guest, "survivors", "picks", right === picks.length && right > 0 ? "accept" : right > 0 ? "partial" : "reject", points, pickMax, `${right} right, ${wrong} wrong of ${picks.length} named.`));
    }

    // the mysteries. The Butler and the killer know "who" and "how" from the inside, so they answer
    // the replacement questions instead, which are worth the same and cannot be known by playing the part.
    const insider = character.role === "butler" || input.truth.killer === guest;
    for (const question of questions) {
      if (question.alternateFor ? !insider : insider && alternateOf.has(question.id)) continue;
      items.push(gradeMystery(guest, question, context));
    }
  }

  items.push(...gradeRaces(input, new Set(present.map((character) => character.id))));
  return items;
}

/** Objective ids that still need a human or Claude, for the packet and the admin count. */
export function pendingItems(items: GradeItem[]): GradeItem[] {
  return items.filter((entry) => entry.needsReview && entry.source === "auto");
}
