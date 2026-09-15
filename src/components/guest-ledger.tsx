"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { InvitationCard } from "./invitation-card";
import { localRsvpService, RsvpSubmission } from "@/lib/rsvp-service";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";

type Errors = Partial<Record<"fullName" | "email" | "attending" | "dress", string>>;

export function GuestLedger() {
  const accessValue = useStorageValue(eventConfig.storageKeys.registerUnlocked);
  const savedValue = useStorageValue(eventConfig.storageKeys.rsvp);
  const [saved, setSaved] = useState<RsvpSubmission | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const storedSubmission = useMemo(() => {
    if (!savedValue) return null;
    try { return JSON.parse(savedValue) as RsvpSubmission; } catch { return null; }
  }, [savedValue]);
  const access = accessValue === undefined ? "checking" : accessValue === "true" ? "open" : "locked";
  const visibleSubmission = saved ?? storedSubmission;

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (codeInput.trim().toLowerCase() === eventConfig.finalPassphrase.toLowerCase()) {
      setStorageValue(eventConfig.storageKeys.registerUnlocked, "true");
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

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

  if (access === "checking" || savedValue === undefined) {
    return <div className="ledger-checking" aria-live="polite">Consulting the private ledger…</div>;
  }

  if (access === "locked") {
    return (
      <section className="ledger-locked">
        <div className="ledger-lock" aria-hidden="true">BV</div>
        <p className="eyebrow">Restricted volume · members only</p>
        <h1>The Guest Register Is Sealed</h1>
        <p>Your name cannot be entered until you give the old words.</p>
        <form className="ledger-code-form" onSubmit={submitCode}>
          <label>
            <span className="sr-only">The old words</span>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              value={codeInput}
              onChange={(event) => { setCodeInput(event.target.value); setCodeError(false); }}
              placeholder="The old words"
              aria-invalid={codeError}
              aria-describedby={codeError ? "code-error" : undefined}
            />
          </label>
          <button className="button-link" type="submit">Unseal the register</button>
        </form>
        {codeError && <small id="code-error" className="field-error">AUTHENTICATION REFUSED. The register does not recognize you.</small>}
        <small>Those who have not found the words should begin in the <Link href="/archive">archive</Link>.</small>
      </section>
    );
  }

  if (visibleSubmission) {
    return (
      <div className="ledger-success ledger-success-complete">
        <header>
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
