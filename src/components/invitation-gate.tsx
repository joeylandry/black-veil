"use client";

import Link from "next/link";
import { useMemo } from "react";
import { eventConfig } from "@/config/event";
import { RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";
import { InvitationCard } from "./invitation-card";

export function InvitationGate() {
  const access = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const saved = useStorageValue(eventConfig.storageKeys.rsvp);
  const rsvp = useMemo(() => {
    if (!saved) return null;
    try { return JSON.parse(saved) as RsvpSubmission; } catch { return null; }
  }, [saved]);
  const state = access === undefined || saved === undefined ? "checking" : access === "true" && rsvp ? "ready" : "locked";

  if (state === "checking") return <div className="ledger-checking">Breaking the wax…</div>;
  if (state === "locked") {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Private enclosure</p>
        <h1>This envelope bears no name.</h1>
        <p>The invitation is revealed only after a guest has entered the private ledger.</p>
        <Link href="/guest-ledger" className="button-link">Consult the guest ledger</Link>
      </section>
    );
  }
  return <InvitationCard fullName={rsvp?.fullName} />;
}
