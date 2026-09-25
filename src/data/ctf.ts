/**
 * Public challenge copy only — safe to import from a "use client" component.
 * Flags live in src/data/ctf-flags.ts, a separate module imported only by
 * server-only code (src/lib/ctf-scoring.ts), so answers never end up in a
 * client JS bundle even incidentally. Don't add a flag field back here.
 */
export type CtfChallenge = {
  id: string;
  number: string;
  title: string;
  points: number;
  briefing: string;
  clue: string;
  hint: string;
};

export const ctfChallenges: CtfChallenge[] = [
  {
    id: "unmapped-passage",
    number: "I",
    title: "The Unmapped Passage",
    points: 10,
    briefing: "Three accounts disagree about where The Black Veil stood.",
    clue: "Consult A Door Without an Address. Submit the most specific two-word location given by the third witness.",
    hint: "The note points toward the Merrimack rather than Elm Street.",
  },
  {
    id: "second-annotation",
    number: "II",
    title: "The Second Annotation",
    points: 15,
    briefing: "The last masquerade photograph carries two notes in different hands.",
    clue: "Submit the darker annotation as three words joined by underscores.",
    hint: "The reverse of the photograph disputes the first note.",
  },
  {
    id: "cabinet-account",
    number: "III",
    title: "The Cabinet Account",
    points: 20,
    briefing: "The hidden 1926 record names the account entrusted with the sealed ledger.",
    clue: "Use the archival terminal. Submit the account name as one word.",
    hint: "An ordinary directory listing does not reveal the record.",
  },
  {
    id: "interrupted-session",
    number: "IV",
    title: "The Interrupted Session",
    points: 25,
    briefing: "The ledger account's final authenticated session ended during the 1924 masquerade.",
    clue: "Unlock the ledger and submit the final-login time as four digits.",
    hint: "The time agrees with one witness and contradicts another.",
  },
  {
    id: "thread-in-the-rose",
    number: "V",
    title: "A Thread in the Rose",
    points: 30,
    briefing: "The last room is not printed in the public dossier. Its name is woven into this restricted page.",
    clue: "Inspect the Black Rose page more closely. Two words; one underscore.",
    hint: "An investigator may examine the page source as carefully as any physical record.",
  },
  {
    id: "uninvited-guest",
    number: "VI",
    title: "The Uninvited Guest",
    points: 35,
    briefing: "The old public page still takes reservations for a room that no longer exists.",
    clue: "Confirm a standing reservation on the archived supper-club notice. Submit the withheld guest's arrangement as two words joined by an underscore.",
    hint: "The form trusts whatever name it is given. A true statement can stand in for one.",
  },
  {
    id: "unlisted-room",
    number: "VII",
    title: "The Unlisted Room",
    points: 40,
    briefing: "The archive lists six trials for public guests. A seventh room was never entered in any directory.",
    clue: "No hallway plan and no link from the house itself will lead you to it. Only the address itself will.",
    hint: "Some doors in this house are never advertised — only remembered by those who already know the number.",
  },
];

export const maxCtfScore = ctfChallenges.reduce((total, challenge) => total + challenge.points, 0);
