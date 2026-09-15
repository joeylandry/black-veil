export type CtfChallenge = {
  id: string;
  number: string;
  title: string;
  points: number;
  briefing: string;
  clue: string;
  hint: string;
  flag: string;
};

export const ctfChallenges: CtfChallenge[] = [
  {
    id: "unmapped-passage",
    number: "I",
    title: "The Unmapped Passage",
    points: 100,
    briefing: "Three catalog cards disagree about where The Black Veil stood.",
    clue: "Consult A Door Without an Address. Submit the most specific two-word location written on the third card.",
    hint: "The note points toward the Merrimack rather than Elm Street.",
    flag: "VEIL{RIVER_SIDE}",
  },
  {
    id: "second-annotation",
    number: "II",
    title: "The Second Annotation",
    points: 150,
    briefing: "The last masquerade photograph carries two notes in different hands.",
    clue: "Submit the darker annotation as three words joined by underscores.",
    hint: "The reverse of the photograph disputes the first note.",
    flag: "VEIL{NOT_THE_LAST}",
  },
  {
    id: "cabinet-account",
    number: "III",
    title: "The Cabinet Account",
    points: 200,
    briefing: "The hidden 1926 record names the account entrusted with the sealed ledger.",
    clue: "Use the archival terminal. Submit the account name as one word.",
    hint: "An ordinary directory listing does not reveal the record.",
    flag: "VEIL{KEEPER}",
  },
  {
    id: "interrupted-session",
    number: "IV",
    title: "The Interrupted Session",
    points: 250,
    briefing: "The ledger account's final authenticated session ended during the 1924 masquerade.",
    clue: "Unlock the ledger and submit the final-login time as four digits.",
    hint: "The time agrees with one witness and contradicts another.",
    flag: "VEIL{1147}",
  },
  {
    id: "thread-in-the-rose",
    number: "V",
    title: "A Thread in the Rose",
    points: 300,
    briefing: "The last room is not printed in the public dossier. Its name is woven into this restricted page.",
    clue: "Inspect the Black Rose page more closely. Two words; one underscore.",
    hint: "An investigator may examine the page source as carefully as any physical record.",
    flag: "VEIL{MERRIMACK_ROOM}",
  },
];

export const maxCtfScore = ctfChallenges.reduce((total, challenge) => total + challenge.points, 0);
