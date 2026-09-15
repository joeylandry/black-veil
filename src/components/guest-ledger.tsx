"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { localRsvpService, RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";

type Errors = Partial<Record<"fullName" | "email" | "attending" | "dress", string>>;

export function GuestLedger() {
  const savedValue = useStorageValue(eventConfig.storageKeys.rsvp);
  const [saved, setSaved] = useState<RsvpSubmission | null>(null);
  const [errors, setErrors] = useState<Errors>({});
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

    if (fullName.length < 2) nextErrors.fullName = "Enter the real name management should place on the register.";
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
    await localRsvpService.save(submission);
    setSaved(submission);
  }

  if (savedValue === undefined) {
    return <div className="ledger-checking" aria-live="polite">Opening the register…</div>;
  }

  if (visibleSubmission) {
    return (
      <section className="ledger-success">
        <div className="ledger-success-stamp">Entered</div>
        <p className="eyebrow">Guest register · October 1926</p>
        <h1>Your name has been entered<br />upon the guest register.</h1>
        <p className="registered-name">{visibleSubmission.fullName}</p>
        <div className="management-found-file">
          <p>The management of The Black Veil has located your file.</p>
          <strong>Further correspondence will follow.</strong>
        </div>
        <p className="rsvp-storage-note">This prototype entry is stored only on this device and has not yet been transmitted to event management.</p>
        <div className="ledger-success-actions">
          <Link href="/invitation" className="button-link">Open your invitation</Link>
          <Link href="/archive" className="artifact-link">Return to the case file</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="ledger-form" onSubmit={submit} noValidate>
      <header>
        <p className="eyebrow">Private guest register · Manchester · 1926</p>
        <h1>Enter your name.</h1>
        <p>Use your real name. A fictional identity will be prepared only after attendance is confirmed.</p>
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
      <p className="prototype-note">Prototype register: submissions remain in this browser until a permanent event backend is connected.</p>
      <button className="ledger-submit" type="submit">Enter my name upon the register</button>
    </form>
  );
}
