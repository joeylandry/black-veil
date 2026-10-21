"use client";

import { useEffect, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import type { RsvpSubmission } from "@/lib/rsvp-service";
import type { RosterView } from "@/lib/roster-service";
import { useStorageValue } from "@/lib/use-storage-value";
import { BlackVeilInsignia } from "./black-veil-insignia";

/**
 * Your character on top, then everyone who is coming. Before the host releases character names
 * it shows names only; after, each guest's character, role and background (tap a row to open it).
 */
export function GuestRoster() {
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const rsvp = useMemo(() => {
    if (!savedRsvp) return null;
    try { return JSON.parse(savedRsvp) as RsvpSubmission; } catch { return null; }
  }, [savedRsvp]);
  const [view, setView] = useState<RosterView | null>(null);

  useEffect(() => {
    if (!savedRsvp) return;
    let cancelled = false;
    const refresh = () => {
      fetch("/api/roster", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => { if (!cancelled && body) setView(body); })
        .catch(() => {});
    };
    refresh();
    const timer = window.setInterval(refresh, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [savedRsvp]);

  if (!rsvp || !view) return null;

  return (
    <>
      {rsvp.attending === "yes" && (
        <section className={view.you ? "character-card roster-you" : "character-card character-card-sealed"} aria-label="Your character">
          {view.you ? (
            <div className="character-card-face">
              <p className="eyebrow">Your character for the evening</p>
              <h2>{view.you.name}</h2>
              <p className="character-occupation">{view.you.role}</p>
              <p className="character-bio">{view.you.background}</p>
              <ul className="roster-soon" aria-label="Still to come">
                <li><strong>Objectives</strong> coming soon</li>
                <li><strong>Secrets</strong> coming soon</li>
              </ul>
            </div>
          ) : (
            <>
              <BlackVeilInsignia />
              <div>
                <p className="eyebrow">Your character for the evening · <strong>Coming very soon</strong></p>
                <p>
                  {view.released
                    ? "Management has not yet matched a character to your name. It will appear here very soon."
                    : "Your character name, role and background will appear here the moment the cast is released."}
                </p>
              </div>
            </>
          )}
        </section>
      )}

      <section className="roster-section" aria-label="Guest ledger">
        <div className="roster-heading">
          <p className="eyebrow">Private ledger · before doors</p>
          <h2>{view.released ? "The cast" : "Who is coming"}</h2>
          <p>{view.released ? "Tap a character to read more." : "Characters are coming very soon. Names only, for now."}</p>
        </div>
        <ul className="roster-list">
          {view.rows.map((row, index) => (
            <li key={`${row.name}-${index}`} className={row.isYou ? "roster-item roster-item-you" : "roster-item"}>
              {row.background ? (
                <details>
                  <summary>
                    <span className="roster-name">{row.name}{row.isYou && <em> · you</em>}</span>
                    <span className="roster-role">{row.role}</span>
                  </summary>
                  <div className="roster-detail">
                    <p>{row.background}</p>
                  </div>
                </details>
              ) : (
                <div className="roster-plain">
                  <span className="roster-name">{row.name}{row.isYou && <em> · you</em>}</span>
                  <span className="roster-role character-sealed">{view.released ? "Coming soon" : "Coming very soon"}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="roster-note">
          {view.rows.length} {view.rows.length === 1 ? "name" : "names"} in the ledger.
        </p>
      </section>
    </>
  );
}
