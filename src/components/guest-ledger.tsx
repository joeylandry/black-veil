"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { InvitationCard } from "./invitation-card";
import { localRsvpService, RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";

type Errors = Partial<Record<"fullName" | "email" | "attending" | "dress", string>>;

export function GuestLedger() {
  const accessValue = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const savedValue = useStorageValue(eventConfig.storageKeys.rsvp);
  const [saved, setSaved] = useState<RsvpSubmission | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const storedSubmission = useMemo(() => {
    if (!savedValue) return null;
    try { return JSON.parse(savedValue) as RsvpSubmission; } catch { return null; }
  }, [savedValue]);
  const access = accessValue === undefined ? "checking" : accessValue === "true" ? "open" : "locked";
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

    if (fullName.length < 2) nextErrors.fullName = "Enter the name by which management may know you.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid address for private correspondence.";
    if (!attending) nextErrors.attending = "Indicate whether a place should be laid.";
    if (!dressAcknowledged) nextErrors.dress = "Acknowledge the house dress requirement.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const submission: RsvpSubmission = {
      fullName,
      email,
      attending,
      note,
      dressAcknowledged,
      recordedAt: new Date().toISOString(),
    };
    await localRsvpService.save(submission);
    setSaved(submission);
  }

  if (access === "checking") {
    return <div className="ledger-checking" aria-live="polite">Consulting the private ledger…</div>;
  }

  if (access === "locked") {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">BV</div>
        <p className="eyebrow">Restricted volume · members only</p>
        <h1>The Guest Ledger Is Sealed</h1>
        <p>Your name cannot be entered until the archive grants access. Management has left no public password.</p>
        <Link href="/archive" className="button-link">Return to the historical archive</Link>
        <small>Begin with the record that should not exist.</small>
      </section>
    );
  }

  if (visibleSubmission) {
    return (
      <div className="ledger-success">
        <header>
          <p className="eyebrow">Entry no. 47 · {visibleSubmission.attending === "yes" ? "place reserved" : "regrets received"}</p>
          <h1>Attendance Recorded</h1>
          <p>This entry is stored on this device for the prototype. It has not yet been delivered to management.</p>
          <div className="ledger-success-actions">
            <Link href="/invitation" className="button-link">Open private invitation</Link>
            <Link href="/black-rose" className="button-link">Enter the Black Rose trials</Link>
          </div>
        </header>
        <InvitationCard fullName={visibleSubmission.fullName} />
      </div>
    );
  }

  return (
    <form className="ledger-form" onSubmit={submit} noValidate>
      <header>
        <p className="eyebrow">Private membership volume · opened by authority</p>
        <h1>Guest Ledger</h1>
        <p>Enter one name only. Aliases will be assigned inside.</p>
      </header>
      <div className="ledger-fields">
        <label>
          <span>Full name</span>
          <input name="fullName" autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "name-error" : undefined} />
          {errors.fullName && <small id="name-error" className="field-error">{errors.fullName}</small>}
        </label>
        <label>
          <span>Email for private correspondence</span>
          <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <small id="email-error" className="field-error">{errors.email}</small>}
        </label>
        <fieldset>
          <legend>Shall management lay a place?</legend>
          <label className="radio-line"><input type="radio" name="attending" value="yes" /> Yes, I shall attend.</label>
          <label className="radio-line"><input type="radio" name="attending" value="no" /> No, I must send regrets.</label>
          {errors.attending && <small className="field-error">{errors.attending}</small>}
        </fieldset>
        <label>
          <span>A note for management <em>optional</em></span>
          <textarea name="note" rows={4} maxLength={500} />
        </label>
        <label className="checkbox-line">
          <input type="checkbox" name="dressAcknowledged" />
          <span>I understand that 1920s formal attire and a masquerade mask are expected.</span>
        </label>
        {errors.dress && <small className="field-error">{errors.dress}</small>}
      </div>
      <p className="prototype-note">Prototype notice: this submission is saved only in this browser. No permanent RSVP backend is connected yet.</p>
      <button className="ledger-submit" type="submit">Enter my name in the ledger</button>
    </form>
  );
}
