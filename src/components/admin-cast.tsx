"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CastData = {
  released: boolean;
  guests: {
    id: string;
    fullName: string;
    email: string;
    attending: "yes" | "no" | null;
    slug: string | null;
    character: { name: string; role: string; background: string } | null;
    how: "name" | "hand" | null;
  }[];
};

/** Who is coming, who each guest will be, sign in as them, and the one button that starts the game. */
export function AdminCast({ secret }: { secret: string }) {
  const [data, setData] = useState<CastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [approvals, setApprovals] = useState<{ guest: string; title: string; word: string }[]>([]);
  const router = useRouter();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${secret}` };

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/roster", { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }).catch(() => null);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? "The cast could not be read.");
      return;
    }
    setError(null);
    setData(await response.json());
  }, [secret]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // the words the host gives out when something has really happened; read-only, staff eyes only
    fetch("/api/admin/game", { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setApprovals(Array.isArray(body?.approvals) ? body.approvals : []))
      .catch(() => setApprovals([]));
  }, [secret]);

  async function startGame() {
    if (!window.confirm("Start the game? Every guest will see their public card, private card and objectives right now.")) return;
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/game", { method: "POST", headers, body: JSON.stringify({ action: "start-game" }) }).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setNotice(result?.error ?? "The game could not be started. Try again.");
    }
    await load();
    setBusy(false);
  }

  async function signInAs(guestId: string) {
    setBusy(true);
    const response = await fetch("/api/admin/impersonate", { method: "POST", headers, body: JSON.stringify({ guestId }) }).catch(() => null);
    if (response?.ok) {
      // /resume/restored loads that guest's register into this browser, then opens their guest ledger.
      router.push("/resume/restored");
      return;
    }
    setNotice("Could not sign in as that guest.");
    setBusy(false);
  }

  if (error) return <p className="field-error" role="alert">{error}</p>;
  if (!data) return <div className="ledger-checking">Reading the register…</div>;

  const coming = data.guests.filter((guest) => guest.attending !== "no");
  const regrets = data.guests.filter((guest) => guest.attending === "no");
  const withCharacter = coming.filter((guest) => guest.character).length;
  const ordered = [...coming].sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <section className="admin-panel staff-cast" aria-label="The cast">
      <div className="staff-cast-top">
        <div>
          <p className="eyebrow">Staff only · the cast</p>
          <h2>Who is coming</h2>
          <p className="admin-panel-note">{coming.length} coming, {withCharacter} with a character{regrets.length ? `, ${regrets.length} sent regrets` : ""}.</p>
        </div>
        <div className={data.released ? "staff-release staff-release-on" : "staff-release"}>
          <strong>{data.released ? "The game has started" : "The game has not started"}</strong>
          <small>{data.released ? "Every guest can see their public card, private card and objectives." : "It opens by itself at 8:00 p.m. on the night. Press the button only to open it early."}</small>
          <button type="button" className="admin-primary" disabled={busy || data.released} onClick={startGame}>
            {data.released ? "Game started" : "Start game"}
          </button>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      {approvals.length > 0 && (
        <details className="staff-approvals">
          <summary>Approval words ({approvals.length}): give one only after you have seen it happen</summary>
          <ul>
            {approvals.map((entry) => (
              <li key={`${entry.guest}-${entry.title}`}><strong>{entry.guest}</strong>: {entry.title} → <code>{entry.word}</code></li>
            ))}
          </ul>
        </details>
      )}

      <ul className="staff-cast-list">
        {ordered.map((guest) => (
          <li key={guest.id} className={guest.character ? "staff-cast-row" : "staff-cast-row staff-cast-row-missing"}>
            <div className="staff-cast-who">
              <strong>{guest.fullName}</strong>
              <small>{guest.email}</small>
            </div>
            <div className="staff-cast-char">
              {guest.character ? (
                <>
                  <strong>{guest.character.name}</strong>
                  <small>{guest.character.role}{guest.how === "hand" ? " · cast by hand" : ""}</small>
                  <small className="staff-cast-bg">{guest.character.background}</small>
                </>
              ) : (
                <span className="character-sealed">No character matched</span>
              )}
            </div>
            <div className="staff-cast-actions">
              <button type="button" disabled={busy} onClick={() => signInAs(guest.id)}>Sign in as</button>
            </div>
          </li>
        ))}
      </ul>

    </section>
  );
}
