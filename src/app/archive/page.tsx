import type { Metadata } from "next";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { DecoDivider } from "@/components/deco-divider";
import { archiveRecords } from "@/data/archive";

export const metadata: Metadata = {
  title: "Historical Archive",
  description: "Newspaper clippings, management papers, and incomplete records from The Black Veil, 1921–1926.",
};

export default function ArchivePage() {
  return (
    <div className="page-wrap archive-page">
      <header className="page-title">
        <p className="eyebrow">Public catalog · Box 17</p>
        <h1>Historical Archive</h1>
        <p>
          Eleven records survive. Several are incomplete. One should not exist.
        </p>
        <DecoDivider />
      </header>
      <div className="catalog-note">
        <span>Filed chronologically</span>
        <span>Access class: public</span>
        <span>Last inventory: Nov. 1924</span>
      </div>
      <section className="archive-grid" aria-label="Archive records">
        {archiveRecords.map((record, index) => (
          <ArchiveEntryCard key={record.slug} record={record} index={index} />
        ))}
      </section>
    </div>
  );
}
