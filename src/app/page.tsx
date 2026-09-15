import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { ClosureStamp } from "@/components/closure-stamp";
import { DecoDivider } from "@/components/deco-divider";
import { InWorldNotice } from "@/components/in-world-notice";
import { Masthead } from "@/components/masthead";
import { archiveRecords } from "@/data/archive";

export default function Home() {
  const featured = [archiveRecords[0], archiveRecords[6], archiveRecords[9]];

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
              By resolution of the proprietors, ordinary operations ceased following the circumstances
              surrounding our final All Hallows’ Eve engagement. No tables may be reserved. No memberships
              will be renewed. Correspondence concerning the night in question will be returned unopened.
            </p>
            <p className="signed">— Management, November 1924</p>
          </div>
        </div>
        <div className="crossed-hours" aria-label="Former opening hours, now cancelled">
          <span>Former hours</span>
          <del>Eight in the evening until discretion fails</del>
        </div>
      </section>

      <section className="section intro-section">
        <div className="section-heading">
          <p className="eyebrow">The surviving public record</p>
          <h2>A house remembered imperfectly.</h2>
        </div>
        <div className="two-column-copy">
          <p className="drop-cap">
            Beneath an unmarked street door, The Black Veil once offered music, supper, and uncommon privacy
            to those who understood the value of all three. Its rooms attracted financiers, actresses,
            politicians, and several persons who preferred not to be described.
          </p>
          <p>
            The archive has been assembled from newspapers, police property lists, private letters, and
            papers recovered after the closure. Gaps in the record are regrettable. Contradictions are not
            our responsibility. Certain catalog cards appear to have been added recently.
          </p>
        </div>
        <DecoDivider />
      </section>

      <section className="section latest-records">
        <div className="section-heading heading-with-link">
          <div>
            <p className="eyebrow">Selected records · 1921–1926</p>
            <h2>From the archive</h2>
          </div>
          <Link className="text-link" href="/archive">View the complete catalog <span aria-hidden="true">→</span></Link>
        </div>
        <div className="archive-grid featured-grid">
          {featured.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} />)}
        </div>
      </section>

      <section className="section notices-grid">
        <InWorldNotice label="Membership">
          <h3>Applications remain suspended.</h3>
          <p>Former members are advised that possession of a key does not constitute permission to enter.</p>
        </InWorldNotice>
        <InWorldNotice label="Records office" className="notice-dark">
          <h3>Catalog irregularity.</h3>
          <p>One item bears a date later than this archive’s closure. Management considers this impossible.</p>
          <Link href="/archive" className="text-link light-link">Consult the catalog</Link>
        </InWorldNotice>
        <InWorldNotice label="Unclaimed property">
          <h3>One black silk mask.</h3>
          <p>Recovered without its owner. Inquiries must include the name under which you entered.</p>
        </InWorldNotice>
      </section>
    </>
  );
}
