"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Overview = {
  stats: {
    guests: number;
    attending: number;
    regrets: number;
    solves: number;
    pendingClaims: number;
    characters: number;
    assigned: number;
  };
  challenges: { id: string; label: string; track: "trials" | "bench"; solves: number }[];
  guests: {
    id: string;
    fullName: string;
    email: string;
    attending: "yes" | "no" | null;
    solves: number;
    points: number;
    character: { name: string; occupation: string } | null;
  }[];
  characters: {
    id: string;
    name: string;
    occupation: string;
    factions: string[];
    murderer: boolean;
    victim: boolean;
    active: boolean;
    assignedTo: string | null;
  }[];
};

/** The staff view of the whole register: counts, solves per challenge, guests, and the cast. */
export function AdminDashboard({ secret, refreshKey }: { secret: string; refreshKey: number; onChange?: () => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "The register could not be read.");
      return;
    }
    setError(null);
    setData(await response.json());
  }, [secret]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  // Live: flags guests submit show up in the tiles, chart and guest table without a reload.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function signInAs(guestId: string) {
    setBusy(true);
    const response = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ guestId }),
    });
    if (response.ok) {
      // /resume/restored loads that guest's register into this browser, then opens the ledger.
      router.push("/resume/restored");
      return;
    }
    setNotice("Could not sign in as that guest.");
    setBusy(false);
  }

  if (error) return <p className="field-error" role="alert">{error}</p>;
  if (!data) return <div className="ledger-checking">Reading the register…</div>;

  const { stats } = data;
  const tiles = [
    { label: "Names on the register", value: stats.guests, note: `${stats.attending} attending · ${stats.regrets} regrets` },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-tiles" aria-label="Register at a glance">
        {tiles.map((tile) => (
          <div className="admin-tile" key={tile.label}>
            <span>{tile.label}</span>
            <strong>{tile.value}</strong>
            <small>{tile.note}</small>
          </div>
        ))}
      </section>

      <section className="admin-panel">
        <h2>Guests</h2>
        {notice && <p className="admin-notice" role="status">{notice}</p>}
        <p className="admin-panel-note">Sign in as any guest to see the site exactly as they do, character card included. Sign back in as yourself from this table.</p>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>RSVP</th>
                <th className="numeric">Points</th>
                <th>Character</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.guests.map((guest) => (
                <tr key={guest.id}>
                  <td>
                    <strong>{guest.fullName}</strong>
                    <small>{guest.email}</small>
                  </td>
                  <td>{guest.attending === "yes" ? "Attending" : guest.attending === "no" ? "Regrets" : "—"}</td>
                  <td className="numeric">{guest.points}</td>
                  <td>{guest.character ? guest.character.name : <span className="character-sealed">None</span>}</td>
                  <td>
                    <button type="button" disabled={busy} onClick={() => signInAs(guest.id)}>Sign in as</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
