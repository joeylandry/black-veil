import { softwareEngineerSims } from "./software-engineer";
import { story } from "./story";
import { systemsAnalystSims } from "./systems-analyst";
import type { Simulation, Track, TrackId } from "./types";

export const tracks: Track[] = [
  {
    id: "systems-analyst",
    name: "Systems Analyst Track",
    short: "SA",
    motto: "Define and validate.",
    summary: `Ten hands-on labs that take you from the life of a trade to a joint showcase: requirements, modelling, UX, APIs, testing and planning on ${story.platform}.`,
    phases: [
      { label: "Foundations, trading domain & data", weeks: [1, 2] },
      { label: "Requirements, modelling & design", weeks: [3, 5] },
      { label: "Systems literacy, product & quality", weeks: [6, 8] },
      { label: "Applied analysis & joint capstone", weeks: [9, 10] },
    ],
    simulations: systemsAnalystSims,
  },
  {
    id: "software-engineer",
    name: "Software Engineer Track",
    short: "SWE",
    motto: "Build and deliver.",
    summary: `Ten hands-on labs that take you from your first commit to a cloud launch: Git, security, Java, Spring, Angular, NestJS, analytics, quality and AWS on ${story.platform}.`,
    phases: [
      { label: "Foundations, ways of working & engineering practices", weeks: [1, 2] },
      { label: "Build spine, analytics & excellence", weeks: [3, 8] },
      { label: "Capstone, deployment & showcase", weeks: [9, 10] },
    ],
    simulations: softwareEngineerSims,
  },
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((track) => track.id === id);
}

export function getSimulation(trackId: string, slug: string): Simulation | undefined {
  return getTrack(trackId)?.simulations.find((sim) => sim.slug === slug);
}

export function simulationMinutes(sim: Simulation) {
  return sim.missions.reduce((total, mission) => total + mission.minutes, 0);
}

/** localStorage key holding one pair's progress through one simulation. */
export function progressKey(trackId: TrackId, slug: string) {
  return `leap:progress:${trackId}:${slug}`;
}

export type { Simulation, Track, TrackId } from "./types";
