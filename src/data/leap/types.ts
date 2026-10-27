/**
 * LEAP simulations — the shapes every lab is written in.
 *
 * A simulation is a ~30 minute lab made of missions. Each mission is a short story beat,
 * a "field notes" primer, and one or more hands-on tasks the page checks on the spot.
 * The data modules are imported by the client runner directly (never passed as props),
 * so tasks may carry functions: console handlers and editor checks run in the browser.
 *
 * Answers live beside the tasks on purpose. These are training labs worked in pairs, not
 * a competition: the point is the feedback, and every check explains itself.
 */

export type TrackId = "systems-analyst" | "software-engineer";

/** One option in a quiz question. `why` is shown after the pair answers. */
export type QuizOption = { text: string; correct?: boolean; why: string };

export type QuizTask = {
  kind: "quiz";
  questions: { prompt: string; options: QuizOption[] }[];
};

/** Put the items in order. `items` is the correct order; the page shuffles it. */
export type SortTask = {
  kind: "sort";
  prompt: string;
  items: string[];
};

/** Assign every item to one of the options (a bucket, a definition, a layer…). */
export type MatchTask = {
  kind: "match";
  prompt: string;
  options: string[];
  items: { text: string; answer: string; why?: string }[];
};

/** A number is accepted within `tolerance`; strings are compared case- and space-insensitively. */
export type AnswerField = {
  label: string;
  accept: (string | number)[];
  tolerance?: number;
  placeholder?: string;
  explain?: string;
};

export type AnswersTask = {
  kind: "answers";
  prompt?: string;
  fields: AnswerField[];
};

/** Mutable state a console keeps between commands: goal flags plus anything a handler needs. */
export type ConsoleState = { flags: Set<string>; vars: Record<string, unknown> };

export type ConsoleCommand = {
  /** Matched against the trimmed command line. Capture groups are passed to `run`. */
  pattern: RegExp;
  run: (match: RegExpMatchArray, state: ConsoleState) => string[];
};

export type ConsoleTask = {
  kind: "console";
  prompt: string;
  shell: string;
  intro: string[];
  /** Shown by `help`, and listed under the console as a cheat sheet. */
  cheatsheet: string[];
  commands: ConsoleCommand[];
  /** The console task is done once every goal flag is set. */
  goals: { flag: string; label: string }[];
  /**
   * Consoles that name the same session share state and scrollback across missions, like a
   * notebook kernel that keeps running between cells. Each still checks its own goals.
   */
  session?: string;
};

export type EditorCheck = { label: string; test: (code: string) => boolean; hint?: string };

/** Edit a file; named checks run against the text, like a test suite. */
export type EditorTask = {
  kind: "editor";
  prompt: string;
  filename: string;
  starter: string;
  checks: EditorCheck[];
};

/**
 * Real JavaScript, run in a Web Worker with a time limit. The pair writes `fnName`;
 * each test calls it with `args` and deep-compares the result with `expect`.
 */
export type CodeTask = {
  kind: "code";
  prompt: string;
  filename: string;
  fnName: string;
  starter: string;
  tests: { name: string; args: unknown[]; expect: unknown }[];
};

/**
 * Real SQL against a throwaway in-memory Postgres seeded from the named dataset.
 * The result is compared with what `solution` returns on the same data.
 */
export type SqlTask = {
  kind: "sql";
  prompt: string;
  dataset: SqlDatasetId;
  starter: string;
  solution: string;
  /** When true, row order must match too (the prompt should ask for an order). */
  ordered?: boolean;
};

/** Read lines (an AI draft, a diff, a config) and flag the ones that are wrong. */
export type SpotTask = {
  kind: "spot";
  prompt: string;
  mono?: boolean;
  lines: { text: string; flag?: string; note?: string }[];
};

export type Task = QuizTask | SortTask | MatchTask | AnswersTask | ConsoleTask | EditorTask | CodeTask | SqlTask | SpotTask;

/** Reference material printed above a mission's tasks. */
export type Exhibit =
  | { kind: "table"; title: string; columns: string[]; rows: (string | number)[][] }
  | { kind: "code"; title: string; text: string }
  | { kind: "note"; title: string; lines: string[] };

export type Mission = {
  id: string;
  title: string;
  minutes: number;
  /** The story beat: what is happening on the floor right now. */
  brief: string;
  /** Field notes: the concept, in two or three sentences. */
  learn: string;
  exhibits?: Exhibit[];
  tasks: Task[];
  hints: string[];
  /** Shown when the mission clears. */
  debrief: string;
};

export type Simulation = {
  slug: string;
  week: number;
  /** The week's focus, as the curriculum names it. */
  focus: string;
  title: string;
  tagline: string;
  /** SA + SWE shared week, or track specific. */
  shared: boolean;
  tools: string[];
  /** The opening scene, read aloud by the pair before mission one. */
  story: string;
  missions: Mission[];
  /** The badge earned on completion. */
  badge: { name: string; emoji: string };
  takeaways: string[];
  /** One question per partner for the end-of-lab conversation. */
  discuss: string[];
};

export type Track = {
  id: TrackId;
  name: string;
  short: string;
  motto: string;
  summary: string;
  phases: { label: string; weeks: [number, number] }[];
  simulations: Simulation[];
};

export type SqlDatasetId = "trading";
