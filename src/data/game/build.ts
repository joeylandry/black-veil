/**
 * Small constructors so 120 objectives stay readable. Text may contain placeholders that
 * `renderText` (index.ts) fills in from the live data, so a renamed character or an edited
 * hiding-place hint changes everywhere at once:
 *   {prop}        the objective's prop name
 *   {hint}        the prop's hiding-place hint
 *   {name:id}     the 1926 name of a character
 */
import type { AnyOf, Pattern } from "@/lib/game/text";
import type { GuestId, Objective, PropId } from "./types";
import { props } from "./props";

export const POINTS = 1;

const codeOf = (propId: PropId) => {
  const prop = props.find((item) => item.id === propId);
  if (!prop) throw new Error(`Unknown prop ${propId}`);
  return prop.code;
};

export function find(id: string, prop: PropId): Objective {
  return {
    id,
    kind: "find",
    title: "A thing to find",
    text: "Find the {prop}. It stays where it is, in a shared room, with a small black tag taped on or beside it. {hint} Read the tag and type its code.",
    ask: "The code on the tag",
    points: POINTS,
    with: [],
    prop,
    check: { kind: "code", codes: [codeOf(prop)] },
  };
}

export function learn(
  id: string,
  title: string,
  text: string,
  ask: string,
  from: GuestId,
  alsoFrom: GuestId[],
  all: Pattern,
  options: { forbid?: AnyOf } = {},
): Objective {
  return { id, kind: "learn", title, text, ask, points: POINTS, with: [from], alsoFrom, check: { kind: "pattern", all, forbid: options.forbid } };
}

/** Learn a guest's small secret. The answer pattern is that secret's key. */
export function secretOf(id: string, target: GuestId, alsoFrom: GuestId, key: AnyOf): Objective {
  return {
    id,
    kind: "learn",
    title: `What {name:${target}} is hiding`,
    text: "Everyone has something they would rather not say. Learn {name:{target}}'s small secret, not by being told it is a secret, but by earning it.".replace("{target}", target),
    ask: "The key word or name",
    points: POINTS,
    with: [target],
    alsoFrom: [alsoFrom],
    check: { kind: "pattern", all: [key] },
  };
}

export function swap(id: string, partner: GuestId, give: PropId, get: PropId): Objective {
  return {
    id,
    kind: "swap",
    title: "A fair trade",
    text: `Strike a bargain with {name:${partner}}: your ${"{give}"} for their ${"{get}"}. It must be a deal, never a grab. When you hold it, read the code on its tag.`
      .replace("{give}", props.find((p) => p.id === give)?.name ?? give)
      .replace("{get}", props.find((p) => p.id === get)?.name ?? get),
    ask: "The code on the tag you received",
    points: POINTS,
    with: [partner],
    prop: get,
    check: { kind: "code", codes: [codeOf(get)] },
  };
}

export function money(id: string, min: number, text: string): Objective {
  return {
    id,
    kind: "money",
    title: "Money to make",
    text: `${text} Count your bills at the end and submit the total. Bartend Joe may ask to see them.`,
    ask: "Dollars in your pocket at the end",
    points: POINTS,
    with: [],
    check: { kind: "money", min },
  };
}

/** A deal that a printed slip proves: the code on the slip you are handed. */
export function deal(id: string, partners: GuestId[], title: string, text: string, ask: string, receives: PropId[]): Objective {
  return { id, kind: "role", title, text, ask, points: POINTS, with: [partners[0]], alsoFrom: partners.slice(1), check: { kind: "code", codes: receives.map(codeOf) } };
}

export function story(
  id: string,
  title: string,
  text: string,
  ask: string,
  from: GuestId,
  alsoFrom: GuestId[],
  all: Pattern,
): Objective {
  return { id, kind: "story", title, text, ask, points: POINTS, with: [from], alsoFrom, check: { kind: "pattern", all } };
}

export function role(id: string, title: string, text: string, ask: string, check: Objective["check"], withGuests: GuestId[] = []): Objective {
  return { id, kind: "role", title, text, ask, points: POINTS, with: withGuests, check };
}

// ---- the three objectives every survivor shares in shape (their content differs) ----

/** Learn the hour the Keeper takes his nightcap: the window in which the glass can be dosed. */
export function nightcapChain(id: string): Objective {
  return {
    id,
    kind: "chain",
    title: "The old man's hour",
    text: "The Keeper takes a nightcap at a fixed hour, in a fixed room. Until then the glass on his table is only a glass. Learn the hour, so you know how long you have.",
    ask: "The hour of his nightcap",
    points: POINTS,
    with: ["rebecca"],
    alsoFrom: ["anika", "silas"],
    check: { kind: "pattern", all: [["nine", "9", "9:00", "900", "9 00", "nine oclock", "9 oclock", "9pm", "9 pm"]] },
  };
}

/** Make an offer to the Butler. The Butler's phone records it whether she says yes or no. */
export function offerChain(id: string): Objective {
  return {
    id,
    kind: "chain",
    title: "Make your offer to the House",
    text: "The House keeps one bottle for the one who knows its words. The words are on a slip hidden in the kitchen under a cactus. Find it, keep it, and after a quarter to nine and before the nightcap is served at nine o'clock, say the words to the Butler at the bar and make your offer. The House counts every offer, whether the answer is yes or no.",
    ask: "In a sentence, what did the Butler say?",
    points: POINTS,
    with: ["rebecca"],
    check: { kind: "vial-attempt" },
  };
}

/** Learn why you want him dead. The answer is the survivor's own grievance, held by three other guests. */
export function motiveChain(id: string, holders: GuestId[], keys: Pattern): Objective {
  return {
    id,
    kind: "motive",
    title: "Why you?",
    text: "Find out what the Keeper did to you: what he took, or who he used to do it. The guest named below saw part of it. Either answer counts.",
    ask: "What did he do?",
    points: POINTS,
    with: [holders[0]],
    alsoFrom: holders.slice(1),
    // either half of the answer is enough: what he took, or who he used
    check: { kind: "pattern", all: [keys.flat()] },
  };
}

/** Something the host confirms in person. The guest claims it on their phone and types the host's approval word. */
export function approval(id: string, title: string, text: string, word: string, withGuests: GuestId[] = []): Objective {
  return { id, kind: "approval", title, text, ask: "The approval word from Bartend Joe", points: POINTS, with: withGuests, check: { kind: "approval", word } };
}

/** Your own small secret: tell the seeker you chose, keep it from the rival. Scored from their answers (see the `keep` check). */
export function keep(id: string, seeker: GuestId, seekerObjective: string, rival: GuestId, rivalObjective: string): Objective {
  return {
    id,
    kind: "keep",
    title: "Your own secret",
    text: `Your small secret is worth two halves. Let {name:${seeker}} earn it from you (half a point), and make sure {name:${rival}} never does (half a point). You will not be asked anything: it is scored from what they each learn. You may also sell it to anyone for $200 in House bills, but a sale to {name:${rival}} costs you that half.`,
    ask: "In a sentence, how did you manage it? (optional)",
    points: POINTS,
    with: [seeker],
    check: { kind: "keep", seeker, seekerObjective, rival, rivalObjective },
  };
}

/** Who you really were: learn your own old trade from guests who saw through your cover. */
export function who(id: string, text: string, holders: GuestId[], keys: Pattern): Objective {
  return {
    id,
    kind: "learn",
    title: "Who were you?",
    text,
    ask: "What was your real trade?",
    points: POINTS,
    with: [holders[0]],
    alsoFrom: holders.slice(1),
    check: { kind: "pattern", all: keys },
  };
}
