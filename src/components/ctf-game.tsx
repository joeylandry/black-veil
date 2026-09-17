"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { PointClaims } from "@/components/point-claims";
import { eventConfig } from "@/config/event";
import { ctfChallenges, maxCtfScore } from "@/data/ctf";
import { CtfProgress, emptyCtfProgress, remoteCtfService } from "@/lib/ctf-service";
import { RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try { return JSON.parse(raw) as CtfProgress; } catch { return emptyCtfProgress; }
}

export function CtfGame() {
  const access = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const rsvp = useMemo(() => {
    if (!savedRsvp) return null;
    try { return JSON.parse(savedRsvp) as RsvpSubmission; } catch { return null; }
  }, [savedRsvp]);
  const storedProgress = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const [workingProgress, setWorkingProgress] = useState<CtfProgress | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect">>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const progress = workingProgress ?? storedProgress;

  if (access === undefined || savedRsvp === undefined) {
    return <div className="ledger-checking">Checking the challenge ledger…</div>;
  }

  if (access !== "true" || !rsvp) {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">V</div>
        <p className="eyebrow">Postscript withheld</p>
        <h1>The Trials Are Not Public.</h1>
        <p>Only a guest who has opened the hidden archive and entered a real name in the register may be scored.</p>
        <Link href="/archive" className="button-link">Return to the archive</Link>
      </section>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>, challengeId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitError(null);
    try {
      const result = await remoteCtfService.submitFlag(challengeId, String(form.get("flag") || ""));
      setWorkingProgress(result.progress);
      setFeedback((current) => ({ ...current, [challengeId]: result.correct ? "correct" : "incorrect" }));
      if (result.correct) event.currentTarget.reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? `${error.message} If you're on a new device or cleared this one, sign in again from the resume page.`
          : "Failed to submit flag.",
      );
    }
  }

  return (
    <div className="ctf-ledger">
      <span className="ctf-source-thread" data-thread="MERRIMACK_ROOM" aria-hidden="true" />
      <header className="ctf-header">
        <BlackVeilInsignia />
        <p className="eyebrow">Restricted postscript · rose clearance</p>
        <h1>The Black Rose Trials</h1>
        <p>Six irregularities remain across the Manchester record. Findings are rewarded. Careless guesses are remembered.</p>
        <div className="score-seal"><span>Your score</span><strong>{progress.score}</strong><small>of {maxCtfScore} points</small></div>
        {submitError && (
          <p className="field-error" role="alert">
            {submitError} <Link href="/resume">Resume from another device</Link>.
          </p>
        )}
      </header>

      <section className="ctf-challenges" aria-label="Black Rose challenges">
        {ctfChallenges.map((challenge) => {
          const solved = progress.solved.includes(challenge.id);
          return (
            <article className={`ctf-challenge ${solved ? "challenge-solved" : ""}`} key={challenge.id}>
              <div className="challenge-number"><span>{challenge.number}</span></div>
              <div className="challenge-copy">
                <div className="challenge-meta"><span>{challenge.points} points</span><span>{solved ? "Finding accepted" : "Unresolved"}</span></div>
                <h2>{challenge.title}</h2>
                <p>{challenge.briefing}</p>
                <p className="challenge-clue">{challenge.clue}</p>
                <details><summary>Request an archivist’s note</summary><p>{challenge.hint}</p></details>
                {!solved ? (
                  <form onSubmit={(event) => submit(event, challenge.id)}>
                    <label htmlFor={`flag-${challenge.id}`}>Submit flag</label>
                    <div>
                      <input id={`flag-${challenge.id}`} name="flag" placeholder="VEIL{…}" autoCapitalize="characters" autoComplete="off" spellCheck={false} />
                      <button type="submit">Enter finding</button>
                    </div>
                    {feedback[challenge.id] === "incorrect" && <small className="flag-incorrect" role="status">Finding rejected. Examine the record again.</small>}
                  </form>
                ) : <p className="flag-correct" role="status">◆ Flag accepted · {challenge.points} points entered</p>}
              </div>
            </article>
          );
        })}
      </section>

      <PointClaims />
    </div>
  );
}
