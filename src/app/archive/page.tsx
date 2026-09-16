import type { Metadata } from "next";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { archiveRecords } from "@/data/archive";

export const metadata: Metadata = {
  title: "The Manchester Archive",
  description: "Newspapers, photographs, police papers, and contradictory records from The Black Veil, Manchester, 1921–1926.",
};

export default function ArchivePage() {
  return (
    <div className="archive-room">
      <header className="archive-room-header">
        <p className="eyebrow">Public catalog · Box 17</p>
        <h1>Historical Archive</h1>
        <div className="catalog-note">
          <span>Filed chronologically</span>
          <span>Access class: public</span>
          <span>Last inventory: Nov. 1924</span>
        </div>
      </header>

      <div className="archive-drawers">
        <div className="archive-table">
          {archiveRecords.map((record, index) => <ArchiveEntryCard key={record.slug} record={record} index={index} />)}
        </div>
      </div>
    </div>
  );
}
