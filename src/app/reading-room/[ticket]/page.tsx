import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeskWorkbench } from "@/components/desks/desk-workbench";
import { getDesk, getDeskTicket } from "@/data/desks";

type Props = { params: Promise<{ ticket: string }> };

export function generateStaticParams() {
  return (getDesk("reading-room")?.tickets ?? []).map((ticket) => ({ ticket: ticket.ticket }));
}

function lookup(ticket: string) {
  const found = getDeskTicket(ticket);
  return found?.desk.id === "reading-room" ? found.ticket : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticket = lookup((await params).ticket);
  if (!ticket) return {};
  return { title: `${ticket.ticket} · ${ticket.title}`, description: ticket.topic, robots: { index: false, follow: false } };
}

export default async function ReadingRoomTicketPage({ params }: Props) {
  const ticket = lookup((await params).ticket);
  if (!ticket) notFound();
  return (
    <div className="page-wrap ctf-page bench-page desk-page">
      <DeskWorkbench deskId="reading-room" ticket={ticket} />
    </div>
  );
}
