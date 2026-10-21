"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { RecoverForm } from "./recover-form";
import { remoteRsvpService, RsvpSubmission } from "@/lib/rsvp-service";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";

type Errors = Partial<Record<"fullName" | "email" | "attending" | "dress", string>>;

export function GuestLedger() {
  const savedValue = useStorageValue(eventConfig.storageKeys.rsvp);
  const [saved, setSaved] = useState<RsvpSubmission | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const storedSubmission = useMemo(() => {
    if (!savedValue) return null;
    try { return JSON.parse(savedValue) as RsvpSubmission; } catch { return null; }
  }, [savedValue]);
  const visibleSubmission = saved ?? storedSubmission;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const attending = String(form.get("attending") || "") as "yes" | "no";
    const note = String(form.get("note") || "").trim();
    const dressAcknowledged = form.get("dressAcknowledged") === "on";
    const nextErrors: Errors = {};

    if (fullName.length < 2) nextErrors.fullName = "Enter the real name management should place in the ledger.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid address for further correspondence.";
    if (!attending) nextErrors.attending = "Indicate whether a place should be held.";
    if (!dressAcknowledged) nextErrors.dress = "Acknowledge the house dress requirement.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const submission: RsvpSubmission = {
      fullName,
      email,
      attending,
      note,
      dressAcknowledged,
      attendanceStatus: attending === "yes" ? "confirmed" : "declined",
      recordedAt: new Date().toISOString(),
    };
    setSubmitError(null);
    try {
      await remoteRsvpService.save(submission);
      // Entering a name opens the rest of the site; there are no old words to give any more.
      setStorageValue(eventConfig.storageKeys.puzzleComplete, "true");
      setStorageValue(eventConfig.storageKeys.registerUnlocked, "true");
      setSaved(submission);
      // The register remembers guests by email: someone re-entering their name on a new
      // device picks up the flags they already solved instead of starting from zero.
      fetch("/api/me")
        .then((response) => (response.ok ? response.json() : null))
        .then((me) => { if (me?.ctf) setStorageValue(eventConfig.storageKeys.ctfProgress, JSON.stringify(me.ctf)); })
        .catch(() => {});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save RSVP.");
    }
  }

  if (savedValue === undefined) {
    return <div className="ledger-checking" aria-live="polite">Consulting the private ledger…</div>;
  }

  if (visibleSubmission) {
    return (
      <div className="ledger-success-actions ledger-actions-only">
        <Link href="/invitation" className="button-link">Open private invitation</Link>
        <Link href="/game" className="button-link">Open the game</Link>
      </div>
    );
  }

  return (
    <>
    <RecoverForm />
    <form className="ledger-form ledger-form-new" onSubmit={submit} noValidate>
      <header>
        <p className="eyebrow">Private guest ledger · Manchester · 1926</p>
        <h2 className="ledger-new-title">New here? Enter your name.</h2>
        <p>Use your real name. A fictional identity will be prepared only after attendance is confirmed.</p>
        <p>Kindly reply by {eventConfig.rsvpDeadlineShort}.</p>
      </header>
      <div className="ledger-fields">
        <label>
          <span>Full legal or preferred name</span>
          <input name="fullName" type="text" autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "name-error" : undefined} />
          {errors.fullName && <small id="name-error" className="field-error">{errors.fullName}</small>}
        </label>
        <label>
          <span>Email for private correspondence</span>
          <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <small id="email-error" className="field-error">{errors.email}</small>}
        </label>
        <fieldset>
          <legend>Shall management hold a place?</legend>
          <label className="radio-line"><input type="radio" name="attending" value="yes" /> Yes, I shall attend.</label>
          <label className="radio-line"><input type="radio" name="attending" value="no" /> I must send regrets.</label>
          {errors.attending && <small className="field-error">{errors.attending}</small>}
        </fieldset>
        <label>
          <span>A private note <em>optional</em></span>
          <textarea name="note" rows={4} maxLength={500} />
        </label>
        <label className="checkbox-line">
          <input type="checkbox" name="dressAcknowledged" />
          <span>I understand that 1920s formal attire and a masquerade mask are expected.</span>
        </label>
        {errors.dress && <small className="field-error">{errors.dress}</small>}
      </div>
      {submitError && <small className="field-error" role="alert">{submitError}</small>}
      <button className="ledger-submit" type="submit">Enter my name in the ledger</button>
    </form>
    </>
  );
}
