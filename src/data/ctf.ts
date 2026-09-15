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
    briefing: "One guest vanished in 1923. The building plan omits the last place he was seen.",
    clue: "Consult the Crowe clipping. Submit the location as two words joined by an underscore.",
    hint: "He did not leave by the front entrance.",
    flag: "VEIL{WEST_STAIR}",
  },
  {
    id: "released-property",
    number: "II",
    title: "Property Improperly Released",
    points: 150,
    briefing: "An evidence receipt records a living object surrendered to an unnamed representative of management.",
    clue: "Identify the evidence number and object, joined by underscores.",
    hint: "The incomplete police inventory knows both pieces.",
    flag: "VEIL{ITEM_7_BLACK_ROSE}",
  },
  {
    id: "cabinet-owner",
    number: "III",
    title: "The Cabinet Owner",
    points: 200,
    briefing: "The hidden archival record points to a restricted account. Management assumed obscurity was security.",
    clue: "Use the archival terminal. The hidden 1926 file names the account.",
    hint: "An ordinary listing is not sufficient. The answer is a surname.",
    flag: "VEIL{VALE}",
  },
  {
    id: "last-login",
    number: "IV",
    title: "The Interrupted Session",
    points: 250,
    briefing: "Mr. Vale’s last authenticated session ended at a time repeated throughout the archive.",
    clue: "Breach the ledger and submit the four digits without punctuation.",
    hint: "Read the last-login line after authentication.",
    flag: "VEIL{1147}",
  },
  {
    id: "thread-in-the-rose",
    number: "V",
    title: "A Thread in the Rose",
    points: 300,
    briefing: "The final room is not printed in this dossier. Its name is woven into the restricted page itself.",
    clue: "Inspect the black rose’s thread. Two words; one underscore.",
    hint: "An engineer may examine the page more closely than an ordinary guest.",
    flag: "VEIL{MOURNING_PARLOUR}",
  },
];

export const maxCtfScore = ctfChallenges.reduce((total, challenge) => total + challenge.points, 0);
