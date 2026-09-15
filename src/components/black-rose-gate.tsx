"use client";

import Link from "next/link";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { CtfGame } from "./ctf-game";

export function BlackRoseGate() {
  const saved = useStorageValue(eventConfig.storageKeys.rsvp);
  const state = saved === undefined ? "checking" : saved ? "ready" : "locked";

  if (state === "checking") return <div className="ledger-checking" aria-live="polite">Consulting the register…</div>;

  if (state === "locked") {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Restricted postscript</p>
        <h1>This record is not yet yours to read.</h1>
        <p>The Black Rose trials open only to names already entered upon the guest register.</p>
        <Link href="/guest-ledger" className="button-link">Go to the guest register</Link>
      </section>
    );
  }

  return <CtfGame />;
}
