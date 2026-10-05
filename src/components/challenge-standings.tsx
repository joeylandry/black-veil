"use client";

import { useEffect, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { ctfChallenges } from "@/data/ctf";
import { CtfProgress, emptyCtfProgress } from "@/lib/ctf-service";
import { RsvpSubmission } from "@/lib/rsvp-service";
import { trackScores } from "@/lib/track-scores";
import { useStorageValue } from "@/lib/use-storage-value";

type Me = {
  character: { characterName: string; occupation: string } | null;
  totalScore: number;
};

type Standings = {
  total: number;
  rows: { rank: number; isYou: boolean; name: string; solved: string[]; points: number }[];
};

const STANDINGS_REFRESH_MS = 5000;

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try { return JSON.parse(raw) as CtfProgress; } catch { return emptyCtfProgress; }
}

export function ChallengeStandings() {
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const rsvp = useMemo(() => {
    if (!savedRsvp) return null;
    try { return JSON.parse(savedRsvp) as RsvpSubmission; } catch { return null; }
  }, [savedRsvp]);
  const progress = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const [me, setMe] = useState<Me | null>(null);
  const [standings, setStandings] = useState<Standings | null>(null);

  useEffect(() => {
    if (!savedRsvp) return;
    let cancelled = false;
    const refresh = () => {
      fetch("/api/me")
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => { if (!cancelled && body) setMe(body); })
        .catch(() => {});
      fetch("/api/standings")
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => { if (!cancelled && body) setStandings(body); })
        .catch(() => {});
    };
    refresh();
    // Other guests' flags land in the standings without this page reloading. A failed
    // poll keeps the last good table rather than blanking it.
    const timer = window.setInterval(refresh, STANDINGS_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [savedProgress, savedRsvp]);

  if (!rsvp) return null;

  const totalScore = me?.totalScore ?? progress.score;
  const characterLabel = me?.character ? `${me.character.characterName} · ${me.character.occupation}` : "Identity sealed";

  return (
    <section className="leaderboard-section">
      <div className="leaderboard-heading">
        <div><p className="eyebrow">Private standings · before doors</p><h2>Guest Ledger</h2></div>
        <p>Live: every guest’s accepted flags appear here within a few seconds; approved findings are added once staff review them.</p>
      </div>
      <div className="leaderboard-table" role="table" aria-label="Black Frog standings">
        <div role="row" className="leaderboard-row leaderboard-labels"><span role="columnheader">Rank</span><span role="columnheader">Guest</span><span role="columnheader">Character</span><span role="columnheader">Flags</span><span role="columnheader">Points</span></div>
        {standings?.rows.length ? (
          standings.rows.map((row) => (
            <div role="row" className={row.isYou ? "leaderboard-row leaderboard-you" : "leaderboard-row"} key={row.rank}>
              <span role="cell">{String(row.rank).padStart(2, "0")}</span>
              <strong role="cell">{row.name}</strong>
              <span role="cell" className={row.isYou && me?.character ? undefined : "character-sealed"}>{row.isYou ? characterLabel : "Identity sealed"}</span>
              <span role="cell">{trackScores(row.solved).trialsSolved} / {ctfChallenges.length}</span>
              <strong role="cell">{row.points}</strong>
            </div>
          ))
        ) : (
          <div role="row" className="leaderboard-row"><span role="cell">01</span><strong role="cell">{rsvp.fullName}</strong><span role="cell" className={me?.character ? undefined : "character-sealed"}>{characterLabel}</span><span role="cell">{trackScores(progress.solved).trialsSolved} / {ctfChallenges.length}</span><strong role="cell">{totalScore}</strong></div>
        )}
      </div>
      <p className="leaderboard-note">{standings ? `${standings.total} names in the ledger; other guests appear by first name and initial. ` : null}Character assignments remain sealed until attendance is confirmed. No murderer, victim, or private dossier material is exposed here.</p>
    </section>
  );
}
