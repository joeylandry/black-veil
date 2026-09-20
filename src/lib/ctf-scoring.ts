import { benchLabs, benchSolveId } from "@/data/bench";
import { ctfChallenges } from "@/data/ctf";
import { ctfFlags } from "@/data/ctf-flags";

/** Server-only: checks a submitted flag against the real value. Never import this from a "use client" file. */
export function verifyFlag(challengeId: string, submission: string) {
  const challenge = ctfChallenges.find((item) => item.id === challengeId);
  const flag = ctfFlags[challengeId];
  if (!challenge || !flag) return { valid: false, points: 0 };
  const correct = flag.toUpperCase() === submission.trim().toUpperCase();
  return { valid: correct, points: challenge.points };
}

/**
 * Scores both tracks from one solved-id list: the Manchester trials by challenge id,
 * and the Restoration Bench labs by their bench- prefixed solve id.
 */
export function scoreForSolvedIds(solvedIds: string[]) {
  const solvedSet = new Set(solvedIds);
  const trials = ctfChallenges.reduce((total, challenge) => (solvedSet.has(challenge.id) ? total + challenge.points : total), 0);
  const bench = benchLabs.reduce((total, lab) => (solvedSet.has(benchSolveId(lab.id)) ? total + lab.points : total), 0);
  return trials + bench;
}
