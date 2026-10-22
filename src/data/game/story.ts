/**
 * The story as told to people: the brief on the door, the rules card, Cassie's letter and the
 * Final Edition that explains everything at the end. SERVER-ONLY: the final edition spoils.
 */
import { characterById, survivors } from "./index";

/** What is publicly known about 1924, and the rules of the night, as the card on every guest's page and at the door. */
export { brief1924 } from "../brief";

export const rulesCard: string[] = [
  "Your card has three tabs. Public is what everyone knows. Background is your history and what to wear. Private is yours alone: your secrets, your five objectives, and anything you must not say aloud.",
  "The host starts the game by pressing one button, and every card opens at once. From then on the room is a cocktail party. Mingle, trade, bargain. Each objective is worth one point.",
  "Later in the evening a body will be found. There is no town hall and no host to rule on anything. Question whom you like. Nobody is forced to answer.",
  "Nothing is ever taken from anyone. Props change hands by a deal, and nobody brings anything: whatever you carry is handed to you at the door. Hidden game pieces are only in shared rooms, never in bedrooms, bathrooms, closets or drawers.",
  "Some objectives happen in the room, not on your phone: you do them for real, tap Claim, and the host gives you an approval word to type once it is confirmed.",
  "Walk, do not run, and keep your drink in your hand.",
  "Type your answers into your phone whenever you like, and as often as you like. Only your last answer to each question counts. The site will not tell you whether you were right; nobody will, until the end.",
  "Points come from your five objectives (5), the survivors you name (up to 4), and above all the three mysteries: the Old, the New and the Connection (10). Each group also races for one extra point. Finish every objective and never work out the story and you cannot win.",
];

export const cassieLetter: string[] = [
  "To the guests of the Black Veil, and to the old man on the floor:",
  "Two years ago I walked out of this house by the river door and told twenty-two people the plan was a clean one. The plan was mine. The betrayal was not.",
  "I wrote “the massacre” myself, in stage blood and borrowed blanks, so that the town would stop looking for the people I meant to set free. They were to have new names and the money in the Merrimack Room. I did not know that the man I trusted with the books meant to keep them, and the money, and the silence.",
  "I am alive. I have been alive in another name, with a bad shoulder and a good memory, and I have known all along that five of you lived. I kept the pin and the dial. He never got either.",
  "He sent nineteen of you black envelopes of his own, to be the town's respectable witnesses while he crowned himself and called it a succession. I sent five, unsigned, to the five he could not finish. I wanted this room full of people who would believe me. Some of you have been looking for him a long time. Some of you only came to see.",
  "The Keeper's books are in the vault behind the Merrimack Room's second window. It takes three keys and a dial: his ring, the Silent Partner's brass key, and my pin. I have the pin and I have the dial. Tomorrow the books go to Boston, to a district attorney I trust, and everyone named in them will have the chance to be sorry in person.",
  "The veil has lifted. Pour the bartender a drink.",
  "— C.",
];

export type FinalEdition = {
  headline: string;
  killerName: string;
  paragraphs: string[];
  survivors: { cover: string; real: string; title: string; markerNo: number }[];
  letter: string[];
};

/** The explanation read out and shown on every phone when results are published. */
export function finalEdition(killerSlug: string): FinalEdition {
  const killer = characterById.get(killerSlug);
  const info = killer?.survivor;
  return {
    headline: "THE VEIL HAS LIFTED",
    killerName: killer?.name ?? killerSlug,
    paragraphs: [
      "1924. Cassie Castello planned an exit. On All Hallows' Eve her people were to slip out of the Black Veil under masks while the town believed there had been a massacre: stage blood from Luke Shelldon's carnival, blank cartridges from Adam Holdsfire's shop, a story the papers could not check. Nobody died that night. The guests fled, the police came, and the papers wrote “massacre.” The members were promised new names and a share of the vault.",
      "The Keeper, Kit Kessler, her bookkeeper, was one of the four who witnessed the plan on the private landing. As the music stopped he left with Cassie by the river door. At the launch he ambushed her and took the books. She escaped with a bandaged shoulder to Rebecca Chow's boarding house, where Kit paid $200 to have her forgotten. Then he took over the Veil.",
      "Kit prepared the List: twenty-two names, each with a place to lie quiet. He hired hitmen to settle them. Seventeen died in “accidents” over the next year. Every order and every receipt that appeared to come from Cassie was forged by the Veil's Notary under threat, in a hand that rings its i's. Five survived the hitmen: Crane, Lyle, Ballard, Marek and Pike. Kit never learned it.",
      "1926. Cassie, in hiding, knew all along that the five had lived. She sent them five unsigned black envelopes of her own, so that they would be in one room with the man who tried to kill them. Kit sent nineteen black envelopes, signed only “The House,” to the town's respectable people, each of whom owed him a secret kept. At half past nine he meant to crown himself the new head of the Black Veil with every one of them signing for him, and to have Cassie declared dead so the vault and the books would pass to him.",
      `Tonight the one who got to the Butler first was ${killer?.name ?? killerSlug}, who paid the House a numbered marker for its single vial of nux vomica, and put it in the Keeper's nine-o'clock rye.${info ? ` Why: ${info.grievance}` : ""}`,
    ],
    survivors: survivors.map((character) => ({
      cover: character.name,
      real: character.survivor!.veilName,
      title: character.survivor!.veilTitle,
      markerNo: character.survivor!.markerNo,
    })),
    letter: cassieLetter,
  };
}

/**
 * The tie-breaker is a secret clue, earned only if needed. Nothing about it is printed on a card or in the
 * rules. A second rail stub (Manchester to Boston, 11:12 PM, one way) is sewn into the lining of the dead
 * man's jacket. If two guests tie on total points, the host asks the tied guests this question aloud:
 * only a guest who searched the lining knows the answer.
 */
export const tieBreaker = {
  question: "At what time did the Keeper's train out of Manchester leave?",
  answer: "11:12 in the evening (11:12 PM)",
  clue: "A second rail stub sewn into the lining of the dead man's jacket: Boston & Maine, Manchester to Boston, 23 October, 11:12 PM, one way.",
};

/** The chronology, for the story bible. Only what the game needs. */
export const timeline: { when: string; what: string }[] = [
  { when: "Dec 1921", what: "Cassandra “Cassie” Castello opens the Black Veil above the Merrimack. Kit Kessler keeps its books. The Mahns family is the Silent Partner." },
  { when: "1922–23", what: "The Amoskeag strike, Canadian liquor on the river, protection by the quarter. The Veil is where it all gets settled." },
  { when: "Oct 1924", what: "Federal pressure builds. Cassie plans the Exit: a staged massacre as cover, new names and a vault payout for twenty-two members." },
  { when: "31 Oct 1924, 23:02", what: "A party of four goes up to the private landing: C.C., K.K., J.M. (the Silent Partner) and E.L. (the Notary). The Exit Compact is witnessed." },
  { when: "31 Oct 1924, 23:30", what: "Stage blood, breakaway furniture and blanks make a massacre. The guests flee, the police come, and they report it." },
  { when: "31 Oct 1924, 23:47", what: "The music stops. Kit signs out of the register. At the launch Kit ambushes Cassie and takes the books; she escapes, wounded, to Rebecca Chow's boarding house, and Kit pays Rebecca $200 to forget Room 3." },
  { when: "After", what: "Kit takes over the Veil and hires hitmen against the twenty-two. Seventeen are settled in “accidents,” and three orders in Cassie's hand are shown to a court; they are forged by the Notary under duress. Five survive. Kit never learns it." },
  { when: "Cassie", what: "Hiding, and believed dead. She knows the five lived." },
  { when: "Oct 1926", what: "Nineteen black envelopes signed “The House” go out, and five unsigned ones from Cassie." },
  { when: "22 Oct 1926", what: "Kit Kessler returns to Manchester and asks the Butler for the Merrimack Room and a rye at nine o'clock." },
  { when: "23 Oct 1926, 20:00", what: "The party. Five survivors under fake identities compete for the House's single vial." },
  { when: "23 Oct 1926, 21:00", what: "The nightcap is served. The House is closed." },
  { when: "23 Oct 1926, 21:15", what: "The Butler finds the Keeper dead, and screams." },
  { when: "23 Oct 1926, 21:30", what: "The hour Kit had set to crown himself head of the Black Veil." },
];
