import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { characterById, characters, exhibits, objectiveById, questions, survivorIds } from "@/data/game";
import { autoGrade, latestSubmissions, parsePicks, POINTS, rubricFor } from "./grading";
import { matchesPattern } from "./text";
import { correctAnswer, correctMystery, mulberry } from "./sim";
import type { GameEvent, GradeItem, Submission, Truth } from "./types";

const everyone = characters.map((character) => character.id);
const truth = (overrides: Partial<Truth> = {}): Truth => ({ killer: "adam", present: everyone, seed: "test", ...overrides });
let clock = 0;
const sub = (guest: string, kind: Submission["kind"], itemId: string, answer: string, at = (clock += 10)): Submission => ({ guest, kind, itemId, answer, proof: "", at });
const ev = (killer = "adam"): GameEvent[] => [
  { kind: "vial-attempt", guest: killer, at: 1, sold: true },
  { kind: "vial-sold", guest: killer, by: "rebecca", at: 1 },
];
const find = (items: GradeItem[], guest: string, kind: string, itemId: string) => {
  const found = items.find((entry) => entry.guest === guest && entry.kind === kind && entry.itemId === itemId);
  assert.ok(found, `no grade for ${guest}|${kind}|${itemId}`);
  return found;
};
const allObjectives = characters.flatMap((character) => character.objectives.map((objective) => ({ character, objective })));
const withKind = (kind: string) => allObjectives.filter(({ objective }) => objective.check.kind === kind);
/** The guest who killed in the default truth, and a survivor who did not. */
const killerId = "adam";
const bystander = survivorIds.find((id) => id !== killerId)!;
const objectiveItem = (items: GradeItem[], objectiveId: string) => find(items, objectiveId.split("-")[0], "objective", objectiveId);

function perfectErrands(skip: (id: string) => boolean = () => false): Submission[] {
  const out: Submission[] = [];
  for (const character of characters) {
    for (const objective of character.objectives) {
      if (skip(objective.id)) continue;
      // the sim answers every clock with 9:16 pm, which is only right inside the Butler's and Josh's windows
      const answer = objective.check.kind === "clock" ? objective.check.from : correctAnswer(character, objective);
      out.push(sub(character.id, "objective", objective.id, answer));
    }
  }
  return out;
}

describe("objectives", () => {
  it("gives every guest 60 when every errand is done correctly and the secrets stay secret", () => {
    // the seekers' answers are withheld (a correct one would cost the hiders), and Josh's fortunes are always read by a human
    const seekIds = new Set(withKind("seek").map(({ objective }) => objective.id));
    const offers: GameEvent[] = survivorIds.map((id, index) => ({ kind: "vial-attempt", guest: id, at: index, sold: id === killerId }));
    const items = autoGrade({ submissions: perfectErrands((id) => seekIds.has(id)), events: [...ev(), ...offers], truth: truth() });
    for (const character of characters) {
      const total = items.filter((entry) => entry.guest === character.id && entry.kind === "objective").reduce((sum, entry) => sum + entry.points, 0);
      const unearned = character.objectives.filter((objective) => objective.check.kind === "seek" || objective.check.kind === "manual").length;
      assert.equal(total, 60 - 12 * unearned, `${character.id} earned ${total}`);
    }
    const fortunes = withKind("manual");
    assert.ok(fortunes.length > 0);
    for (const { objective } of fortunes) assert.equal(objectiveItem(items, objective.id).needsReview, true, `${objective.id} is always flagged for review`);
  });

  it("gives nothing for an objective nobody answered, except those the room decides", () => {
    const items = autoGrade({ submissions: [], events: [], truth: truth() });
    for (const character of characters) {
      for (const objective of character.objectives) {
        const entry = objectiveItem(items, objective.id);
        if (objective.check.kind === "hide") assert.equal(entry.points, 12, "a secret nobody hunted stays secret");
        else assert.equal(entry.points, 0, `${objective.id} earned ${entry.points} for nothing`);
      }
    }
  });

  it("accepts codes in any case, with spaces or dashes", () => {
    const objective = objectiveById.get("anika-1")!;
    const code = (objective.check as { codes: string[] }).codes[0];
    for (const typed of [code, code.toLowerCase(), `${code.slice(0, 2)}-${code.slice(2)}`, ` ${code} `]) {
      const items = autoGrade({ submissions: [sub("anika", "objective", "anika-1", typed)], events: [], truth: truth() });
      assert.equal(objectiveItem(items, "anika-1").points, 12, typed);
    }
  });

  it("rejects a code that belongs to a different prop", () => {
    const items = autoGrade({ submissions: [sub("anika", "objective", "anika-1", "AJTN9")], events: [], truth: truth() });
    assert.equal(objectiveItem(items, "anika-1").points, 0);
  });

  it("grades a learn objective by its answer pattern, forgiving a typo", () => {
    const key = (objectiveById.get("anika-2")!.check as { all: string[][] }).all[0][0];
    const right = autoGrade({ submissions: [sub("anika", "objective", "anika-2", `It is the ${key}`)], events: [], truth: truth() });
    assert.equal(objectiveItem(right, "anika-2").points, 12);
    const wrong = autoGrade({ submissions: [sub("anika", "objective", "anika-2", "Mabel")], events: [], truth: truth() });
    assert.equal(objectiveItem(wrong, "anika-2").points, 0);
    const typo = autoGrade({ submissions: [sub("tim", "objective", "tim-2", "tea leeves")], events: [], truth: truth() });
    assert.equal(objectiveItem(typo, "tim-2").points, 12, "one slipped letter in 'tea leaves'");
  });

  it("sends an answer found only in the proof box to review, not to credit", () => {
    const items = autoGrade({ submissions: [{ guest: "anika", kind: "objective", itemId: "anika-2", answer: "I asked him", proof: `He told me about the ${(objectiveById.get("anika-2")!.check as { all: string[][] }).all[0][0]}`, at: 1 }], events: [], truth: truth() });
    const entry = objectiveItem(items, "anika-2");
    assert.equal(entry.points, 0);
    assert.equal(entry.needsReview, true);
  });

  it("checks money against the target and against what the room started with", () => {
    const { character, objective } = withKind("money")[0];
    const target = (objective.check as { min: number }).min;
    const money = (answer: string) => objectiveItem(autoGrade({ submissions: [sub(character.id, "objective", objective.id, answer)], events: [], truth: truth() }), objective.id);
    assert.equal(money(`$${target}`).points, 12);
    assert.equal(money(`${target + 60}`).points, 12);
    assert.equal(money(`$${target - 1}`).points, 0);
    assert.equal(money("lots").points, 0);
    const impossible = money("$99999");
    assert.equal(impossible.points, 0);
    assert.equal(impossible.needsReview, true);
  });

  it("reads the Butler's scream time inside its window", () => {
    const clockItem = (answer: string) => objectiveItem(autoGrade({ submissions: [sub("rebecca", "objective", "rebecca-5", answer)], events: [], truth: truth() }), "rebecca-5");
    assert.equal(clockItem("9:16").points, 12);
    assert.equal(clockItem("9:16 pm").points, 12);
    assert.equal(clockItem("21:21").points, 12);
    assert.equal(clockItem("9:00").points, 0);
    assert.equal(clockItem("9:30").points, 0);
    assert.equal(clockItem("a while ago").points, 0);
  });

  it("scores the survivors' offers and the Butler's sale from the House's own log", () => {
    const none = autoGrade({ submissions: [], events: [], truth: truth({ killer: null }) });
    const offerOf = (id: string) => characterById.get(id)!.objectives.find((objective) => objective.check.kind === "vial-attempt")!.id;
    const [refused, buyer, silent] = [survivorIds.find((id) => id !== killerId)!, killerId, survivorIds.filter((id) => id !== killerId)[1]];
    const saleId = characterById.get("rebecca")!.objectives.find((objective) => objective.check.kind === "butler-sale")!.id;
    assert.equal(objectiveItem(none, offerOf(buyer)).points, 0);
    assert.equal(objectiveItem(none, saleId).points, 0);
    const events: GameEvent[] = [
      { kind: "vial-attempt", guest: refused, at: 1, sold: false },
      { kind: "vial-attempt", guest: buyer, at: 2, sold: true },
      { kind: "vial-sold", guest: buyer, by: "rebecca", at: 2 },
    ];
    const items = autoGrade({ submissions: [], events, truth: truth() });
    assert.equal(objectiveItem(items, offerOf(refused)).points, 12, "even a refused offer is counted");
    assert.equal(objectiveItem(items, offerOf(buyer)).points, 12);
    assert.equal(objectiveItem(items, offerOf(silent)).points, 0);
    assert.equal(objectiveItem(items, saleId).points, 12);
  });

  it("scores the secret affair: seekers find it, hiders lose points when found", () => {
    const truthy = truth();
    const seekers = withKind("seek").map(({ character, objective }) => ({ id: character.id, objective: objective.id }));
    const hiders = withKind("hide").map(({ character, objective }) => ({ id: character.id, objective: objective.id }));
    assert.deepEqual(hiders.map((hider) => hider.id).sort(), ["ananya", "joel"], "there is exactly one affair");
    assert.ok(seekers.length >= 2);
    const [first, second] = seekers;
    const pair = "Ananya Codru and Joel Indipiginja";

    const hidden = autoGrade({ submissions: [], events: [], truth: truthy });
    for (const hider of hiders) assert.equal(objectiveItem(hidden, hider.objective).points, 12);
    assert.equal(objectiveItem(hidden, first.objective).points, 0);

    const found = autoGrade({ submissions: [sub(first.id, "objective", first.objective, pair)], events: [], truth: truthy });
    assert.equal(objectiveItem(found, first.objective).points, 12);
    for (const hider of hiders) assert.equal(objectiveItem(found, hider.objective).points, 6);

    const twice = autoGrade({ submissions: [sub(first.id, "objective", first.objective, pair), sub(second.id, "objective", second.objective, "joel, ananya")], events: [], truth: truthy });
    for (const hider of hiders) assert.equal(objectiveItem(twice, hider.objective).points, 0);

    const wrong = autoGrade({ submissions: [sub(first.id, "objective", first.objective, "Ananya and Rhea")], events: [], truth: truthy });
    assert.equal(objectiveItem(wrong, first.objective).points, 0);
    for (const hider of hiders) assert.equal(objectiveItem(wrong, hider.objective).points, 12);

    const spray = autoGrade({ submissions: [sub(first.id, "objective", first.objective, "Ananya, Joel, Rhea, Tiffany")], events: [], truth: truthy });
    assert.equal(objectiveItem(spray, first.objective).points, 0, "naming everyone is not a find");
    assert.equal(objectiveItem(spray, first.objective).needsReview, true);
    for (const hider of hiders) assert.equal(objectiveItem(spray, hider.objective).points, 12, "and it cannot cost the hiders anything");
  });
});

describe("resubmission", () => {
  it("counts the newest submission for each item, whatever order they arrive in", () => {
    const key = (objectiveById.get("anika-2")!.check as { all: string[][] }).all[0][0];
    const old = sub("anika", "objective", "anika-2", "Mabel", 100);
    const fresh = sub("anika", "objective", "anika-2", key, 200);
    for (const submissions of [[old, fresh], [fresh, old]]) {
      const items = autoGrade({ submissions, events: [], truth: truth() });
      assert.equal(objectiveItem(items, "anika-2").points, 12);
    }
    const wrongLast = autoGrade({ submissions: [sub("anika", "objective", "anika-2", key, 100), sub("anika", "objective", "anika-2", "Mabel", 200)], events: [], truth: truth() });
    assert.equal(objectiveItem(wrongLast, "anika-2").points, 0);
  });
  it("keeps one entry per guest, kind and item", () => {
    const latest = latestSubmissions([sub("a", "objective", "x", "1", 1), sub("a", "objective", "x", "2", 2), sub("a", "exhibit", "x", "3", 3), sub("b", "objective", "x", "4", 4)]);
    assert.equal(latest.size, 3);
  });
});

describe("exhibits", () => {
  const file = (guest: string, code: string) => sub(guest, "exhibit", code, code);
  it("pays two points per page and stops at twelve", () => {
    const codes = exhibits.filter((exhibit) => exhibit.heldBy !== "anika").map((exhibit) => exhibit.code);
    const items = autoGrade({ submissions: codes.map((code) => file("anika", code)), events: [], truth: truth() });
    const total = items.filter((entry) => entry.guest === "anika" && entry.kind === "exhibit").reduce((sum, entry) => sum + entry.points, 0);
    assert.equal(total, POINTS.exhibitCap);
  });
  it("does not pay twice for the same page, or for a made-up code", () => {
    const code = exhibits[0].code;
    const items = autoGrade({ submissions: [file("anika", code), sub("anika", "exhibit", `${code}-again`, code.toLowerCase()), file("anika", "ZZZZZ")], events: [], truth: truth() });
    const total = items.filter((entry) => entry.guest === "anika" && entry.kind === "exhibit").reduce((sum, entry) => sum + entry.points, 0);
    assert.equal(total, 2);
  });
  it("does not pay for the page you were handed, or one that already earned an objective", () => {
    const own = exhibits.find((exhibit) => exhibit.heldBy === "rebecca")!;
    const items = autoGrade({ submissions: [file("rebecca", own.code)], events: [], truth: truth() });
    assert.equal(find(items, "rebecca", "exhibit", own.id).points, 0);
    const objective = autoGrade({ submissions: [sub("theodor", "objective", "theodor-4", "YMYKK"), file("theodor", "YMYKK")], events: [], truth: truth() });
    assert.equal(find(objective, "theodor", "exhibit", "report").points, 0);
    assert.equal(objectiveItem(objective, "theodor-4").points, 12);
  });
});

describe("the survivors tier", () => {
  const picks = (guest: string, ids: string[]) => sub(guest, "survivors", "picks", JSON.stringify(ids));
  it("pays four for each survivor named and takes two for each wrong name", () => {
    const items = autoGrade({ submissions: [picks("anika", survivorIds)], events: [], truth: truth() });
    assert.equal(find(items, "anika", "survivors", "picks").points, 20);
    const mixed = autoGrade({ submissions: [picks("anika", [survivorIds[0], survivorIds[1], "tim", "joel", "leon"])], events: [], truth: truth() });
    assert.equal(find(mixed, "anika", "survivors", "picks").points, 2 * 4 - 3 * 2);
    const allWrong = autoGrade({ submissions: [picks("anika", ["tim", "joel", "leon", "silas", "eric"])], events: [], truth: truth() });
    assert.equal(find(allWrong, "anika", "survivors", "picks").points, -10);
  });
  it("ignores a sixth name, a repeat and yourself", () => {
    const items = autoGrade({ submissions: [picks("anika", [survivorIds[0], survivorIds[0], "anika", ...survivorIds.slice(1), "tim"])], events: [], truth: truth() });
    assert.equal(find(items, "anika", "survivors", "picks").points, 20, "the five survivors; the repeat, anika and tim are dropped");
  });
  it("reads names typed as text, not only ids", () => {
    assert.deepEqual(parsePicks("Mihir Nagarkatti, Luke Shelldon; Rhea Mallya\nAdam Holdsfire, Molly Daniel"), ["mihir", "luke", "rhea", "adam", "molly"]);
    assert.deepEqual(parsePicks("[\"tim\",\"nobody\"]"), ["tim"]);
  });
  it("pays survivors for staying hidden: twenty, less two for each guest who named them", () => {
    const hidden = autoGrade({ submissions: [], events: [], truth: truth() });
    assert.equal(find(hidden, "mihir", "survivors", "cover").points, 20);
    const submissions = ["anika", "tim", "josh"].map((guest) => picks(guest, ["mihir", "luke"]));
    const caught = autoGrade({ submissions, events: [], truth: truth() });
    assert.equal(find(caught, "mihir", "survivors", "cover").points, 14);
    assert.equal(find(caught, "rhea", "survivors", "cover").points, 20);
  });
  it("never lets a survivor's own picks count against anyone", () => {
    const items = autoGrade({ submissions: [picks("mihir", ["luke", "rhea", "adam", "molly"])], events: [], truth: truth() });
    assert.equal(find(items, "luke", "survivors", "cover").points, 20);
    assert.ok(!items.some((entry) => entry.guest === "mihir" && entry.itemId === "picks"));
  });
});

const altAnswers: Record<string, string> = {
  "alt-1": "He meant to crown himself the new head of the Black Veil, with the nineteen guests as witnesses who had to sign, because Cassie had to be declared dead so the vault and books would pass to him.",
  "alt-2": "In the vault behind the Merrimack Room's second window; it takes three keys and a dial that only Cassie can set.",
};

describe("the three mysteries", () => {
  for (const killer of survivorIds) {
    it(`gives full marks to the model answers when ${killer} is the killer`, () => {
      // an ordinary guest answers the nine counted questions; the replacements are not theirs to answer
      const counted = questions.filter((question) => !question.alternateFor);
      const submissions = counted.map((question) => sub("anika", "mystery", question.id, correctMystery(question, killer)));
      const items = autoGrade({ submissions, events: ev(killer), truth: truth({ killer }) });
      for (const question of counted) assert.equal(find(items, "anika", "mystery", question.id).points, question.points, `${question.id}: ${find(items, "anika", "mystery", question.id).rationale}`);
      assert.ok(!items.some((entry) => entry.guest === "anika" && entry.itemId.startsWith("alt-")), "an ordinary guest has no replacement items");
    });
  }

  it("grades the Butler and the killer on the replacement questions instead of 'who' and 'how'", () => {
    const killer = killerId;
    const replaced = new Map(questions.filter((question) => question.alternateFor).map((question) => [question.alternateFor!, question]));
    assert.equal(replaced.size, 2);
    for (const guest of ["rebecca", killer]) {
      const submissions = questions.map((question) => sub(guest, "mystery", question.id, altAnswers[question.id] ?? correctMystery(question, killer)));
      const items = autoGrade({ submissions, events: ev(killer), truth: truth({ killer }) });
      for (const [original, replacement] of replaced) {
        assert.ok(!items.some((entry) => entry.guest === guest && entry.kind === "mystery" && entry.itemId === original), `${guest} is not graded on ${original}`);
        assert.equal(find(items, guest, "mystery", replacement.id).points, replacement.points, `${guest} ${replacement.id}`);
        assert.equal(replacement.points, questions.find((question) => question.id === original)!.points);
      }
    }
    const ordinary = autoGrade({ submissions: [], events: ev(killer), truth: truth({ killer }) });
    assert.ok(!ordinary.some((entry) => entry.guest === bystander && entry.itemId.startsWith("alt-")));
    assert.ok(ordinary.some((entry) => entry.guest === bystander && entry.itemId === "new-1"));
  });

  it("gives nothing for the wrong killer, and flags a guess that names several guests", () => {
    const wrong = autoGrade({ submissions: [sub("anika", "mystery", "new-1", "joel")], events: ev(), truth: truth() });
    assert.equal(find(wrong, "anika", "mystery", "new-1").points, 0);
    const several = autoGrade({ submissions: [sub("anika", "mystery", "new-1", `joel or ${killerId}`)], events: ev(), truth: truth() });
    assert.equal(find(several, "anika", "mystery", "new-1").points, 0);
    assert.equal(find(several, "anika", "mystery", "new-1").needsReview, true);
    const right = autoGrade({ submissions: [sub("anika", "mystery", "new-1", characterById.get(killerId)!.name)], events: ev(), truth: truth() });
    assert.equal(find(right, "anika", "mystery", "new-1").points, 16);
  });

  it("scores the wrong story at zero", () => {
    const wrong: Record<string, string> = {
      "old-1": "Everybody was murdered that night and the bodies were hidden.",
      "old-2": "I do not know why.",
      "old-3": "Cassie killed them all herself with her own pistol.",
      "new-2": "He was stabbed with a knife in the library.",
      "con-1": "A stranger nobody had ever met.",
      "con-2": "They are the guests' cousins.",
      "con-3": "The mill owner.",
    };
    const items = autoGrade({ submissions: Object.entries(wrong).map(([id, text]) => sub("anika", "mystery", id, text)), events: ev(), truth: truth() });
    for (const id of Object.keys(wrong)) assert.equal(find(items, "anika", "mystery", id).points, 0, `${id}: ${find(items, "anika", "mystery", id).rationale}`);
  });

  it("gives partial credit for partial understanding", () => {
    const items = autoGrade({ submissions: [sub("anika", "mystery", "old-3", "It was Kit Kessler, the Keeper.")], events: ev(), truth: truth() });
    const entry = find(items, "anika", "mystery", "old-3");
    assert.equal(entry.points, 5);
    assert.equal(entry.verdict, "partial");
  });

  it("builds the 'why' rubric from the killer's own grievance, and splits it in half", () => {
    const question = questions.find((candidate) => candidate.id === "new-3")!;
    const killer = survivorIds[0];
    const rubric = rubricFor(question, truth({ killer }));
    assert.equal(rubric.length, 2);
    assert.equal(rubric.reduce((sum, element) => sum + element.points, 0), question.points);
    const [what] = characterById.get(killer)!.survivor!.motiveKeys;
    const half = autoGrade({ submissions: [sub("anika", "mystery", "new-3", `He ${what[0]} me`)], events: ev(killer), truth: truth({ killer }) });
    assert.equal(find(half, "anika", "mystery", "new-3").points, question.points / 2);
  });

  it("does not let the wrong survivor's motive pass for the killer's", () => {
    const killer = survivorIds[0];
    const keys = characterById.get(killer)!.survivor!.motiveKeys;
    const other = survivorIds.slice(1).find((id) => !keys.some((group) => matchesPattern(characterById.get(id)!.survivor!.grievance, [group])));
    assert.ok(other, "some other survivor's grievance shares nothing with the killer's");
    const items = autoGrade({ submissions: [sub("anika", "mystery", "new-3", characterById.get(other!)!.survivor!.grievance)], events: ev(killer), truth: truth({ killer }) });
    assert.equal(find(items, "anika", "mystery", "new-3").points, 0);
  });

  it("flags every free-text answer for a second look and caps a very long one", () => {
    const answer = correctMystery(questions[0], killerId);
    const normal = autoGrade({ submissions: [sub("anika", "mystery", "old-1", answer)], events: ev(), truth: truth() });
    assert.equal(find(normal, "anika", "mystery", "old-1").needsReview, true);
    const stuffed = autoGrade({ submissions: [sub("anika", "mystery", "old-1", `${answer} ${"filler words ".repeat(60)}`)], events: ev(), truth: truth() });
    const entry = find(stuffed, "anika", "mystery", "old-1");
    assert.equal(entry.points, 5);
    assert.match(entry.rationale, /very long/);
  });

  it("makes a keyword-stuffed pile of every term earn no more than the cap and still flags it", () => {
    const pile = questions.flatMap((question) => question.rubric.flatMap((element) => element.all.flatMap((group) => group))).join(" ");
    const items = autoGrade({ submissions: [sub("anika", "mystery", "old-3", pile)], events: ev(), truth: truth() });
    const entry = find(items, "anika", "mystery", "old-3");
    assert.ok(entry.points <= 5, `stuffing earned ${entry.points}`);
    assert.equal(entry.needsReview, true);
  });

  it("does not grade the killer question until a killer exists", () => {
    const items = autoGrade({ submissions: [sub("anika", "mystery", "new-1", killerId)], events: [], truth: truth({ killer: null }) });
    const entry = find(items, "anika", "mystery", "new-1");
    assert.equal(entry.points, 0);
    assert.equal(entry.needsReview, true);
  });
});

describe("the poisoner and the room", () => {
  it("pays the bonus to the killer and nobody else", () => {
    const items = autoGrade({ submissions: [], events: ev(), truth: truth() });
    const bonuses = items.filter((entry) => entry.kind === "bonus" && entry.points > 0);
    assert.deepEqual(bonuses.map((entry) => entry.guest), [killerId]);
    assert.equal(bonuses[0].points, POINTS.poisoner);
  });
  it("grades only the guests who came", () => {
    const present = everyone.filter((id) => id !== "luke" && id !== "joel");
    const items = autoGrade({ submissions: [], events: [], truth: truth({ present }) });
    assert.ok(!items.some((entry) => entry.guest === "luke" || entry.guest === "joel"));
    assert.ok(items.some((entry) => entry.guest === "anika"));
  });
  it("is deterministic however the submissions are ordered", () => {
    const random = mulberry(7);
    const base = perfectErrands(() => random() < 0.3);
    const shuffled = [...base].sort(() => random() - 0.5);
    const a = autoGrade({ submissions: base, events: ev(), truth: truth() });
    const b = autoGrade({ submissions: shuffled, events: ev(), truth: truth() });
    assert.deepEqual(a, b);
  });
});

describe("the bible agrees with itself", () => {
  it("lets every survivor's grievance satisfy their own motive rubric", () => {
    for (const id of survivorIds) {
      const survivor = characterById.get(id)!.survivor!;
      const question = questions.find((candidate) => candidate.id === "new-3")!;
      const rubric = rubricFor(question, truth({ killer: id }));
      const items = autoGrade({ submissions: [sub("anika", "mystery", "new-3", survivor.grievance)], events: ev(id), truth: truth({ killer: id }) });
      assert.equal(find(items, "anika", "mystery", "new-3").points, rubric.reduce((sum, element) => sum + element.points, 0), id);
    }
  });
});
