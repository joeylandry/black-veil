import type { CaseRecord } from "./types";

/**
 * Front matter of File 245: papers clipped inside the cover, open to every reader from the
 * first day (they are backstory, not a week's exhibit, so nobody gets a head start).
 *
 * Keep them clear of what the weekly exhibits reveal. In particular the 1924 front page
 * ("Terror at the Black Toad?") is Week 5's exhibit; the clipping here is a later follow-up.
 */
export const records: CaseRecord[] = [
  {
    slug: "missing-person-castello",
    number: "Record 245-A",
    kind: "report",
    title: "Report of Missing Person: Castello, Cassandra",
    dated: "December 15, 1924",
    filed: "Dec. 15, 1924",
    summary: "Boston Police. Filed three days after the shooting at 245 Summer Street. Marked inactive within the week.",
    blocks: [
      { t: "masthead", name: "Boston Police Department", line: "Bureau of Criminal Investigation · Report of Missing Person" },
      {
        t: "image",
        src: "/evidence/cassie-portrait.png",
        alt: "Portrait of a dark-haired woman with bobbed waves and a fur collar.",
        caption: "Photograph supplied by informant.",
        size: "small",
      },
      {
        t: "fields",
        rows: [
          ["Name", "Cassandra Castello, called “Cassie”"],
          ["Age", "About 31"],
          ["Height / build", "5 ft. 6 in. · slender"],
          ["Hair / eyes", "Dark brown, bobbed and waved · brown"],
          ["Occupation", "Proprietress, supper club, 245 Summer Street (sub-cellar)"],
          ["Last seen", "About 11:47 p.m., Friday, December 12, 1924, at the rear of the premises, near the door to the Fort Point Channel"],
          ["Wearing", "Black beaded evening dress, long pearls, black veil"],
          ["Reported by", "B. Lorne, coat room attendant at the premises"],
          ["Date reported", "December 15, 1924"],
        ],
      },
      {
        t: "p",
        text: "Informant states the missing woman did not take her coat, her motorcar or her money, and would not have left without them. Mr. C. Kessler, manager of the premises, states that Miss Castello left the city of her own accord and declines to assist further.",
      },
      {
        t: "fields",
        rows: [
          ["Disposition", "No evidence of crime. Inquiry closed."],
          ["By order of", "Capt. A. Thayer, Summer Street Station"],
        ],
      },
      { t: "stamp", text: "INACTIVE · DEC 22 1924", tone: "red" },
      { t: "margin", text: "Coat still on its hook, 12/20. Nobody has asked for it. — J.H." },
    ],
  },
  {
    slug: "no-trace-of-missing-hostess",
    number: "Record 245-B",
    kind: "clipping",
    title: "No Trace of Missing Hostess",
    dated: "Saturday, December 20, 1924",
    filed: "Dec. 20, 1924",
    summary: "The Courier, a week later: police drag the Fort Point Channel and find nothing.",
    blocks: [
      { t: "masthead", name: "The Boston Night Courier", line: "Saturday, December 20, 1924 · Two Cents" },
      { t: "headline", text: "No Trace of Missing Hostess", size: "l" },
      { t: "deck", text: "Police Drag Fort Point Channel Without Result · Summer Street Cellar Stays Shut · A Reward Goes Unclaimed" },
      {
        t: "image",
        src: "/evidence/cassie-society.png",
        alt: "A woman in a dark evening dress and long pearls holds a cigarette holder at a club table.",
        caption: "Miss Castello in 1923. Courier file photograph.",
      },
      {
        t: "p",
        text: "Eight days after shots emptied a cellar club beneath 245 Summer Street, Miss Cassandra Castello, its proprietress, has not been found, and the police say they have stopped looking.",
      },
      {
        t: "p",
        text: "Two police launches dragged the Fort Point Channel behind the Hollis & Crane Leather Exchange on Thursday and brought up a chair, a length of chain and nothing else. Capt. Ambrose Thayer of the Summer Street station told the Courier the inquiry is closed. “There is no body because there is no crime,” the captain said. “The lady has gone where she likes.”",
      },
      {
        t: "p",
        text: "Not everyone agrees. A reward of $500 for word of Miss Castello was left at this newspaper's counter on Tuesday in a plain envelope, signed only “a friend of the Toad.” It has not been claimed.",
      },
      {
        t: "p",
        text: "The freight lift at No. 245 remains padlocked. The club's manager, Mr. Christopher Kessler, could not be reached.",
      },
    ],
  },
];

export function getRecord(slug: string) {
  return records.find((record) => record.slug === slug);
}

/** The people the file is about, shown on its first page. */
export const personsOfInterest: {
  name: string;
  role: string;
  status: string;
  photo: string | null;
  recordSlug: string | null;
}[] = [
  {
    name: "Cassandra “Cassie” Castello",
    role: "Proprietress, The Black Toad",
    status: "Missing since Dec. 12, 1924",
    photo: "/evidence/cassie-portrait.png",
    recordSlug: "missing-person-castello",
  },
  {
    name: "Christopher “Kit” Kessler",
    role: "The Keeper, The Black Toad",
    status: "Deceased Mar. 12, 1926",
    photo: null,
    recordSlug: null,
  },
];
