"use client";

import { FormEvent, useEffect, useState } from "react";

type AdminClaim = {
  id: string;
  label: string;
  note: string;
  points: number | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  guestFullName: string;
  guestEmail: string;
};

const adminSecretKey = "black-veil-admin-secret";

export function AdminClaims() {
  const [secret, setSecret] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [claims, setClaims] = useState<AdminClaim[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(adminSecretKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSecret(stored);
    } catch {
      // sessionStorage unavailable — fall back to entering the passphrase each visit
    }
  }, []);

  async function load(withSecret: string) {
    setError(null);
    const response = await fetch("/api/admin/claims?status=pending", {
      headers: { Authorization: `Bearer ${withSecret}` },
    });
    if (!response.ok) {
      setError("That passphrase was rejected.");
      setClaims(null);
      try {
        sessionStorage.removeItem(adminSecretKey);
      } catch {
        // ignore
      }
      setSecret(null);
      return;
    }
    const body = await response.json();
    setClaims(body.claims);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (secret) load(secret);
  }, [secret]);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      sessionStorage.setItem(adminSecretKey, secretInput);
    } catch {
      // ignore
    }
    setSecret(secretInput);
  }

  async function decide(id: string, decision: "approved" | "rejected", points?: number) {
    if (!secret) return;
    const response = await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ decision, points }),
    });
    if (response.ok) {
      setClaims((current) => (current ?? []).filter((claim) => claim.id !== id));
    }
  }

  if (!secret) {
    return (
      <form className="ledger-form admin-unlock" onSubmit={unlock} noValidate>
        <header>
          <p className="eyebrow">Staff only</p>
          <h1>Claim queue</h1>
        </header>
        <div className="ledger-fields">
          <label>
            <span>Admin passphrase</span>
            <input type="password" value={secretInput} onChange={(event) => setSecretInput(event.target.value)} required />
          </label>
        </div>
        {error && <small className="field-error" role="alert">{error}</small>}
        <button className="ledger-submit" type="submit">Unlock</button>
      </form>
    );
  }

  return (
    <div className="admin-claims">
      <header>
        <p className="eyebrow">Staff only · pending</p>
        <h1>Claim Queue</h1>
        <button type="button" className="button-link" onClick={() => load(secret)}>Refresh</button>
      </header>
      {error && <p className="field-error" role="alert">{error}</p>}
      {claims && claims.length === 0 && <p>Nothing pending.</p>}
      {claims && claims.length > 0 && (
        <ul className="admin-claims-list">
          {claims.map((claim) => (
            <AdminClaimRow key={claim.id} claim={claim} onDecide={decide} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminClaimRow({
  claim,
  onDecide,
}: {
  claim: AdminClaim;
  onDecide: (id: string, decision: "approved" | "rejected", points?: number) => void;
}) {
  const [points, setPoints] = useState("50");

  return (
    <li className="admin-claim">
      <div>
        <strong>{claim.label}</strong>
        <p>{claim.guestFullName} · {claim.guestEmail}</p>
        {claim.note && <p className="admin-claim-note">{claim.note}</p>}
      </div>
      <div className="admin-claim-actions">
        <input type="number" min={0} value={points} onChange={(event) => setPoints(event.target.value)} aria-label="Points to award" />
        <button type="button" onClick={() => onDecide(claim.id, "approved", Number(points))}>Approve</button>
        <button type="button" onClick={() => onDecide(claim.id, "rejected")}>Reject</button>
      </div>
    </li>
  );
}
