"use client";

import { FormEvent, useState } from "react";

type Reservation = { name: string; note: string };

const publicReservations: Reservation[] = [
  { name: "T. Harold Whitby", note: "Table for two, Thursdays." },
  { name: "Mrs. A. Fenwick", note: "Anniversary supper, river table." },
  { name: "R. & R. Doucette", note: "Standing order, orchestra nights." },
];

const restrictedRecord = {
  label: "RESTRICTED — MANAGEMENT LEDGER",
  lines: [
    "Party: name withheld at the family's request.",
    "Room: the private landing, upstairs.",
    "Standing arrangement since 1921.",
    "Silent Partner. Accounts not entered in the public book.",
  ],
};

function isInjectionAttempt(raw: string) {
  const value = raw.trim().toLowerCase();
  if (!value) return false;
  const breaksOut = /['";]|--/.test(value);
  const tautology = /\bor\b[^a-z0-9]{0,8}('?"?1'?"?\s*=\s*'?"?1'?"?|true)/.test(value);
  const union = /\bunion\b\s+\bselect\b/.test(value);
  return breaksOut && (tautology || union);
}

type Result =
  | { kind: "empty" }
  | { kind: "not-found"; query: string }
  | { kind: "found"; reservation: Reservation }
  | { kind: "restricted" };

export function ReservationLookup() {
  const [result, setResult] = useState<Result>({ kind: "empty" });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get("party") || "");

    if (isInjectionAttempt(query)) {
      setResult({ kind: "restricted" });
      return;
    }

    const match = publicReservations.find((reservation) =>
      reservation.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    setResult(match ? { kind: "found", reservation: match } : { kind: "not-found", query });
  }

  return (
    <section className="reservation-lookup">
      <p className="eyebrow">Confirm a standing reservation</p>
      <form className="reservation-form" onSubmit={submit}>
        <label htmlFor="reservation-party" className="sr-only">Party name</label>
        <input id="reservation-party" name="party" type="text" placeholder="Party name" autoComplete="off" spellCheck={false} />
        <button type="submit" className="button-link">Confirm</button>
      </form>
      {result.kind === "not-found" && (
        <p className="reservation-result">No party under “{result.query}” is presently confirmed for the dining room.</p>
      )}
      {result.kind === "found" && (
        <p className="reservation-result">
          <strong>{result.reservation.name}</strong> — {result.reservation.note}
        </p>
      )}
      {result.kind === "restricted" && (
        <div className="reservation-result reservation-result-restricted">
          <p className="reservation-restricted-label">{restrictedRecord.label}</p>
          {restrictedRecord.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}
