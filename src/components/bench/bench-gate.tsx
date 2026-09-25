"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { BenchLab, benchSolveId, normalizeBenchWord } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { CtfProgress } from "@/lib/ctf-service";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";
import { BenchLabWorkbench } from "./bench-lab";

/**
 * Whether this browser still holds a signed-in session. "unknown" covers both the
 * first render and an /api/me that failed for some reason other than a lapsed
 * session — the bench opens in that case rather than accusing a signed-in guest
 * of being signed out.
 */
type SessionState = "checking" | "signed-in" | "signed-out" | "unknown";

/**
 * The bench opens to the same guests as the trials: archive access plus a real name on
 * the register. A ticket also needs a live session, since its work is graded server-side;
 * the ticket list does not.
 */
export function BenchAccessGate({ ticket, children }: { ticket?: string; children: ReactNode }) {
  const access = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const [session, setSession] = useState<SessionState>(ticket ? "checking" : "unknown");

  useEffect(() => {
    if (!ticket) return;
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
  }, [ticket]);

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
        <small>The link goes to the address on your register entry. Already signed in on another device? Work ticket {ticket} there instead.</small>
      </section>
    );
  }

  return <>{children}</>;
}

function parseList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseSolved(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as CtfProgress).solved ?? [];
  } catch {
    return [];
  }
}

/**
 * Each ticket is locked behind the bench word printed on its conservation slip in the
 * newspaper. It is a door, not a vault: the word is in plain sight, and the check runs
 * in the browser. A ticket already closed stays open.
 */
function BenchWordLock({ lab, children }: { lab: BenchLab; children: ReactNode }) {
  const savedUnlocked = useStorageValue(eventConfig.storageKeys.benchUnlocked);
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const unlocked = useMemo(() => parseList(savedUnlocked), [savedUnlocked]);
  const solved = useMemo(() => parseSolved(savedProgress), [savedProgress]);
  const [refused, setRefused] = useState(false);

  if (savedUnlocked === undefined) {
    return <div className="ledger-checking">Opening the restoration bench…</div>;
  }

  if (unlocked.includes(lab.ticket) || solved.includes(benchSolveId(lab.id))) {
    return <>{children}</>;
  }

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const attempt = normalizeBenchWord(String(new FormData(event.currentTarget).get("word") ?? ""));
    if (attempt && attempt === normalizeBenchWord(lab.benchWord)) {
      setStorageValue(eventConfig.storageKeys.benchUnlocked, JSON.stringify([...unlocked, lab.ticket]));
    } else {
      setRefused(true);
    }
  }

  return (
    <section className="ledger-locked bench-word-lock">
      <div className="ledger-lock" aria-hidden="true">R</div>
      <p className="eyebrow">{lab.ticket} · ticket sealed</p>
      <h1>{lab.title}</h1>
      <p>
        This ticket opens with the bench word printed on its conservation slip. The slip is pasted into the
        right-hand column of <Link href={`/archive/${lab.recordSlug}`}>{lab.recordTitle}</Link>.
      </p>
      <form className="bench-word-form" onSubmit={unlock}>
        <label htmlFor="bench-word">Bench word</label>
        <div>
          <input
            id="bench-word"
            name="word"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby={refused ? "bench-word-error" : undefined}
            onChange={() => setRefused(false)}
          />
          <button type="submit" className="button-link">Open the ticket</button>
        </div>
      </form>
      {refused && (
        <small id="bench-word-error" className="field-error" role="alert">
          That is not the word on the slip. Read the newspaper again.
        </small>
      )}
      <Link href="/bench">Back to the bench</Link>
    </section>
  );
}

export function BenchGate({ lab }: { lab: BenchLab }) {
  return (
    <BenchAccessGate ticket={lab.ticket}>
      <BenchWordLock lab={lab}>
        <BenchLabWorkbench lab={lab} />
      </BenchWordLock>
    </BenchAccessGate>
  );
}
