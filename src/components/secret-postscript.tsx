"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { bonusChallenges } from "@/data/ctf";
import { CtfProgress, emptyCtfProgress, remoteCtfService } from "@/lib/ctf-service";
import { useStorageValue } from "@/lib/use-storage-value";

const challenge = bonusChallenges.find((item) => item.id === "postscript")!;

/** The unlisted postscript flag. Checked on the server like every trial, and scored onto the register. */
export function SecretPostscript() {
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const storedProgress = useMemo<CtfProgress>(() => {
    if (!savedProgress) return emptyCtfProgress;
    try { return JSON.parse(savedProgress) as CtfProgress; } catch { return emptyCtfProgress; }
  }, [savedProgress]);
  const [incorrect, setIncorrect] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const solved = storedProgress.solved.includes(challenge.id);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setSubmitError(null);
    try {
      const result = await remoteCtfService.submitFlag(challenge.id, String(form.get("flag") || ""));
      setIncorrect(!result.correct);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit flag.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ledger-locked">
      <div className="ledger-lock" aria-hidden="true">?</div>
      <p className="eyebrow">Off the record</p>
      <h1>A Postscript No One Was Meant to Find.</h1>
      <p>Nothing here was printed in any dossier. If something led you to this page, it should also have led you to a flag.</p>
      {solved ? (
        <p className="flag-correct" role="status">◆ Flag accepted · {challenge.points} points entered</p>
      ) : (
        <>
          <form className="ledger-code-form" onSubmit={submit}>
            <label>
              <span className="sr-only">Flag</span>
              <input
                type="text"
                name="flag"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="VEIL{…}"
                aria-invalid={incorrect}
                aria-describedby={incorrect ? "postscript-error" : undefined}
              />
            </label>
            <button className="button-link" type="submit" disabled={busy}>Enter finding</button>
          </form>
          {incorrect && <small id="postscript-error" className="field-error">Finding rejected. Look again.</small>}
          {submitError && (
            <small className="field-error" role="alert">
              {submitError} Only names on the <Link href="/guest-ledger">guest register</Link> can be scored — on a new device, <Link href="/resume">resume your register</Link>.
            </small>
          )}
        </>
      )}
    </section>
  );
}
