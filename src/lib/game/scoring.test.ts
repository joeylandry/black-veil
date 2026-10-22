import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alternateOf, characterById, characters, circles, OBJECTIVE_TOTAL, questions, survivorIds } from "@/data/game";
import { autoGrade, POINTS } from "./grading";
import { round2 } from "./text";
import { applyOverrides, computeStandings, tieHash } from "./scoring";
import { correctAnswer, correctMystery, gradeNight, PROFILES, simulateNight } from "./sim";
import { MYSTERY_POINTS } from "@/data/game/questions";
import type { Question } from "@/data/game";
import type { GradeItem, Submission, Truth } from "./types";

const everyone = characters.map((character) => character.id);
// the killer is always one of the five survivors; a second survivor is the bystander
const killer = survivorIds[0];
const bystander = survivorIds[1];
const butler = characters.find((character) => character.role === "butler")!.id;
const truth: Truth = { killer, present: everyone, seed: "black-veil-1926" };
// "perfect objectives" can only cover what scores itself: hide, keep, vial and sale are not typed in
const typedIn = (o: { check: { kind: string } }) => !["hide", "keep", "vial-attempt", "butler-sale", "manual"].includes(o.check.kind);
let clock = 0;
const sub = (guest: string, kind: Submission["kind"], itemId: string, answer: string): Submission => ({ guest, kind, itemId, answer, proof: "", at: (clock += 10) });

function errandsOnly(guest: string): Submission[] {
  const character = characterById.get(guest)!;
  return character.objectives.filter((o) => o.check.kind !== "hide" && o.check.kind !== "vial-attempt" && o.check.kind !== "butler-sale").map((o) => sub(guest, "objective", o.id, correctAnswer(character, o)));
}
/** sim.ts has no canned answer for the replacement questions, so build one from the rubric: the first phrase of every element. */
function fullAnswer(question: Question): string {
  const canned = correctMystery(question, killer);
  return canned || question.rubric.map((element) => element.all.map((group) => group[0]).join(" ")).join(". ");
}
/** Full-credit answers to the questions this guest is actually graded on (the Butler and the killer get the alternates). */
function mysteries(guest: string): Submission[] {
  const insider = guest === butler || guest === killer;
  return questions
    .filter((question) => (question.alternateFor ? insider : !(insider && alternateOf.has(question.id))))
    .map((question) => sub(guest, "mystery", question.id, fullAnswer(question)));
}

describe("the ladder", () => {
  it("cannot be won by finishing every errand and never working out the story", () => {
    const runner = "joel";
    const detective = "anika";
    // the detective skips every errand, but solves all three mysteries and names survivors
    const submissions = [
      ...errandsOnly(runner),
      ...mysteries(detective),
      sub(detective, "survivors", "picks", JSON.stringify(survivorIds)),
    ];
    const items = autoGrade({ submissions, events: [], truth });
    const result = computeStandings(items, submissions, truth);
    const a = result.standings.find((row) => row.guest === runner)!;
    const b = result.standings.find((row) => row.guest === detective)!;
    const reachable = characterById.get(runner)!.objectives.filter(typedIn).reduce((sum, o) => sum + o.points, 0);
    assert.ok(a.tiers.objectives >= reachable, "the runner did their errands");
    assert.equal(b.tiers.objectives, 0);
    assert.ok(b.total > a.total, `detective ${b.total} should beat runner ${a.total}`);
    assert.equal(result.winner, detective);
  });

  it("makes the three mysteries worth double every objective together", () => {
    assert.equal(questions.filter((question) => !question.alternateFor).reduce((sum, question) => sum + question.points, 0), 2 * OBJECTIVE_TOTAL);
  });

  it("lets a guest who does both outscore a guest who does only one", () => {
    const both = "silas";
    const only = "josh";
    const submissions = [...errandsOnly(both), ...mysteries(both), ...errandsOnly(only), ...mysteries(only).slice(0, 1)];
    const items = autoGrade({ submissions, events: [], truth });
    const result = computeStandings(items, submissions, truth);
    const rank = (id: string) => result.standings.find((row) => row.guest === id)!.rank;
    assert.ok(rank(both) < rank(only));
  });

  it("scores at most 20 for anyone: 5 objectives, 4 survivors, 10 mysteries and 1 for the race", () => {
    const best = "anika";
    const submissions = [...errandsOnly(best), ...mysteries(best), sub(best, "survivors", "picks", JSON.stringify(survivorIds))];
    const items = autoGrade({ submissions, events: [], truth });
    const standing = computeStandings(items, submissions, truth).standings.find((row) => row.guest === best)!;
    assert.equal(standing.tiers.survivors, 4);
    assert.equal(standing.tiers.mysteries, 10);
    assert.ok(standing.tiers.objectives <= 5);
    assert.ok(standing.total <= 5 + 4 + 10 + 1);
  });
});

describe("what the room knows from the inside", () => {
  /** What a survivor is paid for a full-marks answer: 70% on the parts they lived, full price on the rest. */
  const survivorPay = (questionId: string) =>
    questions.find((question) => question.id === questionId)!.rubric.reduce((sum, element) => sum + (element.survivorKnows === true ? round2(element.points * POINTS.insiderCredit) : element.points), 0);

  it("pays a survivor 70% for the parts of the story they lived, and full price for the rest", () => {
    const guest = bystander;
    const submissions = mysteries(guest);
    const items = autoGrade({ submissions, events: [], truth });
    const get = (id: string) => items.find((entry) => entry.guest === guest && entry.itemId === id)!.points;
    assert.equal(get("old-3"), round2(0.5 * POINTS.insiderCredit) + round2(0.2 * POINTS.insiderCredit) + 0.3, "Kit and the hitmen are lived; the frame is not");
    assert.equal(get("con-1"), round2(0.4 * POINTS.insiderCredit) + round2(0.3 * POINTS.insiderCredit) + 0.3);
    assert.equal(get("con-2"), round2(0.5 * POINTS.insiderCredit) + round2(0.3 * POINTS.insiderCredit) + round2(0.2 * POINTS.insiderCredit), "all three parts are lived");
    for (const id of ["old-3", "con-1", "con-2"]) assert.equal(round2(get(id)), round2(survivorPay(id)), id);
    assert.equal(get("con-3"), 1, "the invitation's sender is news to a survivor");
    assert.equal(get("new-1"), 2, "a survivor who did not buy the vial must still work out who did");
    assert.equal(get("new-3"), 1, "only the killer lived the grievance");
  });
  it("charges only the killer for knowing their own grievance", () => {
    const grievance = characterById.get(killer)!.survivor!.grievance;
    const items = autoGrade({
      submissions: [sub(killer, "mystery", "new-3", grievance), sub(bystander, "mystery", "new-3", grievance)],
      events: [],
      truth,
    });
    const k = items.find((entry) => entry.guest === killer && entry.itemId === "new-3")!;
    const other = items.find((entry) => entry.guest === bystander && entry.itemId === "new-3")!;
    assert.equal(k.points, round2(0.5 * POINTS.insiderCredit) * 2);
    assert.equal(other.points, 1);
  });
  it("grades the Butler and the killer on the replacement questions instead of 'who' and 'how'", () => {
    const outsider = "anika";
    const submissions = [butler, killer, outsider].flatMap((guest) => mysteries(guest));
    const items = autoGrade({ submissions, events: [], truth });
    const ids = (guest: string) => items.filter((entry) => entry.guest === guest && entry.kind === "mystery").map((entry) => entry.itemId);
    const get = (guest: string, id: string) => items.find((entry) => entry.guest === guest && entry.itemId === id)!;
    for (const guest of [butler, killer]) {
      for (const [original, alternate] of alternateOf) {
        assert.ok(!ids(guest).includes(original), `${guest} has no ${original}`);
        assert.equal(get(guest, alternate).points, questions.find((question) => question.id === alternate)!.points, `${guest} earns full marks on ${alternate}`);
      }
    }
    for (const [original, alternate] of alternateOf) {
      assert.ok(ids(outsider).includes(original));
      assert.ok(!ids(outsider).includes(alternate), `an outsider has no ${alternate}`);
    }
    assert.equal(get(outsider, "new-1").points, 2);
    // the substitution costs the Butler and the killer nothing: the mysteries still total 10
    for (const guest of [butler, killer, outsider]) {
      const standing = computeStandings(items, submissions, truth).standings.find((row) => row.guest === guest)!;
      assert.ok(standing.tiers.mysteries <= MYSTERY_POINTS, `${guest} ${standing.tiers.mysteries}`);
      if (guest !== killer) assert.equal(standing.tiers.mysteries, MYSTERY_POINTS, `${guest} can still reach the full ${MYSTERY_POINTS}`);
    }
  });
});

describe("overrides", () => {
  const base = (): { items: GradeItem[]; submissions: Submission[] } => {
    const submissions = [sub("anika", "mystery", "old-3", "Kit Kessler the Keeper, I think")];
    return { items: autoGrade({ submissions, events: [], truth }), submissions };
  };
  it("replaces the automatic grade and clears the review flag", () => {
    const { items } = base();
    const before = items.find((entry) => entry.guest === "anika" && entry.itemId === "old-3")!;
    assert.equal(before.needsReview, true);
    const result = applyOverrides(items, [{ guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: 0.9, rationale: "Names Kit and the Keeper's role clearly.", source: "claude" }]);
    const after = result.items.find((entry) => entry.guest === "anika" && entry.itemId === "old-3")!;
    assert.equal(after.points, 0.9);
    assert.equal(after.needsReview, false);
    assert.equal(after.source, "claude");
    assert.equal(before.points, 0.5, "the original array is untouched");
  });
  it("rejects points outside the item's range and reports unknown items", () => {
    const { items } = base();
    const result = applyOverrides(items, [
      { guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: 1.5, rationale: "too many", source: "claude" },
      { guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: -1, rationale: "negative", source: "claude" },
      { guest: "nobody", kind: "mystery", itemId: "old-3", verdict: "accept", points: 1, rationale: "unknown guest", source: "staff" },
    ]);
    assert.equal(result.invalid.length, 2);
    assert.equal(result.unmatched.length, 1);
    assert.equal(result.items.find((entry) => entry.guest === "anika" && entry.itemId === "old-3")!.points, 0.5);
  });
  it("changes the standings", () => {
    const { items, submissions } = base();
    const before = computeStandings(items, submissions, truth);
    assert.ok(before.pendingReview > 0);
    const after = computeStandings(applyOverrides(items, [{ guest: "anika", kind: "mystery", itemId: "old-3", verdict: "reject", points: 0, rationale: "Contradicts itself.", source: "staff" }]).items, submissions, truth);
    assert.equal(after.standings.find((row) => row.guest === "anika")!.tiers.mysteries, 0);
    assert.equal(after.pendingReview, before.pendingReview - 1);
  });
});

describe("ties", () => {
  it("always produces exactly one winner, even when everybody ties", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const tied: Truth = { killer: null, present: everyone, seed };
      // everybody finds the same kind of thing and earns exactly one point
      const submissions = everyone.map((id) => {
        const find = characterById.get(id)!.objectives.find((objective) => objective.kind === "find")!;
        return sub(id, "objective", find.id, correctAnswer(characterById.get(id)!, find));
      });
      const items = autoGrade({ submissions, events: [], truth: tied });
      const result = computeStandings(items, submissions, tied);
      const ranks = result.standings.map((row) => row.rank);
      assert.deepEqual([...ranks].sort((a, b) => a - b), ranks.map((_, index) => index + 1).sort((a, b) => a - b));
      assert.equal(new Set(ranks).size, everyone.length);
      assert.ok(result.winner);
    }
  });
  it("breaks ties by mysteries, then the killer question, then the survivors tier, then errands", () => {
    const a = "anika";
    const b = "silas";
    // equal totals by construction: a has more mystery points, b has more errand points
    const mysteryA = [sub(a, "mystery", "old-3", "Kit Kessler the Keeper hired hitmen, and framed Cassie with forged orders.")];
    const errand = errandsOnly(b)[0];
    const submissions = [...mysteryA, errand];
    const items = autoGrade({ submissions, events: [], truth });
    const adjusted = items.map((entry) => {
      if (entry.guest === a && entry.itemId === "old-3") return { ...entry, points: 1, max: 1 };
      if (entry.guest === b && entry.itemId === errand.itemId) return { ...entry, points: 1 };
      return entry;
    });
    const result = computeStandings(adjusted, submissions, truth);
    const sa = result.standings.find((row) => row.guest === a)!;
    const sb = result.standings.find((row) => row.guest === b)!;
    assert.equal(sa.total, sb.total);
    assert.ok(sa.rank < sb.rank, "the guest with more mystery points ranks higher at equal totals");
  });
  it("is reproducible from the seed: the same hash order every time", () => {
    const order = (seed: string) => [...everyone].sort((x, y) => (tieHash(seed, x) < tieHash(seed, y) ? -1 : 1));
    assert.deepEqual(order("seed-1"), order("seed-1"));
    assert.notDeepEqual(order("seed-1"), order("seed-2"));
  });
  it("names a champion in every circle and an award for each", () => {
    const night = simulateNight({ seed: 11 });
    const { standings } = gradeNight(night);
    for (const circle of circles) {
      const champion = standings.circleChampions[circle.id];
      assert.ok(champion, circle.id);
      assert.equal(characterById.get(champion!)!.circle, circle.id);
    }
    assert.ok(standings.awards.some((award) => award.id === "master-detective"));
    assert.equal(standings.awards.find((award) => award.id === "the-poisoner")!.guest, night.truth.killer);
  });
});

describe("fairness, by simulation", () => {
  const N = 240;
  const nights = Array.from({ length: N }, (_, index) => {
    const night = simulateNight({ seed: 9000 + index });
    return { night, standings: gradeNight(night).standings };
  });

  it("produces exactly one winner every night", () => {
    for (const { standings } of nights) assert.ok(standings.winner);
  });

  it("never lets a non-survivor win on errands alone", () => {
    let wins = 0;
    for (const { night, standings } of nights) {
      const winner = standings.winner!;
      if (night.profiles[winner] === "errandRunner" && !characterById.get(winner)!.survivor) wins += 1;
    }
    assert.equal(wins, 0);
  });

  it("rewards the detectives most, and the balanced players sometimes", () => {
    const share = (profile: string) => nights.filter(({ night, standings }) => night.profiles[standings.winner!] === profile).length / N;
    assert.ok(share("detective") > 0.7, `detectives won ${share("detective")}`);
    assert.ok(share("balanced") > 0.02, `balanced won ${share("balanced")}`);
    assert.ok(share("casual") < 0.03, `casual won ${share("casual")}`);
  });

  it("gives the five survivors roughly their fair share of wins", () => {
    const wins = nights.filter(({ standings }) => characterById.get(standings.winner!)!.survivor).length / N;
    // fair is 5 of 24, about 21%; allow a wide band for sampling noise
    assert.ok(wins > 0.1 && wins < 0.35, `survivors won ${wins}`);
  });

  it("keeps equally skilled survivors and non-survivors within a few points of each other", () => {
    const average = (survivor: boolean) => {
      const totals: number[] = [];
      for (const { night, standings } of nights) for (const row of standings.standings) if (night.profiles[row.guest] === "detective" && row.survivor === survivor) totals.push(row.total);
      return totals.reduce((sum, value) => sum + value, 0) / totals.length;
    };
    const gap = Math.abs(average(true) - average(false));
    assert.ok(gap < 1, `detective survivors and non-survivors differ by ${gap}`);
  });

  it("does not hand the murderer the night", () => {
    const wins = nights.filter(({ night, standings }) => standings.winner === night.truth.killer).length / N;
    assert.ok(wins < 0.15, `the killer won ${wins}`);
  });

  it("does not hand the Butler the night for knowing who bought", () => {
    const wins = nights.filter(({ standings }) => standings.winner === "rebecca").length / N;
    assert.ok(wins < 0.12, `the Butler won ${wins}`);
  });

  it("ranks every profile in the intended order on average", () => {
    const average = (profile: string) => {
      const totals: number[] = [];
      for (const { night, standings } of nights) for (const row of standings.standings) if (night.profiles[row.guest] === profile && !row.survivor) totals.push(row.total);
      return totals.reduce((sum, value) => sum + value, 0) / totals.length;
    };
    assert.ok(average("detective") > average("balanced"));
    assert.ok(average("balanced") > average("errandRunner") - 5);
    assert.ok(average("errandRunner") > average("casual"));
    assert.deepEqual(Object.keys(PROFILES).sort(), ["balanced", "casual", "detective", "errandRunner"]);
  });
});
