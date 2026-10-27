import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SimRunner } from "@/components/leap/sim-runner";
import { getSimulation, getTrack, tracks } from "@/data/leap";

type Props = { params: Promise<{ track: string; sim: string }> };

export function generateStaticParams() {
  return tracks.flatMap((track) => track.simulations.map((sim) => ({ track: track.id, sim: sim.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track, sim } = await params;
  const lab = getSimulation(track, sim);
  if (!lab) return {};
  return { title: { absolute: `Week ${lab.week}: ${lab.title} — LEAP Labs` }, description: lab.tagline, robots: { index: false, follow: false } };
}

export default async function SimulationPage({ params }: Props) {
  const { track, sim } = await params;
  const owner = getTrack(track);
  if (!owner || !getSimulation(track, sim)) notFound();
  return <SimRunner trackId={owner.id} slug={sim} />;
}
