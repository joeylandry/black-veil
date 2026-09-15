import Link from "next/link";
import { ArchiveRecord } from "@/data/archive";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function ArchiveEntryCard({ record, index }: { record: ArchiveRecord; index: number }) {
  return (
    <article className={`archive-card archive-card-${record.format}`} style={{ "--tilt": `${index % 2 === 0 ? -0.35 : 0.3}deg` } as React.CSSProperties}>
      <div className="archive-card-topline">
        <span>{record.format}</span>
        <span>BV–{String(index + 1).padStart(3, "0")}</span>
      </div>
      <time>{record.date}</time>
      <h2><Link href={`/archive/${record.slug}`}>{record.title}</Link></h2>
      <p>{record.excerpt}</p>
      <div className="archive-card-footer">
        <Link href={`/archive/${record.slug}`} className="text-link">Examine record <span aria-hidden="true">→</span></Link>
        {record.rose && <BlackVeilInsignia className="card-rose" />}
      </div>
    </article>
  );
}
