"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Overview = {
  state: { identitiesReleased: boolean; secretsReleased: boolean; submissionsOpen: boolean; nightcapServed: boolean; resultsPublished: boolean; absent: string[]; seed: string; killerOverride: string | null };
  cast: { slug: string; name: string; circle: string; survivor: boolean; markerNo: number | null; guest: { id: string; fullName: string } | null; absent: boolean; submissions: number }[];
  uncastGuests: { id: string; fullName: string }[];
  guests: { id: string; fullName: string }[];
  created: number;
  vial: { soldTo: { slug: string; name?: string; marker?: number } | null; attempts: { slug: string; name?: string; sold: boolean; at: string }[]; dosed: boolean };
  killer: string | null;
  castCount: number;
  grades: { source: string; needsReview: boolean; count: number }[];
  resultsPublished: boolean;
};

type StandingRow = { rank: number; name: string; circle: string; survivor: boolean; total: number; tiers: { objectives: number; exhibits: number; survivors: number; mysteries: number; poisoner: number } };

const circleNames: Record<string, string> = { gilded: "The Gilded", order: "Order & Letters", stage: "Wire & Stage", working: "Working Folk", river: "River Trade" };

const flagLabels: { key: "identitiesReleased" | "secretsReleased" | "submissionsClosed"; title: string; note: string }[] = [
  { key: "identitiesReleased", title: "Characters released", note: "Public and Background tabs. Until this is on, guests see “Characters coming very soon.”" },
  { key: "secretsReleased", title: "Private tab open", note: "Opens by itself at 7:55 PM on the 23rd. Force it open to test, or hold it shut." },
  { key: "submissionsClosed", title: "Book closed", note: "Closes by itself at 10:30 PM. Force it open if the night runs long." },
];

/** The game master's panel: switches, the cast, the House's log, and the end-of-night grading. */
export function AdminGame({ secret }: { secret: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [verdicts, setVerdicts] = useState("");
  const [standings, setStandings] = useState<StandingRow[] | null>(null);

  const headers = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${secret}` }), [secret]);

  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/game", { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }).catch(() => null);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setLoadError(body?.error ?? "The game could not be read.");
      return;
    }
    setLoadError(null);
    setOverview(await response.json());
  }, [secret]);

  async function setupDatabase() {
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/game", { method: "POST", headers: headers(), body: JSON.stringify({ action: "setup-database" }) }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setNotice(response?.ok ? "The game database is ready." : (body?.error ?? "The setup did not work."));
    await load();
    setBusy(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function act(body: Record<string, unknown>, describe: (result: Record<string, unknown>) => string) {
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/game", { method: "POST", headers: headers(), body: JSON.stringify(body) }).catch(() => null);
    const result = (await response?.json().catch(() => null)) ?? {};
    setNotice(response?.ok ? describe(result) : String(result.error ?? result.message ?? "That did not work."));
    await load();
    setBusy(false);
    return result;
  }

  async function downloadPacket() {
    const response = await fetch("/api/admin/game/packet", { headers: { Authorization: `Bearer ${secret}` } }).catch(() => null);
    if (!response?.ok) return setNotice("The packet could not be built.");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "black-veil-review-packet.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function showStandings() {
    const result = await act({ action: "standings" }, (r) => `Winner: ${String(r.winner ?? "nobody yet")}. ${String(r.pendingReview ?? 0)} items still need a second look.`);
    if (Array.isArray(result.rows)) setStandings(result.rows as StandingRow[]);
  }

  if (!overview) {
    if (!loadError) return <div className="ledger-checking">Reading the game…</div>;
    return (
      <section className="admin-panel admin-game">
        <h2>The night</h2>
        <p className="admin-notice" role="alert">{loadError}</p>
        <p className="admin-panel-note">If this is the first time the game has been opened, its tables do not exist yet. One click creates them. It only adds new tables and never touches the guest list, and it is safe to press twice.</p>
        {notice && <p className="admin-notice" role="status">{notice}</p>}
        <div className="admin-actions">
          <button type="button" className="admin-primary" disabled={busy} onClick={setupDatabase}>Set up the game database</button>
        </div>
      </section>
    );
  }
  const { state } = overview;
  const effective: Record<string, boolean> = {
    identitiesReleased: state.identitiesReleased,
    secretsReleased: state.secretsReleased,
    submissionsClosed: !state.submissionsOpen && state.secretsReleased,
    nightcapServed: state.nightcapServed,
  };
  const pending = overview.grades.filter((row) => row.needsReview && row.source === "auto").reduce((total, row) => total + row.count, 0);
  const graded = overview.grades.reduce((total, row) => total + row.count, 0);
  const survivors = overview.cast.filter((entry) => entry.survivor);

  return (
    <section className="admin-panel admin-game">
      <div className="admin-panel-heading">
        <div>
          <h2>The night</h2>
          <p className="admin-panel-note">Switches, the cast, the House&rsquo;s log and the end-of-night grading. The same rules as <code>npm run game:grade</code>.</p>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <div className="admin-game-guide">
        <strong>How the night works</strong>
        <ol>
          <li><b>Before the party:</b> create the characters, give each registered guest one, then turn on <i>Characters released</i> so guests can see who they are.</li>
          <li><b>At 7:55 PM:</b> the Private tab opens by itself. That&rsquo;s where each guest sees their secrets and errands.</li>
          <li><b>During the party:</b> the Butler sells the one vial to the first survivor who shows a marker. That guest is the Poisoner. You stage the old man&rsquo;s death.</li>
          <li><b>At 10:30 PM:</b> answers lock by themselves. Then run the grading below and publish the results.</li>
        </ol>
      </div>

      <h3 className="admin-section-title">1 · Switches</h3>
      <p className="admin-panel-note">Each switch is <b>On</b>, <b>Off</b> or <b>Auto</b> (follows the clock). Leave them on Auto unless you&rsquo;re testing.</p>
      <div className="admin-game-flags">
        {flagLabels.map((flag) => (
          <div className="admin-flag" key={flag.key}>
            <strong>{flag.title}</strong>
            <span className={`admin-flag-state ${effective[flag.key] ? "on" : "off"}`}>{effective[flag.key] ? "On now" : "Off now"}</span>
            <small>{flag.note}</small>
            <div className="admin-row-actions">
              <button type="button" disabled={busy} onClick={() => act({ action: "set-flag", key: flag.key, value: true }, () => `${flag.title}: forced on.`)}>On</button>
              <button type="button" disabled={busy} onClick={() => act({ action: "set-flag", key: flag.key, value: false }, () => `${flag.title}: forced off.`)}>Off</button>
              <button type="button" disabled={busy} onClick={() => act({ action: "set-flag", key: flag.key, value: null }, () => `${flag.title}: back to the clock.`)}>Auto</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="admin-section-title">2 · Who plays whom</h3>
      <p className="admin-panel-note">
        {overview.created === 0
          ? "No characters exist yet. Press the button below first."
          : `${overview.castCount} of ${overview.cast.length} characters have a guest.`}{" "}
        &ldquo;Fill in by name&rdquo; matches each registered guest to the character written for them. After that you can change anyone by hand: pick a different guest from a character&rsquo;s dropdown, or choose &ldquo;nobody&rdquo; to free it up. A guest can only hold one character, so picking someone who already has one moves them.
      </p>
      <div className="admin-actions">
        <button type="button" className="admin-primary" disabled={busy} onClick={() => act({ action: "seed-cast" }, (r) => `Created ${r.created}, refreshed ${r.updated}. Cast ${r.assigned} guests, kept ${r.kept}. ${Array.isArray(r.unmatchedGuests) && r.unmatchedGuests.length ? `No character for: ${(r.unmatchedGuests as string[]).join(", ")}.` : ""}`)}>
          {overview.created === 0 ? "Create the characters and fill in by name" : "Fill in by name again"}
        </button>
      </div>
      {overview.uncastGuests.length > 0 && <p className="admin-notice">Guests with no character yet: {overview.uncastGuests.map((guest) => guest.fullName).join(", ")}. Give them one from a dropdown below, or leave them out.</p>}
      {Object.entries(circleNames).map(([circle, title]) => (
        <div key={circle} className="admin-cast-circle">
          <h4>{title}</h4>
          <ul className="admin-cast-grid">
            {overview.cast.filter((entry) => entry.circle === circle).map((entry) => (
              <li key={entry.slug} className={`${entry.survivor ? "survivor" : ""} ${entry.absent ? "absent" : ""} ${entry.guest ? "" : "uncast"}`}>
                <strong>{entry.name}</strong>
                {entry.survivor && <span className="admin-cast-tag">Survivor · marker {entry.markerNo}</span>}
                <label>
                  Played by
                  <select
                    value={entry.guest?.id ?? ""}
                    disabled={busy || overview.created === 0}
                    onChange={(event) => act({ action: "assign-character", slug: entry.slug, guestId: event.target.value || null }, () => `${entry.name} is now ${event.target.value ? "played by " + (overview.guests.find((guest) => guest.id === event.target.value)?.fullName ?? "that guest") : "unassigned"}.`)}
                  >
                    <option value="">Nobody</option>
                    {overview.guests.map((guest) => <option key={guest.id} value={guest.id}>{guest.fullName}</option>)}
                  </select>
                </label>
                <small>{entry.submissions} answers saved</small>
                <label className="admin-cast-absent">
                  <input
                    type="checkbox"
                    checked={entry.absent}
                    disabled={busy}
                    onChange={(event) => act({ action: "set-flag", key: "absentCharacters", value: event.target.checked ? [...state.absent, entry.slug] : state.absent.filter((slug) => slug !== entry.slug) }, () => `${entry.name} marked ${event.target.checked ? "absent" : "present"}.`)}
                  />
                  Didn&rsquo;t come
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3 className="admin-section-title">3 · The House (the vial)</h3>
      <p className="admin-panel-note">
        {overview.vial.soldTo ? <>The vial was sold to <strong>{overview.vial.soldTo.name}</strong> (marker {overview.vial.soldTo.marker}). {overview.vial.dosed ? "The nightcap was dosed." : "Not yet dosed."}</> : "The vial has not been sold."} Stage the marker from the House Tin beside the body.
      </p>
      {overview.vial.attempts.length > 0 && (
        <ul className="admin-rows">
          {overview.vial.attempts.map((attempt, index) => (
            <li className="admin-row" key={`${attempt.slug}-${index}`}><div><strong>{attempt.name}</strong><small>{attempt.sold ? "SOLD" : "refused"} · {new Date(attempt.at).toLocaleTimeString()}</small></div></li>
          ))}
        </ul>
      )}
      <form
        className="admin-inline-form"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          act({ action: "butler-sell", code }, (r) => String(r.message ?? "Done.")).then(() => setCode(""));
        }}
      >
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Marker code, if the Butler is away" aria-label="Marker code" />
        <button type="submit" disabled={busy || !code.trim()}>Sell as the Butler</button>
      </form>
      <div className="admin-inline-form" style={{ marginTop: ".6rem" }}>
        <select aria-label="Assign the vial" defaultValue="" onChange={(event) => { if (event.target.value) act({ action: "assign-vial", slug: event.target.value }, () => "Vial assigned.").then(() => { event.target.value = ""; }); }}>
          <option value="">Assign the vial by hand…</option>
          {survivors.filter((entry) => entry.guest).map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name} (marker {entry.markerNo})</option>)}
        </select>
        <button type="button" className="admin-danger" disabled={busy} onClick={() => act({ action: "reset-vial" }, () => "The House's log is cleared.")}>Clear the House&rsquo;s log</button>
      </div>

      <h3 className="admin-section-title">4 · Grading, after the party</h3>
      <p className="admin-panel-note">{graded} items graded; {pending} need a second look. The killer is {overview.killer ? <strong>{overview.cast.find((entry) => entry.slug === overview.killer)?.name}</strong> : "not yet known"}.</p>
      <div className="admin-actions">
        <button type="button" className="admin-primary" disabled={busy} onClick={() => act({ action: "grade" }, (r) => `Graded ${r.graded}, kept ${r.kept} decided items, ${r.pending} need a second look.`)}>1 · Run the automatic grader</button>
        <button type="button" disabled={busy} onClick={downloadPacket}>2 · Download the packet for Claude</button>
        <button type="button" disabled={busy} onClick={showStandings}>Show the ladder</button>
        <button type="button" className="admin-primary" disabled={busy} onClick={() => act({ action: "publish" }, (r) => String(r.message))}>4 · Publish results</button>
        <button type="button" disabled={busy} onClick={() => act({ action: "publish", force: true }, (r) => `${String(r.message)} (forced)`)}>Publish anyway</button>
        <button type="button" className="admin-danger" disabled={busy} onClick={() => act({ action: "unpublish" }, () => "Results are hidden again.")}>Hide results</button>
      </div>
      <p className="admin-panel-note">3 · Paste Claude&rsquo;s verdicts file here and apply it:</p>
      <textarea value={verdicts} onChange={(event) => setVerdicts(event.target.value)} placeholder='[{"guest":"anika","kind":"mystery","itemId":"old-3","verdict":"accept","points":10,"rationale":"…"}]' aria-label="Verdicts" />
      <div className="admin-actions" style={{ marginTop: ".5rem" }}>
        <button
          type="button"
          disabled={busy || !verdicts.trim()}
          onClick={() => {
            let parsed: unknown;
            try {
              parsed = JSON.parse(verdicts);
            } catch {
              return setNotice("That is not valid JSON.");
            }
            act({ action: "verdicts", verdicts: parsed }, (r) => `Applied ${r.applied}. ${r.unmatched ? `${r.unmatched} did not match an item. ` : ""}${Array.isArray(r.errors) && r.errors.length ? `Problems: ${(r.errors as string[]).join("; ")}` : ""}`);
          }}
        >
          Apply verdicts
        </button>
      </div>
      {standings && (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Guest</th><th>Circle</th><th className="numeric">Errands</th><th className="numeric">Pages</th><th className="numeric">Survivors</th><th className="numeric">Mysteries</th><th className="numeric">Total</th></tr></thead>
            <tbody>
              {standings.map((row) => (
                <tr key={row.name}>
                  <td>{row.rank}</td><td>{row.name}{row.survivor ? " ✦" : ""}</td><td>{row.circle}</td>
                  <td className="numeric">{row.tiers.objectives}</td><td className="numeric">{row.tiers.exhibits}</td><td className="numeric">{row.tiers.survivors}</td><td className="numeric">{row.tiers.mysteries}</td><td className="numeric"><strong>{row.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
