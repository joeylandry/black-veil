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

export function scoreForSolvedIds(solvedIds: string[]) {
  const solvedSet = new Set(solvedIds);
  return ctfChallenges.reduce((total, challenge) => (solvedSet.has(challenge.id) ? total + challenge.points : total), 0);
}
