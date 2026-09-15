"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { eventConfig } from "@/config/event";
import { ctfChallenges, maxCtfScore } from "@/data/ctf";
import { CtfProgress, emptyCtfProgress, localCtfService } from "@/lib/ctf-service";
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
  const progress = workingProgress ?? storedProgress;

  if (access === undefined || savedRsvp === undefined) return <div className="ledger-checking">Checking the challenge ledger…</div>;
  if (access !== "true" || !rsvp) {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">V</div>
        <p className="eyebrow">Postscript withheld</p>
        <h1>The Trials Are Not Public.</h1>
        <p>Only a name already entered in the guest ledger may be scored.</p>
        <Link href="/guest-ledger" className="button-link">Consult the guest ledger</Link>
      </section>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>, challengeId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await localCtfService.submitFlag(challengeId, String(form.get("flag") || ""), progress);
    setWorkingProgress(result.progress);
    setFeedback((current) => ({ ...current, [challengeId]: result.correct ? "correct" : "incorrect" }));
    if (result.correct) event.currentTarget.reset();
  }

  return (
    <div className="ctf-ledger">
      <span className="ctf-source-thread" data-thread="MOURNING_PARLOUR" aria-hidden="true" />
      <header className="ctf-header">
        <BlackVeilInsignia />
        <p className="eyebrow">Restricted postscript · rose clearance</p>
        <h1>The Black Rose Trials</h1>
        <p>Five irregularities remain in the record. Findings are rewarded. Careless guesses are merely remembered.</p>
        <div className="score-seal"><span>Your score</span><strong>{progress.score}</strong><small>of {maxCtfScore} points</small></div>
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
                    <div><input id={`flag-${challenge.id}`} name="flag" placeholder="VEIL{…}" autoCapitalize="characters" autoComplete="off" spellCheck={false} /><button type="submit">Enter finding</button></div>
                    {feedback[challenge.id] === "incorrect" && <small className="flag-incorrect" role="status">Finding rejected. Examine the record again.</small>}
                  </form>
                ) : <p className="flag-correct" role="status">◆ Flag accepted · {challenge.points} points entered</p>}
              </div>
            </article>
          );
        })}
      </section>

      <section className="leaderboard-section">
        <div className="leaderboard-heading">
          <div><p className="eyebrow">Private standings · before doors</p><h2>Challenge Ledger</h2></div>
          <p>Scores in this prototype are recorded in this browser only.</p>
        </div>
        <div className="leaderboard-table" role="table" aria-label="Black Rose standings">
          <div role="row" className="leaderboard-row leaderboard-labels"><span role="columnheader">Rank</span><span role="columnheader">Guest</span><span role="columnheader">Character</span><span role="columnheader">Flags</span><span role="columnheader">Points</span></div>
          <div role="row" className="leaderboard-row"><span role="cell">01</span><strong role="cell">{rsvp.fullName}</strong><span role="cell" className="character-sealed">Identity sealed</span><span role="cell">{progress.solved.length} / {ctfChallenges.length}</span><strong role="cell">{progress.score}</strong></div>
        </div>
        <p className="leaderboard-note">When permanent RSVP and score storage are connected, this ledger will combine every confirmed guest and their assigned character. No shared entries are fabricated in the prototype.</p>
      </section>
    </div>
  );
}
