/**
 * Shapes for the Black Veil game bible. Everything under src/data/game is SERVER-ONLY:
 * it holds the solution, the survivors and every private card, so nothing here may be
 * imported by a "use client" file or a page that renders to the browser. The guest-facing
 * API routes read it and send each guest only what the release flags allow.
 *
 * Real guests are referred to by character slug (GuestId). Real names live in
 * `realNames` only so the admin can match a registered guest to a character.
 */
import type { AnyOf, Pattern } from "@/lib/game/text";

export type GuestId = string;
export type FactId = string;
export type ExhibitId = string;
export type PropId = string;

export type CircleId = "gilded" | "order" | "stage" | "working" | "river";

export type Circle = {
  id: CircleId;
  name: string;
  /** One line shown on the public card: the world this circle moves in. */
  blurb: string;
};

/** How freely a card line may be repeated. Private cards mark each line, so guests know what is theirs to trade. */
export type Share = "free" | "trade" | "secret";

export type Line = { text: string; share: Share };

export type MysteryId = "old" | "new" | "connection";

/** An atomic thing that is true in the story. Clues are cards that let guests learn facts. */
export type Fact = {
  id: FactId;
  kind: "old" | "new" | "connection" | "identity" | "motive" | "personal" | "decoy";
  /** The plain truth, for the game master and the grader. */
  truth: string;
  /** Who holds it and how their card words it. Must name at least three guests (or two plus a printed exhibit). */
  holders: { guest: GuestId; line: string; share: Share }[];
  /** Printed exhibits that also carry this fact, so one absence can never bury it. */
  exhibits?: ExhibitId[];
};

export type Exhibit = {
  id: ExhibitId;
  /** What a guest types to file the exhibit. Upper-case, no ambiguous characters. */
  code: string;
  title: string;
  /** Where the printed page lives. */
  where: "binder" | "table" | "hidden" | "scene" | "held";
  heldBy?: GuestId;
  /** What to print on the page. Plain text; the print sheet adds the styling. */
  body: string[];
  /** When the page becomes available. */
  appears: "start" | "scene";
  supports: FactId[];
};

export type Prop = {
  id: PropId;
  code: string;
  name: string;
  /** What the object could be in your house. Replace with the real item when you scan the house. */
  generic: string;
  /** Where it starts. */
  placement: "hidden" | "carried" | "table" | "bar";
  /** The riddle or hint on the finder's card. Edit when the house is scanned. */
  hint: string;
  /** For carried props: who starts with it. */
  carriedBy?: GuestId;
  /** The item you actually put out. Filled in after the house scan. */
  assigned?: string;
};

export type ObjectiveKind =
  | "find"
  | "learn"
  | "swap"
  | "money"
  | "hide"
  | "seek"
  | "story"
  | "chain"
  | "motive"
  | "role";

export type Check =
  /** The answer must equal one of these printed codes. */
  | { kind: "code"; codes: string[] }
  /** The answer must match this pattern. `forbid` terms push a match to human review. */
  | { kind: "pattern"; all: Pattern; forbid?: AnyOf }
  /** The answer must name this guest (by character name, surname or first name). */
  | { kind: "guest"; guest: GuestId }
  /** The answer is a dollar amount of at least `min`. */
  | { kind: "money"; min: number }
  /** Hide a secret affair: scored by the absence of correct "seek" answers naming you. */
  | { kind: "hide"; partner: GuestId }
  /** Seek secret affairs: name two guests who are secretly together. `pairs` are the truths. */
  | { kind: "seek"; pairs: [GuestId, GuestId][] }
  /** Made an offer to the Butler (recorded by the Butler's phone, not by the guest). */
  | { kind: "vial-attempt" }
  /** The Butler (or Joe, standing in) made the night's sale. Recorded by the Butler's phone. */
  | { kind: "butler-sale" }
  /** The answer is a clock time on the party night, from `from` to `to` inclusive, as "HH:MM" on a 24-hour clock. */
  | { kind: "clock"; from: string; to: string }
  /** Nothing automatic can judge it: always sent to Claude or staff. */
  | { kind: "manual"; rubric: string };

export type Objective = {
  id: string;
  kind: ObjectiveKind;
  title: string;
  /** Second person, as printed on the card. */
  text: string;
  /** The label on the submission box: what to type. */
  ask: string;
  points: number;
  /** Characters this objective sends you to. */
  with: GuestId[];
  /** Anyone else who can supply the same answer, so one absence never strands an objective. */
  alsoFrom?: GuestId[];
  prop?: PropId;
  check: Check;
};

export type Survivor = {
  /** The name on the List. */
  veilName: string;
  veilTitle: string;
  /** The marker number on the List and on the card the survivor carries. */
  markerNo: number;
  markerCode: string;
  /** What the survivor does, unconsciously, a few times a night. Also written into the List. */
  tell: string;
  /** What the survivor's real trade leaks through their cover. */
  skillLeak: string;
  /** The private card text: who you really are. */
  realStory: string;
  /** How the survivor survived the Keeper's hitman. */
  escape: string;
  /** What the Keeper did to this survivor: the reason they want him dead. */
  grievance: string;
  /** What a correct answer to "why did they do it" looks like for this survivor. */
  motiveKeys: Pattern;
  /** The fact id that lets other guests learn this motive. */
  motiveFact: FactId;
  /** The withdrawn memorial notice, if any. */
  memorial?: string;
};

export type Character = {
  id: GuestId;
  /** Names a registered guest might have used. Matched case-insensitively. */
  realNames: string[];
  circle: CircleId;
  /** The 1926 name, loosely built from the real one so the room can tell who is who. */
  name: string;
  occupation: string;
  /** Public tab: what everyone may know. */
  publicBio: string;
  /** Background tab: your history, your people, what to wear. Shown before the party. */
  background: { history: string; people: string[]; wardrobe: string };
  /** Private tab: secrets you hold, one line each. */
  secrets: Line[];
  /** The one small secret other guests can learn from you (and your confidant). */
  smallSecret: { text: string; key: AnyOf; confidant: GuestId };
  startingCash: number;
  /** Props that start in this guest's envelope. */
  carries: PropId[];
  role?: "sheriff" | "butler" | "doctor";
  /** Rules that belong to the role (private tab). */
  roleCard?: string[];
  /** A harmless habit this guest has. For decoys it is deliberately similar to a survivor's tell. */
  habit?: string;
  survivor?: Survivor;
  objectives: Objective[];
  /** True for characters dealt only if more guests arrive than the cast; nobody's objective may point at them. */
  spare?: boolean;
};

export type RubricElement = {
  id: string;
  label: string;
  points: number;
  all: Pattern;
  forbid?: AnyOf;
  /**
   * Survivors lived the Keeper's story, so they know some answers without investigating.
   * true: every survivor knows it; "killer": only the survivor who bought the vial does.
   * A survivor earns a reduced share of an element they already knew (see INSIDER_CREDIT).
   */
  survivorKnows?: boolean | "killer";
};

export type Question = {
  id: string;
  mystery: MysteryId;
  prompt: string;
  /** The words a guest sees under the box. */
  hint: string;
  points: number;
  type: "text" | "guest";
  /** For text questions: what earns points. Per-killer questions take their rubric from the killer's survivor card. */
  rubric: RubricElement[];
  /** For guest questions: which truth supplies the answer. */
  truth?: "killer";
  /** For "why" questions: build the rubric from the killer's motive instead. */
  fromKillerMotive?: boolean;
  /**
   * For the Butler and the killer only: this question stands in for another one (their "who" and "how"
   * are free for them), is worth the same, and is not counted for anyone else.
   */
  alternateFor?: string;
};

export type Truth = {
  keeperName: string;
  killerFallback: GuestId | null;
};
