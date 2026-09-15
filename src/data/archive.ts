export type ArchiveFormat =
  | "newspaper"
  | "society"
  | "police"
  | "telegram"
  | "management"
  | "advertisement"
  | "correspondence"
  | "incident";

export type ArchiveRecord = {
  slug: string;
  date: string;
  year: number;
  title: string;
  format: ArchiveFormat;
  source: string;
  excerpt: string;
  body: string[];
  markings?: string[];
  rose?: boolean;
  anomaly?: boolean;
};

export const archiveRecords: ArchiveRecord[] = [
  {
    slug: "a-veil-lifted-on-bleecker-street",
    date: "September 18, 1921",
    year: 1921,
    title: "A Veil Lifted on Bleecker Street",
    format: "society",
    source: "The Metropolitan Tattler, Evening Edition",
    excerpt: "A private cellar club opens beneath a respectable hatmaker and promptly misplaces its discretion.",
    body: [
      "Last evening Mr. Silas Vale received a select company beneath the premises of Bell & Sons, where a black rose affixed to an unnumbered door admitted those whose names were remembered.",
      "The rooms—called the Mirror Hall, the Blue Room, and, rather dramatically, the Mourning Parlour—were praised for their orchestra and condemned for their lighting. Management calls the establishment The Black Veil. Its neighbors call it several less printable things.",
      "Mr. Vale insists that no spirits are served upon the premises. This is perhaps true in one sense only.",
    ],
    markings: ["Filed 21-B", "Membership list withheld"],
    rose: true,
  },
  {
    slug: "police-raid-no-arrests",
    date: "November 1, 1922",
    year: 1922,
    title: "Police Raid Suspected Speakeasy — No Arrests Made",
    format: "newspaper",
    source: "The New York Evening Register",
    excerpt: "Officers entered the Black Veil shortly after midnight and emerged without prisoners, bottles, or explanation.",
    body: [
      "Twelve patrolmen and one detective entered the private club known as The Black Veil at 12:14 yesterday morning. Despite a crowd observed entering minutes earlier, the rooms were reportedly vacant upon inspection.",
      "Captain H. Doyle denied that music continued during the search. Three residents across the street disagree. No arrests were made, no liquor was recovered, and the incident ledger bears a page removed cleanly at the binding.",
    ],
    markings: ["Clipping incomplete", "No charge entered"],
  },
  {
    slug: "the-vanishing-of-edwin-crowe",
    date: "March 17, 1923",
    year: 1923,
    title: "Local Businessman Vanishes After Evening at Black Veil",
    format: "newspaper",
    source: "The Morning Clarion",
    excerpt: "Edwin Crowe was last seen carrying a silver cigarette case into the private club’s west stairwell.",
    body: [
      "Mr. Edwin Crowe, textile importer, has not returned home since attending a private engagement at The Black Veil on Thursday. His motorcar remained outside until dawn, its lamps still burning.",
      "Club manager Silas Vale says Crowe departed by the front entrance before eleven. A coat-check ticket in Crowe’s pocketbook was numbered 47, though management maintains the cloakroom issued only forty tickets that evening.",
      "Mrs. Crowe requests that rumor cease. The police request precisely the opposite.",
    ],
    markings: ["Missing person 31-7", "See west stair plan"],
  },
  {
    slug: "all-hallows-advertisement",
    date: "October 4, 1924",
    year: 1924,
    title: "One Night Behind the Veil",
    format: "advertisement",
    source: "Unplaced printer’s proof",
    excerpt: "An unprinted advertisement for an All Hallows’ Eve masquerade, invitation and mask required.",
    body: [
      "THE BLACK VEIL invites its members to one night beyond ordinary company. All Hallows’ Eve. Eleven o’clock. Supper at twelve. Masks must remain until management gives the word.",
      "A black rose shall be accepted in place of a calling card. Guests are reminded that names spoken in the Mourning Parlour are not entered in the house ledger.",
    ],
    markings: ["CANCEL PRESS", "Plate ordered destroyed"],
    rose: true,
  },
  {
    slug: "telegram-to-mr-vale",
    date: "October 29, 1924",
    year: 1924,
    title: "Telegram to Mr. Vale",
    format: "telegram",
    source: "Western Union carbon, sender unknown",
    excerpt: "A warning arrives two days before the masquerade. Its final line was struck through twice.",
    body: [
      "VALE BLACK VEIL STOP DO NOT OPEN MIRROR HALL SATURDAY STOP LIST IS NOT YOUR LIST STOP SOME INVITATIONS BEAR NAMES OF PERSONS NOT LIVING STOP",
      "BURN THE ROSES STOP BURN THIS STOP",
    ],
    markings: ["Received 3:08 A.M.", "Delivery signature illegible"],
  },
  {
    slug: "masquerade-night-desk-note",
    date: "October 31, 1924",
    year: 1924,
    title: "Masquerade Night — Desk Memorandum",
    format: "management",
    source: "Black Veil management files",
    excerpt: "A hurried set of instructions written over an older password memorandum.",
    body: [
      "Admit only persons named in the guest ledger. Direct deliveries to the service stair. Keep the Mirror Hall locked after eleven forty-five. If the telephone rings from the Mourning Parlour, do not answer it.",
      "The archive cabinet credential remains the house flower, run together in lower case. Mr. Vale refuses another change. Security is an expense; discretion, he says, is free.",
      "Destroy this note before midnight.",
    ],
    markings: ["Recovered from ash bin", "BLACK ROSE impressed in wax"],
    rose: true,
  },
  {
    slug: "tragedy-at-halloween-masquerade",
    date: "November 1, 1924",
    year: 1924,
    title: "Tragedy at Halloween Masquerade — Black Veil Shuttered",
    format: "newspaper",
    source: "The Daily Standard, late city edition",
    excerpt: "Conflicting reports describe police, an ambulance, and guests leaving without their masks.",
    body: [
      "The Black Veil was closed by police this morning following what authorities called a grave disturbance at the private club’s annual masquerade. Witnesses disagree as to whether one person was carried from the building or three.",
      "A police spokesman confirmed no name, injury, or arrest. The establishment’s orchestra leader told this paper that the band stopped at eleven forty-seven; a surviving programme schedules the final dance at twelve fifteen.",
      "Mr. Silas Vale could not be located. By noon, black cloth covered the club’s street entrance and every mirror inside had been removed or turned to the wall.",
    ],
    markings: ["Later edition contradicts casualty count", "Page 6 column missing"],
  },
  {
    slug: "incident-report-47",
    date: "November 2, 1924",
    year: 1924,
    title: "Incident Report No. 47",
    format: "incident",
    source: "Partial police property record",
    excerpt: "An incomplete inventory of objects removed from the premises after the final masquerade.",
    body: [
      "Property logged: one broken champagne glass; two black silk masks; one silver cigarette case engraved E.C.; eleven place cards without names; one phonograph record marked LAST DANCE.",
      "The reporting officer’s narrative is absent. The evidence receipt carries no station stamp. Item seven—described only as ‘rose, fresh’—was released to an unidentified representative of management.",
    ],
    markings: ["CASE STATUS: ———", "Signature removed"],
    rose: true,
  },
  {
    slug: "one-year-behind-the-veil",
    date: "November 1, 1925",
    year: 1925,
    title: "One Year Behind the Veil",
    format: "newspaper",
    source: "The Sunday Chronicle",
    excerpt: "A retrospective finds the rooms empty, the inquiry dormant, and several questions newly inconvenient.",
    body: [
      "One year has passed since The Black Veil’s last masquerade and its abrupt closure. Police now deny that a formal inquiry ever existed, although this newspaper retains two requests from detectives for its photographs.",
      "The lease remains paid through 1927 by a company dissolved in 1920. Neighbors report that the street lamp outside the old entrance is extinguished each October 31, and that music may be heard below shortly before midnight.",
      "The reporter assigned to this retrospective resigned before publication. His notes end with four words: the ledger is wrong.",
    ],
    markings: ["Reporter: J. Mercer", "Photographs unreturned"],
  },
  {
    slug: "notice-of-continued-closure",
    date: "January 12, 1926",
    year: 1926,
    title: "Notice of Continued Closure",
    format: "management",
    source: "Posted at 17 Bleecker Street",
    excerpt: "Management denies every rumor while quietly renewing the building’s musicians’ license.",
    body: [
      "The public is advised that The Black Veil remains closed indefinitely. No rooms are available for private hire. No member list survives. Any invitation bearing the house insignia is fraudulent and should be surrendered unopened.",
      "Management further denies that the premises have been cleaned, provisioned, tuned, heated, or otherwise prepared for occupancy. Inquiries will not be answered.",
    ],
    markings: ["Paper recently replaced", "Ink not fully cured"],
  },
  {
    slug: "the-doors-open-tonight",
    date: "October 31, 1926",
    year: 1926,
    title: "The Doors Open Tonight",
    format: "correspondence",
    source: "Record origin unavailable",
    excerpt: "A new card has appeared in an archive catalog that has been untouched for two years.",
    body: [
      "To those whose invitations found them: the street entrance will remain dark. Come at the appointed hour. Bring the name you were given and the face you intend to hide.",
      "The public rooms are closed. The private rooms have never closed. Present the words at the door. If you do not know them, consult the oldest records and ask what an ordinary listing refuses to show.",
      "The Black Veil opens tonight. You have been expected.",
    ],
    markings: ["CATALOG TIME: 11:47 P.M.", "CREATED AFTER ARCHIVE CLOSURE"],
    rose: true,
    anomaly: true,
  },
];

export function getArchiveRecord(slug: string) {
  return archiveRecords.find((record) => record.slug === slug);
}
