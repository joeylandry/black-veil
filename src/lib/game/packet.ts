/**
 * The review packet: how "Claude does the judging" works without an API key at the party.
 *
 * After the night, `npm run game:grade -- packet` writes a JSON file listing every item that
 * needs a second look, with the guest's words, the automatic grade, the answer key and plain
 * instructions. Claude Code reads it, writes a verdicts file, and `-- verdicts` applies it.
 * SERVER-ONLY: the packet holds the solution.
 */
import { characterById, characters, objectiveById, questionById } from "@/data/game";
import type { Check } from "@/data/game";
import { rubricFor } from "./grading";
import type { GradeItem, Submission, Truth, VerdictOverride } from "./types";

export type PacketItem = {
  key: string;
  guest: string;
  character: string;
  kind: GradeItem["kind"];
  itemId: string;
  /** What the guest was asked. */
  prompt: string;
  /** What they typed, and the proof note if any. */
  answer: string;
  proof: string;
  /** How the automatic grader scored it, and why it wants a second look. */
  auto: { verdict: GradeItem["verdict"]; points: number; max: number; rationale: string };
  /** What a full-credit answer must contain, in plain words. */
  answerKey: string;
};

export type Packet = {
  version: 1;
  instructions: string[];
  verdictFormat: { guest: string; kind: string; itemId: string; verdict: "accept | partial | reject"; points: "number from 0 to max"; rationale: "one sentence" };
  truth: { killer: string | null; killerName: string | null; killerGrievance: string | null; survivors: string[] };
  items: PacketItem[];
  spotChecks: { guest: string; character: string; claim: string }[];
};

export const packetInstructions = [
  "You are the judge for The Black Veil, a murder-mystery party game. Each item below is one thing a guest typed that the automatic grader could not fully decide.",
  "Judge by meaning, not by keywords. Accept an answer that clearly states the idea in the answer key, even in different words. Reject an answer that contradicts it, that merely lists many names or terms hoping to hit one, or that is about something else.",
  "Be generous to a clear but loosely worded answer, and strict with keyword-stuffing or hedged answers that name several possibilities. If an answer names the right idea AND a wrong one, give the credit only if the right idea is clearly the guest's actual claim.",
  "Points may be anything from 0 to the item's max. For multi-part answers give partial credit for the parts that are right. Never exceed `max`.",
  "Where the guest lived the story (a survivor answering about 1924, or the Butler answering who bought the vial) the automatic grader already applied the insider discount. If you override the points, apply the same 70% to the parts they already knew, or leave the item as the auto grade if the discount was applied correctly.",
  "Write one short sentence of rationale for every verdict. Output a JSON array of verdict objects in the verdictFormat shape and nothing else.",
];

function describeCheck(check: Check): string {
  switch (check.kind) {
    case "code":
      return `The answer must be one of the printed codes: ${check.codes.join(", ")}.`;
    case "pattern":
      return `The answer must express every one of these ideas (any one term in each group): ${check.all.map((group) => `[${group.join(" | ")}]`).join(" AND ")}.`;
    case "guest":
      return `The answer must name exactly one guest: ${characterById.get(check.guest)?.name ?? check.guest}.`;
    case "money":
      return `The answer must be a dollar amount of at least $${check.min}.`;
    case "clock":
      return `The answer must be a clock time between ${check.from} and ${check.to}.`;
    case "manual":
      return check.rubric;
    case "approval":
      return "Decided by the host's approval word, not by the guest's own words.";
    case "keep":
    case "vial-attempt":
    case "butler-sale":
      return "Decided from the House's log, not from the guest's words.";
  }
}

export function buildPacket(items: GradeItem[], submissions: Submission[], truth: Truth): Packet {
  const latest = new Map<string, Submission>();
  for (const submission of submissions) {
    const key = `${submission.guest}|${submission.kind}|${submission.itemId}`;
    const previous = latest.get(key);
    if (!previous || submission.at >= previous.at) latest.set(key, submission);
  }

  const packetItems: PacketItem[] = items
    .filter((item) => item.needsReview && item.source === "auto")
    .map((item) => {
      const submission = latest.get(`${item.guest}|${item.kind}|${item.itemId}`);
      let prompt = "";
      let answerKey = "";
      if (item.kind === "objective") {
        const objective = objectiveById.get(item.itemId);
        prompt = `${objective?.title ?? item.itemId}: ${objective?.text ?? ""} (asked: ${objective?.ask ?? ""})`;
        answerKey = objective ? describeCheck(objective.check) : "";
      } else if (item.kind === "mystery") {
        const question = questionById.get(item.itemId);
        prompt = question ? `${question.prompt} (${question.hint})` : item.itemId;
        if (question?.type === "guest") answerKey = `The correct answer is ${truth.killer ? characterById.get(truth.killer)?.name : "not yet decided"}.`;
        else if (question) {
          const rubric = rubricFor(question, truth);
          answerKey = rubric.map((element) => `${element.points} pts: ${element.label}. Ideas: ${element.all.map((group) => `[${group.join(" | ")}]`).join(" AND ")}`).join("\n");
        }
      } else {
        prompt = `${item.kind} ${item.itemId}`;
      }
      return {
        key: `${item.guest}|${item.kind}|${item.itemId}`,
        guest: item.guest,
        character: characterById.get(item.guest)?.name ?? item.guest,
        kind: item.kind,
        itemId: item.itemId,
        prompt,
        answer: submission?.answer ?? "",
        proof: submission?.proof ?? "",
        auto: { verdict: item.verdict, points: item.points, max: item.max, rationale: item.rationale },
        answerKey,
      };
    });

  // money claims from the likely winners, for the host to check against the actual bills
  const claims: Packet["spotChecks"] = [];
  for (const item of items) {
    if (item.kind !== "objective" || item.verdict !== "accept") continue;
    const objective = objectiveById.get(item.itemId);
    if (objective?.check.kind !== "money") continue;
    const submission = latest.get(`${item.guest}|objective|${item.itemId}`);
    claims.push({ guest: item.guest, character: characterById.get(item.guest)?.name ?? item.guest, claim: submission?.answer ?? "" });
  }

  const killer = truth.killer ? characterById.get(truth.killer) : undefined;
  return {
    version: 1,
    instructions: packetInstructions,
    verdictFormat: { guest: "character slug", kind: "kind from the item", itemId: "itemId from the item", verdict: "accept | partial | reject", points: "number from 0 to max", rationale: "one sentence" },
    truth: {
      killer: truth.killer,
      killerName: killer?.name ?? null,
      killerGrievance: killer?.survivor?.grievance ?? null,
      survivors: characters.filter((character) => character.survivor).map((character) => `${character.name} (marker ${character.survivor!.markerNo}, ${character.survivor!.veilTitle})`),
    },
    items: packetItems,
    spotChecks: claims,
  };
}

export type VerdictParse = { overrides: VerdictOverride[]; errors: string[] };

/** Parses a verdicts file written by Claude or staff. Strict: a bad row is reported, never guessed at. */
export function parseVerdicts(input: unknown, source: "claude" | "staff" = "claude"): VerdictParse {
  const errors: string[] = [];
  const overrides: VerdictOverride[] = [];
  const rows = Array.isArray(input) ? input : input && typeof input === "object" && Array.isArray((input as { verdicts?: unknown }).verdicts) ? (input as { verdicts: unknown[] }).verdicts : null;
  if (!rows) return { overrides, errors: ["Expected a JSON array of verdicts, or an object with a `verdicts` array."] };
  rows.forEach((row, index) => {
    const label = `verdict #${index + 1}`;
    if (!row || typeof row !== "object") {
      errors.push(`${label}: not an object`);
      return;
    }
    const record = row as Record<string, unknown>;
    let guest = typeof record.guest === "string" ? record.guest : "";
    let kind = typeof record.kind === "string" ? record.kind : "";
    let itemId = typeof record.itemId === "string" ? record.itemId : "";
    if (typeof record.key === "string" && (!guest || !kind || !itemId)) {
      const [g, k, ...rest] = record.key.split("|");
      guest = guest || g;
      kind = kind || k;
      itemId = itemId || rest.join("|");
    }
    const verdict = record.verdict;
    const points = Number(record.points);
    if (!guest || !kind || !itemId) errors.push(`${label}: needs guest, kind and itemId (or a key)`);
    else if (!characterById.has(guest)) errors.push(`${label}: unknown guest "${guest}"`);
    else if (verdict !== "accept" && verdict !== "partial" && verdict !== "reject") errors.push(`${label}: verdict must be accept, partial or reject`);
    else if (!Number.isFinite(points) || points < 0) errors.push(`${label}: points must be a number of 0 or more`);
    else {
      overrides.push({
        guest,
        kind: kind as VerdictOverride["kind"],
        itemId,
        verdict,
        points,
        rationale: typeof record.rationale === "string" ? record.rationale.slice(0, 400) : "",
        source,
      });
    }
  });
  return { overrides, errors };
}
