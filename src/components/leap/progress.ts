"use client";

import { useCallback, useMemo } from "react";
import { progressKey } from "@/data/leap";
import type { Simulation, TrackId } from "@/data/leap/types";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";

/** One pair's progress through one lab, kept in this browser only. */
export type LabProgress = {
  done: string[];
  hints: Record<string, number>;
  pair: [string, string];
};

const empty: LabProgress = { done: [], hints: {}, pair: ["", ""] };

export function parseProgress(raw: string | null | undefined): LabProgress {
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<LabProgress>;
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [],
      hints: parsed.hints && typeof parsed.hints === "object" ? parsed.hints : {},
      pair: Array.isArray(parsed.pair) && parsed.pair.length === 2 ? [String(parsed.pair[0]), String(parsed.pair[1])] : ["", ""],
    };
  } catch {
    return empty;
  }
}

/** Three stars with no hints, two with one, one with more. */
export function missionStars(progress: LabProgress, missionId: string) {
  if (!progress.done.includes(missionId)) return 0;
  const used = progress.hints[missionId] ?? 0;
  return used === 0 ? 3 : used === 1 ? 2 : 1;
}

export function useLabProgress(trackId: TrackId, slug: string) {
  const key = progressKey(trackId, slug);
  const raw = useStorageValue(key);
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const update = useCallback(
    (change: (current: LabProgress) => LabProgress) => {
      try {
        setStorageValue(key, JSON.stringify(change(parseProgress(localStorage.getItem(key)))));
      } catch {
        // Storage unavailable (private mode): progress just won't persist.
      }
    },
    [key],
  );
  return { progress, update, ready: raw !== undefined };
}

export function labStatus(sim: Simulation, progress: LabProgress) {
  const done = sim.missions.filter((mission) => progress.done.includes(mission.id)).length;
  return { done, total: sim.missions.length, complete: done === sim.missions.length };
}
