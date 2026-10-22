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
      { id: "staged", label: "It was staged: stage blood, blanks, a show", points: 5, all: [["staged", "stage", "fake", "faked", "hoax", "fabricated", "pretend", "pretended", "theatre", "theater", "blanks", "stage blood", "trick", "trickery", "a show"]] },
      { id: "nodeaths", label: "Nobody actually died that night", points: 3, all: [["nobody died", "no one died", "no deaths", "no bodies", "no body", "nobody was killed", "no one was killed", "everyone survived", "everyone lived", "nobody was hurt", "alive", "still alive"]] },
      { id: "cassie", label: "Cassie planned it", points: 2, all: [["cassie", "cassandra", "castello"]] },
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
      { id: "newnames", label: "New names, a fresh start, to be thought dead", points: 4, all: [["new name", "new names", "new identity", "new identities", "fresh start", "false name", "false names", "disappear", "disappeared", "thought dead", "believed dead", "fake their deaths", "faked their deaths", "die publicly", "new life", "new lives"]] },
      { id: "payout", label: "A payout from the vault", points: 4, all: [["payout", "paid out", "paid", "money", "share", "shares", "vault", "advance", "cash", "payment"]] },
      { id: "trust", label: "They trusted her as the boss", points: 2, all: [["trust", "trusted", "boss", "followed", "loyal", "loyalty", "leader"]] },
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
      { id: "vehicle", label: "In his nightcap (rye / whiskey)", points: 4, all: [["nightcap", "night cap", "rye", "whiskey", "whisky", "drink", "drank", "honey"]] },
      { id: "poison", label: "Strychnine / nux vomica tincture", points: 3, all: [["strychnine", "nux vomica", "poison", "tincture", "vial"]] },
      { id: "butler", label: "Bought from the Butler / the House's stock", points: 5, all: [["butler", "rebecca", "chow", "house stock", "the house", "house tincture", "house bottle"]] },
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
    hint: "There were two senders. What did each of them want?",
    points: 10,
    type: "text",
    rubric: [
      { id: "kit", label: "Kit, writing as the House, invited the nineteen regular guests", points: 3, all: [["kit", "kessler", "keeper", "old man", "the old man", "the house", "the dead man"]] },
      { id: "witnesses", label: "To be witnesses to his succession: they had to sign for him", points: 3, all: [["witness", "witnesses", "sign", "signed", "crown", "crowned", "succession", "succeed", "head of the veil", "take over", "charter"]] },
      { id: "cassie", label: "Cassie, from Montreal, invited the five survivors", points: 4, all: [["cassie", "cassandra", "castello", "montreal"]] },
    ],
  },

  // ---------------- THE REPLACEMENT QUESTIONS (the Butler and the killer only) ----------------
  // The Butler knows who bought the vial and the killer knows who poured it, so "who" and "how" are free
  // for them. They answer these two instead, worth the same, which nobody can know just by playing the part.
  {
    id: "alt-1",
    mystery: "new",
    alternateFor: "new-1",
    prompt: "What did the Keeper come to the Black Veil to do tonight, and how did he mean to do it?",
    hint: "Think about what he wanted, who he needed in the room, and why.",
    points: 16,
    type: "text",
    rubric: [
      { id: "crown", label: "He meant to crown himself the new head of the Black Veil", points: 6, all: [["crown", "crowned", "head of the veil", "head of the black veil", "take over the veil", "take the veil", "new head", "become the head", "succession", "succeed", "take the club"]] },
      { id: "witnesses", label: "With the nineteen guests as witnesses, who had to sign, held by their secrets", points: 5, all: [["witness", "witnesses", "sign", "signed", "signature", "signatures", "swear", "charter", "roll", "secrets", "leash", "blackmail"]] },
      { id: "dead", label: "Cassie had to be declared dead so the vault and books would pass to him", points: 5, all: [["declared dead", "declare her dead", "declare cassie dead", "legally dead", "certify", "certificate", "death certificate", "dead by christmas", "declared cassie dead"]] },
    ],
  },
  {
    id: "alt-2",
    mystery: "new",
    alternateFor: "new-2",
    prompt: "Where are the Keeper's books, and what does it take to open them?",
    hint: "A place, some keys, and one thing only one person could set.",
    points: 12,
    type: "text",
    rubric: [
      { id: "where", label: "In the vault behind the Merrimack Room's second window", points: 4, all: [["vault", "safe"], ["merrimack", "second window", "behind the window", "wall", "flue"]] },
      { id: "keys", label: "Three keys: the Keeper's ring, the Silent Partner's brass key, Cassie's pin", points: 5, all: [["three keys", "3 keys", "keeper's ring", "keepers ring", "silent partner", "brass key", "pin", "diamond"]] },
      { id: "dial", label: "A dial only Cassie can set", points: 3, all: [["dial", "combination"]] },
    ],
  },
];

export const questionById = new Map(questions.map((question) => [question.id, question]));

/** Which questions are replaced for the Butler and the killer. */
export const alternateOf = new Map(questions.filter((question) => question.alternateFor).map((question) => [question.alternateFor!, question.id]));

/** The mysteries are worth 100: the replacement questions stand in for questions already counted. */
export const MYSTERY_POINTS = questions.filter((question) => !question.alternateFor).reduce((total, question) => total + question.points, 0);
