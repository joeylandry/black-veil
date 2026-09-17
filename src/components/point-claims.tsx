"use client";

import { FormEvent, useEffect, useState } from "react";

type Claim = {
  id: string;
  label: string;
  note: string;
  points: number | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

const statusCopy: Record<Claim["status"], string> = {
  pending: "Awaiting staff review",
  approved: "Approved",
  rejected: "Not approved",
};

export function PointClaims() {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/claims")
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((body) => setClaims(body.claims))
      .catch(() => setClaims([]));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") || "").trim();
    const note = String(form.get("note") || "").trim();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, note }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to submit claim.");
      setClaims((current) => [body.claim as Claim, ...(current ?? [])]);
      event.currentTarget.reset();
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="point-claims" aria-label="Submit a finding for staff approval">
      <div className="point-claims-heading">
        <p className="eyebrow">During the event · staff-reviewed</p>
        <h2>Claim a Finding</h2>
        <p>Something you accomplished in person doesn’t check itself. Describe it, and a member of management will award points on the spot.</p>
      </div>
      <form className="point-claim-form" onSubmit={submit}>
        <label htmlFor="claim-label">What did you do?</label>
        <input id="claim-label" name="label" type="text" required minLength={3} maxLength={200} placeholder="e.g. Talked Cassandra’s attorney into a confession" />
        <label htmlFor="claim-note">Details for the reviewer <em>optional</em></label>
        <textarea id="claim-note" name="note" rows={3} maxLength={500} />
        {error && <small className="field-error" role="alert">{error}</small>}
        <button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit for approval"}</button>
      </form>
      {claims && claims.length > 0 && (
        <ul className="point-claims-list">
          {claims.map((claim) => (
            <li key={claim.id} className={`claim-${claim.status}`}>
              <strong>{claim.label}</strong>
              <span>{statusCopy[claim.status]}{claim.status === "approved" && typeof claim.points === "number" ? ` · ${claim.points} points` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
