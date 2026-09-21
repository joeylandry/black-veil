import { eventConfig } from "@/config/event";
import { CtfProgress } from "@/lib/ctf-service";
import { setStorageValue } from "@/lib/use-storage-value";

export type BenchCheckResult = { name: string; passed: boolean; detail?: string };
export type BenchGradeResult = {
  passed: boolean;
  checks: BenchCheckResult[];
  log: string[];
  flag: string | null;
  progress: CtfProgress;
};

/**
 * Client half of the Restoration Bench. Work is graded in /api/bench/[ticket]; the
 * expected answers, the repository fixture, and the vault sandbox all stay on the
 * server, so nothing here can be read for a shortcut.
 */
export const benchService = {
  async run(ticket: string, history: string[]): Promise<string[]> {
    const response = await fetch(`/api/bench/${ticket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", history }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "The bench did not respond.");
    }
    const result = (await response.json()) as { output: string[] };
    return result.output;
  },

  async submit(
    ticket: string,
    submission: { files: Record<string, string>; fields: Record<string, string>; history: string[] },
  ): Promise<BenchGradeResult> {
    const response = await fetch(`/api/bench/${ticket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", ...submission }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "The bench could not grade that submission.");
    }
    const result = (await response.json()) as BenchGradeResult;
    setStorageValue(eventConfig.storageKeys.ctfProgress, JSON.stringify(result.progress));
    return result;
  },
};
