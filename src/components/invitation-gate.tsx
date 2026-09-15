"use client";

import Link from "next/link";
import { useMemo } from "react";
import { eventConfig } from "@/config/event";
import { RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";
import { InvitationCard } from "./invitation-card";

export function InvitationGate() {
  const saved = useStorageValue(eventConfig.storageKeys.rsvp);
  const rsvp = useMemo(() => {
    if (!saved) return null;
    try { return JSON.parse(saved) as RsvpSubmission; } catch { return null; }
  }, [saved]);
  const state = saved === undefined ? "checking" : rsvp ? "ready" : "locked";

  if (state === "checking") return <div className="ledger-checking">Breaking the wax…</div>;
  if (state === "locked") {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Private enclosure</p>
        <h1>This envelope bears no name.</h1>
        <p>The invitation is revealed only after a guest has entered the register under their real name.</p>
        <Link href="/guest-ledger" className="button-link">Open the guest register</Link>
      </section>
    );
  }
  return <InvitationCard fullName={rsvp?.fullName} />;
}
