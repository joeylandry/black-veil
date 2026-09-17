import { ArchiveRecord } from "@/data/archive";
import { NewspaperArtifact } from "@/components/newspaper-artifact";

export function NewspaperInspector({ record }: { record: ArchiveRecord }) {
  return (
    <div className="newspaper-scroll" role="region" aria-label="Scrollable newspaper artifact" tabIndex={0}>
      <NewspaperArtifact record={record} />
    </div>
  );
}
