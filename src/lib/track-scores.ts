import { benchLabs, benchSolveId } from "@/data/bench";
import { ctfChallenges } from "@/data/ctf";

/**
 * Splits one solved-id list into the two tracks' scores. Safe for client code: it
 * reads only point values, never flags.
 */
export function trackScores(solvedIds: string[]) {
  const solved = new Set(solvedIds);
  const trials = ctfChallenges.filter((challenge) => solved.has(challenge.id));
  const bench = benchLabs.filter((lab) => solved.has(benchSolveId(lab.id)));
  return {
    trials: trials.reduce((total, challenge) => total + challenge.points, 0),
    trialsSolved: trials.length,
    bench: bench.reduce((total, lab) => total + lab.points, 0),
    benchSolved: bench.length,
  };
}
