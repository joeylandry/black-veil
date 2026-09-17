import { eventConfig } from "@/config/event";
import { setStorageValue } from "@/lib/use-storage-value";

export type CtfProgress = {
  solved: string[];
  score: number;
  updatedAt: string;
};

export type CtfService = {
  submitFlag(challengeId: string, submission: string): Promise<{ correct: boolean; progress: CtfProgress }>;
};

/**
 * Flags are checked server-side in /api/ctf/submit against the full challenge data
 * in src/data/ctf.ts, which this module never imports, so correct answers never
 * ship in client JS. The response is mirrored to localStorage purely as a UI
 * cache; the ctf_solves table in Postgres is the source of truth.
 */
export const remoteCtfService: CtfService = {
  async submitFlag(challengeId, submission) {
    const response = await fetch("/api/ctf/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, submission }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "Failed to submit flag.");
    }
    const result = (await response.json()) as { correct: boolean; progress: CtfProgress };
    setStorageValue(eventConfig.storageKeys.ctfProgress, JSON.stringify(result.progress));
    return result;
  },
};

export const emptyCtfProgress: CtfProgress = { solved: [], score: 0, updatedAt: "" };
