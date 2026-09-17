"use client";

import { FormEvent, useState } from "react";
import { eventConfig } from "@/config/event";
import { secretFlag } from "@/data/secret-flag";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";

export function SecretPostscript() {
  const solvedValue = useStorageValue(eventConfig.storageKeys.postscriptSolved);
  const [incorrect, setIncorrect] = useState(false);
  const solved = solvedValue === "true";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submission = String(form.get("flag") || "").trim().toUpperCase();
    if (submission === secretFlag.toUpperCase()) {
      setStorageValue(eventConfig.storageKeys.postscriptSolved, "true");
      setIncorrect(false);
    } else {
      setIncorrect(true);
    }
  }

  return (
    <section className="ledger-locked">
      <div className="ledger-lock" aria-hidden="true">?</div>
      <p className="eyebrow">Off the record</p>
      <h1>A Postscript No One Was Meant to Find.</h1>
      <p>Nothing here was printed in any dossier. If something led you to this page, it should also have led you to a flag.</p>
      {solved ? (
        <p className="flag-correct" role="status">◆ Flag accepted.</p>
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
            <button className="button-link" type="submit">Enter finding</button>
          </form>
          {incorrect && <small id="postscript-error" className="field-error">Finding rejected. Look again.</small>}
        </>
      )}
    </section>
  );
}
