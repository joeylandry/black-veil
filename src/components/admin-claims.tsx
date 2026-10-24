"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminCast } from "./admin-cast";
import { AdminGrading } from "./admin-grading";

const adminSecretKey = "black-veil-admin-secret";

/** The staff office: unlock, then the cast. Nothing else for now. */
export function AdminClaims() {
  const [secret, setSecret] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!stored) {
      // When the passphrase is switched off (temporary, see eventConfig.adminOpen) the
      // session check passes with any value, so open the office straight away.
      verify("open").then((problem) => {
        if (!problem) setSecret("open");
      });
      return;
    }
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

  if (!secret) {
    return (
      <form className="ledger-form admin-unlock" onSubmit={unlock} noValidate>
        <header>
          <p className="eyebrow">Staff only</p>
          <h1>Staff office</h1>
        </header>
        <div className="ledger-fields">
          <label>
            <span>Admin passcode</span>
            <input
              type={showSecret ? "text" : "password"}
              value={secretInput}
              onChange={(event) => setSecretInput(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </label>
          <label className="admin-show">
            <input type="checkbox" checked={showSecret} onChange={(event) => setShowSecret(event.target.checked)} />
            <span>Show passcode</span>
          </label>
        </div>
        {error && <small className="field-error" role="alert">{error}</small>}
        <button className="ledger-submit" type="submit">Unlock</button>
      </form>
    );
  }

  return (
    <div className="admin-claims">
      <AdminCast secret={secret} />
      <AdminGrading secret={secret} />
    </div>
  );
}
