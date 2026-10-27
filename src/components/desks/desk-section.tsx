"use client";

import Link from "next/link";
import { desks, getDesk } from "@/data/desks";
import type { DeskId } from "@/data/desks";
import { useClosedTickets } from "./desk-progress";

/** One desk's ticket list, in the same form as the Restoration Bench. */
export function DeskSection({ deskId }: { deskId: DeskId }) {
  const desk = getDesk(deskId);
  const { closed } = useClosedTickets();
  if (!desk) return null;
  const other = desks.find((candidate) => candidate.id !== desk.id);
  const done = desk.tickets.filter((ticket) => closed.includes(ticket.ticket)).length;

  return (
    <section className="bench-section" aria-label={desk.name}>
      <header className="bench-section-header">
        <p className="eyebrow">
          {desk.role} · {desk.motto}
        </p>
        <h1>{desk.name}</h1>
        <p>{desk.intro}</p>
        <p className="bench-section-count">
          {done} of {desk.tickets.length} tickets closed
        </p>
      </header>

      <ol className="bench-ticket-list">
        {desk.tickets.map((ticket) => {
          const isClosed = closed.includes(ticket.ticket);
          return (
            <li key={ticket.id} className={isClosed ? "bench-ticket closed" : "bench-ticket"}>
              <Link href={`/${desk.id}/${ticket.ticket}`}>
                <span className="bench-ticket-number">{ticket.ticket}</span>
                <span className="bench-ticket-copy">
                  <strong>{ticket.title}</strong>
                  <em>{ticket.topic}</em>
                  <small>{ticket.sprint}</small>
                </span>
                <span className="bench-ticket-state">
                  <span>Week {ticket.week}</span>
                  <span>{isClosed ? "Closed" : "Open"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {other && (
        <p className="desk-other">
          The other apprentice desk: <Link href={`/${other.id}`}>{other.name}</Link> · {other.role.toLowerCase()}
        </p>
      )}
    </section>
  );
}
