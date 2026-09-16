import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { ClosureStamp } from "@/components/closure-stamp";
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
        <div className="posted-hours" aria-label="Posted hours">
          <span>Hours</span>
          <span className="posted-hours-text">Eight in the evening until the last mill whistle</span>
        </div>
        <div className="hero-notice">
          <ClosureStamp />
          <div className="management-copy">
            <p className="eyebrow">Notice from the office of management</p>
            <h2>The house receives no company.</h2>
            <p>
              By resolution of management, all ordinary operations ceased after the All Hallows’
              Eve masquerade massacre of 1924. Cassandra Castello cannot be reached. The house is
              closed until further notice, and no visitors will be received.
            </p>
            <p className="signed">— November 1, 1924</p>
          </div>
        </div>
        <div className="hero-newspaper">
          <div className="newspaper-scroll" role="region" aria-label="Scrollable newspaper artifact" tabIndex={0}>
            <Link className="hero-newspaper-link" href="/archive/murderer-or-murdered" aria-label="Examine the Murderer or Murdered newspaper front page">
              <NewspaperArtifact record={cassandraFrontPage} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section latest-records">
        <div className="section-heading heading-with-link">
          <div><h2>Archive</h2></div>
          <Link className="text-link light-link" href="/archive">Explore the full archive <span aria-hidden="true">→</span></Link>
        </div>
        <div className="archive-table featured-table">
          {featured.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} />)}
        </div>
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
