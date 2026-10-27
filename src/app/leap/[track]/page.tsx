import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LabCardProgress } from "@/components/leap/lab-card-progress";
import { getTrack, simulationMinutes, tracks } from "@/data/leap";

type Props = { params: Promise<{ track: string }> };

export function generateStaticParams() {
  return tracks.map((track) => ({ track: track.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const track = getTrack((await params).track);
  if (!track) return {};
  return { title: { absolute: `${track.name} — LEAP Labs` }, description: track.summary, robots: { index: false, follow: false } };
}

export default async function TrackPage({ params }: Props) {
  const track = getTrack((await params).track);
  if (!track) notFound();
  const other = tracks.find((candidate) => candidate.id !== track.id);

  return (
    <div className="leap-track">
      <nav className="leap-crumbs" aria-label="Breadcrumb">
        <Link href="/leap">LEAP Labs</Link> <span aria-hidden="true">›</span> <span>{track.name}</span>
      </nav>
      <header className="leap-track-head">
        <p className="leap-eyebrow">
          {track.short} · {track.motto}
        </p>
        <h1>{track.name}</h1>
        <p>{track.summary}</p>
        <p className="leap-legend">
          <span className="leap-swatch shared" /> SA + SWE shared experience <span className="leap-swatch specific" /> {track.short} specific
        </p>
      </header>

      {track.phases.map((phase) => {
        const sims = track.simulations.filter((sim) => sim.week >= phase.weeks[0] && sim.week <= phase.weeks[1]);
        return (
          <section key={phase.label} className="leap-phase" aria-label={phase.label}>
            <h2>
              <span>{phase.label}</span>
              <small>
                Weeks {phase.weeks[0]}–{phase.weeks[1]}
              </small>
            </h2>
            <ul className="leap-cards">
              {sims.map((sim) => (
                <li key={sim.slug}>
                  <Link href={`/leap/${track.id}/${sim.slug}`} className={sim.shared ? "leap-card shared" : "leap-card"}>
                    <span className="leap-card-week">Week {sim.week}</span>
                    <span className="leap-card-focus">{sim.focus}</span>
                    <strong>{sim.title}</strong>
                    <span className="leap-card-tagline">{sim.tagline}</span>
                    <span className="leap-card-foot">
                      <span>
                        ⏱ {simulationMinutes(sim)} min · {sim.missions.length} missions
                      </span>
                      <LabCardProgress trackId={track.id} slug={sim.slug} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {other && (
        <p className="leap-switch">
          Looking for the other track? <Link href={`/leap/${other.id}`}>{other.name} →</Link>
        </p>
      )}
    </div>
  );
}
