/**
 * What the game API sends to the browser. Defined here rather than imported from the game
 * bible, because the bible is server-only: it holds the answers.
 */
export type Line = { text: string; share: "free" | "trade" | "paid" | "secret" };

export type Errand = {
  id: string;
  kind: string;
  title: string;
  text: string;
  ask: string;
  points: number;
  prop?: { name: string };
  withNames: string[];
  house: boolean;
  approval: boolean;
  automatic: boolean;
};

export type RaceCard = { group: string; title: string; text: string; ask: string; house: boolean; points: number; slips: string[]; closed: boolean; wonByYou: boolean };

export type SurvivorCard = {
  veilName: string;
  veilTitle: string;
  markerNo: number;
  tell: string;
  realStory: string;
  escape: string;
  rules: string[];
  rivals: { name: string; circle: string }[];
};

export type Card = {
  id: string;
  name: string;
  occupation: string;
  circle: { id: string; name: string; blurb: string };
  publicBio: string;
  background: { history: string; people: string[]; wardrobe: string };
  private: {
    startingCash: number;
    carries: string[];
    secrets: Line[];
    knows: Line[];
    habit?: string;
    role?: { title: string; rules: string[] };
    survivor?: SurvivorCard;
    objectives: Errand[];
    totalPoints: number;
    race: RaceCard;
  };
};

export type FinalQuestion = { id: string; mystery: string; prompt: string; hint: string; points: number; type: "text" | "guest" };
export type DirectoryEntry = { id: string; name: string; occupation: string };

export type CardResponse =
  | { status: "sealed" | "uncast"; message: string }
  | {
      status: "ok";
      card: Card;
      secretsReleased: boolean;
      directory: DirectoryEntry[] | null;
      questions: FinalQuestion[] | null;
      state: { submissionsOpen: boolean; nightcapServed: boolean; resultsPublished: boolean };
    };

export type SavedAnswer = { kind: string; itemId: string; answer: string; proof: string; at: string };

export type ResultItem = { guest: string; kind: string; itemId: string; verdict: string; points: number; max: number; rationale: string; source: string };
export type Results = {
  publishedAt: string;
  you: { guest: string; name: string; total: number; rank: number; tiers: { objectives: number; survivors: number; mysteries: number; race: number; cash: number }; items: ResultItem[] } | null;
  board: { guest: string; name: string; survivor: boolean; total: number; rank: number; isYou: boolean }[];
  winner: string | null;
  killer: string | null;
  awards: { id: string; title: string; guest: string | null; detail: string }[];
  solution: {
    headline: string;
    killerName: string;
    paragraphs: string[];
    survivors: { cover: string; real: string; title: string; markerNo: number }[];
    letter: string[];
  };
};
