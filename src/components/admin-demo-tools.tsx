"use client";

import { FormEvent, useState } from "react";

type Action = "seed" | "load-cast" | "clear" | "reset";

/** The npm run demo:* scripts as buttons, for when there's no terminal to hand. */
export function AdminDemoTools({ secret, onChange }: { secret: string; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [email, setEmail] = useState("");

  async function run(action: Action, confirmText: string, extra: Record<string, string> = {}) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ action, ...extra }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setNotice({ ok: Boolean(response?.ok), text: body?.message ?? body?.error ?? "The site could not be reached." });
    setBusy(false);
    if (response?.ok) onChange();
  }

  function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = email.trim();
    if (!target) return;
    run("reset", `Forget ${target} completely? Their RSVP, solves, claims and sign-in links are deleted. This can't be undone.`, { email: target }).then(() => setEmail(""));
  }

  return (
    <section className="admin-panel admin-demo-tools">
      <h2>Demo tools</h2>
      <p className="admin-panel-note">
        The same as the npm run demo:* commands. Demo guests all use @demo.blackveil.invalid emails, so these never touch a real guest, except Reset, which forgets whichever email you give it.
      </p>
      <div className="admin-demo-grid">
        <div>
          <strong>Fill the register</strong>
          <p>Replaces the demo guests with 22 invented ones, their solves and claims, and reloads the 35-character cast, unassigned.</p>
          <button type="button" className="admin-primary" disabled={busy} onClick={() => run("seed", "Replace all demo guests and reload the cast? Everyone holding a character loses it.")}>
            Seed demo data
          </button>
        </div>
        <div>
          <strong>Start yourself from scratch</strong>
          <p>Forgets one guest by email, so you can do the walkthrough again as a brand-new guest.</p>
          <form onSubmit={reset} className="admin-inline-form">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email to forget" required />
            <button type="submit" disabled={busy || !email.trim()}>Reset guest</button>
          </form>
        </div>
        <div>
          <strong>After the demo</strong>
          <p>Removes every demo guest and the demo cast. Real guests stay, but lose any demo character they were holding.</p>
          <button type="button" disabled={busy} onClick={() => run("clear", "Remove every demo guest and the whole demo cast?")}>
            Clear demo data
          </button>
        </div>
      </div>
      {notice && (
        <p className={notice.ok ? "admin-notice" : "field-error"} role="status">
          {notice.text}
        </p>
      )}
    </section>
  );
}
