/**
 * The information-flow playtest. Twenty-four simulated guests mingle through a whole night,
 * trade the lines on their cards by the sharing rules, read the printed pages, chase their own
 * objectives, race their groups, and write their final answers from what they actually learned.
 * The real grader and the real standings then score the night, so this checks the whole chain:
 * can everyone get enough information, does every objective have a way through, and who wins.
 *
 *   npx tsx scripts/playtest/info-sim.ts [runs] [report.md]
 *
 * It is a model, not people: the point is to find places where the design strands somebody.
 */
import { writeFileSync } from "node:fs";
import { alternateOf, characterById, characters, exhibits, facts, objectiveById, questions, races, survivorIds } from "@/data/game";
import type { Character, Objective, Question, RubricElement } from "@/data/game";
import { propById } from "@/data/game/props";
import { autoGrade } from "@/lib/game/grading";
import { computeStandings } from "@/lib/game/scoring";
import { mulberry, correctAnswer } from "@/lib/game/sim";
import type { GameEvent, GradeItem, Submission, Truth } from "@/lib/game/types";

// ---------------------------------------------------------------- what each rubric element stands on
/** An element is earned if the guest knows at least one of these facts. */
const ELEMENT_FACTS: Record<string, Record<string, string[]>> = {
  "old-1": { staged: ["staged"], nodeaths: ["staged"], cassie: ["exit-plan"] },
  "old-2": { newnames: ["exit-plan"], payout: ["exit-plan"], trust: ["exit-plan", "kit-ouster"] },
  "old-3": { kit: ["kit-ouster", "hitman"], hitman: ["hitman"], frame: ["forged"] },
  "new-2": { vehicle: ["nightcap", "poison"], poison: ["poison"], butler: ["poison", "vial"] },
  "con-1": { who: ["dead-kit"], list: ["list-prepared"], betrayed: ["kit-ouster"] },
  "con-2": { survived: ["survivors-exist"], revenge: ["survivors-exist", "marker-map"], members: ["marker-map", "list-prepared"] },
  "con-3": { kit: ["kit-invites"], witnesses: ["succession"], cassie: ["invites-cassie", "cassie-alive"] },
  "alt-1": { crown: ["succession", "kit-why"], witnesses: ["succession", "kit-invites"], dead: ["kit-why"] },
  "alt-2": { where: ["vault"], keys: ["vault"], dial: ["vault"] },
};

/** What a survivor lived through, so they know it without asking anyone. */
const SURVIVOR_INNATE = ["dead-kit", "hitman", "list-prepared", "survivors-exist"];

type Profile = { name: string; targeted: number; read: number; talk: number; effort: number };
const PROFILES: Profile[] = [
  { name: "detective", targeted: 0.9, read: 0.95, talk: 1.25, effort: 0.7 },
  { name: "balanced", targeted: 0.5, read: 0.6, talk: 1, effort: 0.85 },
  { name: "errandRunner", targeted: 0.15, read: 0.25, talk: 1, effort: 0.97 },
  { name: "casual", targeted: 0.1, read: 0.15, talk: 0.7, effort: 0.5 },
];

type Conditions = { seed: number; absent: number; talks: number; secretShare: number; earn: number; fixedProfile?: string; butlerAbsent?: boolean };

type GuestState = { id: string; profile: Profile; known: Set<string>; lines: Set<string>; trail: string[] };

type RunResult = {
  conditions: Conditions;
  absent: string[];
  present: string[];
  killer: string;
  items: GradeItem[];
  submissions: Submission[];
  events: GameEvent[];
  truth: Truth;
  standings: ReturnType<typeof computeStandings>;
  /** per question: how many guests (of those asked) earned full marks */
  solved: Record<string, { asked: number; full: number; any: number }>;
  objective: { done: number; possible: number; byKind: Record<string, { done: number; possible: number }> };
  stranded: { guest: string; objective: string; why: string }[];
  races: Record<string, string | null>;
  killerNamedBy: number;
  profiles: Record<string, string>;
  loneliest: { guest: string; facts: number };
};


function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function runNight(conditions: Conditions): RunResult {
  const random = mulberry(conditions.seed);
  const absentSet = new Set(shuffle(characters.map((c) => c.id).filter((id) => id !== "rebecca"), random).slice(0, conditions.butlerAbsent ? Math.max(0, conditions.absent - 1) : conditions.absent));
  if (conditions.butlerAbsent) absentSet.add("rebecca");
  const present = characters.filter((c) => !absentSet.has(c.id));
  const presentIds = new Set(present.map((c) => c.id));
  // the killer is whichever present survivor reaches the Butler first
  const livingSurvivors = survivorIds.filter((id) => presentIds.has(id));
  const killer = livingSurvivors[Math.floor(random() * livingSurvivors.length)];

  const state = new Map<string, GuestState>();
  for (const guest of present) {
    const profile = (conditions.fixedProfile ? PROFILES.find((entry) => entry.name === conditions.fixedProfile) : undefined) ?? PROFILES[Math.floor(random() * PROFILES.length)];
    const known = new Set<string>(guest.survivor ? SURVIVOR_INNATE : []);
    const lines = new Set<string>();
    for (const fact of facts) for (const holder of fact.holders) if (holder.guest === guest.id) known.add(fact.id);
    state.set(guest.id, { id: guest.id, profile, known, lines, trail: [] });
  }

  // what a guest may tell, by share rule
  const holders = (guestId: string) => facts.flatMap((fact) => fact.holders.filter((holder) => holder.guest === guestId).map((holder) => ({ fact, share: holder.share })));
  const exhibitsHeld = (guestId: string) => exhibits.filter((exhibit) => exhibit.heldBy === guestId);

  // 1. a conversation: the asker (a) learns from b by the sharing rules; trade lines need a trade in return
  function talk(aId: string, bId: string, secretChance: number) {
    const a = state.get(aId)!;
    const b = state.get(bId)!;
    const learn = (from: string, to: GuestState, targeted: number, allowTrade: boolean) => {
      const pool = holders(from).filter(({ fact, share }) => !to.known.has(fact.id) && (share === "free" || (share === "trade" && allowTrade) || (share === "secret" && random() < secretChance)));
      const held = exhibitsHeld(from).filter((exhibit) => exhibit.supports.some((id) => !to.known.has(id)));
      const wanted = pool.filter(({ fact }) => Object.values(ELEMENT_NEED_FLAT).some((ids) => ids.includes(fact.id)));
      const pick = random() < targeted && wanted.length ? wanted : pool;
      // up to two lines per conversation
      for (const { fact } of shuffle(pick, random).slice(0, 2)) to.known.add(fact.id);
      if (held.length && (allowTrade || random() < 0.5)) for (const id of held[0].supports) to.known.add(id);
    };
    // trades are mutual: both must be willing and both have something to give
    const tradeOk = holders(aId).some((line) => line.share === "trade") || exhibitsHeld(aId).length > 0 || random() < 0.5;
    learn(bId, a, a.profile.targeted, tradeOk);
    learn(aId, b, b.profile.targeted, tradeOk);
  }
  const ELEMENT_NEED_FLAT: Record<string, string[]> = Object.fromEntries(Object.entries(ELEMENT_FACTS).flatMap(([q, els]) => Object.entries(els).map(([e, ids]) => [`${q}.${e}`, ids])));

  // 2. objectives first: each guest meets the people their objectives name (the standby tray covers absences)
  const stranded: RunResult["stranded"] = [];
  const done = new Map<string, boolean>(); // objective id -> completed
  const kindTotals: Record<string, { done: number; possible: number }> = {};
  const note = (kind: string, ok: boolean) => {
    kindTotals[kind] ??= { done: 0, possible: 0 };
    kindTotals[kind].possible += 1;
    if (ok) kindTotals[kind].done += 1;
  };
  const learnedFrom = new Map<string, boolean>(); // seeker objective id -> got the secret
  // a rival is trying to learn something its keeper is guarding, so only the keeper's confidant can leak it
  const rivalOf = new Set(characters.filter((c) => presentIds.has(c.id)).flatMap((c) => c.objectives.flatMap((o) => (o.check.kind === "keep" ? [o.check.rivalObjective] : []))));
  for (const guest of present) {
    const me = state.get(guest.id)!;
    for (const objective of guest.objectives) {
      const sources = [...objective.with, ...(objective.alsoFrom ?? [])].filter((id) => presentIds.has(id));
      const check = objective.check;
      let ok = false;
      switch (check.kind) {
        case "pattern": {
          if (objective.kind === "role") ok = random() < me.profile.effort;
          else if (!sources.length) stranded.push({ guest: guest.id, objective: objective.id, why: "every named source is absent" });
          else {
            // meet each source in turn; a secret has to be earned, so each attempt can fail
            for (const source of sources) {
              talk(guest.id, source, 0.9);
              if (random() < conditions.earn * (0.6 + 0.4 * me.profile.effort) * (rivalOf.has(objective.id) ? 0.45 : 1)) {
                ok = true;
                break;
              }
            }
            if (!ok) stranded.push({ guest: guest.id, objective: objective.id, why: "met the sources but did not earn it" });
          }
          if (objective.kind === "learn" && check.kind === "pattern") learnedFrom.set(objective.id, ok);
          break;
        }
        case "code": {
          const partnerNeeded = objective.kind === "swap" || (objective.kind === "role" && objective.with.length > 0);
          ok = (!partnerNeeded || sources.length > 0) && random() < me.profile.effort;
          if (partnerNeeded && !sources.length) stranded.push({ guest: guest.id, objective: objective.id, why: "the trade partner is absent (standby tray)" });
          break;
        }
        case "money":
          ok = random() < me.profile.effort * 0.8;
          break;
        case "approval":
          ok = random() < me.profile.effort;
          break;
        case "vial-attempt":
          ok = true;
          break;
        case "butler-sale":
          ok = true;
          break;
        case "keep":
          ok = false; // settled below
          break;
        default:
          ok = random() < me.profile.effort;
      }
      done.set(objective.id, ok);
    }
  }

  // 3. the mingling: everyone talks to a few random people, more if they are sociable
  for (const guest of present) {
    const me = state.get(guest.id)!;
    const others = shuffle(present.filter((c) => c.id !== guest.id).map((c) => c.id), random);
    const count = Math.round(conditions.talks * me.profile.talk);
    for (const other of others.slice(0, count)) talk(guest.id, other, conditions.secretShare);
  }

  // 4. the printed pages: the binder, the table and the scene are open to anyone who goes to read them
  for (const guest of present) {
    const me = state.get(guest.id)!;
    for (const exhibit of exhibits) {
      if (exhibit.where === "held") continue;
      if (random() < me.profile.read) for (const id of exhibit.supports) me.known.add(id);
    }
  }

  // 5. the kept secrets
  for (const guest of present) {
    for (const objective of guest.objectives) {
      if (objective.check.kind !== "keep") continue;
      const check = objective.check;
      const told = !presentIds.has(check.seeker) || learnedFrom.get(check.seekerObjective) === true;
      const leaked = presentIds.has(check.rival) && learnedFrom.get(check.rivalObjective) === true;
      done.set(objective.id, told && !leaked);
    }
  }

  // 6. the group races: ask around for slips; the earliest complete set wins
  const slipHolders = new Map<string, string>();
  for (const race of races) for (const token of race.tokens) slipHolders.set(token, propById.get(token)!.carriedBy!);
  const raceWin: Record<string, string | null> = {};
  const submissions: Submission[] = [];
  let clock = 1_000_000;
  const racers = new Map<string, { at: number; guest: string }>();
  for (const race of races.filter((candidate) => candidate.tokens.length)) {
    const members = present.filter((c) => c.circle === race.circle);
    for (const member of members) {
      const me = state.get(member.id)!;
      const target = shuffle(present.filter((c) => c.id !== member.id).map((c) => c.id), random).slice(0, Math.round(conditions.talks * me.profile.talk * (0.5 + me.profile.effort / 2)));
      const have = race.tokens.filter((token) => target.includes(slipHolders.get(token)!) && presentIds.has(slipHolders.get(token)!));
      // the standby tray gives a spare of any slip whose holder did not come
      const missing = race.tokens.filter((token) => !presentIds.has(slipHolders.get(token)!));
      if (have.length + missing.length >= race.need && random() < 0.85) {
        const at = 2_000_000 + Math.floor(random() * 600_000);
        const best = racers.get(race.circle);
        submissions.push({ guest: member.id, kind: "objective", itemId: "race", answer: race.tokens.slice(0, race.need).map((token) => propById.get(token)!.code).join(" "), proof: "", at });
        if (!best || at < best.at) racers.set(race.circle, { at, guest: member.id });
      }
    }
    raceWin[race.circle] = racers.get(race.circle)?.guest ?? null;
  }
  raceWin.survivors = killer;

  // 7. the final answers, written from what each guest actually knows
  const insiderAsked = (guest: Character, question: Question) => {
    const insider = guest.role === "butler" || killer === guest.id;
    return question.alternateFor ? insider : !(insider && alternateOf.has(question.id));
  };
  const killerChar = characterById.get(killer)!;
  const killerN = killerChar.survivor!.markerNo;
  const answers = new Map<string, number>();
  const solved: RunResult["solved"] = {};
  for (const guest of present) {
    const me = state.get(guest.id)!;
    // objectives answered
    for (const objective of guest.objectives) {
      if (!done.get(objective.id)) {
        // a guarded secret that stayed guarded: the rival still types a guess
        if (rivalOf.has(objective.id) && random() < 0.9) submissions.push({ guest: guest.id, kind: "objective", itemId: objective.id, answer: "no idea", proof: "", at: (clock += 100) });
        continue;
      }
      if (["keep", "vial-attempt", "butler-sale"].includes(objective.check.kind)) {
        if (objective.check.kind === "keep") {
          // scored from the seekers' answers, which are submitted when they learned it
        }
        continue;
      }
      submissions.push({ guest: guest.id, kind: "objective", itemId: objective.id, answer: correctAnswer(guest, objective), proof: "", at: (clock += 100) });
    }
    // the mysteries
    for (const question of questions) {
      if (!insiderAsked(guest, question)) continue;
      solved[question.id] ??= { asked: 0, full: 0, any: 0 };
      solved[question.id].asked += 1;
      let answer = "";
      if (question.id === "new-1") {
        const knowsMarker = me.known.has("marker-map") && (me.known.has("vial") || guest.id === "rebecca");
        const knowsWho = me.known.has(`tell-${killerN}`) || me.known.has(`crack-${killerN}`) || me.known.has(`motive-${killerN}`);
        answer = knowsMarker && knowsWho ? killerChar.name : characters.filter((c) => c.id !== guest.id && presentIds.has(c.id))[Math.floor(random() * (present.length - 1))]?.name ?? "";
      } else if (question.id === "new-3") {
        answer = me.known.has(killerChar.survivor!.motiveFact) || killer === guest.id ? killerChar.survivor!.grievance : "";
      } else {
        const needs = ELEMENT_FACTS[question.id] ?? {};
        answer = question.rubric
          .filter((element: RubricElement) => (needs[element.id] ?? []).some((id) => me.known.has(id)))
          .map((element) => element.all.map((group) => group[0]).join(" "))
          .join(". ");
      }
      if (answer) submissions.push({ guest: guest.id, kind: "mystery", itemId: question.id, answer, proof: "", at: (clock += 100) });
    }
    // the survivors guess: a diligent guest knows the tells they have heard
    const known = survivorIds.filter((id) => id !== guest.id && presentIds.has(id) && (me.known.has(`tell-${characterById.get(id)!.survivor!.markerNo}`) || me.known.has(`crack-${characterById.get(id)!.survivor!.markerNo}`)));
    const wrong = shuffle(present.filter((c) => !c.survivor && c.id !== guest.id).map((c) => c.id), random);
    const picks = [...known, ...wrong].slice(0, 4);
    submissions.push({ guest: guest.id, kind: "survivors", itemId: "picks", answer: JSON.stringify(picks), proof: "", at: (clock += 100) });
  }
  void answers;

  // 8. keep objectives are scored from the others' answers, so the seekers' objective answers must exist: done above

  const events: GameEvent[] = livingSurvivors.map((id, index) => ({ kind: "vial-attempt", guest: id, at: 500_000 + index, sold: id === killer }));
  events.push({ kind: "vial-sold", guest: killer, by: "rebecca", at: 500_000 });
  const truth: Truth = { killer, present: [...presentIds], seed: "black-veil-1926" };
  const items = autoGrade({ submissions, events, truth });
  const standings = computeStandings(items, submissions, truth);

  for (const question of questions) {
    const entries = items.filter((entry) => entry.kind === "mystery" && entry.itemId === question.id);
    if (!entries.length) continue;
    solved[question.id] ??= { asked: 0, full: 0, any: 0 };
    solved[question.id].full = entries.filter((entry) => entry.points >= entry.max - 0.001).length;
    solved[question.id].any = entries.filter((entry) => entry.points > 0).length;
  }

  // objective tallies from the real grader (what the guest would actually be paid)
  let doneCount = 0;
  let possible = 0;
  const byKind: Record<string, { done: number; possible: number }> = {};
  for (const entry of items.filter((item) => item.kind === "objective")) {
    const objective = objectiveById.get(entry.itemId) as Objective;
    possible += 1;
    const got = entry.points >= entry.max - 0.001;
    if (got) doneCount += 1;
    byKind[objective.check.kind] ??= { done: 0, possible: 0 };
    byKind[objective.check.kind].possible += 1;
    if (got) byKind[objective.check.kind].done += 1;
  }
  void kindTotals;
  void note;
  const lonely = present
    .map((guest) => ({ guest: guest.id, facts: state.get(guest.id)!.known.size }))
    .sort((a, b) => a.facts - b.facts)[0];

  return {
    conditions,
    absent: [...absentSet],
    present: [...presentIds],
    killer,
    items,
    submissions,
    events,
    truth,
    standings,
    solved,
    objective: { done: doneCount, possible, byKind },
    stranded,
    races: raceWin,
    killerNamedBy: items.filter((entry) => entry.kind === "mystery" && entry.itemId === "new-1" && entry.points > 0).length,
    profiles: Object.fromEntries([...state.values()].map((entry) => [entry.id, entry.profile.name])),
    loneliest: lonely,
  };
}

// ---------------------------------------------------------------- the ten nights
const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const pct = (value: number) => `${Math.round(value * 100)}%`;
const f = (value: number, digits = 2) => value.toFixed(digits);

/** The same player in every seat, many nights: does any seat get a harder night than the others? */
export function fairness(nights = 300) {
  const totals = new Map<string, { objectives: number; total: number; nights: number; kinds: Map<string, { done: number; of: number }> }>();
  for (let index = 0; index < nights; index += 1) {
    const run = runNight({ seed: 90000 + index * 31, absent: index % 4, talks: 12, secretShare: 0.3, earn: 0.85, fixedProfile: "balanced" });
    for (const row of run.standings.standings) {
      const entry = totals.get(row.guest) ?? { objectives: 0, total: 0, nights: 0, kinds: new Map() };
      entry.objectives += row.tiers.objectives;
      entry.total += row.total;
      entry.nights += 1;
      totals.set(row.guest, entry);
    }
  }
  return [...totals.entries()].map(([guest, entry]) => ({ guest, objectives: entry.objectives / entry.nights, total: entry.total / entry.nights })).sort((a, b) => a.total - b.total);
}

export function playTen(runs = 10) {
  const absences = [0, 0, 1, 2, 2, 3, 3, 4, 5, 5];
  const talks = [12, 16, 10, 14, 18, 12, 10, 15, 11, 9];
  const results: RunResult[] = [];
  for (let index = 0; index < runs; index += 1) {
    results.push(runNight({ seed: 4200 + index * 17, absent: absences[index % absences.length], talks: talks[index % talks.length], secretShare: 0.3, earn: 0.85 }));
  }
  return results;
}

function report(results: RunResult[]): string {
  const lines: string[] = ["# Information-flow playtest", "", `*${results.length} simulated nights, 24 guests each, generated by \`npx tsx scripts/playtest/info-sim.ts\`. A model of how guests share what is on their cards; the real grader scores every answer.*`, ""];
  lines.push("## The nights", "", "| Night | Absent | Chats each | Killer | Winner (score) | Top 3 | Lowest | Mystery full marks (new-1 right) | Objectives done |", "|---|---|---|---|---|---|---|---|---|");
  results.forEach((run, index) => {
    const rows = run.standings.standings;
    const winner = rows[0];
    lines.push(`| ${index + 1} | ${run.absent.length} | ${run.conditions.talks} | ${characterById.get(run.killer)!.name.split(" ")[0]} | ${winner.name.split(" ")[0]} (${f(winner.total)}, ${run.profiles[winner.guest]}) | ${rows.slice(0, 3).map((row) => f(row.total, 1)).join(" / ")} | ${f(rows.at(-1)!.total, 1)} | ${run.killerNamedBy} of ${run.present.length} | ${pct(run.objective.done / run.objective.possible)} |`);
  });

  lines.push("", "## Could they work out each mystery question?", "", "Share of the guests asked who earned **full marks**, averaged over the nights (and the share who earned **something**).", "", "| Question | Full marks | Some credit |", "|---|---|---|");
  for (const question of questions) {
    const rows = results.map((run) => run.solved[question.id]).filter(Boolean);
    const asked = rows.reduce((sum, row) => sum + row.asked, 0);
    lines.push(`| ${question.id}: ${question.prompt.slice(0, 70)}${question.prompt.length > 70 ? "…" : ""} | ${pct(rows.reduce((s, r) => s + r.full, 0) / asked)} | ${pct(rows.reduce((s, r) => s + r.any, 0) / asked)} |`);
  }

  lines.push("", "## Score by kind of player", "", "| Player | Mystery points (of 10) | Objectives (of 5) | Survivors named (of 4) | Total (of 20) |", "|---|---|---|---|---|");
  for (const profile of PROFILES) {
    const rows = results.flatMap((run) => run.standings.standings.filter((row) => run.profiles[row.guest] === profile.name));
    lines.push(`| ${profile.name} | ${f(mean(rows.map((r) => r.tiers.mysteries)), 1)} | ${f(mean(rows.map((r) => r.tiers.objectives)), 1)} | ${f(mean(rows.map((r) => r.tiers.survivors)), 1)} | ${f(mean(rows.map((r) => r.total)), 1)} |`);
  }
  const surv = results.flatMap((run) => run.standings.standings.filter((row) => row.survivor));
  const non = results.flatMap((run) => run.standings.standings.filter((row) => !row.survivor));
  lines.push(`| *survivors* | ${f(mean(surv.map((r) => r.tiers.mysteries)), 1)} | ${f(mean(surv.map((r) => r.tiers.objectives)), 1)} | ${f(mean(surv.map((r) => r.tiers.survivors)), 1)} | ${f(mean(surv.map((r) => r.total)), 1)} |`);
  lines.push(`| *everyone else* | ${f(mean(non.map((r) => r.tiers.mysteries)), 1)} | ${f(mean(non.map((r) => r.tiers.objectives)), 1)} | ${f(mean(non.map((r) => r.tiers.survivors)), 1)} | ${f(mean(non.map((r) => r.total)), 1)} |`);

  lines.push("", "## Objectives that were completed, by kind", "", "| Kind | Completed |", "|---|---|");
  const kinds = new Set(results.flatMap((run) => Object.keys(run.objective.byKind)));
  for (const kind of [...kinds].sort()) {
    const done = results.reduce((s, r) => s + (r.objective.byKind[kind]?.done ?? 0), 0);
    const possible = results.reduce((s, r) => s + (r.objective.byKind[kind]?.possible ?? 0), 0);
    lines.push(`| ${kind} | ${pct(done / possible)} (${done} of ${possible}) |`);
  }

  lines.push("", "## Group races: who won", "", "| Night | " + races.map((race) => race.circle).join(" | ") + " |", "|---|" + races.map(() => "---").join("|") + "|");
  results.forEach((run, index) => lines.push(`| ${index + 1} | ${races.map((race) => (run.races[race.circle] ? characterById.get(run.races[race.circle]!)!.name.split(" ")[0] : "nobody")).join(" | ")} |`));

  lines.push("", "## Anyone stranded?", "");
  const strandedKinds = new Map<string, number>();
  for (const run of results) for (const entry of run.stranded) strandedKinds.set(entry.why, (strandedKinds.get(entry.why) ?? 0) + 1);
  for (const [why, count] of strandedKinds) lines.push(`- ${why}: ${count} times across ${results.length} nights`);
  const worst = results.map((run) => {
    const by = new Map<string, number>();
    for (const entry of run.stranded) by.set(entry.guest, (by.get(entry.guest) ?? 0) + 1);
    return Math.max(0, ...by.values());
  });
  lines.push(`- Most stranded objectives for one guest in a night: ${Math.max(...worst)}`);
  lines.push(`- Fewest facts any guest knew at the end (of 39): ${Math.min(...results.map((run) => run.loneliest.facts))}`);
  return lines.join("\n");
}

/** Twenty nights with nearly everyone there (0 to 2 absent, the Butler always present). */
export function fullHouse(runs = 20) {
  const results: RunResult[] = [];
  for (let index = 0; index < runs; index += 1) {
    results.push(runNight({ seed: 7700 + index * 23, absent: index % 3, talks: 10 + (index % 7), secretShare: 0.3, earn: 0.85 }));
  }
  return results;
}

function fullReport(results: RunResult[]): string {
  const lines = [report(results), "", "## Who wins (full house)", ""];
  const wins = new Map<string, { wins: number; ties: number; total: number; nights: number; ranks: number }>();
  for (const run of results) {
    const rows = run.standings.standings;
    const top = rows[0].total;
    rows.forEach((row, index) => {
      const e = wins.get(row.guest) ?? { wins: 0, ties: 0, total: 0, nights: 0, ranks: 0 };
      e.nights += 1; e.total += row.total; e.ranks += index + 1;
      if (row.total >= top - 0.001) { e.ties += 1; if (rows.filter((r) => r.total >= top - 0.001).length === 1) e.wins += 1; }
      wins.set(row.guest, e);
    });
  }
  lines.push("| Guest | Role | Group | Outright wins | Top (incl. ties) | Mean score | Mean rank |", "|---|---|---|---|---|---|---|");
  [...wins.entries()].sort((a, b) => b[1].ties - a[1].ties || b[1].total - a[1].total).forEach(([id, e]) => {
    const c = characterById.get(id)!;
    lines.push(`| ${c.name} | ${c.occupation} | ${c.circle} | ${e.wins} | ${e.ties} | ${f(e.total / e.nights, 1)} | ${f(e.ranks / e.nights, 1)} |`);
  });
  const tied = results.filter((run) => run.standings.standings.filter((r) => r.total >= run.standings.standings[0].total - 0.001).length > 1).length;
  lines.push("", `Nights with a tie for first: ${tied} of ${results.length}.`);
  const byCircle = new Map<string, number>();
  for (const run of results) byCircle.set(characterById.get(run.standings.standings[0].guest)!.circle, (byCircle.get(characterById.get(run.standings.standings[0].guest)!.circle) ?? 0) + 1);
  lines.push("", "Winner's group: " + [...byCircle.entries()].map(([k, v]) => `${k} ${v}`).join(", "));
  const byProfile = new Map<string, number>();
  for (const run of results) { const p = run.profiles[run.standings.standings[0].guest]; byProfile.set(p, (byProfile.get(p) ?? 0) + 1); }
  lines.push("", "Winner's play style: " + [...byProfile.entries()].map(([k, v]) => `${k} ${v}`).join(", "));
  return lines.join("\n");
}

if (process.argv[2] === "full") {
  const results = fullHouse(Number(process.argv[3] ?? 20));
  const text = fullReport(results);
  console.log(text);
  if (process.argv[4]) writeFileSync(process.argv[4], `${text}\n`);
} else if (process.argv[2] === "fairness") {
  const rows = fairness(Number(process.argv[3] ?? 300));
  const avg = mean(rows.map((row) => row.total));
  console.log("guest, mean objectives (of 5), mean total (of 20)");
  for (const row of rows) console.log(`${row.guest.padEnd(9)} ${f(row.objectives)} ${f(row.total)}${row.total < avg - 0.6 ? "   <-- low" : row.total > avg + 0.6 ? "   <-- high" : ""}`);
  console.log(`average total ${f(avg)}; spread ${f(rows.at(-1)!.total - rows[0].total)}`);
} else if (process.argv[1]?.endsWith("info-sim.ts")) {
  const runs = Number(process.argv[2] ?? 10);
  const out = process.argv[3];
  const results = playTen(runs);
  const text = report(results);
  console.log(text);
  if (out) writeFileSync(out, `${text}\n`);
}
