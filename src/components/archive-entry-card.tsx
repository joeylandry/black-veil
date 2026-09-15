import Image from "next/image";
import Link from "next/link";
import { ArchiveRecord } from "@/data/archive";

export function ArchiveEntryCard({ record, index }: { record: ArchiveRecord; index: number }) {
  const tilt = ["-1.2deg", "0.7deg", "-0.35deg", "1.1deg"][index % 4];

  return (
    <article
      className={`archive-piece archive-piece-${record.format} ${record.featured ? "archive-piece-featured" : ""}`}
      style={{ "--tilt": tilt } as React.CSSProperties}
    >
      {record.image && (
        <figure className="archive-piece-image">
          <Image
            src={record.image.src}
            alt=""
            width={record.image.width}
            height={record.image.height}
            sizes="(max-width: 700px) 92vw, (max-width: 1000px) 45vw, 30vw"
          />
        </figure>
      )}
      <div className="archive-piece-copy">
        <div className="archive-piece-topline"><span>{record.format.replace("-", " ")}</span><span>{record.catalogNumber}</span></div>
        <time>{record.date}</time>
        <h3><Link href={`/archive/${record.slug}`}>{record.title}</Link></h3>
        {record.deck && <p className="archive-piece-deck">{record.deck}</p>}
        <p>{record.excerpt}</p>
        <Link href={`/archive/${record.slug}`} className="artifact-link">Open record <span aria-hidden="true">↗</span></Link>
      </div>
      {record.markings?.[0] && <span className="archive-stamp" aria-hidden="true">{record.markings[0]}</span>}
    </article>
  );
}
