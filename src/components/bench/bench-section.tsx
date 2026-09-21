"use client";

import Link from "next/link";
import { useMemo } from "react";
import { benchLabs, benchSolveId, maxBenchScore } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { CtfProgress, emptyCtfProgress } from "@/lib/ctf-service";
import { useStorageValue } from "@/lib/use-storage-value";

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try {
    return JSON.parse(raw) as CtfProgress;
  } catch {
    return emptyCtfProgress;
  }
}

/** The engineering track, listed apart from the Manchester trials. */
export function BenchSection() {
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const progress = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const solvedCount = benchLabs.filter((lab) => progress.solved.includes(benchSolveId(lab.id))).length;

  return (
    <section className="bench-section" id="restoration-bench" aria-label="The Restoration Bench">
      <header className="bench-section-header">
        <p className="eyebrow">Second track · present-day work</p>
        <h2>The Restoration Bench</h2>
        <p>
          The archive you have been reading was digitised by people who left their own mess behind: a dropped register
          entry, a register merged badly, a vault that hands records to anyone who asks. Twelve restoration tickets are
          open. Each one is carried on a slip in the right-hand column of the newspaper it concerns, and none of them is
          answered by guessing — the bench runs your work and tells you what failed.
        </p>
        <p className="bench-section-count">
          {solvedCount} of {benchLabs.length} tickets closed · {maxBenchScore} points on the bench
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
