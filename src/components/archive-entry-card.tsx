import Image from "next/image";
import Link from "next/link";
import { FitHeading } from "@/components/fit-heading";
import { ArchiveRecord } from "@/data/archive";

export function ArchiveEntryCard({ record, index, compact = false }: { record: ArchiveRecord; index: number; compact?: boolean }) {
  const tilt = ["-1.2deg", "0.7deg", "-0.35deg", "1.1deg"][index % 4];

  if (record.imageOnly && record.image) {
    return (
      <article
        className={`archive-piece archive-piece-${record.format} archive-piece-image-only`}
        style={{ "--tilt": tilt } as React.CSSProperties}
      >
        <Link href={`/archive/${record.slug}`} aria-label={record.title}>
          <figure className="archive-piece-image">
            <Image
              src={record.image.src}
              alt=""
              width={record.image.width}
              height={record.image.height}
              sizes="(max-width: 700px) 92vw, (max-width: 1000px) 45vw, 30vw"
              style={{ objectPosition: record.image.focalPoint ?? "center" }}
            />
          </figure>
        </Link>
      </article>
    );
  }

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
            style={{ objectPosition: record.image.focalPoint ?? "center" }}
          />
        </figure>
      )}
      <div className="archive-piece-copy">
        <div className="archive-piece-topline"><span>{record.format.replace("-", " ")}</span><span>{record.catalogNumber}</span></div>
        <time>{record.date}</time>
        <FitHeading as="h3" maxRem={compact ? 2.5 : 3.2} minRem={1.4}>
          <Link href={`/archive/${record.slug}`}>{record.title}</Link>
        </FitHeading>
        {record.deck && <p className="archive-piece-deck">{record.deck}</p>}
        <p>{record.excerpt}</p>
        <Link href={`/archive/${record.slug}`} className="artifact-link">Open record <span aria-hidden="true">↗︎</span></Link>
      </div>
    </article>
  );
}
