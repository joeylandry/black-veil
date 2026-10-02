"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type Guest = { id: string; email: string; fullName: string; characterId: string | null; createdAt: string };
type Rsvp = { id: string; fullName: string; email: string; attending: "yes" | "no"; note: string; recordedAt: string };
type Character = {
  id: string;
  characterName: string;
  occupation: string;
  publicBiography: string;
  factions: string[];
  privateBiography: string;
  secrets: string[];
  objectives: string[];
  murderer: boolean;
  victim: boolean;
  active: boolean;
};
type Claim = { id: string; guestId: string; label: string; note: string; points: number | null; status: "pending" | "approved" | "rejected"; submittedAt: string };
type Solve = { id: string; guestId: string; challengeId: string; solvedAt: string };
type Tables = { guests: Guest[]; rsvps: Rsvp[]; characters: Character[]; claims: Claim[]; solves: Solve[]; challenges: { id: string; label: string }[] };

const tabs = [
  { id: "guests", label: "Guests" },
  { id: "rsvps", label: "RSVPs" },
  { id: "characters", label: "Characters" },
  { id: "claims", label: "Claims" },
  { id: "solves", label: "Solves" },
] as const;
type Tab = (typeof tabs)[number]["id"];

const blankCharacter: Omit<Character, "id"> = {
  characterName: "",
  occupation: "",
  publicBiography: "",
  factions: [],
  privateBiography: "",
  secrets: [],
  objectives: [],
  murderer: false,
  victim: false,
  active: true,
};

/** Edit or remove anything in the register: guests, RSVPs, characters, claims and solves. */
export function AdminDatabase({ secret, refreshKey, onChange }: { secret: string; refreshKey: number; onChange: () => void }) {
  const [data, setData] = useState<Tables | null>(null);
  const [tab, setTab] = useState<Tab>("guests");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/db", { headers: { Authorization: `Bearer ${secret}` } }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response?.ok) {
      setNotice({ ok: false, text: body?.error ?? "The database could not be read." });
      return;
    }
    setData(body);
  }, [secret]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  async function send(payload: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(true);
    setNotice(null);
    const response = await fetch("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setNotice({ ok: Boolean(response?.ok), text: body?.message ?? body?.error ?? "The site could not be reached." });
    setBusy(false);
    if (response?.ok) {
      setEditing(null);
      await load();
      onChange();
      return true;
    }
    return false;
  }

  const guestName = useMemo(() => new Map((data?.guests ?? []).map((guest) => [guest.id, guest.fullName])), [data]);
  const characterName = useMemo(() => new Map((data?.characters ?? []).map((character) => [character.id, character.characterName])), [data]);
  const challengeLabel = useMemo(() => new Map((data?.challenges ?? []).map((challenge) => [challenge.id, challenge.label])), [data]);

  const needle = filter.trim().toLowerCase();
  const matches = (...values: (string | null | undefined)[]) => !needle || values.some((value) => value?.toLowerCase().includes(needle));

  if (!data) {
    return (
      <section className="admin-panel">
        <h2>Database</h2>
        {notice ? <p className="field-error">{notice.text}</p> : <div className="ledger-checking">Opening the database…</div>}
      </section>
    );
  }

  const counts: Record<Tab, number> = {
    guests: data.guests.length,
    rsvps: data.rsvps.length,
    characters: data.characters.length,
    claims: data.claims.length,
    solves: data.solves.length,
  };

  return (
    <section className="admin-panel admin-database">
      <div className="admin-panel-heading">
        <div>
          <h2>Database</h2>
          <p className="admin-panel-note">Edit or remove anything. Deleting a guest also deletes their RSVP, solves, claims and sign-in links. Deletes can&apos;t be undone.</p>
        </div>
        <input className="admin-filter" type="search" placeholder="Filter…" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter rows" />
      </div>

      <div className="admin-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "active" : undefined}
            onClick={() => { setTab(item.id); setEditing(null); }}
          >
            {item.label} <span>{counts[item.id]}</span>
          </button>
        ))}
      </div>

      {notice && <p className={notice.ok ? "admin-notice" : "field-error"} role="status">{notice.text}</p>}

      {tab === "guests" && (
        <Rows empty="No guests yet.">
          {data.guests.filter((guest) => matches(guest.fullName, guest.email, characterName.get(guest.characterId ?? ""))).map((guest) =>
            editing === guest.id ? (
              <GuestForm key={guest.id} guest={guest} characters={data.characters} holders={data.guests} busy={busy} onCancel={() => setEditing(null)}
                onSave={(values) => send({ op: "update", table: "guests", id: guest.id, data: values })} />
            ) : (
              <Row key={guest.id} title={guest.fullName} detail={`${guest.email} · ${guest.characterId ? characterName.get(guest.characterId) ?? "unknown character" : "no character"}`}
                onEdit={() => setEditing(guest.id)}
                onDelete={() => send({ op: "delete", table: "guests", id: guest.id }, `Delete ${guest.fullName}, and their RSVP, solves, claims and sign-in links?`)} busy={busy} />
            ),
          )}
        </Rows>
      )}

      {tab === "rsvps" && (
        <Rows empty="No RSVPs yet.">
          {data.rsvps.filter((rsvp) => matches(rsvp.fullName, rsvp.email, rsvp.note)).map((rsvp) =>
            editing === rsvp.id ? (
              <RsvpForm key={rsvp.id} rsvp={rsvp} busy={busy} onCancel={() => setEditing(null)}
                onSave={(values) => send({ op: "update", table: "rsvps", id: rsvp.id, data: values })} />
            ) : (
              <Row key={rsvp.id} title={rsvp.fullName} detail={`${rsvp.email} · ${rsvp.attending === "yes" ? "attending" : "regrets"}${rsvp.note ? ` · “${rsvp.note}”` : ""}`}
                onEdit={() => setEditing(rsvp.id)}
                onDelete={() => send({ op: "delete", table: "rsvps", id: rsvp.id }, `Delete this RSVP from ${rsvp.fullName}? Their guest account stays.`)} busy={busy} />
            ),
          )}
        </Rows>
      )}

      {tab === "characters" && (
        <>
          <div className="admin-actions">
            <button type="button" className="admin-primary" disabled={busy} onClick={() => setEditing("new")}>New character</button>
          </div>
          {editing === "new" && (
            <CharacterForm character={blankCharacter} busy={busy} onCancel={() => setEditing(null)}
              onSave={(values) => send({ op: "create", table: "characters", data: values })} />
          )}
          <Rows empty="No characters yet. Create one, or use Load the cast above.">
            {data.characters.filter((character) => matches(character.characterName, character.occupation)).map((character) => {
              const holder = data.guests.find((guest) => guest.characterId === character.id);
              const flags = [character.murderer && "murderer", character.victim && "victim", !character.active && "inactive"].filter(Boolean).join(", ");
              return editing === character.id ? (
                <CharacterForm key={character.id} character={character} busy={busy} onCancel={() => setEditing(null)}
                  onSave={(values) => send({ op: "update", table: "characters", id: character.id, data: values })} />
              ) : (
                <Row key={character.id} title={character.characterName}
                  detail={`${character.occupation || "no occupation"} · ${holder ? `held by ${holder.fullName}` : "unassigned"}${flags ? ` · ${flags}` : ""}`}
                  onEdit={() => setEditing(character.id)}
                  onDelete={() => send({ op: "delete", table: "characters", id: character.id }, `Delete ${character.characterName}?${holder ? ` ${holder.fullName} will lose it.` : ""}`)} busy={busy} />
              );
            })}
          </Rows>
        </>
      )}

      {tab === "claims" && (
        <Rows empty="No claims yet.">
          {data.claims.filter((claim) => matches(claim.label, claim.note, guestName.get(claim.guestId))).map((claim) =>
            editing === claim.id ? (
              <ClaimForm key={claim.id} claim={claim} busy={busy} onCancel={() => setEditing(null)}
                onSave={(values) => send({ op: "update", table: "claims", id: claim.id, data: values })} />
            ) : (
              <Row key={claim.id} title={claim.label}
                detail={`${guestName.get(claim.guestId) ?? "unknown guest"} · ${claim.status}${claim.status === "approved" ? ` · ${claim.points} pts` : ""}`}
                onEdit={() => setEditing(claim.id)}
                onDelete={() => send({ op: "delete", table: "claims", id: claim.id }, `Delete the claim “${claim.label}”?`)} busy={busy} />
            ),
          )}
        </Rows>
      )}

      {tab === "solves" && (
        <>
          <SolveForm guests={data.guests} challenges={data.challenges} busy={busy}
            onSave={(values) => send({ op: "create", table: "solves", data: values })} />
          <Rows empty="No solves yet.">
            {data.solves.filter((solve) => matches(guestName.get(solve.guestId), challengeLabel.get(solve.challengeId))).map((solve) => (
              <Row key={solve.id} title={guestName.get(solve.guestId) ?? "unknown guest"} detail={challengeLabel.get(solve.challengeId) ?? solve.challengeId}
                onDelete={() => send({ op: "delete", table: "solves", id: solve.id }, `Remove this solve? The guest loses its points.`)} busy={busy} />
            ))}
          </Rows>
        </>
      )}
    </section>
  );
}

function Rows({ children, empty }: { children: ReactNode[]; empty: string }) {
  return children.length ? <ul className="admin-rows">{children}</ul> : <p className="admin-panel-note">{empty}</p>;
}

function Row({ title, detail, onEdit, onDelete, busy }: { title: string; detail: string; onEdit?: () => void; onDelete: () => void; busy: boolean }) {
  return (
    <li className="admin-row">
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      <div className="admin-row-actions">
        {onEdit && <button type="button" disabled={busy} onClick={onEdit}>Edit</button>}
        <button type="button" className="admin-danger" disabled={busy} onClick={onDelete}>Delete</button>
      </div>
    </li>
  );
}

function EditForm({ children, busy, onCancel, onSubmit }: { children: ReactNode; busy: boolean; onCancel: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <li className="admin-edit">
      <form onSubmit={onSubmit}>
        <div className="admin-edit-fields">{children}</div>
        <div className="admin-row-actions">
          <button type="submit" className="admin-primary" disabled={busy}>Save</button>
          <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </li>
  );
}

const read = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return new FormData(event.currentTarget);
};

function GuestForm({ guest, characters, holders, busy, onCancel, onSave }: {
  guest: Guest; characters: Character[]; holders: Guest[]; busy: boolean; onCancel: () => void; onSave: (values: Record<string, unknown>) => void;
}) {
  return (
    <EditForm busy={busy} onCancel={onCancel} onSubmit={(event) => {
      const form = read(event);
      onSave({ fullName: form.get("fullName"), email: form.get("email"), characterId: form.get("characterId") || null });
    }}>
      <label>Name<input name="fullName" defaultValue={guest.fullName} required /></label>
      <label>Email<input name="email" type="email" defaultValue={guest.email} required /></label>
      <label className="wide">Character
        <select name="characterId" defaultValue={guest.characterId ?? ""}>
          <option value="">No character</option>
          {characters.map((character) => {
            const holder = holders.find((item) => item.characterId === character.id && item.id !== guest.id);
            return <option key={character.id} value={character.id} disabled={Boolean(holder)}>{character.characterName}{holder ? ` (held by ${holder.fullName})` : ""}</option>;
          })}
        </select>
      </label>
    </EditForm>
  );
}

function RsvpForm({ rsvp, busy, onCancel, onSave }: { rsvp: Rsvp; busy: boolean; onCancel: () => void; onSave: (values: Record<string, unknown>) => void }) {
  return (
    <EditForm busy={busy} onCancel={onCancel} onSubmit={(event) => {
      const form = read(event);
      onSave({ fullName: form.get("fullName"), email: form.get("email"), attending: form.get("attending"), note: form.get("note") });
    }}>
      <label>Name<input name="fullName" defaultValue={rsvp.fullName} required /></label>
      <label>Email<input name="email" type="email" defaultValue={rsvp.email} required /></label>
      <label>Attending
        <select name="attending" defaultValue={rsvp.attending}>
          <option value="yes">Attending</option>
          <option value="no">Regrets</option>
        </select>
      </label>
      <label className="wide">Note<textarea name="note" rows={2} defaultValue={rsvp.note} /></label>
    </EditForm>
  );
}

function CharacterForm({ character, busy, onCancel, onSave }: { character: Omit<Character, "id">; busy: boolean; onCancel: () => void; onSave: (values: Record<string, unknown>) => void }) {
  return (
    <EditForm busy={busy} onCancel={onCancel} onSubmit={(event) => {
      const form = read(event);
      onSave({
        characterName: form.get("characterName"),
        occupation: form.get("occupation"),
        publicBiography: form.get("publicBiography"),
        factions: form.get("factions"),
        privateBiography: form.get("privateBiography"),
        secrets: form.get("secrets"),
        objectives: form.get("objectives"),
        murderer: form.get("murderer") === "on",
        victim: form.get("victim") === "on",
        active: form.get("active") === "on",
      });
    }}>
      <label>Character name<input name="characterName" defaultValue={character.characterName} required /></label>
      <label>Occupation<input name="occupation" defaultValue={character.occupation} /></label>
      <label className="wide">Factions <em>comma-separated</em><input name="factions" defaultValue={character.factions.join(", ")} /></label>
      <label className="wide">Public biography <em>everyone may know this</em><textarea name="publicBiography" rows={3} defaultValue={character.publicBiography} /></label>
      <label className="wide">Private biography <em>only this guest sees it</em><textarea name="privateBiography" rows={3} defaultValue={character.privateBiography} /></label>
      <label className="wide">Secrets <em>one per line</em><textarea name="secrets" rows={3} defaultValue={character.secrets.join("\n")} /></label>
      <label className="wide">Objectives <em>one per line</em><textarea name="objectives" rows={3} defaultValue={character.objectives.join("\n")} /></label>
      <div className="wide admin-checks">
        <label><input type="checkbox" name="murderer" defaultChecked={character.murderer} /> Murderer</label>
        <label><input type="checkbox" name="victim" defaultChecked={character.victim} /> Victim</label>
        <label><input type="checkbox" name="active" defaultChecked={character.active} /> Active (can be dealt)</label>
      </div>
    </EditForm>
  );
}

function ClaimForm({ claim, busy, onCancel, onSave }: { claim: Claim; busy: boolean; onCancel: () => void; onSave: (values: Record<string, unknown>) => void }) {
  return (
    <EditForm busy={busy} onCancel={onCancel} onSubmit={(event) => {
      const form = read(event);
      onSave({ label: form.get("label"), note: form.get("note"), status: form.get("status"), points: form.get("points") });
    }}>
      <label className="wide">Label<input name="label" defaultValue={claim.label} required /></label>
      <label className="wide">Note<textarea name="note" rows={2} defaultValue={claim.note} /></label>
      <label>Status
        <select name="status" defaultValue={claim.status}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <label>Points <em>for approved</em><input name="points" type="number" min={0} defaultValue={claim.points ?? ""} /></label>
    </EditForm>
  );
}

function SolveForm({ guests, challenges, busy, onSave }: { guests: Guest[]; challenges: { id: string; label: string }[]; busy: boolean; onSave: (values: Record<string, unknown>) => void }) {
  return (
    <form className="admin-inline-form admin-solve-form" onSubmit={(event) => {
      const form = read(event);
      onSave({ guestId: form.get("guestId"), challengeId: form.get("challengeId") });
    }}>
      <select name="guestId" required aria-label="Guest" defaultValue="">
        <option value="" disabled>Guest…</option>
        {guests.map((guest) => <option key={guest.id} value={guest.id}>{guest.fullName}</option>)}
      </select>
      <select name="challengeId" required aria-label="Challenge" defaultValue="">
        <option value="" disabled>Challenge…</option>
        {challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.label}</option>)}
      </select>
      <button type="submit" disabled={busy || !guests.length}>Record solve</button>
    </form>
  );
}
