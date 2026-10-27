import { binderyTickets } from "./bindery";
import { readingRoomTickets } from "./reading-room";
import type { Desk } from "./types";

/** The archive's two apprentice desks — one per LEAP track. */
export const desks: Desk[] = [
  {
    id: "reading-room",
    name: "The Reading Room",
    prefix: "RR",
    role: "Systems analyst track",
    motto: "Define and validate",
    intro:
      "The Reading Room decides what the Black Veil records mean and what the digital archive must do with them — then checks that it does. Ten tickets, one for each week of the analyst track. Each takes about half an hour and is meant for two: one of you at the keyboard, one reading the brief and checking the work. Change places at each numbered step.",
    tickets: readingRoomTickets,
  },
  {
    id: "bindery",
    name: "The Bindery",
    prefix: "BD",
    role: "Software engineer track",
    motto: "Build and deliver",
    intro:
      "The Bindery builds and runs the services that hold the digitised records — the wire book service first of all. Ten tickets, one for each week of the engineering track. Each takes about half an hour and is meant for two: one of you at the keyboard, one reading the brief and checking the work. Change places at each numbered step.",
    tickets: binderyTickets,
  },
];

export function getDesk(id: string) {
  return desks.find((desk) => desk.id === id);
}

export function getDeskTicket(ticket: string) {
  const wanted = ticket.toUpperCase();
  for (const desk of desks) {
    const found = desk.tickets.find((item) => item.ticket === wanted);
    if (found) return { desk, ticket: found };
  }
  return null;
}

export type { Desk, DeskId, DeskTicket } from "./types";
