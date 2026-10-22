/**
 * The assembled game bible. SERVER-ONLY: this module holds the solution. Guest-facing
 * code gets the redacted shapes from `buildCard` and `listDirectory`, never the raw data.
 */
import { normalize } from "@/lib/game/text";
import { circles, races } from "./circles";
import { gilded } from "./cast-gilded";
import { order } from "./cast-order";
import { river } from "./cast-river";
import { stage } from "./cast-stage";
import { working } from "./cast-working";
import { exhibits } from "./exhibits";
import { facts } from "./facts";
import { markers, propById, props } from "./props";
import { alternateOf, MYSTERY_POINTS, questionById, questions } from "./questions";
import type { Character, Circle, CircleId, Line, Objective, Share } from "./types";

export { alternateOf, circles, exhibits, facts, markers, MYSTERY_POINTS, props, questionById, questions, races };
export * from "./types";

export const characters: Character[] = [...gilded, ...order, ...stage, ...working, ...river];
export const characterById = new Map(characters.map((character) => [character.id, character]));
export const circleById = new Map<CircleId, Circle>(circles.map((circle) => [circle.id, circle]));

export const survivors = characters.filter((character) => character.survivor);
export const survivorIds = survivors.map((character) => character.id);

/** Points a guest can earn from errands: five objectives of one point each, the same for everyone. */
export const OBJECTIVE_TOTAL = 5;

// ---------------------------------------------------------------- text helpers

/** Fills {prop}, {hint} and {name:id} in card text from the live data. */
export function renderText(text: string, objective?: Pick<Objective, "prop">): string {
  const prop = objective?.prop ? propById.get(objective.prop) : undefined;
  return text
    .replace(/\{prop\}/g, prop?.name ?? "item")
    .replace(/\{hint\}/g, prop?.hint ?? "")
    .replace(/\{name:([a-z0-9-]+)\}/g, (_, id: string) => characterById.get(id)?.name ?? id)
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------- naming guests

const skipWords = new Set(["the", "of", "on", "no", "dr", "mr", "mrs", "miss", "judge", "sheriff", "relation", "to", "motorcar", "and", "or", "a", "manor", "lamps", "court", "palm", "union", "manchester", "black", "veil", "bathtub", "gin", "baron", "emporium", "farrago", "oil", "nag", "esq", "wfea", "sky", "bat", "vermouth"]);

/** Extra ways a guest might name a character: the stage names on the card, minus any that are also ordinary words in the story. */
const extraAliases: Record<string, string[]> = {
  joel: ["wayne", "bruce", "j bruce wayne", "bruce wayne", "joel", "playboy"],
  silas: ["duke", "palmer"],
  theodor: ["theo", "farag", "theodor", "the sheriff", "sheriff farrago", "theodor farrago"],
  tim: ["timothy", "mcginley", "tim"],
  josh: ["joshua", "kaminsky", "kamin sky", "josh", "soothsayer"],
  sidd: ["siddarth", "arvind", "sid", "sidd", "air wind", "airwind"],
  rebecca: ["chou", "chow", "becca", "rebecca", "the butler"],
  tiffany: ["liu", "tiffany"],
  eric: ["eric", "li", "leeway", "judge li", "the judge"],
  diwakar: ["sandbag", "sandbagg", "sandhu"],
  leon: ["gee whiz", "geewhiz", "gee"],
  ananya: ["codru", "koduru", "charlie", "wakem", "wakim"],
  luke: ["shell game", "sheldon", "shelldon"],
  arjun: ["the bat", "bhat"],
  adam: ["holds fire", "holdsfire", "ouldsfiya"],
  angelos: ["bowled over", "boules", "bowles"],
  anthony: ["hung jury", "huang", "hung"],
  emre: ["sooner or later", "sunar", "sunner", "emmerich", "the doctor"],
  mihir: ["nagarkatti"],
  rhea: ["mallya"],
  molly: ["daniel", "the newsie"],
  erika: ["lam", "lamm"],
  anika: ["mahns"],
  krrish: ["verma"],
};

/** Every distinctive word a guest might use for a character: first and last names and the odd stage name. */
export function aliasesFor(character: Character): string[] {
  const words = new Set<string>([character.id]);
  for (const real of character.realNames) for (const word of normalize(real).split(" ")) if (word.length > 2 && !skipWords.has(word)) words.add(word);
  for (const word of normalize(character.name).split(" ")) if (word.length > 2 && !skipWords.has(word)) words.add(word);
  for (const word of extraAliases[character.id] ?? []) words.add(normalize(word));
  return [...words];
}

const aliasIndex = new Map<string, Set<string>>();
for (const character of characters) {
  for (const alias of aliasesFor(character)) {
    const owners = aliasIndex.get(alias) ?? new Set<string>();
    owners.add(character.id);
    aliasIndex.set(alias, owners);
  }
}

/** Every character a piece of free text names, by any distinctive alias. Ambiguous aliases name nobody. */
export function findGuests(text: string): string[] {
  const found = new Set<string>();
  const phrase = ` ${normalize(text)} `;
  for (const [alias, owners] of aliasIndex) {
    if (owners.size !== 1) continue;
    if (phrase.includes(` ${alias} `)) found.add([...owners][0]);
  }
  return [...found];
}

// ---------------------------------------------------------------- the redacted card

export type RenderedObjective = {
  id: string;
  kind: Objective["kind"];
  title: string;
  text: string;
  ask: string;
  points: number;
  prop?: { name: string };
  withNames: string[];
  /** True when the House's own log, not the guest's answer, decides it. */
  house: boolean;
  /** True when the host confirms it in person and gives an approval word to type. */
  approval: boolean;
  /** True when nothing needs typing at all: it is scored from other guests' answers. */
  automatic: boolean;
};

export type CardView = {
  id: string;
  name: string;
  occupation: string;
  circle: { id: string; name: string; blurb: string };
  publicBio: string;
  background: { history: string; people: string[]; wardrobe: string };
  private: {
    startingCash: number;
    carries: string[];
    secrets: Line[];
    knows: Line[];
    habit?: string;
    role?: { title: string; rules: string[] };
    survivor?: {
      veilName: string;
      veilTitle: string;
      markerNo: number;
      tell: string;
      realStory: string;
      escape: string;
      rules: string[];
      rivals: { name: string; circle: string }[];
    };
    objectives: RenderedObjective[];
    totalPoints: number;
    /** This group's race for one extra point. */
    race: { group: string; title: string; text: string; ask: string; house: boolean; points: number; slips: string[] };
  };
};

/** What every survivor is told on the night. The reason they want him dead is deliberately not here: it is their own errand to learn it. */
export function survivorRules(markerNo: number): string[] {
  return [
    "You are one who got away. You know the old man hunted you and the people you trusted, and you know who he is. Others probably escaped too, but you do not know how many or who. Everyone else has been told only that survivors are in the room. Your cover is your public card. Keep it.",
    "Your invitation came unsigned, and it knew the new name you have used ever since. Only one person could have known it. Working out who is one of your errands.",
    `You carry marker No. ${markerNo}. It is yours alone: never trade it, never give it away. It is how you pay the House.`,
    "You have told yourself so many stories since 1925 that you are no longer certain of your real reason for coming. You only know that you must be the one. Somebody in this room saw what he did to you; finding out is one of your errands.",
    "The House keeps one bottle of tincture and sells it once a night, to whoever shows the Butler a marker first. Make your offer before the nightcap is served at nine o'clock. Only one of you can be the one.",
    "If the Butler sells to you, the Keeper's nightcap waits in a glass on his table in the Merrimack Room. Pour the vial in unseen, then type the short code printed under the glass's coaster into the nightcap box on this page. Only the buyer's code counts, and the page will say only “Noted.”",
    "Do your tell, a small habit you no longer notice, at least three times before the nightcap. Do not overdo it.",
    "Whoever finishes him takes Cassie's seat and the Veil. You are competing with others you cannot name, and every one of you has the right to try.",
  ];
}

const roleTitles: Record<NonNullable<Character["role"]>, string> = {
  sheriff: "The Sheriff",
  butler: "The Butler",
  doctor: "The Physician",
};

/** The facts, confidences and habits a character carries, as private-tab lines. */
export function knowsFor(character: Character): Line[] {
  const lines: Line[] = [];
  for (const fact of facts) {
    for (const holder of fact.holders) {
      if (holder.guest === character.id) lines.push({ text: holder.line, share: holder.share });
    }
  }
  for (const other of characters) {
    if (other.smallSecret.confidant === character.id) {
      lines.push({ text: `About ${other.name}: ${other.smallSecret.text}`, share: "trade" as Share });
    }
  }
  return lines;
}

/** Everything a guest may see about their own character. Never includes answer keys, other guests' cards or the solution. */
export function buildCard(id: string): CardView | null {
  const character = characterById.get(id);
  if (!character) return null;
  const circle = circleById.get(character.circle)!;
  const survivor = character.survivor;
  // survivors do not know each other: they know only that others probably escaped, not how many or who
  const rivals: { name: string; circle: string }[] = [];
  return {
    id: character.id,
    name: character.name,
    occupation: character.occupation,
    circle: { id: circle.id, name: circle.name, blurb: circle.blurb },
    publicBio: character.publicBio,
    background: character.background,
    private: {
      startingCash: character.startingCash,
      carries: character.carries.map((propId) => propById.get(propId)?.name ?? propId),
      secrets: character.secrets,
      knows: knowsFor(character),
      habit: character.habit,
      role: character.role && character.roleCard ? { title: roleTitles[character.role], rules: character.roleCard } : undefined,
      survivor: survivor
        ? {
            veilName: survivor.veilName,
            veilTitle: survivor.veilTitle,
            markerNo: survivor.markerNo,
            tell: survivor.tell,
            realStory: survivor.realStory,
            escape: survivor.escape,
            rules: survivorRules(survivor.markerNo),
            rivals,
          }
        : undefined,
      objectives: character.objectives.map(renderObjective),
      totalPoints: character.objectives.reduce((total, objective) => total + objective.points, 0),
      race: raceFor(character),
    },
  };
}

/** The race card for a character's group, and the slips this character is carrying for other groups' races. */
function raceFor(character: Character) {
  const race = races.find((candidate) => candidate.circle === character.circle)!;
  const slips = character.carries
    .map((propId) => races.find((candidate) => candidate.tokens.includes(propId)))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .map((candidate) => `${propById.get(character.carries.find((propId) => candidate.tokens.includes(propId))!)?.name ?? "slip"}: hand it to anyone who asks for it by name.`);
  return { group: circleById.get(character.circle)!.name, title: race.title, text: race.text, ask: race.ask, house: race.circle === "survivors", points: 1, slips };
}

const guardedObjectiveIds = new Set(characters.flatMap((c) => c.objectives.flatMap((o) => (o.check.kind === "keep" ? [o.check.rivalObjective] : []))));

export function renderObjective(objective: Objective): RenderedObjective {
  const prop = objective.prop ? propById.get(objective.prop) : undefined;
  return {
    id: objective.id,
    kind: objective.kind,
    title: renderText(objective.title, objective),
    text: renderText(objective.text, objective) + (guardedObjectiveIds.has(objective.id) ? " Someone is guarding this one, so expect a harder time: a real try still earns half a point." : ""),
    ask: objective.ask,
    points: objective.points,
    prop: prop && objective.kind === "find" ? { name: prop.name } : undefined,
    withNames: objective.with.map((guest) => characterById.get(guest)?.name ?? guest),
    house: ["keep", "vial-attempt", "butler-sale"].includes(objective.check.kind),
    approval: objective.check.kind === "approval",
    automatic: objective.check.kind === "keep",
  };
}

/** The roster every guest may see: who is in the room. Survivors and killers are never marked, and groups are never listed (the survivors are a group of their own). */
export function listDirectory() {
  return characters.map((character) => ({
    id: character.id,
    name: character.name,
    occupation: character.occupation,
  }));
}

export const allObjectives: Objective[] = characters.flatMap((character) => character.objectives);
export const objectiveById = new Map(allObjectives.map((objective) => [objective.id, objective]));
export const exhibitCodes = new Map(exhibits.map((exhibit) => [exhibit.code, exhibit]));

/** Finds the character a registered guest should be dealt, by the names they might have used. */
export function characterForName(fullName: string): Character | undefined {
  const wanted = normalize(fullName);
  return characters.find((character) => character.realNames.some((real) => normalize(real) === wanted));
}

