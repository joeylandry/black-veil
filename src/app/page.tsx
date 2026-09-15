import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { NewspaperArtifact } from "@/components/newspaper-artifact";
import { archiveRecords } from "@/data/archive";

export default function Home() {
  const cassandraFrontPage = archiveRecords.find((record) => record.slug === "murderer-or-murdered")!;
  const featured = archiveRecords.filter((record) => record.featured && record.slug !== "murderer-or-murdered");

  return (
    <>
      <section className="home-hero">
        <div className="mill-window" aria-hidden="true" />
        <div className="home-hero-copy">
          <BlackVeilInsignia />
          <p className="eyebrow">By private invitation · Manchester, New Hampshire</p>
          <h1>The Black<br />Veil</h1>
          <p className="hero-established">Established 1921</p>
          <div className="hero-event-line">
            <span>All Hallows’ Eve Masquerade</span>
            <strong>October 31, 1926</strong>
          </div>
          <p className="hero-tagline">The veil has lifted.</p>
          <Link className="button-link button-light" href="/guest-ledger">Enter the guest register</Link>
        </div>
        <aside className="black-envelope" aria-label="A black invitation envelope">
          <div className="envelope-flap" aria-hidden="true" />
          <BlackVeilInsignia />
          <p>For the person to whom this has been delivered</p>
          <small>Location disclosed to confirmed guests</small>
        </aside>
      </section>

      <section className="home-newspaper-hook" aria-labelledby="cassandra-hook-heading">
        <div className="hook-copy">
          <p className="eyebrow">Recovered from the 1924 file</p>
          <h2 id="cassandra-hook-heading">The house has opened before.</h2>
          <p>It closed after one masquerade. Its proprietress was never seen again.</p>
          <p className="hook-question">If Cassandra disappeared two years ago—who sent the invitations?</p>
          <Link className="artifact-link" href="/archive/murderer-or-murdered">Read the surviving front page <span aria-hidden="true">→</span></Link>
        </div>
        <Link className="hero-newspaper-link" href="/archive/murderer-or-murdered" aria-label="Examine the Murderer or Murdered newspaper front page">
          <NewspaperArtifact record={cassandraFrontPage} compact />
        </Link>
      </section>

      <section className="manchester-grounding">
        <div>
          <p className="eyebrow">Manchester · 1921–1926</p>
          <h2>Brick, river, whistle.</h2>
        </div>
        <div className="grounding-copy">
          <p>Beyond the unmarked door: the Merrimack in fog, streetcars on Elm, and the brick miles of Amoskeag. Mill hands and mill owners occupied the same city, seldom the same room.</p>
          <p>Later papers claimed The Black Veil received both. The claim is fiction. The pressure surrounding it—the strike, Prohibition, industrial decline, immigrant Manchester—is not.</p>
        </div>
      </section>

      <section className="home-records">
        <header className="section-heading heading-with-link">
          <div>
            <p className="eyebrow">Selected holdings · drawers 1921–1926</p>
            <h2>Three records remain out.</h2>
          </div>
          <Link className="artifact-link" href="/archive">Open the full case file <span aria-hidden="true">→</span></Link>
        </header>
        <div className="archive-table featured-table">
          {featured.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} />)}
        </div>
      </section>

      <section className="closing-question">
        <p className="eyebrow">October 1926</p>
        <h2>Some doors were never meant to reopen.</h2>
        <Link href="/guest-ledger" className="button-link">Find your name in the register</Link>
      </section>
    </>
  );
}
