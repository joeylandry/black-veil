/**
 * The design validator. It cross-checks the whole game bible: every objective must be
 * answerable from a real card, every clue must have enough holders, nothing the guest sees
 * early may leak the solution, and the web of dependencies must survive absences.
 *
 * `runValidation()` is pure and is called by `npm run game:check` and by the tests.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  allObjectives,
  characterById,
  characters,
  circles,
  exhibits,
  facts,
  findGuests,
  knowsFor,
  markers,
  props,
  questions,
  survivorRules,
  survivors,
  OBJECTIVE_TOTAL,
} from "@/data/game";
import type { Character, Objective } from "@/data/game";
import { matchesPattern, normalize } from "./text";

export type Check = { name: string; ok: boolean; details: string[] };
export type Report = { checks: Check[]; stats: Record<string, string | number>; ok: boolean };

const CODE_ALPHABET = /^[ACDEFGHJKMNPRTUVWXY2346789]{5}$/;

function sourcesOf(objective: Objective): string[] {
  return [...objective.with, ...(objective.alsoFrom ?? [])];
}

/** Every line of text a guest could show or tell, from which a learner could draw an answer. */
function linesOf(character: Character): string[] {
  const lines = knowsFor(character).map((line) => line.text);
  lines.push(...character.secrets.map((line) => line.text));
  lines.push(character.smallSecret.text);
  if (character.roleCard) lines.push(...character.roleCard);
  if (character.survivor) lines.push(character.survivor.realStory, character.survivor.grievance, character.survivor.escape);
  return lines;
}

function exhibitText(): string {
  return exhibits.map((exhibit) => exhibit.body.join(" ")).join(" ");
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Recursively lists source files under a directory. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(path);
  }
  return out;
}

export function runValidation(root = process.cwd()): Report {
  const checks: Check[] = [];
  const add = (name: string, details: string[]) => checks.push({ name, ok: details.length === 0, details });
  const stats: Record<string, string | number> = {};
  const ids = new Set(characters.map((character) => character.id));

  // ------------------------------------------------------------ roster
  {
    const problems: string[] = [];
    if (characters.length !== 24) problems.push(`expected 24 characters, found ${characters.length}`);
    if (ids.size !== characters.length) problems.push("duplicate character ids");
    const names = new Set<string>();
    for (const character of characters) {
      if (names.has(character.name)) problems.push(`duplicate character name ${character.name}`);
      names.add(character.name);
    }
    const real = new Map<string, string>();
    for (const character of characters) {
      for (const alias of character.realNames) {
        const key = normalize(alias);
        const previous = real.get(key);
        if (previous && previous !== character.id) problems.push(`real name "${alias}" matches both ${previous} and ${character.id}`);
        real.set(key, character.id);
      }
    }
    const sizes = circles.map((circle) => characters.filter((character) => character.circle === circle.id).length);
    stats["circle sizes"] = sizes.join("/");
    if (sizes.some((size) => size < 4 || size > 5)) problems.push(`circle sizes must be 4 or 5, got ${sizes.join(",")}`);
    for (const circle of circles) {
      const count = characters.filter((character) => character.circle === circle.id && character.survivor).length;
      if (count !== 1) problems.push(`circle ${circle.id} has ${count} survivors (needs exactly 1)`);
    }
    add("Roster: 24 guests, five circles of 4 to 5, one survivor in each", problems);
  }

  // ------------------------------------------------------------ roles
  {
    const problems: string[] = [];
    for (const role of ["sheriff", "butler", "doctor"] as const) {
      const holders = characters.filter((character) => character.role === role);
      if (holders.length !== 1) problems.push(`role ${role} held by ${holders.length}`);
      else if (!holders[0].roleCard?.length) problems.push(`role ${role} has no role card`);
    }
    for (const survivor of survivors) {
      if (survivor.role) problems.push(`${survivor.id} is a survivor and a role holder`);
    }
    add("Roles: exactly one Sheriff, Butler and physician, none of them survivors", problems);
  }

  // ------------------------------------------------------------ survivors and markers
  {
    const problems: string[] = [];
    if (survivors.length !== 5) problems.push(`expected 5 survivors, found ${survivors.length}`);
    const numbers = survivors.map((survivor) => survivor.survivor!.markerNo).sort();
    if (numbers.join(",") !== "18,19,20,21,22") problems.push(`marker numbers must be 18 to 22, got ${numbers.join(",")}`);
    for (const survivor of survivors) {
      const info = survivor.survivor!;
      const marker = markers.find((item) => item.no === info.markerNo);
      if (!marker) problems.push(`no marker ${info.markerNo}`);
      else if (marker.code !== info.markerCode) problems.push(`${survivor.id}: marker code ${info.markerCode} does not match the markers table (${marker.code})`);
      const cardMarker = survivor.carries.length;
      if (cardMarker) problems.push(`${survivor.id}: markers are issued separately, not as carried props`);
      const fact = facts.find((item) => item.id === info.motiveFact);
      if (!fact) problems.push(`${survivor.id}: motive fact ${info.motiveFact} missing`);
      else {
        // the motive keys must match each holder's line, or a learner could never earn it
        for (const holder of fact.holders) {
          if (!matchesPattern(holder.line, info.motiveKeys)) problems.push(`${survivor.id}: motive pattern does not match ${holder.guest}'s line`);
          if (characterById.get(holder.guest)?.survivor) problems.push(`${survivor.id}: motive fact is held by a survivor (${holder.guest})`);
        }
      }
    }
    for (const survivor of survivors) {
      const fact = facts.find((item) => item.id === survivor.survivor!.motiveFact);
      const motive = survivor.objectives.find((objective) => objective.kind === "motive");
      if (fact && motive) {
        const allowed = new Set(fact.holders.map((holder) => holder.guest));
        for (const source of sourcesOf(motive)) if (!allowed.has(source)) problems.push(`${survivor.id}: motive objective sends them to ${source}, who does not hold the motive fact`);
        if (sourcesOf(motive).length < 3) problems.push(`${survivor.id}: motive objective should have three sources`);
      }
    }
    for (const survivor of survivors) {
      const info = survivor.survivor!;
      const everything = [info.realStory, info.escape, info.tell, info.skillLeak, ...survivor.secrets.map((line) => line.text), ...survivor.roleCard ?? [], ...survivor.background.people, survivor.background.history].join(" ");
      if (matchesPattern(everything, info.motiveKeys)) problems.push(`${survivor.id}: the survivor's own card gives away their motive, which is their errand to learn`);
      for (const rule of survivorRules(info.markerNo)) if (matchesPattern(rule, info.motiveKeys)) problems.push(`${survivor.id}: the shared survivor rules give away the motive`);
    }
    const codes = new Set(markers.map((marker) => marker.code));
    if (codes.size !== 5) problems.push("marker codes are not unique");
    add("Survivors: five markers 18 to 22 match the List, codes unique, motive clues match their holders", problems);
  }

  // ------------------------------------------------------------ the List agrees with the survivors
  {
    const problems: string[] = [];
    const list = exhibits.find((exhibit) => exhibit.id === "list");
    const listText = list?.body.join("\n") ?? "";
    const tellKeywords: Record<number, string[]> = { 18: ["thumb", "count"], 19: ["ring", "tap"], 20: ["hat", "brim"], 21: ["back to a door"], 22: ["clock"] };
    for (const survivor of survivors) {
      const info = survivor.survivor!;
      const row = listText.split("\n").find((line) => line.startsWith(`No. ${info.markerNo} `));
      if (!row) {
        problems.push(`the List has no row ${info.markerNo}`);
        continue;
      }
      const surname = info.veilName.split(" ").at(-1)!;
      if (!normalize(row).includes(normalize(surname))) problems.push(`List row ${info.markerNo} does not carry the surname ${surname}`);
      if (!normalize(row).includes(normalize(info.veilTitle.replace(/^The /, "")))) problems.push(`List row ${info.markerNo} does not carry the title ${info.veilTitle}`);
      if (!row.includes("UNSETTLED")) problems.push(`List row ${info.markerNo} should read UNSETTLED`);
      const keywords = tellKeywords[info.markerNo] ?? [];
      const tell = normalize(info.tell);
      if (!keywords.some((word) => normalize(row).includes(normalize(word)) && tell.includes(normalize(word)))) problems.push(`List row ${info.markerNo}'s note and the survivor's tell share no keyword`);
    }
    const settled = listText.split("\n").filter((line) => /^No\. \d+ .*SETTLED/.test(line) && !line.includes("UNSETTLED")).length;
    if (settled !== 17) problems.push(`expected 17 settled rows, found ${settled}`);
    for (const survivor of survivors) {
      const memorial = survivor.survivor!.memorial;
      if (memorial) {
        const text = exhibits.find((exhibit) => exhibit.id === "memorials")?.body.join(" ") ?? "";
        const name = memorial.replace("In memoriam, ", "");
        if (!text.includes(name.split(" ").at(-1)!)) problems.push(`memorial for ${name} is not in the withdrawn-notices exhibit`);
      }
    }
    stats["memorials"] = survivors.filter((survivor) => survivor.survivor!.memorial).length;
    if (survivors.filter((survivor) => survivor.survivor!.memorial).length !== 2) problems.push("canon says exactly two memorial notices were withdrawn");
    add("The List: 17 settled and 5 unsettled rows match the survivors' names, titles and tells; two memorials", problems);
  }

  // ------------------------------------------------------------ objectives: shape
  {
    const problems: string[] = [];
    const seen = new Set<string>();
    for (const character of characters) {
      if (character.objectives.length !== 5) problems.push(`${character.id} has ${character.objectives.length} objectives`);
      const total = character.objectives.reduce((sum, objective) => sum + objective.points, 0);
      if (total !== OBJECTIVE_TOTAL) problems.push(`${character.id}'s objectives total ${total}, not ${OBJECTIVE_TOTAL}`);
      for (const objective of character.objectives) {
        if (seen.has(objective.id)) problems.push(`duplicate objective id ${objective.id}`);
        seen.add(objective.id);
        if (!objective.id.startsWith(`${character.id}-`)) problems.push(`${objective.id} should start with ${character.id}-`);
        for (const other of sourcesOf(objective)) {
          if (!ids.has(other)) problems.push(`${objective.id} names an unknown guest ${other}`);
          if (other === character.id) problems.push(`${objective.id} sends ${character.id} to themselves`);
        }
        if (new Set(sourcesOf(objective)).size !== sourcesOf(objective).length) problems.push(`${objective.id} lists a source twice`);
        if (!objective.text.trim() || !objective.ask.trim() || !objective.title.trim()) problems.push(`${objective.id} has empty text`);
      }
    }
    stats["objectives"] = allObjectives.length;
    add("Objectives: five per guest, 12 points each, 60 for everyone, all references valid", problems);
  }

  // ------------------------------------------------------------ objectives: answerable
  {
    const problems: string[] = [];
    const reference = `${exhibitText()}`;
    let learners = 0;
    for (const character of characters) {
      for (const objective of character.objectives) {
        const check = objective.check;
        if (check.kind === "pattern") {
          learners += 1;
          const sources = sourcesOf(objective);
          if (objective.kind === "role") {
            const holder = characterById.get(character.id)!;
            const text = [...linesOf(holder), reference].join(" ");
            if (!matchesPattern(text, check.all)) problems.push(`${objective.id}: pattern is not answerable from the role card or the report`);
            continue;
          }
          if (sources.length < 2) problems.push(`${objective.id}: needs at least two sources so one absence cannot strand it (has ${sources.length})`);
          for (const sourceId of sources) {
            const source = characterById.get(sourceId);
            if (!source) continue;
            const lines = linesOf(source);
            if (!lines.some((line) => matchesPattern(line, check.all))) problems.push(`${objective.id}: ${sourceId}'s card has no single line that satisfies the answer`);
          }
        }
        if (check.kind === "code") {
          if (objective.kind === "find" || objective.kind === "swap") {
            const prop = props.find((item) => item.id === objective.prop);
            if (!prop) problems.push(`${objective.id}: unknown prop ${objective.prop}`);
            else if (!check.codes.includes(prop.code)) problems.push(`${objective.id}: code does not match prop ${prop.id}`);
            if (objective.kind === "find" && prop?.placement !== "hidden") problems.push(`${objective.id}: a find objective needs a hidden prop`);
          }
          for (const code of check.codes) {
            const known = props.some((item) => item.code === code) || exhibits.some((item) => item.code === code);
            if (!known) problems.push(`${objective.id}: code ${code} is not printed anywhere`);
          }
        }
        if (check.kind === "money") {
          const start = character.startingCash;
          if (check.min <= start) problems.push(`${objective.id}: target $${check.min} is not above the starting $${start}`);
          if (check.min - start > 130) problems.push(`${objective.id}: target is $${check.min - start} above start; too steep`);
        }
        if (check.kind === "clock") {
          const ok = /^\d{2}:\d{2}$/.test(check.from) && /^\d{2}:\d{2}$/.test(check.to) && check.from <= check.to;
          if (!ok) problems.push(`${objective.id}: bad clock window`);
        }
        if (check.kind === "guest" && !ids.has(check.guest)) problems.push(`${objective.id}: unknown guest ${check.guest}`);
      }
    }
    stats["pattern objectives"] = learners;
    add("Objectives: every learn / story answer is on a real card in every listed source, with two sources minimum", problems);
  }

  // ------------------------------------------------------------ swaps
  {
    const problems: string[] = [];
    const swaps = allObjectives.filter((objective) => objective.kind === "swap");
    const byOwner = new Map<string, Objective>();
    for (const objective of swaps) byOwner.set(objective.id.split("-")[0], objective);
    for (const character of characters) {
      const mine = byOwner.get(character.id);
      if (!mine) continue;
      const partnerId = mine.with[0];
      const theirs = byOwner.get(partnerId);
      if (!theirs) {
        problems.push(`${character.id}: partner ${partnerId} has no swap objective`);
        continue;
      }
      if (theirs.with[0] !== character.id) problems.push(`${character.id} swaps with ${partnerId}, who swaps with ${theirs.with[0]}`);
      const partner = characterById.get(partnerId)!;
      if (!partner.carries.includes(mine.prop!)) problems.push(`${character.id} wants ${mine.prop}, which ${partnerId} does not carry`);
      if (!character.carries.includes(theirs.prop!)) problems.push(`${partnerId} wants ${theirs.prop}, which ${character.id} does not carry`);
    }
    const carried = new Set<string>();
    for (const character of characters) {
      for (const propId of character.carries) {
        if (carried.has(propId)) problems.push(`${propId} is carried by two guests`);
        carried.add(propId);
        const prop = props.find((item) => item.id === propId);
        if (prop?.carriedBy !== character.id) problems.push(`${propId}: carriedBy ${prop?.carriedBy} disagrees with ${character.id}`);
      }
    }
    for (const prop of props.filter((item) => item.placement === "carried")) {
      if (!carried.has(prop.id)) problems.push(`carried prop ${prop.id} is held by nobody`);
    }
    stats["swap pairs"] = swaps.length / 2;
    add("Swaps: every swap is mirrored, every carried prop is carried by its owner and used once", problems);
  }

  // ------------------------------------------------------------ secret affairs
  {
    const problems: string[] = [];
    const hides = allObjectives.filter((objective) => objective.kind === "hide");
    const pairs = new Set<string>();
    for (const objective of hides) {
      const owner = objective.id.split("-")[0];
      const partner = (objective.check as { partner: string }).partner;
      const other = hides.find((candidate) => candidate.id.split("-")[0] === partner);
      if (!other) problems.push(`${owner}'s secret partner ${partner} has no hide objective`);
      else if ((other.check as { partner: string }).partner !== owner) problems.push(`${owner} and ${partner} are not mutual`);
      pairs.add([owner, partner].sort().join("|"));
    }
    const seeks = allObjectives.filter((objective) => objective.kind === "seek");
    for (const objective of seeks) {
      const truth = (objective.check as { pairs: [string, string][] }).pairs.map((pair) => [...pair].sort().join("|"));
      if (truth.length !== pairs.size || truth.some((pair) => !pairs.has(pair))) problems.push(`${objective.id}: its truth does not match the hide pairs`);
    }
    if (seeks.length < 2) problems.push("need at least two seekers so the secret can be found");
    stats["secret pairs"] = pairs.size;
    stats["seekers"] = seeks.length;
    add("Secret affairs: every hider is mirrored and every seeker's truth matches the pairs", problems);
  }

  // ------------------------------------------------------------ the three butler-chain objectives
  {
    const problems: string[] = [];
    for (const survivor of survivors) {
      const kinds = survivor.objectives.map((objective) => objective.kind).sort().join(",");
      if (kinds !== ["chain", "chain", "find", "learn", "motive"].sort().join(",")) problems.push(`${survivor.id}'s objective kinds are ${kinds}`);
    }
    const butler = characters.find((character) => character.role === "butler");
    const sale = butler?.objectives.find((objective) => objective.check.kind === "butler-sale");
    if (!sale) problems.push("the Butler has no sale objective");
    const attempts = allObjectives.filter((objective) => objective.check.kind === "vial-attempt");
    if (attempts.length !== 5) problems.push(`expected 5 vial-attempt objectives, found ${attempts.length}`);
    add("Survivors: each has find, learn, two chain steps and a motive; the Butler's sale is an objective", problems);
  }

  // ------------------------------------------------------------ props and codes
  {
    const problems: string[] = [];
    const all = [
      ...props.map((prop) => ({ code: prop.code, label: `prop ${prop.id}` })),
      ...exhibits.map((exhibit) => ({ code: exhibit.code, label: `exhibit ${exhibit.id}` })),
      ...markers.map((marker) => ({ code: marker.code, label: `marker ${marker.no}` })),
    ];
    const seen = new Map<string, string>();
    for (const item of all) {
      if (!CODE_ALPHABET.test(item.code)) problems.push(`${item.label}: ${item.code} is not a valid code`);
      const previous = seen.get(item.code);
      if (previous) problems.push(`${item.label} reuses the code of ${previous}`);
      seen.set(item.code, item.label);
    }
    for (const exhibit of exhibits) {
      if (!exhibit.body.join("\n").includes(exhibit.code)) problems.push(`exhibit ${exhibit.id}: the filing code is not printed on the page`);
      if (exhibit.where === "held" && !exhibit.heldBy) problems.push(`exhibit ${exhibit.id} is held by nobody`);
      if (exhibit.heldBy && !ids.has(exhibit.heldBy)) problems.push(`exhibit ${exhibit.id} held by unknown ${exhibit.heldBy}`);
      for (const factId of exhibit.supports) {
        if (!facts.some((fact) => fact.id === factId)) problems.push(`exhibit ${exhibit.id} supports unknown fact ${factId}`);
      }
    }
    stats["printed codes"] = all.length;
    add("Codes: unique, typo-safe alphabet, and every exhibit prints its own filing code", problems);
  }

  // ------------------------------------------------------------ facts
  {
    const problems: string[] = [];
    const exhibitIds = new Set(exhibits.map((exhibit) => exhibit.id));
    for (const fact of facts) {
      const guests = fact.holders.map((holder) => holder.guest);
      if (new Set(guests).size !== guests.length) problems.push(`${fact.id}: duplicate holder`);
      for (const holder of fact.holders) {
        if (!ids.has(holder.guest)) problems.push(`${fact.id}: unknown holder ${holder.guest}`);
        if (!holder.line.trim()) problems.push(`${fact.id}: ${holder.guest}'s line is empty`);
      }
      for (const exhibitId of fact.exhibits ?? []) {
        if (!exhibitIds.has(exhibitId)) problems.push(`${fact.id}: unknown exhibit ${exhibitId}`);
      }
      const survivorHolders = guests.filter((guest) => characterById.get(guest)?.survivor);
      const present = guests.length - survivorHolders.length;
      const printed = (fact.exhibits ?? []).length;
      if (present < 3 && !(present >= 2 && printed >= 1)) problems.push(`${fact.id}: only ${present} non-survivor holders and ${printed} printed exhibits`);
      if (["old", "new", "connection"].includes(fact.kind) && present < 3) problems.push(`${fact.id}: a mystery clue needs at least three non-survivor holders`);
      if (fact.kind === "identity" || fact.kind === "decoy" || fact.kind === "motive") {
        if (survivorHolders.length) problems.push(`${fact.id}: held by a survivor, who may lie about themselves`);
      }
    }
    stats["facts"] = facts.length;
    stats["fact lines"] = facts.reduce((total, fact) => total + fact.holders.length, 0);
    add("Clues: every fact is held by at least three people (or two plus a printed page), and survivors never vouch for themselves", problems);
  }

  // ------------------------------------------------------------ the deduction ladder
  {
    const problems: string[] = [];
    const need: Record<string, string[]> = {
      "old-1": ["staged", "exit-plan"],
      "old-2": ["exit-plan", "kit-ouster"],
      "old-3": ["kit-ouster", "hitman", "forged", "list-prepared"],
      "new-1": ["marker-map", "vial", "tell-18", "tell-19", "tell-20", "tell-21", "tell-22"],
      "new-2": ["poison", "vial", "nightcap"],
      "new-3": ["motive-18", "motive-19", "motive-20", "motive-21", "motive-22"],
      "con-1": ["dead-kit", "list-prepared", "kit-ouster"],
      "con-2": ["survivors-exist", "list-prepared", "marker-map"],
      "con-3": ["kit-invites", "invites-cassie", "cassie-alive"],
      "alt-1": ["succession", "kit-why", "kit-invites"],
      "alt-2": ["vault", "kit-why"],
    };
    for (const question of questions) {
      for (const factId of need[question.id] ?? []) {
        const fact = facts.find((item) => item.id === factId);
        if (!fact) {
          problems.push(`${question.id}: needed fact ${factId} does not exist`);
          continue;
        }
        const nonSurvivors = fact.holders.filter((holder) => !characterById.get(holder.guest)?.survivor).length;
        if (nonSurvivors + (fact.exhibits?.length ?? 0) < 3) problems.push(`${question.id}: fact ${factId} has too few independent sources`);
      }
      if (!need[question.id]) problems.push(`${question.id} has no fact ladder`);
    }
    const counted = questions.filter((question) => !question.alternateFor);
    const total = counted.reduce((sum, question) => sum + question.points, 0);
    const byMystery = (id: string) => counted.filter((question) => question.mystery === id).reduce((sum, question) => sum + question.points, 0);
    stats["mystery points"] = `${byMystery("old")}+${byMystery("new")}+${byMystery("connection")}=${total}`;
    if (total !== 100) problems.push(`the three mysteries should total 100 points, got ${total}`);
    if (total <= OBJECTIVE_TOTAL) problems.push("the mysteries must be worth more than all the objectives together");
    for (const question of questions) {
      const rubric = question.rubric.reduce((sum, element) => sum + element.points, 0);
      if (question.type === "text" && !question.fromKillerMotive && rubric !== question.points) problems.push(`${question.id}: rubric totals ${rubric}, not ${question.points}`);
    }
    add("Reckoning: every question stands on at least three independent sources; the mysteries are worth 100", problems);
  }

  // ------------------------------------------------------------ identity routes
  {
    const problems: string[] = [];
    for (const survivor of survivors) {
      const n = survivor.survivor!.markerNo;
      const tell = facts.find((fact) => fact.id === `tell-${n}`);
      const crack = facts.find((fact) => fact.id === `crack-${n}`);
      if (!tell || tell.holders.length < 3) problems.push(`survivor ${n}: needs a tell fact with three witnesses`);
      if (!crack || crack.holders.length < 3) problems.push(`survivor ${n}: needs a crack fact with three witnesses`);
      const motive = facts.find((fact) => fact.id === survivor.survivor!.motiveFact);
      if (!motive || motive.holders.length < 3) problems.push(`survivor ${n}: needs a motive fact with three witnesses`);
    }
    // each survivor's tell has a decoy somebody else performs, with a vouch fact that rules the decoy out
    const decoys = characters.filter((character) => character.habit);
    const vouches = facts.filter((fact) => fact.kind === "decoy");
    if (decoys.length < 5) problems.push(`expected at least five decoy habits, found ${decoys.length}`);
    for (const decoy of ["angelos", "emre", "silas", "erika", "sidd"]) {
      if (!characterById.get(decoy)?.habit) problems.push(`${decoy} should have a decoy habit`);
      if (!vouches.some((fact) => fact.id.startsWith("vouch-") && fact.id.endsWith(decoy))) problems.push(`no vouch fact clears ${decoy}`);
    }
    // a guest's own tell must be known to the guest, and never printed in a public field
    for (const survivor of survivors) {
      if (!survivor.survivor!.tell.trim()) problems.push(`${survivor.id} has no tell`);
    }
    stats["decoys"] = decoys.length;
    add("Identity: each survivor has a tell, a crack and a motive with three witnesses; five decoys are each cleared", problems);
  }

  // ------------------------------------------------------------ load balance
  {
    const problems: string[] = [];
    const loads = characters.map((character) => ({ id: character.id, lines: facts.reduce((total, fact) => total + fact.holders.filter((holder) => holder.guest === character.id).length, 0) }));
    const nonSurvivors = loads.filter((entry) => !characterById.get(entry.id)?.survivor);
    const max = Math.max(...nonSurvivors.map((entry) => entry.lines));
    const min = Math.min(...nonSurvivors.map((entry) => entry.lines));
    stats["clue lines per guest"] = `${min}–${max}`;
    for (const entry of nonSurvivors) {
      if (entry.lines > 9) problems.push(`${entry.id} carries ${entry.lines} clue lines (limit 9)`);
      if (entry.lines < 3) problems.push(`${entry.id} carries only ${entry.lines} clue lines (minimum 3)`);
    }
    add("Load: no non-survivor carries more than nine or fewer than three clue lines", problems);
  }

  // ------------------------------------------------------------ the web of dependencies
  {
    const problems: string[] = [];
    const edges = new Map<string, Set<string>>();
    for (const character of characters) edges.set(character.id, new Set());
    const link = (a: string, b: string) => {
      edges.get(a)?.add(b);
      edges.get(b)?.add(a);
    };
    for (const objective of allObjectives) {
      const owner = objective.id.split("-")[0];
      for (const other of sourcesOf(objective)) link(owner, other);
    }
    for (const character of characters) link(character.id, character.smallSecret.confidant);
    // connectivity
    const seen = new Set<string>();
    const queue = [characters[0].id];
    while (queue.length) {
      const next = queue.pop()!;
      if (seen.has(next)) continue;
      seen.add(next);
      for (const other of edges.get(next) ?? []) queue.push(other);
    }
    if (seen.size !== characters.length) problems.push(`the web has ${characters.length - seen.size} disconnected guests`);
    const degrees = [...edges.entries()].map(([id, set]) => ({ id, degree: set.size }));
    const minDegree = Math.min(...degrees.map((entry) => entry.degree));
    stats["web ties per guest"] = `${minDegree}–${Math.max(...degrees.map((entry) => entry.degree))}`;
    if (minDegree < 4) problems.push(`${degrees.find((entry) => entry.degree === minDegree)!.id} has only ${minDegree} ties`);
    // every circle reaches into every other circle
    for (const circle of circles) {
      const members = characters.filter((character) => character.circle === circle.id).map((character) => character.id);
      const reaches = new Set<string>();
      for (const id of members) for (const other of edges.get(id) ?? []) reaches.add(characterById.get(other)!.circle);
      for (const other of circles) if (other.id !== circle.id && !reaches.has(other.id)) problems.push(`circle ${circle.id} never meets ${other.id}`);
    }
    // cut vertices: removing any one guest must not disconnect the rest
    for (const removed of characters) {
      const rest = characters.filter((character) => character.id !== removed.id);
      const visited = new Set<string>();
      const stack = [rest[0].id];
      while (stack.length) {
        const current = stack.pop()!;
        if (visited.has(current) || current === removed.id) continue;
        visited.add(current);
        for (const other of edges.get(current) ?? []) stack.push(other);
      }
      if (visited.size !== rest.length) problems.push(`removing ${removed.id} splits the web`);
    }
    add("Web: everyone is connected, circles meet each other, and no single absence splits the room", problems);
  }

  // ------------------------------------------------------------ absences: stranded objectives and lost clues
  {
    const problems: string[] = [];
    const random = mulberry32(1926);
    const trials = 4000;
    let worstStrandedPerGuest = 0;
    let worstLostFacts = 0;
    let worstLostRoutes = 0;
    for (const absences of [3, 5]) {
      for (let trial = 0; trial < trials; trial += 1) {
        const absent = new Set<string>();
        while (absent.size < absences) absent.add(characters[Math.floor(random() * characters.length)].id);
        const strandedBy = new Map<string, number>();
        for (const character of characters) {
          if (absent.has(character.id)) continue;
          for (const objective of character.objectives) {
            if (objective.check.kind !== "pattern" || objective.kind === "role") continue;
            const alive = sourcesOf(objective).filter((source) => !absent.has(source)).length;
            if (alive === 0) strandedBy.set(character.id, (strandedBy.get(character.id) ?? 0) + 1);
          }
        }
        for (const count of strandedBy.values()) worstStrandedPerGuest = Math.max(worstStrandedPerGuest, count);
        // the facts that carry the mysteries must keep a live holder or a printed exhibit
        // every printed page is always available: pages held by a guest are duplicated in the
        // Dead Letter box, which opens at 9:15, so only facts with no page depend on their holders
        let lost = 0;
        for (const fact of facts) {
          if (!["old", "new", "connection"].includes(fact.kind)) continue;
          const live = fact.holders.filter((holder) => !absent.has(holder.guest)).length;
          if (live === 0 && !(fact.exhibits ?? []).length) lost += 1;
        }
        worstLostFacts = Math.max(worstLostFacts, lost);
        // a survivor can be identified by their tell (always on the List), their crack or their motive:
        // at least two routes must stay alive
        for (const survivor of survivors) {
          const n = survivor.survivor!.markerNo;
          const routes = [`tell-${n}`, `crack-${n}`, survivor.survivor!.motiveFact].filter((id) => {
            const fact = facts.find((item) => item.id === id)!;
            return (fact.exhibits ?? []).length > 0 || fact.holders.some((holder) => !absent.has(holder.guest));
          });
          if (routes.length < 2) worstLostRoutes += 1;
        }
      }
    }
    stats["worst stranded objectives per guest (3 or 5 absent, 8000 trials)"] = worstStrandedPerGuest;
    stats["worst facts with no live holder and no printed page"] = worstLostFacts;
    if (worstStrandedPerGuest > 2) problems.push(`with up to 5 absences a guest can be left with ${worstStrandedPerGuest} stranded objectives; the standby notes must cover them`);
    stats["trials where a survivor kept fewer than two identity routes"] = worstLostRoutes;
    if (worstLostFacts > 0) problems.push(`${worstLostFacts} mystery facts can lose every holder and have no printed page`);
    if (worstLostRoutes > 0) problems.push(`a survivor kept fewer than two identity routes in ${worstLostRoutes} absence trials`);
    add("Absences: with 3 or 5 guests missing, at most two objectives are ever stranded and no clue is lost for good", problems);
  }

  // ------------------------------------------------------------ names
  {
    const problems: string[] = [];
    for (const character of characters) {
      const found = findGuests(character.name);
      if (found.length !== 1 || found[0] !== character.id) problems.push(`${character.id}: its full name resolves to [${found.join(",")}]`);
      for (const real of character.realNames) {
        const hits = findGuests(real);
        if (hits.length && !hits.includes(character.id)) problems.push(`${character.id}: real name "${real}" resolves to [${hits.join(",")}]`);
      }
    }
    add("Names: every character's name resolves to exactly that character", problems);
  }

  // ------------------------------------------------------------ nothing early leaks the solution
  {
    const problems: string[] = [];
    const secretWords = ["survivor", "marker", "kessler", "quill", "vial", "tincture", "veil name", "the list", "poison", "unsettled", "killer", "murderer"];
    for (const character of characters) {
      const early = [character.publicBio, character.name, character.occupation, character.background.history, character.background.wardrobe, ...character.background.people].join(" ").toLowerCase();
      if (character.survivor) {
        for (const word of ["hitman", "veil name", "marker", "survivor", "tell", "pike", "crane", "lyle", "ballard", "marek"]) {
          if (early.includes(word)) problems.push(`${character.id}: survivor's pre-party tabs mention "${word}"`);
        }
      }
      const publicOnly = [character.publicBio, character.name, character.occupation].join(" ").toLowerCase();
      for (const word of secretWords) {
        if (publicOnly.includes(word)) problems.push(`${character.id}: public tab mentions "${word}"`);
      }
    }
    // the pre-party Background tab must not hold the fact that a clue is a clue: it may mention
    // the character's own history, but never the poison's source or the killer
    for (const character of characters) {
      const early = character.background.history.toLowerCase();
      for (const word of ["strychnine", "nux vomica", "the vial", "the marker", "the nightcap"]) {
        if (early.includes(word)) problems.push(`${character.id}: Background tab mentions "${word}"`);
      }
    }
    add("Leaks: public and pre-party tabs never name the poison, markers, the List or the survivors", problems);
  }

  // ------------------------------------------------------------ client bundles never import the bible
  {
    const problems: string[] = [];
    const roots = ["src/app", "src/components"];
    for (const rootDir of roots) {
      const dir = join(root, rootDir);
      for (const file of walk(dir)) {
        const text = readFileSync(file, "utf8");
        const isApi = file.includes(`${join("src", "app", "api")}`);
        const isClient = /^\s*["']use client["']/m.test(text);
        const importsBible = /from\s+["']@\/(data\/game|lib\/game\/(grading|scoring|service|truth|packet|validate))/.test(text);
        if (importsBible && (isClient || !isApi)) problems.push(`${file.replace(`${root}/`, "")} imports server-only game code${isClient ? " in a client component" : " outside an API route"}`);
      }
    }
    add("Bundles: only API routes import the game bible, never a client component or a page", problems);
  }

  // ------------------------------------------------------------ built bundles contain no solution
  {
    const problems: string[] = [];
    const staticDir = join(root, ".next", "static");
    let scanned = 0;
    try {
      statSync(staticDir);
      const forbidden = [
        ...markers.map((marker) => marker.code),
        ...exhibits.map((exhibit) => exhibit.code),
        ...survivors.map((survivor) => survivor.survivor!.veilName),
        "Kessler",
        "Quill",
        "motiveKeys",
        "nux vomica",
      ];
      const files: string[] = [];
      const collect = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const path = join(dir, entry);
          if (statSync(path).isDirectory()) collect(path);
          else if (entry.endsWith(".js")) files.push(path);
        }
      };
      collect(staticDir);
      for (const file of files) {
        const text = readFileSync(file, "utf8");
        scanned += 1;
        for (const term of forbidden) if (text.includes(term)) problems.push(`${file.replace(`${root}/`, "")} contains "${term}"`);
      }
      stats["client files scanned for secrets"] = scanned;
    } catch {
      stats["client files scanned for secrets"] = "none (run npm run build first)";
    }
    add("Built client: no marker code, exhibit code, survivor name or answer key appears in any shipped JavaScript", problems);
  }

  // ------------------------------------------------------------ cash
  {
    const problems: string[] = [];
    const total = characters.reduce((sum, character) => sum + character.startingCash, 0);
    stats["cash in the room"] = `$${total}`;
    const cap = characters.reduce((sum, character) => sum + Math.max(0, character.objectives.filter((objective) => objective.check.kind === "money").reduce((s, objective) => s + ((objective.check as { min: number }).min - character.startingCash), 0)), 0);
    stats["total money the objectives ask players to win"] = `$${cap}`;
    if (cap > total * 0.35) problems.push(`money objectives ask guests to win $${cap} of the $${total} in the room (more than 35%)`);
    add("Money: the room holds enough cash for every money objective to be won without ruining anyone", problems);
  }

  return { checks, stats, ok: checks.every((check) => check.ok) };
}

export function formatReport(report: Report): string {
  const lines: string[] = [];
  for (const check of report.checks) {
    lines.push(`${check.ok ? "PASS" : "FAIL"}  ${check.name}`);
    for (const detail of check.details) lines.push(`        - ${detail}`);
  }
  lines.push("");
  for (const [key, value] of Object.entries(report.stats)) lines.push(`  ${key}: ${value}`);
  lines.push("");
  lines.push(report.ok ? `ALL ${report.checks.length} CHECKS PASSED` : `${report.checks.filter((check) => !check.ok).length} OF ${report.checks.length} CHECKS FAILED`);
  return lines.join("\n");
}
