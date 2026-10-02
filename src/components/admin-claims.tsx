"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminDashboard } from "./admin-dashboard";
import { AdminDatabase } from "./admin-database";
import { AdminDemoTools } from "./admin-demo-tools";

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
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Checks a passphrase before the staff office is shown, so a failure is reported on
   * the unlock form with its real cause: wrong passphrase, no ADMIN_SECRET on this
   * deployment, or a database that can't be read.
   */
  async function verify(candidate: string) {
    const check = await fetch("/api/admin/session", { headers: { Authorization: `Bearer ${candidate}` } }).catch(() => null);
    if (check?.ok) return null;
    const body = await check?.json().catch(() => null);
    return (
      body?.error ??
      (check ? `The staff office could not be opened (server error ${check.status}).` : "The site could not be reached. Check your connection.")
    );
  }

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(adminSecretKey);
    } catch {
      // sessionStorage unavailable — fall back to entering the passphrase each visit
    }
    if (!stored) return;
    verify(stored).then((problem) => {
      if (problem) {
        setError(problem);
        try {
          sessionStorage.removeItem(adminSecretKey);
        } catch {
          // ignore
        }
      } else setSecret(stored);
    });
  }, []);

  async function load(withSecret: string) {
    const response = await fetch("/api/admin/claims?status=pending", {
      headers: { Authorization: `Bearer ${withSecret}` },
    }).catch(() => null);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? "The claim queue could not be loaded.");
      setClaims(null);
      return;
    }
    setError(null);
    const body = await response.json();
    setClaims(body.claims);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (secret) load(secret);
  }, [secret]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const problem = await verify(secretInput);
    if (problem) {
      setError(problem);
      return;
    }
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
      setRefreshKey((key) => key + 1);
    }
  }

  if (!secret) {
    return (
      <form className="ledger-form admin-unlock" onSubmit={unlock} noValidate>
        <header>
          <p className="eyebrow">Staff only</p>
          <h1>Staff office</h1>
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
        <p className="eyebrow">Staff only · the register</p>
        <h1>Staff Office</h1>
        <button type="button" className="button-link" onClick={() => { load(secret); setRefreshKey((key) => key + 1); }}>Refresh</button>
      </header>
      <AdminDashboard secret={secret} refreshKey={refreshKey} onChange={() => { load(secret); setRefreshKey((key) => key + 1); }} />
      <AdminDemoTools secret={secret} onChange={() => { load(secret); setRefreshKey((key) => key + 1); }} />
      <AdminDatabase secret={secret} refreshKey={refreshKey} onChange={() => { load(secret); setRefreshKey((key) => key + 1); }} />
      <h2 className="admin-section-title">Claim queue</h2>
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
  const [points, setPoints] = useState("5");

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
