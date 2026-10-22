import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { characterById, characters, objectiveById, questions, races, survivorIds } from "@/data/game";
import { propById } from "@/data/game/props";
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
const slipCodes = (circle: string) => races.find((race) => race.circle === circle)!.tokens.map((token) => propById.get(token)!.code);
const NEED = 3;

function perfectErrands(skip: (id: string) => boolean = () => false): Submission[] {
  const out: Submission[] = [];
  for (const character of characters) {
    for (const objective of character.objectives) {
      if (skip(objective.id)) continue;
      out.push(sub(character.id, "objective", objective.id, correctAnswer(character, objective)));
    }
  }
  return out;
}

describe("objectives", () => {
  it("gives every guest 5 when every objective is done, except the half of a kept secret the rival spoils", () => {
    // everyone answered every search, so every rival learned what the keeper wanted kept: those keepers keep half
    const offers: GameEvent[] = survivorIds.map((id, index) => ({ kind: "vial-attempt", guest: id, at: index, sold: id === killerId }));
    const items = autoGrade({ submissions: perfectErrands(), events: [...ev(), ...offers], truth: truth() });
    for (const character of characters) {
      const total = items.filter((entry) => entry.guest === character.id && entry.kind === "objective").reduce((sum, entry) => sum + entry.points, 0);
      const unearned = character.objectives.filter((objective) => objective.check.kind === "keep").length * 0.5;
      assert.equal(total, 5 - unearned, `${character.id} earned ${total}`);
    }
  });

  it("gives nothing for an objective nobody answered, except the half of a kept secret that nobody learned", () => {
    const items = autoGrade({ submissions: [], events: [], truth: truth() });
    for (const character of characters) {
      for (const objective of character.objectives) {
        const entry = objectiveItem(items, objective.id);
        if (objective.check.kind === "keep") assert.equal(entry.points, 0.5, "nobody learned it, so at least it stayed hidden");
        else assert.equal(entry.points, 0, `${objective.id} earned ${entry.points} for nothing`);
      }
    }
  });

  it("accepts codes in any case, with spaces or dashes", () => {
    const objective = objectiveById.get("anika-find")!;
    const code = (objective.check as { codes: string[] }).codes[0];
    for (const typed of [code, code.toLowerCase(), `${code.slice(0, 2)}-${code.slice(2)}`, ` ${code} `]) {
      const items = autoGrade({ submissions: [sub("anika", "objective", "anika-find", typed)], events: [], truth: truth() });
      assert.equal(objectiveItem(items, "anika-find").points, 1, typed);
    }
  });

  it("rejects a code that belongs to a different prop", () => {
    const items = autoGrade({ submissions: [sub("anika", "objective", "anika-find", "AJTN9")], events: [], truth: truth() });
    assert.equal(objectiveItem(items, "anika-find").points, 0);
  });

  it("grades a learn objective by its answer pattern, forgiving a typo", () => {
    const key = (objectiveById.get("anika-secret")!.check as { all: string[][] }).all[0][0];
    const right = autoGrade({ submissions: [sub("anika", "objective", "anika-secret", `It is the ${key}`)], events: [], truth: truth() });
    assert.equal(objectiveItem(right, "anika-secret").points, 1);
    const wrong = autoGrade({ submissions: [sub("anika", "objective", "anika-secret", "Mabel")], events: [], truth: truth() });
    assert.equal(objectiveItem(wrong, "anika-secret").points, 0);
    const typo = autoGrade({ submissions: [sub("rebecca", "objective", "rebecca-secret", "the shoebax")], events: [], truth: truth() });
    assert.equal(objectiveItem(typo, "rebecca-secret").points, 1, "one slipped letter in 'shoebox'");
  });

  it("sends an answer found only in the proof box to review, not to credit", () => {
    const items = autoGrade({ submissions: [{ guest: "anika", kind: "objective", itemId: "anika-secret", answer: "I asked her", proof: `She told me about the ${(objectiveById.get("anika-secret")!.check as { all: string[][] }).all[0][0]}`, at: 1 }], events: [], truth: truth() });
    const entry = objectiveItem(items, "anika-secret");
    assert.equal(entry.points, 0);
    assert.equal(entry.needsReview, true);
  });

  it("checks money against the target and against what the room started with", () => {
    const { character, objective } = withKind("money")[0];
    const target = (objective.check as { min: number }).min;
    const money = (answer: string) => objectiveItem(autoGrade({ submissions: [sub(character.id, "objective", objective.id, answer)], events: [], truth: truth() }), objective.id);
    assert.equal(money(`$${target}`).points, 1);
    assert.equal(money(`${target + 60}`).points, 1);
    assert.equal(money(`$${target - 1}`).points, 0);
    assert.equal(money("lots").points, 0);
    const impossible = money("$99999");
    assert.equal(impossible.points, 0);
    assert.equal(impossible.needsReview, true);
  });

  it("gives a host-approved objective only to the guest who types the host's word", () => {
    const { character, objective } = withKind("approval")[0];
    const word = (objective.check as { word: string }).word;
    const typed = (answer: string) => objectiveItem(autoGrade({ submissions: [sub(character.id, "objective", objective.id, answer)], events: [], truth: truth() }), objective.id);
    assert.equal(typed(word).points, 1);
    assert.equal(typed(`  ${word.toUpperCase()} `).points, 1, "case and spaces do not matter");
    assert.equal(typed("please").points, 0);
    assert.equal(typed("").points, 0);
    assert.equal(objectiveItem(autoGrade({ submissions: [], events: [], truth: truth() }), objective.id).points, 0, "claiming alone earns nothing");
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
    assert.equal(objectiveItem(items, offerOf(refused)).points, 1, "even a refused offer is counted");
    assert.equal(objectiveItem(items, offerOf(buyer)).points, 1);
    assert.equal(objectiveItem(items, offerOf(silent)).points, 0);
    assert.equal(objectiveItem(items, saleId).points, 1);
  });

  it("scores a kept secret in two halves: the chosen seeker learned it, and the rival did not", () => {
    const keeper = "krrish";
    const check = objectiveById.get("krrish-keep")!.check as { seeker: string; seekerObjective: string; rival: string; rivalObjective: string };
    const answer = (objectiveId: string) => correctAnswer(characterById.get(objectiveId.split("-")[0])!, objectiveById.get(objectiveId)!);
    const keep = (submissions: Submission[], present = everyone) => objectiveItem(autoGrade({ submissions, events: [], truth: truth({ present }) }), "krrish-keep");
    const told = sub(check.seeker, "objective", check.seekerObjective, answer(check.seekerObjective));
    const leaked = sub(check.rival, "objective", check.rivalObjective, answer(check.rivalObjective));
    assert.equal(keep([]).points, 0.5, "nobody learned it: the hiding half only");
    assert.equal(keep([told]).points, 1, "told to the right person and to nobody else");
    assert.equal(keep([told, leaked]).points, 0.5, "the rival learned it too: the telling half only");
    assert.equal(keep([leaked]).points, 0, "only the rival learned it");
    assert.equal(keep([], everyone.filter((id) => id !== check.seeker)).points, 1, "the seeker did not come, so it cannot be held against you");
    assert.ok(keeper);
  });
});

describe("the group races", () => {
  const raceItems = (items: GradeItem[]) => items.filter((entry) => entry.kind === "bonus" && entry.itemId === "race");

  it("gives the extra point to the earliest member who submits three different slips of the group's race", () => {
    const codes = slipCodes("order").slice(0, NEED).join(" ");
    const items = autoGrade({
      submissions: [
        sub("eric", "objective", "race", [slipCodes("order")[0], slipCodes("order")[0], slipCodes("order")[1]].join(" "), 50), // two different slips, one repeated
        sub("emre", "objective", "race", slipCodes("order").slice(2, 5).join(" "), 300), // any three of the five will do
        sub("anika", "objective", "race", codes.toLowerCase().split(" ").join(", "), 100), // earliest complete
      ],
      events: [],
      truth: truth({ killer: null }),
    });
    const winners = raceItems(items).filter((entry) => characterById.get(entry.guest)!.circle === "order");
    assert.deepEqual(winners.map((entry) => entry.guest), ["anika"]);
    assert.equal(winners[0].points, POINTS.race);
  });

  it("counts a complete early attempt even if the guest later overwrites it, and ignores outsiders", () => {
    const codes = slipCodes("river").slice(0, NEED).join(" ");
    const items = autoGrade({
      submissions: [
        sub("erika", "objective", "race", codes, 100),
        sub("erika", "objective", "race", "nonsense", 400),
        sub("anika", "objective", "race", codes, 10), // anika is not in the river group
      ],
      events: [],
      truth: truth({ killer: null }),
    });
    assert.deepEqual(raceItems(items).map((entry) => entry.guest), ["erika"]);
  });

  it("gives the survivors' point to the one who bought the vial, and gives nobody a point if nobody finished", () => {
    const withKiller = autoGrade({ submissions: [], events: ev(), truth: truth() });
    assert.deepEqual(raceItems(withKiller).map((entry) => entry.guest), [killerId]);
    const nobody = autoGrade({ submissions: [], events: [], truth: truth({ killer: null }) });
    assert.equal(raceItems(nobody).length, 0);
  });

  it("does not pay a racer who did not come", () => {
    const codes = slipCodes("stage").slice(0, NEED).join(" ");
    const items = autoGrade({ submissions: [sub("leon", "objective", "race", codes, 5), sub("silas", "objective", "race", codes, 50)], events: [], truth: truth({ killer: null, present: everyone.filter((id) => id !== "leon") }) });
    assert.deepEqual(raceItems(items).filter((entry) => characterById.get(entry.guest)!.circle === "stage").map((entry) => entry.guest), ["silas"]);
  });
});

describe("resubmission", () => {
  it("counts the newest submission for each item, whatever order they arrive in", () => {
    const key = (objectiveById.get("anika-secret")!.check as { all: string[][] }).all[0][0];
    const old = sub("anika", "objective", "anika-secret", "Mabel", 100);
    const fresh = sub("anika", "objective", "anika-secret", key, 200);
    for (const submissions of [[old, fresh], [fresh, old]]) {
      const items = autoGrade({ submissions, events: [], truth: truth() });
      assert.equal(objectiveItem(items, "anika-secret").points, 1);
    }
    const wrongLast = autoGrade({ submissions: [sub("anika", "objective", "anika-secret", key, 100), sub("anika", "objective", "anika-secret", "Mabel", 200)], events: [], truth: truth() });
    assert.equal(objectiveItem(wrongLast, "anika-secret").points, 0);
  });
  it("keeps one entry per guest, kind and item", () => {
    const latest = latestSubmissions([sub("a", "objective", "x", "1", 1), sub("a", "objective", "x", "2", 2), sub("a", "mystery", "x", "3", 3), sub("b", "objective", "x", "4", 4)]);
    assert.equal(latest.size, 3);
  });
});

describe("the survivors tier", () => {
  const picks = (guest: string, ids: string[]) => sub(guest, "survivors", "picks", JSON.stringify(ids));
  it("pays one for each survivor named and takes half a point for each wrong name, never below zero", () => {
    const items = autoGrade({ submissions: [picks("anika", survivorIds.slice(0, 4))], events: [], truth: truth() });
    assert.equal(find(items, "anika", "survivors", "picks").points, 4);
    const mixed = autoGrade({ submissions: [picks("anika", [survivorIds[0], survivorIds[1], "tim", "joel"])], events: [], truth: truth() });
    assert.equal(find(mixed, "anika", "survivors", "picks").points, 2 - 1);
    const oneRight = autoGrade({ submissions: [picks("anika", [survivorIds[0], "tim", "joel", "leon"])], events: [], truth: truth() });
    assert.equal(find(oneRight, "anika", "survivors", "picks").points, 0, "1 - 3 halves is below zero, so zero");
    const allWrong = autoGrade({ submissions: [picks("anika", ["tim", "joel", "leon", "silas"])], events: [], truth: truth() });
    assert.equal(find(allWrong, "anika", "survivors", "picks").points, 0);
  });
  it("ignores a fifth name, a repeat and yourself", () => {
    const items = autoGrade({ submissions: [picks("anika", [survivorIds[0], survivorIds[0], "anika", ...survivorIds.slice(1), "tim"])], events: [], truth: truth() });
    assert.equal(find(items, "anika", "survivors", "picks").points, 4, "four survivors; the repeat, anika and the fifth are dropped");
  });
  it("lets a survivor name the others, but never themselves", () => {
    const others = survivorIds.filter((id) => id !== "mihir");
    const items = autoGrade({ submissions: [picks("mihir", ["mihir", ...others])], events: [], truth: truth() });
    assert.equal(find(items, "mihir", "survivors", "picks").points, 4);
    assert.equal(find(items, "mihir", "survivors", "picks").max, 4);
  });
  it("never costs a survivor anything for being named", () => {
    const submissions = ["anika", "tim", "josh"].map((guest) => picks(guest, ["mihir", "luke"]));
    const items = autoGrade({ submissions, events: [], truth: truth() });
    assert.ok(!items.some((entry) => entry.kind === "survivors" && entry.itemId === "cover"));
    assert.equal(find(items, "mihir", "survivors", "picks").points, 0, "mihir named nobody; naming him cost him nothing");
  });
  it("reads names typed as text, not only ids", () => {
    assert.deepEqual(parsePicks("Mihir Nagarkatti, Luke Shelldon; Rhea Mallya\nAdam Holdsfire, Molly Daniel"), ["mihir", "luke", "rhea", "adam"]);
    assert.deepEqual(parsePicks("[\"tim\",\"nobody\"]"), ["tim"]);
  });
});

const altAnswers: Record<string, string> = {
  "alt-1": "He meant to crown himself the new head of the Black Veil, with the nineteen guests as witnesses who had to sign, because Cassie had to be declared dead so the vault and books would pass to him.",
  "alt-2": "In the vault behind the Merrimack Room's second window; it takes three keys and a dial that only Cassie can set.",
};

describe("the three mysteries", () => {
  it("are worth ten points, double the objectives", () => {
    const counted = questions.filter((question) => !question.alternateFor);
    assert.equal(counted.reduce((sum, question) => sum + question.points, 0), 10);
  });

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
    assert.equal(find(right, "anika", "mystery", "new-1").points, 2);
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
    assert.equal(entry.points, 0.5);
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
    assert.equal(entry.points, 0.5);
    assert.match(entry.rationale, /very long/);
  });

  it("makes a keyword-stuffed pile of every term earn no more than the cap and still flags it", () => {
    const pile = questions.flatMap((question) => question.rubric.flatMap((element) => element.all.flatMap((group) => group))).join(" ");
    const items = autoGrade({ submissions: [sub("anika", "mystery", "old-3", pile)], events: ev(), truth: truth() });
    const entry = find(items, "anika", "mystery", "old-3");
    assert.ok(entry.points <= 0.5, `stuffing earned ${entry.points}`);
    assert.equal(entry.needsReview, true);
  });

  it("does not grade the killer question until a killer exists", () => {
    const items = autoGrade({ submissions: [sub("anika", "mystery", "new-1", killerId)], events: [], truth: truth({ killer: null }) });
    const entry = find(items, "anika", "mystery", "new-1");
    assert.equal(entry.points, 0);
    assert.equal(entry.needsReview, true);
  });
});

describe("the room", () => {
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
