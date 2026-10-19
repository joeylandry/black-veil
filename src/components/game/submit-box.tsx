"use client";

import { FormEvent, useState } from "react";
import type { SavedAnswer } from "./game-types";

type Props = {
  kind: "objective" | "exhibit" | "mystery" | "survivors";
  itemId: string;
  label: string;
  initial?: SavedAnswer;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
  /** Show a second box for a short note on how you know. */
  withProof?: boolean;
  onSaved?: (saved: SavedAnswer) => void;
  /** Overrides the text sent, for pickers that compose their answer. */
  compose?: () => string;
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * One answer box. Saving only ever says "received": the page never reveals whether an answer
 * was right, because nobody is told that until the book is graded at the end of the night.
 */
export function SubmitBox({ kind, itemId, label, initial, disabled, multiline, placeholder, withProof, onSaved, compose }: Props) {
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [proof, setProof] = useState(initial?.proof ?? "");
  const [saved, setSaved] = useState<{ answer: string; proof: string; at: string } | null>(initial ? { answer: initial.answer, proof: initial.proof, at: initial.at } : null);
  const [state, setState] = useState<{ phase: "idle" | "saving" | "error"; message?: string }>({ phase: "idle" });

  const current = compose ? compose() : answer;
  const dirty = !saved || saved.answer !== current || saved.proof !== proof;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !current.trim()) return;
    setState({ phase: "saving" });
    const response = await fetch("/api/game/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, itemId, answer: current, proof }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response?.ok) {
      setState({ phase: "error", message: body?.error ?? "That did not go through. Try again." });
      return;
    }
    const entry = { answer: kind === "exhibit" ? current.toUpperCase() : current, proof, at: body.at as string };
    setSaved(entry);
    setState({ phase: "idle" });
    onSaved?.({ kind, itemId, answer: entry.answer, proof, at: entry.at });
  }

  return (
    <form className="game-submit" onSubmit={save}>
      <label>
        <span>{label}</span>
        {compose ? null : multiline ? (
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={3} maxLength={600} placeholder={placeholder} disabled={disabled} />
        ) : (
          <input type="text" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={600} placeholder={placeholder} disabled={disabled} autoComplete="off" autoCapitalize="none" />
        )}
      </label>
      {withProof && (
        <label>
          <span>How do you know? <em>(optional note; only read if your answer is borderline)</em></span>
          <input type="text" value={proof} onChange={(event) => setProof(event.target.value)} maxLength={800} placeholder="I talked to…" disabled={disabled} autoComplete="off" />
        </label>
      )}
      <div className="game-submit-row">
        <button type="submit" disabled={disabled || state.phase === "saving" || !current.trim() || !dirty}>
          {state.phase === "saving" ? "Saving…" : saved ? "Update answer" : "Save answer"}
        </button>
        {state.phase === "error" ? (
          <small className="field-error" role="alert">{state.message}</small>
        ) : disabled ? (
          <small>The book is closed.</small>
        ) : saved && !dirty ? (
          <small className="game-saved">Received at {clock(saved.at)}. Change it any time; only your last answer counts.</small>
        ) : saved ? (
          <small>Unsaved change.</small>
        ) : (
          <small>Nothing here tells you if you are right. That comes at the end.</small>
        )}
      </div>
    </form>
  );
}
