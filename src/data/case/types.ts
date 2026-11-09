/**
 * The shapes of the case file. An exhibit is a document made of blocks, so a newspaper, a
 * police form, a telegram and a ledger page all render from the same data without baking
 * text into images.
 *
 * Inline text can carry redactions: `{{x:12}}` renders as a black bar about twelve
 * characters wide. Use them for what the 1926 censors blacked out, never to hide what a
 * week's finding asks for: findings must be answerable from the visible text.
 */

export type Block =
  | { t: "masthead"; name: string; line: string }
  | { t: "headline"; text: string; size?: "xl" | "l" | "m" }
  | { t: "deck"; text: string }
  | { t: "byline"; text: string }
  | { t: "p"; text: string }
  | { t: "fields"; rows: [label: string, value: string][] }
  | { t: "table"; head: string[]; rows: string[][]; note?: string }
  | { t: "image"; src: string; alt: string; caption: string; size?: "small" }
  | { t: "stamp"; text: string; tone?: "red" | "ink" }
  | { t: "sign"; name: string; title: string }
  | { t: "margin"; text: string }
  | { t: "box"; title: string; text: string[] }
  | { t: "statement"; who: string; role: string; text: string[] }
  | { t: "wire"; meta: string; lines: string[] }
  | { t: "rule" };

export type ExhibitKind =
  | "newspaper"
  | "report"
  | "clipping"
  | "card"
  | "wire"
  | "ledger"
  | "memo"
  | "notebook"
  | "order";

export type Person = { name: string; role: string; note: string };

export type Exhibit = {
  week: number;
  slug: string;
  /** "Exhibit 245-01" and so on. */
  number: string;
  kind: ExhibitKind;
  title: string;
  /** The in-world date of the document. */
  dated: string;
  /** One line for the file index once the exhibit is unsealed. */
  summary: string;
  blocks: Block[];
  /** What is wrong with the scan. The week's simulation is pitched as the fix for it. */
  damage: string;
  /** Lines added to "What the file says so far" once this exhibit is unsealed. */
  notes: string[];
  /** People this exhibit names for the first time. */
  persons: Person[];
  /** The week's question. The answer lives server-side in answers.ts. */
  finding: { prompt: string; help?: string };
};

/** A paper from the file's front matter: open to every reader, not tied to a week. */
export type CaseRecord = Pick<Exhibit, "slug" | "number" | "kind" | "title" | "dated" | "summary" | "blocks"> & {
  /** Short date for lists, typed the way the notes are: "DEC. 15, 1924". */
  filed?: string;
};

export type Sprint = {
  week: number;
  /** In-world work-order number for the week's restoration. */
  workOrder: string;
  exhibitSlug: string;
  simulation: {
    /** Shown before and after the simulation exists. */
    title: string;
    /**
     * The "purpose of this simulation is to…" line that ties the week's curriculum to the
     * exhibit. Placeholder copy until the curriculum is mapped; rewrite it when a lab lands.
     */
    pretext: string;
    /**
     * The lab that runs for this week (an id from src/data/bench.ts, or a new lab). Null shows
     * the slot as "arrives with this sprint".
     */
    labId: string | null;
  };
};
