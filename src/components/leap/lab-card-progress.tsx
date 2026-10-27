"use client";

import { getSimulation } from "@/data/leap";
import type { TrackId } from "@/data/leap/types";
import { labStatus, useLabProgress } from "./progress";

/** The progress line on a lab card, read from this browser's saved progress. */
export function LabCardProgress({ trackId, slug }: { trackId: TrackId; slug: string }) {
  const { progress, ready } = useLabProgress(trackId, slug);
  const sim = getSimulation(trackId, slug);
  if (!sim || !ready) return <span className="leap-card-state">Not started</span>;
  const status = labStatus(sim, progress);
  if (status.complete) {
    return (
      <span className="leap-card-state done">
        {sim.badge.emoji} {sim.badge.name}
      </span>
    );
  }
  if (status.done) {
    return (
      <span className="leap-card-state going">
        {status.done}/{status.total} missions
      </span>
    );
  }
  return <span className="leap-card-state">Not started</span>;
}
