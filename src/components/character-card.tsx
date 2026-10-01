"use client";

import { useEffect, useMemo, useState } from "react";
import { eventConfig } from "@/config/event";
import { RsvpSubmission } from "@/lib/rsvp-service";
import { useStorageValue } from "@/lib/use-storage-value";
import { BlackVeilInsignia } from "./black-veil-insignia";

type Character = {
  characterName: string;
  occupation: string;
  publicBiography: string;
  factions: string[];
  dossier?: { privateBiography: string; secrets: string[]; objectives: string[] };
};

/** The signed-in guest's own character: public profile, and their private dossier under a seal. */
export function CharacterCard() {
  const savedRsvp = useStorageValue(eventConfig.storageKeys.rsvp);
  const rsvp = useMemo(() => {
    if (!savedRsvp) return null;
    try { return JSON.parse(savedRsvp) as RsvpSubmission; } catch { return null; }
  }, [savedRsvp]);
  const [character, setCharacter] = useState<Character | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!savedRsvp) return;
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setCharacter(body?.character ?? null))
      .catch(() => setCharacter(null));
  }, [savedRsvp]);

  if (!rsvp || rsvp.attending !== "yes" || character === undefined) return null;

  if (!character) {
    return (
      <section className="character-card character-card-sealed" aria-label="Your character">
        <BlackVeilInsignia />
        <p className="eyebrow">Your identity for the evening</p>
        <h2>Sealed</h2>
        <p>Management has not yet chosen who you will be on October 31. Your character will appear here once it is assigned.</p>
      </section>
    );
  }

  return (
    <section className="character-card" aria-label="Your character">
      <div className="character-card-face">
        <p className="eyebrow">Your identity for the evening</p>
        <h2>{character.characterName}</h2>
        <p className="character-occupation">{character.occupation}</p>
        {character.factions.length > 0 && (
          <ul className="character-factions" aria-label="Factions">
            {character.factions.map((faction) => <li key={faction}>{faction}</li>)}
          </ul>
        )}
        <p className="character-bio">{character.publicBiography}</p>
        <small>Everyone at the masquerade may know this much.</small>
      </div>

      {character.dossier && (
        <div className="character-dossier">
          <p className="eyebrow">Private dossier · for your eyes only</p>
          {open ? (
            <>
              {character.dossier.privateBiography && <p>{character.dossier.privateBiography}</p>}
              {character.dossier.secrets.length > 0 && (
                <>
                  <h3>What you are hiding</h3>
                  <ul>{character.dossier.secrets.map((secret) => <li key={secret}>{secret}</li>)}</ul>
                </>
              )}
              {character.dossier.objectives.length > 0 && (
                <>
                  <h3>What you must do tonight</h3>
                  <ol>{character.dossier.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
                </>
              )}
              <button type="button" className="character-seal-button" onClick={() => setOpen(false)}>Reseal</button>
            </>
          ) : (
            <button type="button" className="character-seal-button" onClick={() => setOpen(true)}>Break the seal</button>
          )}
        </div>
      )}
    </section>
  );
}
