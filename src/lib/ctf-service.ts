import { eventConfig } from "@/config/event";
import { ctfChallenges } from "@/data/ctf";
import { setStorageValue } from "@/lib/use-storage-value";

export type CtfProgress = {
  solved: string[];
  score: number;
  updatedAt: string;
};

export type CtfService = {
  submitFlag(challengeId: string, submission: string, current: CtfProgress): Promise<{ correct: boolean; progress: CtfProgress }>;
};

export const localCtfService: CtfService = {
  async submitFlag(challengeId, submission, current) {
    const challenge = ctfChallenges.find((item) => item.id === challengeId);
    const correct = challenge?.flag.toUpperCase() === submission.trim().toUpperCase();
    if (!challenge || !correct || current.solved.includes(challengeId)) {
      return { correct: Boolean(correct), progress: current };
    }
    const progress = {
      solved: [...current.solved, challengeId],
      score: current.score + challenge.points,
      updatedAt: new Date().toISOString(),
    };
    setStorageValue(eventConfig.storageKeys.ctfProgress, JSON.stringify(progress));
    return { correct: true, progress };
  },
};

export const emptyCtfProgress: CtfProgress = { solved: [], score: 0, updatedAt: "" };
