import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { ClosureStamp } from "@/components/closure-stamp";
import { DecoDivider } from "@/components/deco-divider";
import { InWorldNotice } from "@/components/in-world-notice";
import { Masthead } from "@/components/masthead";
import { NewspaperArtifact } from "@/components/newspaper-artifact";
import { archiveRecords } from "@/data/archive";

export default function Home() {
  const cassandraFrontPage = archiveRecords.find((record) => record.slug === "murderer-or-murdered")!;
  const featured = archiveRecords.filter((record) => record.featured && record.slug !== "murderer-or-murdered");

  return (
    <>
      <section className="hero paper-panel">
        <div className="hero-rule" aria-hidden="true" />
        <Masthead />
        <div className="hero-notice">
          <ClosureStamp />
          <div className="management-copy">
            <p className="eyebrow">Notice from the office of management</p>
            <h2>The house receives no company.</h2>
            <p>
              By resolution of management, ordinary operations ceased after the All Hallows’ Eve
              masquerade of 1924. Cassandra Castello cannot be reached. Correspondence concerning
              the night in question will be returned unopened.
            </p>
            <p className="signed">— Manchester, November 1924</p>
          </div>
        </div>
        <div className="posted-hours" aria-label="Posted hours">
          <span>Hours</span>
          <span className="posted-hours-text">Eight in the evening until the last mill whistle</span>
        </div>
      </section>

      <section className="home-newspaper-hook" aria-labelledby="cassandra-hook-heading">
        <div className="hook-copy">
          <p className="eyebrow">Recovered from the 1924 file</p>
          <h2 id="cassandra-hook-heading">The house has opened before.</h2>
          <p>It closed after one masquerade. Its proprietress was never seen again.</p>
          <p className="hook-question">If Cassandra disappeared two years ago—who sent the invitations?</p>
          <Link className="artifact-link light-link" href="/archive/murderer-or-murdered">Read the surviving front page <span aria-hidden="true">→</span></Link>
        </div>
        <Link className="hero-newspaper-link" href="/archive/murderer-or-murdered" aria-label="Examine the Murderer or Murdered newspaper front page">
          <NewspaperArtifact record={cassandraFrontPage} compact />
        </Link>
      </section>

      <section className="section latest-records">
        <div className="section-heading heading-with-link">
          <div><p className="eyebrow">Selected records · 1921–1926</p><h2>From the archive</h2></div>
          <Link className="text-link light-link" href="/archive">Explore the full archive <span aria-hidden="true">→</span></Link>
        </div>
        <div className="archive-table featured-table">
          {featured.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} />)}
        </div>
      </section>

      <section className="section intro-section">
        <div className="section-heading">
          <p className="eyebrow">The surviving Manchester record</p>
          <h2>A house remembered imperfectly.</h2>
        </div>
        <div className="two-column-copy">
          <p className="drop-cap">
            Somewhere between Elm Street, the Merrimack, and the brick mass of the Amoskeag works,
            The Black Veil offered illegal drink and uncommon privacy to people who did not ordinarily share a table.
          </p>
          <p>
            Correspondence addressed to the house is still collected, though by whom is not recorded.
            Those who ask after The Black Veil are told, politely, that it closed in 1924. Those who
            know the old words are not told this.
          </p>
        </div>
        <DecoDivider />
      </section>

      <section className="section notices-grid">
        <InWorldNotice label="Membership">
          <h3>Applications remain suspended.</h3>
          <p>Former members are advised that possession of a black envelope does not establish who sent it.</p>
        </InWorldNotice>
        <InWorldNotice label="Records office" className="notice-dark">
          <h3>Catalog irregularity.</h3>
          <p>One item bears a date later than the archive’s closure. Management considers this impossible.</p>
          <Link href="/archive/the-veil-has-lifted" className="text-link light-link">Examine the record</Link>
        </InWorldNotice>
        <InWorldNotice label="Unclaimed property">
          <h3>One black silk mask.</h3>
          <p>Recovered after the 1924 masquerade without its owner. The evidence label records no room.</p>
        </InWorldNotice>
      </section>
    </>
  );
}
