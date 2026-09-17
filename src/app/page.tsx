import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { ClosureStamp } from "@/components/closure-stamp";
import { Masthead } from "@/components/masthead";
import { NewspaperHeroPreview } from "@/components/newspaper-hero-preview";
import { archiveRecords } from "@/data/archive";

export default function Home() {
  const cassandraFrontPage = archiveRecords.find((record) => record.slug === "murderer-or-murdered")!;
  const featuredOrder = ["last-photograph-at-the-masquerade", "terror-at-the-black-veil", "where-is-cassandra-castello"];
  const featured = featuredOrder.map((slug) => archiveRecords.find((record) => record.slug === slug)!);

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
          <NewspaperHeroPreview record={cassandraFrontPage} href="/archive/murderer-or-murdered" />
        </div>
      </section>

      <section className="section latest-records">
        <div className="section-heading heading-with-link">
          <div><h2>Archive</h2></div>
          <Link className="text-link light-link" href="/archive">Explore the full archive <span aria-hidden="true">→</span></Link>
        </div>
        <div className="archive-table featured-table">
          {featured.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} compact />)}
        </div>
      </section>
    </>
  );
}
