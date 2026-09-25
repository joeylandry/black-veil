"use client";

import Link from "next/link";
import { useMemo } from "react";
import { benchLabs, benchSolveId, maxBenchScore } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { CtfProgress, emptyCtfProgress } from "@/lib/ctf-service";
import { trackScores } from "@/lib/track-scores";
import { useStorageValue } from "@/lib/use-storage-value";

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try {
    return JSON.parse(raw) as CtfProgress;
  } catch {
    return emptyCtfProgress;
  }
}

/** The engineering track, on its own page and scored apart from the Manchester trials. */
export function BenchSection() {
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const progress = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const scores = useMemo(() => trackScores(progress.solved), [progress.solved]);

  return (
    <section className="bench-section" id="restoration-bench" aria-label="The Restoration Bench">
      <header className="bench-section-header">
        <p className="eyebrow">Engineering track · present-day work</p>
        <h1>The Restoration Bench</h1>
        <p>
          The archive you have been reading was digitised by people who left their own mess behind: a dropped register
          entry, a register merged badly, a vault that hands records to anyone who asks. Twelve restoration tickets are
          open. Each one is sealed until you bring the bench word printed on its slip in the right-hand column of the
          newspaper it concerns. None of them is answered by guessing — the bench runs your work and tells you what failed.
        </p>
        <div className="score-seal"><span>Bench score</span><strong>{scores.bench}</strong><small>of {maxBenchScore} points</small></div>
        <p className="bench-section-count">
          {scores.benchSolved} of {benchLabs.length} tickets closed
        </p>
      </header>

      <ol className="bench-ticket-list">
        {benchLabs.map((lab) => {
          const closed = progress.solved.includes(benchSolveId(lab.id));
          return (
            <li key={lab.id} className={closed ? "bench-ticket closed" : "bench-ticket"}>
              <Link href={`/bench/${lab.ticket}`}>
                <span className="bench-ticket-number">{lab.ticket}</span>
                <span className="bench-ticket-copy">
                  <strong>{lab.title}</strong>
                  <em>{lab.topic}</em>
                  <small>Filed against {lab.recordTitle}</small>
                </span>
                <span className="bench-ticket-state">
                  <span>{lab.points} pts</span>
                  <span>{closed ? "Closed" : "Open"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
