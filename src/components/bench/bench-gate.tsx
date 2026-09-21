"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BenchLab } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { BenchLabWorkbench } from "./bench-lab";

/**
 * Whether this browser still holds a signed-in session. "unknown" covers both the
 * first render and an /api/me that failed for some reason other than a lapsed
 * session — the bench opens in that case rather than accusing a signed-in guest
 * of being signed out.
 */
type SessionState = "checking" | "signed-in" | "signed-out" | "unknown";

/** The bench opens to the same guests as the trials: archive access plus a real name on the register. */
export function BenchGate({ lab }: { lab: BenchLab }) {
  const access = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const [session, setSession] = useState<SessionState>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((response) => {
        if (cancelled) return;
        if (response.ok) setSession("signed-in");
        else setSession(response.status === 401 ? "signed-out" : "unknown");
      })
      .catch(() => {
        if (!cancelled) setSession("unknown");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (access === undefined || savedRsvp === undefined || session === "checking") {
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

  // Every console command and every submission is graded against the guest's register
  // entry on the server, so a bench without a session is a bench that can only answer
  // 401s. Say so here instead of handing over a workbench that refuses each command.
  if (session === "signed-out") {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">R</div>
        <p className="eyebrow">Restoration bench withheld</p>
        <h1>Sign In To Work This Bench.</h1>
        <p>This browser remembers the archive, but its sign-in has lapsed. The bench runs your commands and grades your work on the server against your register entry, so it needs you signed in again.</p>
        <Link href="/resume" className="button-link">Send a new sign-in link</Link>
        <small>The link goes to the address on your register entry. Already signed in on another device? Work ticket {lab.ticket} there instead.</small>
      </section>
    );
  }

  return <BenchLabWorkbench lab={lab} />;
}
