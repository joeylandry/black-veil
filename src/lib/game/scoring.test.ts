import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { characterById, characters, circles, questions, survivorIds } from "@/data/game";
import { autoGrade, POINTS } from "./grading";
import { applyOverrides, computeStandings, tieHash } from "./scoring";
import { correctAnswer, correctMystery, gradeNight, PROFILES, simulateNight } from "./sim";
import type { GradeItem, Submission, Truth } from "./types";

const everyone = characters.map((character) => character.id);
const truth: Truth = { killer: "sidd", present: everyone, seed: "black-veil-1926" };
let clock = 0;
const sub = (guest: string, kind: Submission["kind"], itemId: string, answer: string): Submission => ({ guest, kind, itemId, answer, proof: "", at: (clock += 10) });

function errandsOnly(guest: string): Submission[] {
  const character = characterById.get(guest)!;
  return character.objectives.filter((o) => o.check.kind !== "hide" && o.check.kind !== "vial-attempt" && o.check.kind !== "butler-sale").map((o) => sub(guest, "objective", o.id, correctAnswer(character, o)));
}
function mysteries(guest: string): Submission[] {
  return questions.map((question) => sub(guest, "mystery", question.id, correctMystery(question, "sidd")));
}

describe("the ladder", () => {
  it("cannot be won by finishing every errand and never working out the story", () => {
    const runner = "mihir";
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
    assert.ok(a.tiers.objectives >= 48, "the runner did their errands");
    assert.equal(b.tiers.objectives, 0);
    assert.ok(b.total > a.total, `detective ${b.total} should beat runner ${a.total}`);
    assert.equal(result.winner, detective);
  });

  it("makes the three mysteries worth more than every errand together", () => {
    assert.ok(questions.reduce((sum, question) => sum + question.points, 0) > 60);
  });

  it("lets a guest who does both outscore a guest who does only one", () => {
    const both = "luke";
    const only = "josh";
    const submissions = [...errandsOnly(both), ...mysteries(both), ...errandsOnly(only), ...mysteries(only).slice(0, 1)];
    const items = autoGrade({ submissions, events: [], truth });
    const result = computeStandings(items, submissions, truth);
    const rank = (id: string) => result.standings.find((row) => row.guest === id)!.rank;
    assert.ok(rank(both) < rank(only));
  });

  it("scores 192 at most for a non-survivor and caps the survivors' tier at twenty", () => {
    const best = "anika";
    const submissions = [...errandsOnly(best), ...mysteries(best), sub(best, "survivors", "picks", JSON.stringify(survivorIds))];
    const items = autoGrade({ submissions, events: [], truth });
    const standing = computeStandings(items, submissions, truth).standings.find((row) => row.guest === best)!;
    assert.equal(standing.tiers.survivors, 20);
    assert.equal(standing.tiers.mysteries, 100);
    assert.ok(standing.tiers.objectives <= 60);
    assert.ok(standing.total <= 60 + 12 + 20 + 100);
  });
});

describe("what the room knows from the inside", () => {
  it("pays a survivor 70% for the parts of the story they lived, and full price for the rest", () => {
    const guest = "joel";
    const submissions = mysteries(guest);
    const items = autoGrade({ submissions, events: [], truth });
    const get = (id: string) => items.find((entry) => entry.guest === guest && entry.itemId === id)!.points;
    assert.equal(get("old-1"), Math.round(2 * POINTS.insiderCredit) + Math.round(3 * POINTS.insiderCredit) + Math.round(5 * POINTS.insiderCredit));
    assert.equal(get("con-3"), 10, "the invitation's sender is news to a survivor");
    assert.equal(get("new-1"), 16, "a survivor who did not buy the vial must still work out who did");
  });
  it("charges only the killer for knowing their own grievance", () => {
    const grievance = characterById.get("sidd")!.survivor!.grievance;
    const items = autoGrade({
      submissions: [sub("sidd", "mystery", "new-3", grievance), sub("joel", "mystery", "new-3", grievance)],
      events: [],
      truth,
    });
    const killer = items.find((entry) => entry.guest === "sidd" && entry.itemId === "new-3")!;
    const other = items.find((entry) => entry.guest === "joel" && entry.itemId === "new-3")!;
    assert.equal(killer.points, Math.round(6 * POINTS.insiderCredit) * 2);
    assert.equal(other.points, 12);
  });
  it("discounts the Butler's 'who did it', because she saw the sale", () => {
    const items = autoGrade({ submissions: [sub("rebecca", "mystery", "new-1", "sidd"), sub("anika", "mystery", "new-1", "sidd")], events: [], truth });
    assert.equal(items.find((entry) => entry.guest === "rebecca" && entry.itemId === "new-1")!.points, Math.round(16 * POINTS.insiderCredit));
    assert.equal(items.find((entry) => entry.guest === "anika" && entry.itemId === "new-1")!.points, 16);
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
    const result = applyOverrides(items, [{ guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: 9, rationale: "Names Kit and the Keeper's role clearly.", source: "claude" }]);
    const after = result.items.find((entry) => entry.guest === "anika" && entry.itemId === "old-3")!;
    assert.equal(after.points, 9);
    assert.equal(after.needsReview, false);
    assert.equal(after.source, "claude");
    assert.equal(before.points, 5, "the original array is untouched");
  });
  it("rejects points outside the item's range and reports unknown items", () => {
    const { items } = base();
    const result = applyOverrides(items, [
      { guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: 11, rationale: "too many", source: "claude" },
      { guest: "anika", kind: "mystery", itemId: "old-3", verdict: "accept", points: -1, rationale: "negative", source: "claude" },
      { guest: "nobody", kind: "mystery", itemId: "old-3", verdict: "accept", points: 1, rationale: "unknown guest", source: "staff" },
    ]);
    assert.equal(result.invalid.length, 2);
    assert.equal(result.unmatched.length, 1);
    assert.equal(result.items.find((entry) => entry.guest === "anika" && entry.itemId === "old-3")!.points, 5);
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
      const submissions = everyone.map((id) => sub(id, "exhibit", "EWWXP", "EWWXP"));
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
    const b = "mihir";
    // equal totals by construction: a has more mystery points, b has more errand points
    const mysteryA = [sub(a, "mystery", "old-3", "Kit Kessler the Keeper hired a hitman, Quill, and framed Cassie with forged orders.")];
    const submissions = [...mysteryA, ...errandsOnly(b).slice(0, 1)];
    const items = autoGrade({ submissions, events: [], truth });
    const adjusted = items.map((entry) => {
      if (entry.guest === a && entry.itemId === "old-3") return { ...entry, points: 12, max: 12 };
      if (entry.guest === b && entry.itemId === "mihir-1") return { ...entry, points: 12 };
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
    assert.ok(gap < 8, `detective survivors and non-survivors differ by ${gap}`);
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
