/**
 * The Reckoning: the questions every guest answers at the end. Together the three
 * mysteries are worth 100 points, which is more than the 60 a guest can earn from every
 * objective, so a player who finishes their errands but never works out the story cannot
 * win. Rubrics are AND-of-OR patterns (see src/lib/game/text.ts); the grader pays each
 * rubric element separately so partial understanding earns partial credit.
 *
 * "Why did the killer do it" is graded against the killer's own motive, so its rubric is
 * built at grading time from that survivor's card (fromKillerMotive).
 */
import type { Question } from "./types";

export const questions: Question[] = [
  // ---------------- THE OLD MYSTERY · 30 ----------------
  {
    id: "old-1",
    mystery: "old",
    prompt: "What really happened at the Black Veil on All Hallows' Eve, 1924?",
    hint: "In a sentence or two. The papers called it a massacre.",
    points: 10,
    type: "text",
    rubric: [
      { id: "staged", label: "It was staged: stage blood, blanks, a show", points: 5, all: [["staged", "stage", "fake", "faked", "hoax", "fabricated", "pretend", "pretended", "theatre", "theater", "blanks", "stage blood", "trick", "trickery", "a show"]], survivorKnows: true },
      { id: "nodeaths", label: "Nobody actually died that night", points: 3, all: [["nobody died", "no one died", "no deaths", "no bodies", "no body", "nobody was killed", "no one was killed", "everyone survived", "everyone lived", "nobody was hurt", "alive", "still alive"]], survivorKnows: true },
      { id: "cassie", label: "Cassie planned it", points: 2, all: [["cassie", "cassandra", "castello"]], survivorKnows: true },
    ],
  },
  {
    id: "old-2",
    mystery: "old",
    prompt: "Why did the Veil's members all leave with Cassie that night?",
    hint: "What did she promise them? What did they get?",
    points: 10,
    type: "text",
    rubric: [
      { id: "newnames", label: "New names, a fresh start, to be thought dead", points: 4, all: [["new name", "new names", "new identity", "new identities", "fresh start", "false name", "false names", "disappear", "disappeared", "thought dead", "believed dead", "fake their deaths", "faked their deaths", "die publicly", "new life", "new lives"]], survivorKnows: true },
      { id: "payout", label: "A payout from the vault", points: 4, all: [["payout", "paid out", "paid", "money", "share", "shares", "vault", "advance", "cash", "payment"]], survivorKnows: true },
      { id: "trust", label: "They trusted her as the boss", points: 2, all: [["trust", "trusted", "boss", "followed", "loyal", "loyalty", "leader"]], survivorKnows: true },
    ],
  },
  {
    id: "old-3",
    mystery: "old",
    prompt: "Who killed the members afterward, and how did it look like someone else did it?",
    hint: "Name the person, and the trick that pointed away from them.",
    points: 10,
    type: "text",
    rubric: [
      { id: "kit", label: "Kit Kessler, the Keeper, was behind it", points: 5, all: [["kit", "kessler", "keeper", "bookkeeper", "k.k.", "kk", "the old man", "old man", "kit kessler"]], survivorKnows: true },
      { id: "hitman", label: "He hired a hitman (Quill)", points: 2, all: [["hitman", "hit man", "quill", "assassin", "hired killer", "hired gun", "gunman"]], survivorKnows: true },
      { id: "frame", label: "He framed Cassie with forged orders", points: 3, all: [["forged", "forge", "forger", "forgery", "framed", "frame", "blame", "blamed", "fake orders", "false orders", "forged orders"]] },
    ],
  },

  // ---------------- THE NEW MYSTERY · 40 ----------------
  {
    id: "new-1",
    mystery: "new",
    prompt: "Who poisoned the Keeper?",
    hint: "Pick one guest.",
    points: 16,
    type: "guest",
    truth: "killer",
    butlerKnows: true,
    rubric: [],
  },
  {
    id: "new-2",
    mystery: "new",
    prompt: "How was he poisoned, and where did the poison come from?",
    hint: "What was it in, and who sold it?",
    points: 12,
    type: "text",
    rubric: [
      { id: "vehicle", label: "In his nightcap (rye / whiskey)", points: 4, all: [["nightcap", "night cap", "rye", "whiskey", "whisky", "drink", "drank", "honey"]], survivorKnows: true },
      { id: "poison", label: "Strychnine / nux vomica tincture", points: 3, all: [["strychnine", "nux vomica", "poison", "tincture", "vial"]], survivorKnows: true },
      { id: "butler", label: "Bought from the Butler / the House's stock", points: 5, all: [["butler", "rebecca", "chow", "house stock", "the house", "house tincture", "house bottle"]], survivorKnows: true },
    ],
  },
  {
    id: "new-3",
    mystery: "new",
    prompt: "Why did the killer do it? What had the Keeper done to them?",
    hint: "Be specific about what was taken from the killer.",
    points: 12,
    type: "text",
    fromKillerMotive: true,
    rubric: [],
  },

  // ---------------- THE CONNECTION · 30 ----------------
  {
    id: "con-1",
    mystery: "connection",
    prompt: "Who was the dead man to the Veil, and what had he done?",
    hint: "His name, his job, and what he did to Cassie and the members.",
    points: 10,
    type: "text",
    rubric: [
      { id: "who", label: "Kit Kessler, the Keeper / bookkeeper", points: 4, all: [["kit", "kessler", "keeper", "bookkeeper", "k.k.", "kk"]], survivorKnows: true },
      { id: "list", label: "He prepared the List and had members killed", points: 3, all: [["list", "roll", "placements", "hitman", "quill", "settled", "had them killed", "had members killed", "killed the members", "killed the others"]], survivorKnows: true },
      { id: "betrayed", label: "He betrayed or ousted Cassie", points: 3, all: [["betrayed", "betrayal", "ousted", "oust", "double crossed", "double-crossed", "took over", "overthrew", "forced out", "pushed out", "took the books", "backstabbed", "turned on cassie"]] },
    ],
  },
  {
    id: "con-2",
    mystery: "connection",
    prompt: "How do the five survivors connect to him?",
    hint: "Who were they to him, and why did they come?",
    points: 10,
    type: "text",
    rubric: [
      { id: "survived", label: "They are the five who escaped his hitman, thought dead", points: 5, all: [["survivor", "survivors", "survived", "escaped", "escape", "unsettled", "five", "got away", "thought dead", "believed dead", "not found"]], survivorKnows: true },
      { id: "revenge", label: "They came for revenge or to confront him", points: 3, all: [["revenge", "avenge", "avenged", "vengeance", "payback", "confront", "kill him", "kill", "justice", "retribution"]], survivorKnows: true },
      { id: "members", label: "They were members of the Veil", points: 2, all: [["member", "members", "veil", "list", "marker", "markers"]], survivorKnows: true },
    ],
  },
  {
    id: "con-3",
    mystery: "connection",
    prompt: "Who sent the invitations, and why?",
    hint: "Where was it sent from, and what did the sender want?",
    points: 10,
    type: "text",
    rubric: [
      { id: "cassie", label: "Cassie sent them (from Montreal)", points: 6, all: [["cassie", "cassandra", "castello", "montreal"]] },
      { id: "lure", label: "To lure the Keeper and the survivors, with witnesses", points: 4, all: [["lure", "lured", "trap", "bait", "expose", "exposed", "confront", "witness", "witnesses", "draw out", "bring them", "gather", "gathered"]] },
    ],
  },
];

export const questionById = new Map(questions.map((question) => [question.id, question]));

export const MYSTERY_POINTS = questions.reduce((total, question) => total + question.points, 0);
