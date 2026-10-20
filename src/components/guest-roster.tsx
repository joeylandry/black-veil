"use client";

import { useEffect, useState } from "react";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";

type Ledger = {
  released: boolean;
  published: boolean;
  rows: { name: string; character: string | null; occupation: string | null; points: number; rank: number | null; isYou: boolean }[];
};

/** Who is coming, who they will be, and where everyone stands: at 0 until the host publishes results. */
export function GuestRoster() {
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const [ledger, setLedger] = useState<Ledger | null>(null);

  useEffect(() => {
    if (!savedRsvp) return;
    let cancelled = false;
    const refresh = () => {
      fetch("/api/standings", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => { if (!cancelled && body) setLedger(body); })
        .catch(() => {});
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [savedRsvp]);

  if (!savedRsvp || !ledger) return null;

  return (
    <section className="leaderboard-section">
      <div className="leaderboard-heading">
        <div><p className="eyebrow">Private ledger · before doors</p><h2>Guest Ledger</h2></div>
        <p>{ledger.published ? "The night is over. Here is how everyone finished." : "Everyone starts the night at 0. Points are counted when the night is over."}</p>
      </div>
      <div className="leaderboard-table" role="table" aria-label="Guest ledger">
        <div role="row" className="leaderboard-row leaderboard-labels"><span role="columnheader">{ledger.published ? "Rank" : "No."}</span><span role="columnheader">Guest</span><span role="columnheader">Character</span><span role="columnheader">Points</span></div>
        {ledger.rows.map((row, index) => (
          <div role="row" className={row.isYou ? "leaderboard-row leaderboard-you" : "leaderboard-row"} key={`${row.name}-${index}`}>
            <span role="cell">{String(row.rank ?? index + 1).padStart(2, "0")}</span>
            <strong role="cell">{row.name}</strong>
            <span role="cell" className={row.character ? undefined : "character-sealed"}>{row.character ? `${row.character} · ${row.occupation}` : "Coming very soon"}</span>
            <strong role="cell">{row.points}</strong>
          </div>
        ))}
      </div>
      <p className="leaderboard-note">{ledger.rows.length} names in the ledger. Who is a survivor, and everything private to a character, stays sealed.</p>
    </section>
  );
}
