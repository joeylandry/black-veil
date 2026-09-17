import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactInspector } from "@/components/artifact-inspector";
import { FitHeading } from "@/components/fit-heading";
import { NewspaperInspector } from "@/components/newspaper-inspector";
import { TerminalDiscovery } from "@/components/terminal/terminal-discovery";
import { archiveRecords, getArchiveRecord } from "@/data/archive";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return archiveRecords.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = getArchiveRecord(slug);
  if (!record) return {};
  return { title: record.title, description: record.excerpt };
}

export default async function ArchiveDocumentPage({ params }: Props) {
  const { slug } = await params;
  const record = getArchiveRecord(slug);
  if (!record) notFound();
  const index = archiveRecords.findIndex((item) => item.slug === record.slug);
  const previous = archiveRecords[index - 1];
  const next = archiveRecords[index + 1];
  const isNewspaper = record.format === "newspaper" || record.format === "front-page";

  return (
    <div className="record-room">
      <div className="record-toolbar">
        <Link href="/archive" className="record-return-link">← RETURN TO ARCHIVES</Link>
        <span>{record.catalogNumber}</span>
      </div>

      <nav className="record-pagination" aria-label="Adjacent archive records">
        {previous ? (
          <Link href={`/archive/${previous.slug}`}>
            <span aria-hidden="true">←</span>
            <span className="record-pagination-copy"><span>Previous record</span>{previous.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/archive/${next.slug}`}>
            <span className="record-pagination-copy"><span>Next record</span>{next.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : <span />}
      </nav>

      <div className={`record-stage record-stage-${record.format} ${isNewspaper ? "record-stage-full" : ""}`}>
        {isNewspaper ? (
          <NewspaperInspector record={record} />
        ) : record.imageOnly && record.image ? (
          <article className={`physical-document physical-document-${record.format} physical-document-image-only`}>
            <figure className="document-photograph">
              <div className="document-photograph-frame">
                <Image
                  src={record.image.src}
                  alt={record.image.alt}
                  width={record.image.width}
                  height={record.image.height}
                  sizes="(max-width: 800px) 88vw, 760px"
                  style={{ objectPosition: record.image.focalPoint ?? "center" }}
                />
              </div>
            </figure>
            {record.slug === "the-veil-has-lifted" && <TerminalDiscovery />}
          </article>
        ) : (
          <article className={`physical-document physical-document-${record.format}`}>
            <div className="document-punches" aria-hidden="true"><i /><i /></div>
            <header>
              <div><span>{record.format}</span><span>{record.catalogNumber}</span></div>
              <time>{record.date}</time>
              <FitHeading as="h1" maxRem={6} minRem={2.2}>{record.title}</FitHeading>
              {record.deck && <p>{record.deck}</p>}
            </header>
            {record.image && (
              <figure className="document-photograph">
                <div className="document-photograph-frame">
                  <Image
                    src={record.image.src}
                    alt={record.image.alt}
                    width={record.image.width}
                    height={record.image.height}
                    sizes="(max-width: 800px) 88vw, 760px"
                    style={{ objectPosition: record.image.focalPoint ?? "center" }}
                  />
                </div>
                <figcaption>{record.image.caption}</figcaption>
                <ArtifactInspector {...record.image} title={record.title} />
              </figure>
            )}
            <div className="physical-document-copy">
              {record.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {record.markings && <div className="record-markings">{record.markings.map((mark) => <span key={mark}>{mark}</span>)}</div>}
            {record.slug === "the-veil-has-lifted" && <TerminalDiscovery />}
          </article>
        )}
      </div>

      {record.provenance.sourceUrl && (
        <p className="record-source-link">
          <a href={record.provenance.sourceUrl} target="_blank" rel="noreferrer">Learn more about this record ↗︎</a>
        </p>
      )}
    </div>
  );
}
