/**
 * The story as told to people: the brief on the door, the rules card, Cassie's letter and the
 * Final Edition that explains everything at the end. SERVER-ONLY: the final edition spoils.
 */
import { characterById, survivors } from "./index";

/** What is publicly known about 1924, and the rules of the night, as the card on every guest's page and at the door. */
export const brief1924: { heading: string; bullets: string[] }[] = [
  {
    heading: "All Hallows' Eve, 1924",
    bullets: [
      "The masquerade was the talk of Manchester, right up until the music stopped. The orchestra slipped in by the river door. Four masked guests slipped up to the private landing. By midnight the papers were screaming massacre, and nobody could find a body, a name, or a coroner willing to sign for one. The proprietress, Miss Cassie Castello, had vanished with the last dance.",
    ],
  },
  {
    heading: "The year after",
    bullets: [
      "A police bulletin called Cassie “a person of interest,” and then lost interest. Seventeen people with no records and no relatives met unfortunate accidents. Nobody added it up. (You may.)",
    ],
  },
  {
    heading: "Tonight",
    bullets: [
      "The black envelopes came to your door, signed by nobody you would dare name. You came anyway. Curious. A little reckless. Wear it well. Before the night is through, someone will be found dead, and the rest of you will have opinions.",
    ],
  },
  {
    heading: "Five ghosts in the room",
    bullets: [
      "Five souls the papers swore were lost are here tonight in borrowed names and borrowed faces, sipping your drinks and watching your hands. They are guests like you. Before the lights come up you may point at up to five of your fellow guests and say ghost. Be right and it pays. Be wrong and it stings.",
    ],
  },
  {
    heading: "Last call",
    bullets: ["You will be asked three things: what really happened in 1924, who did it tonight and how, and who the dead man was to the Veil."],
  },
  {
    heading: "A word to the ghosts",
    bullets: ["If you are one of the five, your private page already knows. Everyone else's has the same sealed flap with nothing behind it. Nobody can tell by looking. Keep a straight face."],
  },
];

export const rulesCard: string[] = [
  "Your card has three tabs. Public is what everyone knows. Background is your history and what to wear. Private is yours alone: your secrets, your five errands, and anything you must not say aloud.",
  "From 8:00 the room is a cocktail party. Mingle, trade, bargain. Errands earn you points; so do the pages and clues you find.",
  "Later in the evening a body will be found. There is no town hall and no host to rule on anything. Question whom you like. Nobody is forced to answer.",
  "Nothing is ever taken from anyone. Props change hands by a deal, and nobody brings anything: whatever you carry is handed to you at the door. Hidden game pieces are only in shared rooms, never in bedrooms, bathrooms, closets or drawers.",
  "Walk, do not run, and keep your drink in your hand.",
  "Type your answers into your phone whenever you like, and as often as you like. Only your last answer to each question counts. The site will not tell you whether you were right; nobody will, until the end.",
  "The book closes at the end of the night. Points come from your errands, the pages you file, the survivors you name, and above all the three mysteries: the Old, the New and the Connection. Finish every errand and never work out the story and you cannot win.",
];

export const cassieLetter: string[] = [
  "To the guests of the Black Veil, and to the old man on the floor:",
  "Two years ago I walked out of this house by the river door and told twenty-two people the plan was a clean one. The plan was mine. The betrayal was not.",
  "I wrote “the massacre” myself, in stage blood and borrowed blanks, so that the town would stop looking for the people I meant to set free. They were to have new names and the money in the Merrimack Room. I did not know that the man I trusted with the books meant to keep them, and the money, and the silence.",
  "I am alive. I have been alive in Montreal, in another name, with a bad shoulder and a good memory. I kept the pin and the dial. He never got either.",
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
      "1924. Cassie Castello planned an exit. On All Hallows' Eve her people were to slip out of the Black Veil under masks while the town believed there had been a massacre: stage blood from Luke Shelldon's carnival, blank cartridges from Adam Holdsfire's shop, a story the papers could not check. Nobody died that night. The members were promised new names and a share of the vault.",
      "The Keeper, Kit Kessler, her bookkeeper, was one of the four who witnessed the plan on the private landing at 11:02. At 11:47, as the music stopped, he left with Cassie by the river door. At the launch he ambushed her, took the books, and told the scattered members that Cassie was finished. She escaped with a bandaged shoulder and a hiding place at Rebecca Chow's boarding house.",
      "Kit prepared the List: twenty-two names, each with a place to lie quiet. He hired a man named Quill to settle them. Seventeen died in “accidents” between December 1924 and September 1925. Every order and every receipt that appeared to come from Cassie was forged by the Veil's Notary under threat, in a hand that rings its i's. Five could not be found: Crane, Lyle, Ballard, Marek and Pike.",
      "1926. Cassie, in Montreal, sent the wire that asked who prepared the list, and five unsigned black envelopes of her own, so that the five he failed to kill would be in one room with him. Kit sent nineteen black envelopes, signed only “The House,” to the town's respectable people, each of whom owed him a secret kept. At half past nine he meant to crown himself the new head of the Black Veil with every one of them signing for him, and to have Cassie declared dead so the vault and the books would pass to him. He did not know the five were in the room.",
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

/** The chronology, for the story bible. */
export const timeline: { when: string; what: string }[] = [
  { when: "Dec 1921", what: "Cassandra “Cassie” Castello opens the Black Veil above the Merrimack. Kit Kessler keeps its books. The Mahns family is the Silent Partner." },
  { when: "1922–23", what: "The Amoskeag strike, Canadian liquor on the river, protection by the quarter. The Veil is where it all gets settled." },
  { when: "Oct 1924", what: "Federal pressure builds. Cassie plans the Exit: a staged massacre as cover, new names and a vault payout for twenty-two members." },
  { when: "31 Oct 1924, 22:10", what: "The orchestra is admitted at the river door." },
  { when: "31 Oct 1924, 23:02", what: "A party of four goes up to the private landing: C.C., K.K., J.M. (the Silent Partner) and E.L. (the Notary). The Exit Compact is witnessed." },
  { when: "31 Oct 1924, 23:30", what: "Stage blood, breakaway furniture and blanks make a massacre. Guests flee and tell the papers." },
  { when: "31 Oct 1924, 23:47", what: "The music stops. Kit signs out of the register. Cassie and Kit leave by the river door. At the launch Kit ambushes her; she escapes, wounded, to Rebecca Chow's boarding house." },
  { when: "1 Nov 1924", what: "Kit tells the scattered members that Cassie is finished and places each of them somewhere to lie quiet. He pays Rebecca $200 to forget Room 3." },
  { when: "4 Nov 1924", what: "Kit prepares the List of twenty-two. A. Quill is retained on the 8th, paid from the Teller's own share." },
  { when: "Dec 1924 – Sep 1925", what: "Seventeen members are settled in “accidents.” Three orders in Cassie's hand are shown to a court; they are forged by the Notary under duress." },
  { when: "3 Mar 1925", what: "Cal Yates's aeroplane falls into Lake Massabesic." },
  { when: "21 Mar 1925", what: "Pat Dunn, the Runner's partner, is thrown into the river off the Granite Street steps." },
  { when: "30 Sep 1925", what: "Quill reports all twenty-two settled; he cannot show five. Kit does not believe him." },
  { when: "Oct 1925", what: "The survivors find Quill first and kill him. Two memorial notices (Crane, Ballard) are placed in the Farrago and withdrawn. The survivors have gone under new names." },
  { when: "22 Dec 1925", what: "Cassie's Christmas card, postmarked Manchester." },
  { when: "7 Oct 1926", what: "Nineteen black envelopes signed “The House” go out from Boston, and five unsigned ones from Montreal. A Montreal wire asks WHO PREPARED THE LIST." },
  { when: "22 Oct 1926", what: "Kit Kessler returns to Manchester and asks the Butler for the Merrimack Room and a rye at nine o'clock." },
  { when: "23 Oct 1926, 20:00", what: "The party. Five survivors under fake identities compete for the House's single vial." },
  { when: "23 Oct 1926, 21:00", what: "The nightcap is served. The House is closed." },
  { when: "23 Oct 1926, 21:15", what: "The Butler finds the Keeper dead, and screams." },
  { when: "23 Oct 1926, 21:30", what: "The hour Kit had set to crown himself head of the Black Veil." },
];
