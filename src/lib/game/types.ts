/**
 * Shapes shared by the grader, the scorer and the services. No game data is imported here,
 * so these are safe to use anywhere; the grader that fills them in is server-only.
 */

export type SubmissionKind = "objective" | "exhibit" | "mystery" | "survivors";
// "exhibit" is kept so old rows still load; filing pages no longer scores and new filings are refused.

/** One thing a guest typed. Guests may submit as often as they like; the latest per item counts. */
export type Submission = {
  /** The character slug, not the database guest id. */
  guest: string;
  kind: SubmissionKind;
  itemId: string;
  answer: string;
  proof: string;
  /** Milliseconds since the epoch. */
  at: number;
};

export type GameEvent =
  | { kind: "vial-attempt"; guest: string; at: number; sold: boolean }
  | { kind: "vial-sold"; guest: string; by: string | null; at: number }
  | { kind: "dose"; guest: string; at: number };

export type Verdict = "accept" | "partial" | "reject";

export type GradeKind = SubmissionKind | "bonus";

/**
 * One graded item for one guest. `needsReview` means the automatic grade is only provisional:
 * the answer was ambiguous, or it is free text a human or Claude should read. Once Claude or
 * staff decide, `source` changes and the flag clears.
 */
export type GradeItem = {
  guest: string;
  kind: GradeKind;
  itemId: string;
  verdict: Verdict;
  points: number;
  max: number;
  rationale: string;
  needsReview: boolean;
  source: "auto" | "claude" | "staff";
};

/** A decision from Claude or staff on one item. Points may be anything from 0 to the item's max. */
export type VerdictOverride = {
  guest: string;
  kind: GradeKind;
  itemId: string;
  verdict: Verdict;
  points: number;
  rationale: string;
  source: "claude" | "staff";
};

export type Truth = {
  /** The survivor who bought the vial, or null if nobody did and staff have not decided. */
  killer: string | null;
  /** Characters actually in the room. Everyone not listed is treated as a no-show. */
  present: string[];
  /** Tie-breaker seed, printed on the Final Edition so anyone can audit it. */
  seed: string;
};

export type Tiers = {
  objectives: number;
  survivors: number;
  mysteries: number;
  /** The extra point for winning the group's race. */
  race: number;
  /** The wallet bonus: ending among the quarter of the room that gained the most money. */
  cash: number;
};

export type Standing = {
  guest: string;
  name: string;
  circle: string;
  survivor: boolean;
  total: number;
  tiers: Tiers;
  /** Points from the "who did it" question, a tie-breaker. */
  killerPoints: number;
  lastSubmissionAt: number;
  rank: number;
  circleRank: number;
  /** Everything auto-graded or decided, for the guest's own results page. */
  items: GradeItem[];
};

export type Standings = {
  standings: Standing[];
  winner: string | null;
  circleChampions: Record<string, string | null>;
  killer: string | null;
  /** Items still waiting for a decision. */
  pendingReview: number;
  awards: { id: string; title: string; guest: string | null; detail: string }[];
};
