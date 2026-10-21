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

/** Who is coming, who each guest will be, sign in as them, and the one switch that shows guests their characters. */
export function AdminCast({ secret }: { secret: string }) {
  const [data, setData] = useState<CastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  async function post(body: unknown, failure: string) {
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/roster", { method: "POST", headers, body: JSON.stringify(body) }).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setNotice(result?.error ?? failure);
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
          <strong>{data.released ? "Character names are visible to guests" : "Character names are hidden"}</strong>
          <small>{data.released ? "Guests see their character and everyone's role." : "Guests see \"coming very soon\"."}</small>
          <button type="button" className="admin-primary" disabled={busy} onClick={() => post({ released: !data.released }, "That did not save.")}>
            {data.released ? "Hide character names" : "Release character names"}
          </button>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

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
