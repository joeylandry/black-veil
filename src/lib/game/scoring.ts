/**
 * Turns graded items into standings. Pure and deterministic: the same grades always give
 * the same ranking, and the final tie-breaker is a hash anyone can recompute from the
 * seed printed on the Final Edition, so there is always exactly one winner.
 *
 * The ladder is built so that a guest who finishes every errand but never works out the
 * story cannot win: the three mysteries (100) outweigh every objective together (60).
 */
import { createHash } from "node:crypto";
import { characterById, circles } from "@/data/game";
import type { GradeItem, Standing, Standings, Submission, Tiers, Truth, VerdictOverride } from "./types";

export const TIE_ORDER = ["total", "mysteries", "killerPoints", "survivors", "objectives", "exhibits", "lastSubmissionAt", "hash"] as const;

/** Applies Claude's or staff's decisions on top of the automatic grades. Unknown items are reported, never silently dropped. */
export function applyOverrides(items: GradeItem[], overrides: VerdictOverride[]): { items: GradeItem[]; unmatched: VerdictOverride[]; invalid: string[] } {
  const index = new Map(items.map((entry, position) => [`${entry.guest}|${entry.kind}|${entry.itemId}`, position]));
  const result = items.map((entry) => ({ ...entry }));
  const unmatched: VerdictOverride[] = [];
  const invalid: string[] = [];
  for (const override of overrides) {
    const position = index.get(`${override.guest}|${override.kind}|${override.itemId}`);
    if (position === undefined) {
      unmatched.push(override);
      continue;
    }
    const target = result[position];
    if (!Number.isFinite(override.points) || override.points < 0 || override.points > target.max) {
      invalid.push(`${override.guest}|${override.kind}|${override.itemId}: ${override.points} is outside 0 to ${target.max}`);
      continue;
    }
    target.points = override.points;
    target.verdict = override.verdict;
    target.rationale = override.rationale;
    target.source = override.source;
    target.needsReview = false;
  }
  return { items: result, unmatched, invalid };
}

function tierOf(items: GradeItem[]): Tiers {
  const sum = (predicate: (entry: GradeItem) => boolean) => items.filter(predicate).reduce((total, entry) => total + entry.points, 0);
  return {
    objectives: sum((entry) => entry.kind === "objective"),
    exhibits: sum((entry) => entry.kind === "exhibit"),
    survivors: sum((entry) => entry.kind === "survivors"),
    mysteries: sum((entry) => entry.kind === "mystery"),
    poisoner: sum((entry) => entry.kind === "bonus"),
  };
}

export function tieHash(seed: string, guest: string): string {
  return createHash("sha256").update(`${seed}:${guest}`).digest("hex");
}

export function computeStandings(items: GradeItem[], submissions: Submission[], truth: Truth): Standings {
  const lastBy = new Map<string, number>();
  for (const submission of submissions) lastBy.set(submission.guest, Math.max(lastBy.get(submission.guest) ?? 0, submission.at));

  const rows: (Standing & { hash: string })[] = truth.present
    .map((id) => characterById.get(id))
    .filter((character): character is NonNullable<typeof character> => Boolean(character))
    .map((character) => {
      const mine = items.filter((entry) => entry.guest === character.id);
      const tiers = tierOf(mine);
      const total = tiers.objectives + tiers.exhibits + tiers.survivors + tiers.mysteries + tiers.poisoner;
      return {
        guest: character.id,
        name: character.name,
        circle: character.circle,
        survivor: Boolean(character.survivor),
        total,
        tiers,
        killerPoints: mine.find((entry) => entry.kind === "mystery" && (entry.itemId === "new-1" || entry.itemId === "alt-1"))?.points ?? 0,
        lastSubmissionAt: lastBy.get(character.id) ?? Number.MAX_SAFE_INTEGER,
        rank: 0,
        circleRank: 0,
        items: mine,
        hash: tieHash(truth.seed, character.id),
      };
    });

  const compare = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    b.total - a.total ||
    b.tiers.mysteries - a.tiers.mysteries ||
    b.killerPoints - a.killerPoints ||
    b.tiers.survivors - a.tiers.survivors ||
    b.tiers.objectives - a.tiers.objectives ||
    b.tiers.exhibits - a.tiers.exhibits ||
    a.lastSubmissionAt - b.lastSubmissionAt ||
    (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0);

  rows.sort(compare);
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });
  // each circle is ranked among its own non-survivors; the five survivors are ranked together as one group
  const circleChampions: Record<string, string | null> = {};
  for (const circle of circles) {
    const members = rows.filter((row) => row.circle === circle.id && !row.survivor);
    members.forEach((row, index) => {
      row.circleRank = index + 1;
    });
    circleChampions[circle.id] = members[0]?.total > 0 ? members[0].guest : null;
  }
  const survivorGroup = rows.filter((row) => row.survivor);
  survivorGroup.forEach((row, index) => {
    row.circleRank = index + 1;
  });
  circleChampions["survivors"] = survivorGroup[0]?.total > 0 ? survivorGroup[0].guest : null;

  const top = rows[0];
  const winner = top && top.total > 0 ? top.guest : null;
  const awards: Standings["awards"] = [];
  if (winner) awards.push({ id: "master-detective", title: "The Master Detective", guest: winner, detail: `${top.total} points, with ${top.tiers.mysteries} from the three mysteries.` });
  for (const circle of circles) {
    const champion = circleChampions[circle.id];
    awards.push({ id: `circle-${circle.id}`, title: `Champion of ${circle.name}`, guest: champion, detail: champion ? `${rows.find((row) => row.guest === champion)!.total} points.` : "Nobody scored." });
  }
  const survivorChampion = circleChampions["survivors"];
  awards.push({ id: "circle-survivors", title: "Champion of the Survivors", guest: survivorChampion, detail: survivorChampion ? `${rows.find((row) => row.guest === survivorChampion)!.total} points.` : "Nobody scored." });
  const perfect = rows.filter((row) => row.tiers.objectives >= 60);
  awards.push({ id: "perfect-errands", title: "Perfect Errands", guest: perfect[0]?.guest ?? null, detail: perfect.length ? `${perfect.length} guest${perfect.length === 1 ? "" : "s"} finished every errand.` : "Nobody finished all five." });
  const covers = rows.filter((row) => row.survivor).sort((a, b) => b.tiers.survivors - a.tiers.survivors || (a.hash < b.hash ? -1 : 1));
  awards.push({ id: "best-cover", title: "The Best Cover", guest: covers[0]?.guest ?? null, detail: covers[0] ? `${covers[0].tiers.survivors} points for staying hidden.` : "No survivors present." });
  const eyes = rows.filter((row) => !row.survivor).sort((a, b) => b.tiers.survivors - a.tiers.survivors || (a.hash < b.hash ? -1 : 1));
  awards.push({ id: "sharpest-eye", title: "The Sharpest Eye", guest: eyes[0]?.guest ?? null, detail: eyes[0] ? `${eyes[0].tiers.survivors} points for naming survivors.` : "Nobody guessed." });
  awards.push({ id: "the-poisoner", title: "The Poisoner", guest: truth.killer, detail: truth.killer ? "Bought the House's vial and poisoned the Keeper." : "Nobody bought the vial." });

  return {
    standings: rows.map((row) => ({
      guest: row.guest,
      name: row.name,
      circle: row.circle,
      survivor: row.survivor,
      total: row.total,
      tiers: row.tiers,
      killerPoints: row.killerPoints,
      lastSubmissionAt: row.lastSubmissionAt,
      rank: row.rank,
      circleRank: row.circleRank,
      items: row.items,
    })),
    winner,
    circleChampions,
    killer: truth.killer,
    pendingReview: items.filter((entry) => entry.needsReview && entry.source === "auto").length,
    awards,
  };
}

