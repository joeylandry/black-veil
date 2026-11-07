"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  week: number;
  prompt: string;
  help?: string;
  canAnswer: boolean;
  initial: { answered: boolean; remaining: number };
  points: number;
};

export function FindingForm({ week, prompt, help, canAnswer, initial, points }: Props) {
  const router = useRouter();
  const [answered, setAnswered] = useState(initial.answered);
  const [remaining, setRemaining] = useState(initial.remaining);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/finding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, answer }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.error ?? "That answer could not be checked.");
        return;
      }
      if (body.correct) {
        setAnswered(true);
        router.refresh();
      } else {
        setRemaining(body.remaining ?? 0);
        setMessage(body.locked ? "That was the last try. This finding is closed for you." : "Not what the file says. Read it again.");
      }
    } catch {
      setMessage("That answer could not be checked. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="finding-form">
      <p className="finding-prompt">{prompt}</p>
      {help && <p className="small">{help}</p>}

      {answered ? (
        <p className="finding-done" role="status">
          ◆ Entered in the record · {points} points
        </p>
      ) : !canAnswer ? (
        <p className="small">
          <Link href="/join">Join the file</Link> to answer.
        </p>
      ) : remaining <= 0 ? (
        <p className="finding-locked">Closed: no tries left.</p>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor={`finding-${week}`} className="visually-hidden">
            Your answer
          </label>
          <input
            id={`finding-${week}`}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Your answer"
            maxLength={200}
          />
          <button type="submit" className="button" disabled={busy || !answer.trim()}>
            {busy ? "Checking…" : "Enter it"}
          </button>
          <p className="small">
            {remaining} {remaining === 1 ? "try" : "tries"} left · {points} points
          </p>
        </form>
      )}
      {message && (
        <p className="finding-message" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
