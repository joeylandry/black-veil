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
export function AdminDashboard({ secret, refreshKey }: { secret: string; refreshKey: number }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) {
      setError("The register could not be read.");
      return;
    }
    setError(null);
    setData(await response.json());
  }, [secret]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  async function characters(action: "assign" | "clear") {
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ action }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) setNotice(body?.error ?? "That did not work.");
    else if (action === "clear") setNotice(`Took back ${body.cleared} character${body.cleared === 1 ? "" : "s"}.`);
    else {
      setNotice(
        body.assigned
          ? `Dealt ${body.assigned} character${body.assigned === 1 ? "" : "s"} to attending guests.${body.stillWaiting ? ` ${body.stillWaiting} guest(s) still waiting — add more characters.` : ""}`
          : "Every attending guest already holds a character.",
      );
    }
    await load();
    setBusy(false);
  }

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
    { label: "Flags & tickets solved", value: stats.solves, note: "across both tracks" },
    { label: "Claims awaiting review", value: stats.pendingClaims, note: "see the queue below" },
    { label: "Characters dealt", value: `${stats.assigned} / ${stats.characters}`, note: stats.assigned ? "identities assigned" : "none assigned yet" },
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
        <h2>Solves by challenge</h2>
        <p className="admin-panel-note">How many guests have solved each trial and restoration ticket.</p>
        <SolveChart challenges={data.challenges} total={stats.guests} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>The cast</h2>
            <p className="admin-panel-note">
              {stats.characters
                ? "Dealing gives every attending guest without a character a random one. Guests who already hold one keep it."
                : "No characters are in the database yet. Run npm run demo:seed, or add them in Drizzle Studio."}
            </p>
          </div>
          <div className="admin-actions">
            <button type="button" className="admin-primary" disabled={busy || !stats.characters} onClick={() => characters("assign")}>
              Assign characters
            </button>
            <button type="button" disabled={busy || !stats.assigned} onClick={() => characters("clear")}>
              Take all back
            </button>
          </div>
        </div>
        {notice && <p className="admin-notice" role="status">{notice}</p>}
        <ul className="admin-cast">
          {data.characters.map((character) => (
            <li key={character.id} className={character.assignedTo ? "assigned" : undefined}>
              <strong>{character.name}</strong>
              <em>{character.occupation}</em>
              <span className="admin-cast-holder">{character.assignedTo ? `→ ${character.assignedTo}` : "Unassigned"}</span>
              {(character.murderer || character.victim) && (
                <span className="admin-cast-flag" title="Staff eyes only — never sent to guests">
                  {character.murderer ? "Murderer" : "Victim"} · staff only
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <h2>Guests</h2>
        <p className="admin-panel-note">Sign in as any guest to see the site exactly as they do, character card included. Sign back in as yourself from this table.</p>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>RSVP</th>
                <th className="numeric">Solved</th>
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
                  <td className="numeric">{guest.solves}</td>
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

/** One series, so one ink: horizontal bars grouped by track, value labels at the bar ends. */
function SolveChart({ challenges, total }: { challenges: Overview["challenges"]; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...challenges.map((challenge) => challenge.solves));
  const groups = [
    { track: "trials", title: "Manchester trials" },
    { track: "bench", title: "Restoration bench" },
  ] as const;

  return (
    <div className="solve-chart">
      {groups.map((group) => (
        <div key={group.track} className="solve-chart-group">
          <h3>{group.title}</h3>
          <ul>
            {challenges
              .filter((challenge) => challenge.track === group.track)
              .map((challenge) => (
                <li
                  key={challenge.id}
                  className={hovered === challenge.id ? "hovered" : undefined}
                  onMouseEnter={() => setHovered(challenge.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="solve-chart-label">{challenge.label}</span>
                  <span className="solve-chart-track">
                    <span className="solve-chart-bar" style={{ width: `${(challenge.solves / max) * 100}%` }} />
                    {hovered === challenge.id && (
                      <span className="solve-chart-tip" role="tooltip">
                        {challenge.solves} of {total} guests · {total ? Math.round((challenge.solves / total) * 100) : 0}%
                      </span>
                    )}
                  </span>
                  <span className="solve-chart-value">{challenge.solves}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
