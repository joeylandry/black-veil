"use client";

import { Workbench } from "@/components/bench/bench-lab";
import { getDesk } from "@/data/desks";
import type { DeskId, DeskTicket } from "@/data/desks";
import { closeTicket, useClosedTickets } from "./desk-progress";
import { deskService } from "./desk-service";

export function DeskWorkbench({ deskId, ticket }: { deskId: DeskId; ticket: DeskTicket }) {
  const desk = getDesk(deskId);
  const { closed } = useClosedTickets();
  if (!desk) return null;
  return (
    <Workbench
      lab={ticket}
      service={deskService}
      eyebrow={`${desk.name} · ticket ${ticket.ticket} · ${ticket.sprint}`}
      meta={["About 30 minutes", "Worked in pairs"]}
      alreadySolved={closed.includes(ticket.ticket)}
      acceptedNote="ticket closed"
      onPassed={() => closeTicket(ticket.ticket)}
      backHref={`/${desk.id}`}
      backLabel={`Return to ${desk.name.replace(/^The /, "the ")}`}
    />
  );
}
