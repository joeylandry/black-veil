import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { archiveRecords, archiveYears, getArchiveRecordsByYear } from "@/data/archive";

export const metadata: Metadata = {
  title: "The Manchester Archive",
  description: "Newspapers, photographs, police papers, and contradictory records from The Black Veil, Manchester, 1921–1926.",
};

export default function ArchivePage() {
  return (
    <div className="archive-room">
      <header className="archive-room-header">
        <p className="eyebrow">Municipal transfer · Collection BV · Public reading room</p>
        <h1>The Manchester<br />Archive</h1>
        <div className="archive-register-line">
          <span>{archiveRecords.length} surviving objects</span>
          <span>1921–1926</span>
          <span>Provenance attached</span>
        </div>
        <p>The Black Veil is fictional. Manchester’s places and history are not. Labels distinguish the two without settling what happened inside the story.</p>
      </header>

      <nav className="year-index" aria-label="Archive year index">
        <span>Drawer index</span>
        {archiveYears.map((year) => <Link key={year} href={`#year-${year}`}>{year}</Link>)}
      </nav>

      <div className="archive-drawers">
        {archiveYears.map((year) => {
          const records = getArchiveRecordsByYear(year);
          return (
            <section className={`archive-year archive-year-${year}`} id={`year-${year}`} key={year} aria-labelledby={`heading-${year}`}>
              <header className="drawer-label">
                <span>Drawer {String(year - 1920).padStart(2, "0")}</span>
                <h2 id={`heading-${year}`}>{year}</h2>
                <small>{records.length} {records.length === 1 ? "object" : "objects"}</small>
              </header>
              <div className="archive-table">
                {records.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index + year} />)}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="archive-method" id="sources">
        <div>
          <p className="eyebrow">About the archive</p>
          <h2>History is cited. Fiction is marked.</h2>
        </div>
        <div>
          <p>The Black Veil, Cassandra Castello, its alleged crimes, and all associated testimony are fictional. Genuine Manchester photographs and historical context retain source and rights information on each record.</p>
          <p>Generated historical-fiction images are labeled as such. They are designed to support the story and are never represented as authentic evidence.</p>
        </div>
      </aside>
    </div>
  );
}
