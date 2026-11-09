"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Member = { id: string; fullName: string; email: string; teamId: string | null; points: number };
type Location = { id: string; name: string; accessCode: string; teams: { id: string; name: string }[]; members: Member[] };
type Standing = { teamId: string; name: string; locationName: string; members: number; average: number; awarded: number; score: number; rank: number };
type Run = {
  id: string;
  name: string;
  week1At: string;
  releasedThrough: number;
  weeksOpen: number;
  schedule: string[];
  standings: Standing[];
  locations: Location[];
};
type Award = { id: string; teamId: string; label: string; points: number; createdAt: string };
type Overview = { weeks: number; runs: Run[]; awards: Award[]; unplaced: { id: string; fullName: string; email: string }[] };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function AdminConsole() {
  const [staff, setStaff] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    const body = await response.json().catch(() => null);
    if (response.status === 401) {
      setStaff(false);
      return;
    }
    if (!response.ok) {
      setError(body?.error ?? "The overview could not be read.");
      return;
    }
    setError(null);
    setOverview(body as Overview);
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const body = await response.json().catch(() => null);
      setStaff(Boolean(body?.staff));
      if (body?.staff) await load();
    })();
  }, [load]);

  async function act(payload: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? "That change was refused.");
        return false;
      }
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passphrase = String(new FormData(event.currentTarget).get("passphrase") ?? "");
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    const body = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) {
      setError(body?.error ?? "Sign-in failed.");
      return;
    }
    setStaff(true);
    await load();
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setStaff(false);
    setOverview(null);
  }

  function formAct(build: (data: FormData) => Record<string, unknown>) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (await act(build(new FormData(form)))) form.reset();
    };
  }

  if (staff === null) return <p>Checking…</p>;

  if (!staff) {
    return (
      <form className="stack-form" onSubmit={signIn}>
        <label>
          Staff passphrase
          <input name="passphrase" type="password" required autoComplete="current-password" />
        </label>
        {error && (
          <p className="finding-message" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button" disabled={busy}>
          Sign in
        </button>
      </form>
    );
  }

  return (
    <div className="admin">
      <div className="admin-bar">
        <span>Signed in as staff. You can read every week of the file.</span>
        <span>
          <Link href="/file">Preview the file</Link> ·{" "}
          <button type="button" className="link-button" onClick={signOut}>
            Sign out
          </button>
        </span>
      </div>

      {error && (
        <p className="notice notice-warn" role="alert">
          {error}
        </p>
      )}

      <section className="panel">
        <h2>New run</h2>
        <p className="small">A run is one cohort: four rooms, one shared ten-week schedule. Week 1 unseals at the time you set; each week after, seven days later.</p>
        <form
          className="inline-form"
          onSubmit={formAct((data) => ({
            action: "create-run",
            name: data.get("name"),
            week1At: new Date(String(data.get("week1At"))).toISOString(),
          }))}
        >
          <input name="name" placeholder="2027 · Run 1" required />
          <input name="week1At" type="datetime-local" required aria-label="Week 1 unseals at" />
          <button type="submit" className="button" disabled={busy}>
            Create run
          </button>
        </form>
      </section>

      {overview?.runs.length === 0 && <p>No runs yet. Create one above, then add its rooms.</p>}

      {overview?.runs.map((run) => (
        <section className="panel admin-run" key={run.id}>
          <header className="admin-run-head">
            <div>
              <h2>{run.name}</h2>
              <p className="small">
                Week 1 unseals {when(run.week1At)} Boston time · {run.weeksOpen} of {overview.weeks} weeks open now
              </p>
            </div>
            <button type="button" className="link-button danger" onClick={() => act({ action: "delete-run", runId: run.id }, `Delete ${run.name}, its rooms, teams and everyone's scores? This cannot be undone.`)}>
              Delete run
            </button>
          </header>

          <details>
            <summary>Schedule and release</summary>
            <ol className="admin-schedule">
              {run.schedule.map((iso, index) => (
                <li key={iso} className={index < run.weeksOpen ? "is-open" : undefined}>
                  Week {index + 1}: {when(iso)}
                </li>
              ))}
            </ol>
            <form
              className="inline-form"
              onSubmit={formAct((data) => ({ action: "update-run", runId: run.id, releasedThrough: Number(data.get("releasedThrough")) }))}
            >
              <label>
                Open early through week
                <select name="releasedThrough" defaultValue={run.releasedThrough}>
                  {Array.from({ length: overview.weeks + 1 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? "Follow the calendar" : `Week ${i}`}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="button" disabled={busy}>
                Save
              </button>
            </form>
            <form
              className="inline-form"
              onSubmit={formAct((data) => ({ action: "update-run", runId: run.id, week1At: new Date(String(data.get("week1At"))).toISOString() }))}
            >
              <label>
                Move Week 1 to
                <input name="week1At" type="datetime-local" required />
              </label>
              <button type="submit" className="button" disabled={busy}>
                Move
              </button>
            </form>
          </details>

          <h3>Standings</h3>
          {run.standings.length ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Room</th>
                  <th>Readers</th>
                  <th>Avg</th>
                  <th>Awarded</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {run.standings.map((row) => (
                  <tr key={row.teamId}>
                    <td>{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.locationName}</td>
                    <td>{row.members}</td>
                    <td>{row.average}</td>
                    <td>{row.awarded}</td>
                    <td>
                      <strong>{row.score}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="small">No teams yet.</p>
          )}

          <form
            className="inline-form"
            onSubmit={formAct((data) => ({
              action: "award",
              teamIds: data.getAll("teamIds"),
              label: data.get("label"),
              points: Number(data.get("points")),
            }))}
          >
            <fieldset className="admin-award">
              <legend>Award points in the room</legend>
              <div className="admin-checks">
                {run.locations.flatMap((location) =>
                  location.teams.map((team) => (
                    <label key={team.id}>
                      <input type="checkbox" name="teamIds" value={team.id} /> {team.name} <span className="small">({location.name})</span>
                    </label>
                  )),
                )}
              </div>
              <input name="label" placeholder="What for (e.g. Deliberation round 1)" required />
              <input name="points" type="number" placeholder="Points" required />
              <button type="submit" className="button" disabled={busy}>
                Award
              </button>
            </fieldset>
          </form>

          <h3>Rooms</h3>
          <form className="inline-form" onSubmit={formAct((data) => ({ action: "add-location", runId: run.id, name: data.get("name") }))}>
            <input name="name" placeholder="Room name (e.g. Boston)" required />
            <button type="submit" className="button" disabled={busy}>
              Add room with six teams
            </button>
          </form>

          {run.locations.map((location) => {
            const unassigned = location.members.filter((member) => !member.teamId).length;
            return (
              <article className="admin-room" key={location.id}>
                <header className="admin-room-head">
                  <h4>{location.name}</h4>
                  <p className="admin-code" aria-label="Access code">
                    {location.accessCode}
                  </p>
                  <span className="admin-room-links">
                    <Link href={`/board/${location.id}`} target="_blank">
                      Projector board
                    </Link>{" "}
                    ·{" "}
                    <button type="button" className="link-button" onClick={() => act({ action: "new-code", locationId: location.id }, "Issue a new access code? The old one stops working.")}>
                      New code
                    </button>{" "}
                    ·{" "}
                    <button
                      type="button"
                      className="link-button danger"
                      onClick={() => act({ action: "delete-location", locationId: location.id }, `Delete ${location.name} and its teams? Its readers stay but lose their room.`)}
                    >
                      Delete room
                    </button>
                  </span>
                </header>

                <p className="small">
                  {location.members.length} readers · {location.teams.length} teams · {unassigned} without a team
                </p>
                <div className="inline-form">
                  <button type="button" className="button" disabled={busy || !unassigned} onClick={() => act({ action: "deal", locationId: location.id })}>
                    Deal {unassigned} into teams
                  </button>
                  <form className="inline-form" onSubmit={formAct((data) => ({ action: "add-team", locationId: location.id, name: data.get("name") }))}>
                    <input name="name" placeholder="New team name" required />
                    <button type="submit" className="button" disabled={busy}>
                      Add team
                    </button>
                  </form>
                </div>

                <ul className="admin-teams">
                  {location.teams.map((team) => (
                    <li key={team.id}>
                      {team.name} ({location.members.filter((member) => member.teamId === team.id).length}){" "}
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                          const name = window.prompt("Rename team", team.name);
                          if (name) act({ action: "rename-team", teamId: team.id, name });
                        }}
                      >
                        rename
                      </button>{" "}
                      <button type="button" className="link-button danger" onClick={() => act({ action: "delete-team", teamId: team.id }, `Delete team ${team.name}? Its readers become unassigned.`)}>
                        delete
                      </button>
                    </li>
                  ))}
                </ul>

                {location.members.length > 0 && (
                  <details>
                    <summary>Readers ({location.members.length})</summary>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Team</th>
                          <th>Points</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {location.members.map((member) => (
                          <tr key={member.id}>
                            <td>{member.fullName}</td>
                            <td>{member.email}</td>
                            <td>
                              <select
                                value={member.teamId ?? ""}
                                aria-label={`Team for ${member.fullName}`}
                                onChange={(event) => act({ action: "move-member", memberId: member.id, teamId: event.target.value })}
                              >
                                <option value="">No team</option>
                                {location.teams.map((team) => (
                                  <option key={team.id} value={team.id}>
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{member.points}</td>
                            <td>
                              <button
                                type="button"
                                className="link-button danger"
                                onClick={() => act({ action: "remove-member", memberId: member.id }, `Remove ${member.fullName} and their points?`)}
                              >
                                remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
              </article>
            );
          })}
        </section>
      ))}

      {overview && overview.awards.length > 0 && (
        <section className="panel">
          <h2>Awards given</h2>
          <ul className="admin-awards">
            {overview.awards.slice(0, 50).map((award) => {
              const team = overview.runs.flatMap((run) => run.locations.flatMap((location) => location.teams)).find((item) => item.id === award.teamId);
              return (
                <li key={award.id}>
                  {award.points > 0 ? "+" : ""}
                  {award.points} · {team?.name ?? "deleted team"} · {award.label}{" "}
                  <button type="button" className="link-button danger" onClick={() => act({ action: "delete-award", awardId: award.id }, "Take these points back?")}>
                    undo
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
