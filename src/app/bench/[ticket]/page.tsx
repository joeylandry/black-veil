import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eventConfig } from "@/config/event";
import { BenchGate } from "@/components/bench/bench-gate";
import { benchLabs, getBenchLab } from "@/data/bench";

type Props = { params: Promise<{ ticket: string }> };

export function generateStaticParams() {
  return benchLabs.map((lab) => ({ ticket: lab.ticket }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticket } = await params;
  const lab = getBenchLab(ticket);
  if (!lab) return {};
  return {
    title: `${lab.ticket} · ${lab.title}`,
    description: lab.topic,
    robots: { index: false, follow: false },
  };
}

export default async function BenchTicketPage({ params }: Props) {
  // The trials are closed for now: send everyone to the game.
  if (!eventConfig.ctfOpen) redirect("/game");
  const { ticket } = await params;
  const lab = getBenchLab(ticket);
  if (!lab) notFound();

  return (
    <div className="page-wrap ctf-page bench-page">
      <BenchGate lab={lab} />
    </div>
  );
}
