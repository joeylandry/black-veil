"use client";

import { useState } from "react";

type Row = { rank: number; name: string; circle: string; total: number; tiers: { objectives: number; survivors: number; mysteries: number; race: number; cash: number } };
type Standings = { winner: string | null; killer: string | null; pendingReview: number; rows: Row[] };

/** Grade the night from the browser: run grading, read the winner, review the open answers, publish. */
export function AdminGrading({ secret }: { secret: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [standings, setStandings] = useState<Standings | null>(null);
  const [packet, setPacket] = useState("");
  const [verdicts, setVerdicts] = useState("");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${secret}` };

  async function act(action: string, extra: Record<string, unknown> = {}) {
    const response = await fetch("/api/admin/game", { method: "POST", headers, body: JSON.stringify({ action, ...extra }) }).catch(() => null);
    const body = await response?.json().catch(() => null);
    return { ok: Boolean(response?.ok), body };
  }

  async function run(label: string, work: () => Promise<void>) {
    setBusy(true);
    setNotice(null);
    try {
      await work();
    } catch {
      setNotice(`${label} failed. Try again.`);
    }
    setBusy(false);
  }

  const showStandings = async () => {
    const result = await act("standings");
    if (!result.ok) return setNotice(result.body?.error ?? "Could not read the standings.");
    setStandings(result.body as Standings);
  };

  const grade = () =>
    run("Grading", async () => {
      const graded = await act("grade");
      if (!graded.ok) return setNotice(graded.body?.error ?? "Grading failed.");
      await showStandings();
      setNotice("Graded. The winner below is provisional until any open answers are reviewed.");
    });

  const getPacket = () =>
    run("The review packet", async () => {
      const result = await act("packet");
      if (!result.ok) return setNotice(result.body?.error ?? "Could not build the packet.");
      setPacket(JSON.stringify(result.body.packet, null, 2));
      setNotice("Copy the packet and send it to Claude, then paste the verdicts back below.");
    });

  const applyVerdicts = () =>
    run("Applying verdicts", async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(verdicts);
      } catch {
        return setNotice("Those verdicts are not valid JSON.");
      }
      const result = await act("verdicts", { verdicts: parsed });
      if (!result.ok) return setNotice(result.body?.error ?? "The verdicts were refused.");
      await showStandings();
      setNotice(`Verdicts applied${result.body?.errors?.length ? ` (${result.body.errors.length} problems: ${result.body.errors.join("; ")})` : ""}.`);
    });

  const publish = (force: boolean) =>
    run("Publishing", async () => {
      if (!window.confirm(force ? "Publish now with the automatic grades? This closes the book for good." : "Publish the results? This closes the book for good.")) return;
      const result = await act("publish", { force });
      setNotice(result.body?.message ?? (result.ok ? "Published." : "Could not publish."));
    });

  const top = standings?.rows[0];
  const tied = standings ? standings.rows.filter((row) => row.total > 0 && top && row.total === top.total) : [];

  return (
    <section className="admin-panel admin-game" aria-label="Grade the night">
      <p className="eyebrow">Staff only · grading</p>
      <h2>Grade the night</h2>
      <p className="admin-panel-note">Run this when the night is over. Publishing closes the book for good.</p>
      <div className="admin-actions">
        <button type="button" className="admin-primary" disabled={busy} onClick={grade}>1. Run grading and show the winner</button>
        <button type="button" disabled={busy} onClick={getPacket}>2. Get the review packet</button>
        <button type="button" disabled={busy} onClick={() => publish(false)}>3. Publish results</button>
        <button type="button" disabled={busy} onClick={() => publish(true)}>Publish anyway (accept automatic grades)</button>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {standings && (
        <div>
          <h3>{standings.winner ? `Winner: ${standings.winner}` : "No winner yet"}</h3>
          {tied.length > 1 && <p><strong>TIED FOR FIRST:</strong> {tied.map((row) => row.name).join(", ")}. Ask them the secret tie-breaker: the second rail stub in the jacket lining (Manchester to Boston, 11:12 PM).</p>}
          <p>{standings.pendingReview} answers still need a second look. The Keeper&rsquo;s killer: {standings.killer ?? "nobody yet"}.</p>
          <ol>
            {standings.rows.slice(0, 10).map((row) => (
              <li key={row.name}>{row.name}: <strong>{row.total}</strong> (objectives {row.tiers.objectives}, survivors {row.tiers.survivors}, mysteries {row.tiers.mysteries}, race {row.tiers.race}, wallet {row.tiers.cash})</li>
            ))}
          </ol>
        </div>
      )}
      {packet && <textarea readOnly value={packet} aria-label="Review packet" onFocus={(event) => event.currentTarget.select()} />}
      <label>
        <span>Paste the verdicts here, then apply them</span>
        <textarea value={verdicts} onChange={(event) => setVerdicts(event.target.value)} placeholder="Verdicts from Claude (JSON)" />
      </label>
      <button type="button" disabled={busy || !verdicts.trim()} onClick={applyVerdicts}>Apply verdicts</button>
    </section>
  );
}
