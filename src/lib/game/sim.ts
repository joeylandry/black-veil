/**
 * Test and simulation helpers. They know the answers (they read the game bible), so this
 * module is only ever imported by tests and scripts, never by the application.
 */
import { characterById, characters, exhibits, questions, survivorIds } from "@/data/game";
import type { Character, Objective, Question } from "@/data/game";
import { autoGrade } from "./grading";
import { computeStandings } from "./scoring";
import type { GameEvent, Standings, Submission, Truth } from "./types";

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One typed answer that satisfies an objective's check. */
export function correctAnswer(character: Character, objective: Objective): string {
  const check = objective.check;
  switch (check.kind) {
    case "code":
      return check.codes[0];
    case "pattern":
      return check.all.map((group) => group[0]).join(" ");
    case "guest":
      return characterById.get(check.guest)!.name;
    case "money":
      return `$${check.min + 5}`;
    case "clock":
      return "8:46 pm";
    case "seek": {
      const [a, b] = check.pairs[0];
      return `${characterById.get(a)!.realNames[0]} and ${characterById.get(b)!.realNames[0]}`;
    }
    case "hide":
    case "vial-attempt":
    case "butler-sale":
      return "done";
    case "manual":
      return "done";
  }
  void character;
}

/** Canonical full-credit answers for each question, given who the killer is. */
export function correctMystery(question: Question, killer: string): string {
  switch (question.id) {
    case "old-1":
      return "It was staged by Cassie: stage blood and blanks, a hoax. Nobody died that night.";
    case "old-2":
      return "They were promised new names and a payout from the vault, to be thought dead; they trusted Cassie, their boss.";
    case "old-3":
      return "Kit Kessler the Keeper hired a hitman, Quill, and framed Cassie with forged orders.";
    case "new-1":
      return killer;
    case "new-2":
      return "Strychnine in his rye nightcap, bought from the Butler's House stock.";
    case "new-3":
      return characterById.get(killer)!.survivor!.grievance;
    case "con-1":
      return "He was Kit Kessler, the Keeper, who prepared the List and had members killed after he betrayed Cassie.";
    case "con-2":
      return "They are the five survivors who escaped his hitman, members of the Veil thought dead, who came for revenge.";
    case "con-3":
      return "Cassie sent them from Montreal to lure the Keeper and the survivors in front of witnesses.";
    default:
      return "";
  }
}

export type Profile = {
  /** Chance of finishing each errand. */
  errands: number;
  /** Chance of fully answering each mystery question. */
  mystery: number;
  /** Chance that each survivor pick is right (non-survivors) */
  eye: number;
  /** Whether the guest files exhibits, and how many */
  exhibits: number;
};

export const PROFILES: Record<string, Profile> = {
  errandRunner: { errands: 0.95, mystery: 0.1, eye: 0.15, exhibits: 2 },
  detective: { errands: 0.5, mystery: 0.85, eye: 0.6, exhibits: 6 },
  balanced: { errands: 0.75, mystery: 0.5, eye: 0.35, exhibits: 4 },
  casual: { errands: 0.4, mystery: 0.2, eye: 0.2, exhibits: 1 },
};

export type Night = { submissions: Submission[]; events: GameEvent[]; truth: Truth; profiles: Record<string, string> };

/** Builds a plausible night: each guest plays a profile, the Butler sells to the chosen killer. */
export function simulateNight(options: { seed: number; killer?: string; profiles?: Record<string, string> }): Night {
  const random = mulberry(options.seed);
  const killer = options.killer ?? survivorIds[Math.floor(random() * survivorIds.length)];
  const names = Object.keys(PROFILES);
  const assigned: Record<string, string> = {};
  const submissions: Submission[] = [];
  const events: GameEvent[] = [];
  let clock = 1_000_000;

  for (const character of characters) {
    const profile = options.profiles?.[character.id] ?? names[Math.floor(random() * names.length)];
    assigned[character.id] = profile;
    const p = PROFILES[profile];

    for (const objective of character.objectives) {
      if (random() < p.errands) {
        submissions.push({ guest: character.id, kind: "objective", itemId: objective.id, answer: correctAnswer(character, objective), proof: "", at: (clock += 1000) });
      }
    }
    // exhibits: pick a few that are not held by the guest
    const pool = exhibits.filter((exhibit) => exhibit.heldBy !== character.id);
    for (let i = 0; i < p.exhibits; i += 1) {
      const exhibit = pool[Math.floor(random() * pool.length)];
      submissions.push({ guest: character.id, kind: "exhibit", itemId: exhibit.code, answer: exhibit.code, proof: "", at: (clock += 1000) });
    }
    // mysteries
    for (const question of questions) {
      // survivors lived the story, the killer knows their own grievance, and the Butler saw the sale
      const lived =
        (character.survivor && question.rubric.some((element) => element.survivorKnows === true)) ||
        (character.survivor && question.id === "new-3" && character.id === killer) ||
        (character.role === "butler" && question.butlerKnows);
      if (lived || random() < p.mystery) {
        submissions.push({ guest: character.id, kind: "mystery", itemId: question.id, answer: correctMystery(question, killer), proof: "", at: (clock += 1000) });
      } else if (random() < 0.4) {
        submissions.push({ guest: character.id, kind: "mystery", itemId: question.id, answer: question.type === "guest" ? "nobody" : "Cassie did everything, I think", proof: "", at: (clock += 1000) });
      }
    }
    // survivor picks
    if (!character.survivor) {
      const picks: string[] = [];
      for (let i = 0; i < 5; i += 1) {
        if (random() < p.eye) {
          const unpicked = survivorIds.filter((id) => !picks.includes(id));
          if (unpicked.length) picks.push(unpicked[Math.floor(random() * unpicked.length)]);
        } else {
          const others = characters.filter((c) => !c.survivor && c.id !== character.id && !picks.includes(c.id));
          picks.push(others[Math.floor(random() * others.length)].id);
        }
      }
      submissions.push({ guest: character.id, kind: "survivors", itemId: "picks", answer: JSON.stringify(picks), proof: "", at: (clock += 1000) });
    }
  }

  // the Butler's night: every survivor makes an offer; the chosen killer is first
  const order = [killer, ...survivorIds.filter((id) => id !== killer)];
  order.forEach((id, index) => {
    events.push({ kind: "vial-attempt", guest: id, at: 500_000 + index * 1000, sold: index === 0 });
  });
  events.push({ kind: "vial-sold", guest: killer, by: "rebecca", at: 500_000 });

  const truth: Truth = { killer, present: characters.map((character) => character.id), seed: "black-veil-1926" };
  return { submissions, events, truth, profiles: assigned };
}

export function gradeNight(night: Night): { standings: Standings; items: ReturnType<typeof autoGrade> } {
  const items = autoGrade({ submissions: night.submissions, events: night.events, truth: night.truth });
  return { items, standings: computeStandings(items, night.submissions, night.truth) };
}
