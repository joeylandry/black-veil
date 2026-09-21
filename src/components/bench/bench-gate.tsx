"use client";

import Link from "next/link";
import { BenchLab } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { BenchLabWorkbench } from "./bench-lab";

/** The bench opens to the same guests as the trials: archive access plus a real name on the register. */
export function BenchGate({ lab }: { lab: BenchLab }) {
  const access = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);

  if (access === undefined || savedRsvp === undefined) {
    return <div className="ledger-checking">Opening the restoration bench…</div>;
  }

  if (access !== "true" || !savedRsvp) {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">R</div>
        <p className="eyebrow">Restoration bench withheld</p>
        <h1>This Bench Is Not Public.</h1>
        <p>Restoration tickets are worked only by guests who have opened the hidden archive and entered a real name in the register.</p>
        <Link href="/archive" className="button-link">Return to the archive</Link>
      </section>
    );
  }

  return <BenchLabWorkbench lab={lab} />;
}
