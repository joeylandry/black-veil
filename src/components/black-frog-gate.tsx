"use client";

import Link from "next/link";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { CtfGame } from "./ctf-game";

export function BlackFrogGate() {
  const saved = useStorageValue(eventConfig.storageKeys.rsvp);
  const state = saved === undefined ? "checking" : saved ? "ready" : "locked";

  if (state === "checking") return <div className="ledger-checking" aria-live="polite">Consulting the ledger…</div>;

  if (state === "locked") {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Restricted postscript</p>
        <h1>This record is not yet yours to read.</h1>
        <p>The Black Frog trials open only to names already entered in the guest ledger.</p>
        <Link href="/guest-ledger" className="button-link">Go to the guest ledger</Link>
      </section>
    );
  }

  return <CtfGame />;
}
