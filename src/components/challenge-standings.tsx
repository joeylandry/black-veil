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

  useEffect(() => {
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setMe(body))
      .catch(() => setMe(null));
  }, [savedProgress]);

  if (!rsvp) return null;

  const totalScore = me?.totalScore ?? progress.score;
  const characterLabel = me?.character ? `${me.character.characterName} · ${me.character.occupation}` : "Identity sealed";

  return (
    <section className="leaderboard-section">
      <div className="leaderboard-heading">
        <div><p className="eyebrow">Private standings · before doors</p><h2>Guest Ledger</h2></div>
        <p>Flag points update the moment they’re accepted; approved findings are added once staff review them.</p>
      </div>
      <div className="leaderboard-table" role="table" aria-label="Black Rose standings">
        <div role="row" className="leaderboard-row leaderboard-labels"><span role="columnheader">Rank</span><span role="columnheader">Guest</span><span role="columnheader">Character</span><span role="columnheader">Flags</span><span role="columnheader">Points</span></div>
        <div role="row" className="leaderboard-row"><span role="cell">01</span><strong role="cell">{rsvp.fullName}</strong><span role="cell" className={me?.character ? undefined : "character-sealed"}>{characterLabel}</span><span role="cell">{trackScores(progress.solved).trialsSolved} / {ctfChallenges.length}</span><strong role="cell">{totalScore}</strong></div>
      </div>
      <p className="leaderboard-note">Character assignments remain sealed until attendance is confirmed. No murderer, victim, or private dossier material is exposed here.</p>
    </section>
  );
}
