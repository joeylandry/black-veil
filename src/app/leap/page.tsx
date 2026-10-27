import type { Metadata } from "next";
import Link from "next/link";
import { simulationMinutes, tracks } from "@/data/leap";
import { story } from "@/data/leap/story";

export const metadata: Metadata = {
  title: { absolute: "LEAP Labs — hands-on simulations" },
  description: "Thirty-minute, pair-friendly simulations for the LEAP Systems Analyst and Software Engineer tracks.",
  robots: { index: false, follow: false },
};

export default function LeapHome() {
  return (
    <div className="leap-home">
      <section className="leap-home-hero">
        <p className="leap-eyebrow">10 weeks · 2 tracks · 20 labs</p>
        <h1>Learn it by doing it.</h1>
        <p>
          Every week of {story.program} onboarding comes with a 30-minute simulation set on {story.platformLong} at {story.firm}. Grab a partner, pick your
          week, and work through real hands-on missions — consoles, SQL, code, models and reviews — that check your work instantly.
        </p>
      </section>

      <section className="leap-track-cards" aria-label="Tracks">
        {tracks.map((track) => (
          <Link key={track.id} href={`/leap/${track.id}`} className={`leap-track-card ${track.id}`}>
            <span className="leap-track-short">{track.short}</span>
            <h2>{track.name}</h2>
            <p className="leap-track-motto">{track.motto}</p>
            <p>{track.summary}</p>
            <ul>
              {track.simulations.slice(0, 4).map((sim) => (
                <li key={sim.slug}>
                  <b>W{sim.week}</b> {sim.title}
                </li>
              ))}
              <li>
                <b>…</b> and {track.simulations.length - 4} more
              </li>
            </ul>
            <span className="leap-btn primary">
              Open the {track.short} labs · ~{Math.round(track.simulations.reduce((sum, sim) => sum + simulationMinutes(sim), 0) / 60)} hrs →
            </span>
          </Link>
        ))}
      </section>

      <section className="leap-how-grid" aria-label="How the labs work">
        <div>
          <span aria-hidden="true">👥</span>
          <h3>Built for pairs</h3>
          <p>One drives, one navigates. Roles swap every mission so both partners get hands on keyboard.</p>
        </div>
        <div>
          <span aria-hidden="true">🛠️</span>
          <h3>Really hands-on</h3>
          <p>Run Git and kubectl in a console, query a live Postgres database, write JavaScript that runs against tests, and review AI output.</p>
        </div>
        <div>
          <span aria-hidden="true">⭐</span>
          <h3>Stars and badges</h3>
          <p>Each mission is worth three stars; hints cost one. Clear every mission to earn the week&apos;s badge.</p>
        </div>
        <div>
          <span aria-hidden="true">🤖</span>
          <h3>AI, responsibly</h3>
          <p>Every lab practises the same habit: {story.assistant} drafts, humans verify. Spot the hallucination before it ships.</p>
        </div>
      </section>
    </div>
  );
}
