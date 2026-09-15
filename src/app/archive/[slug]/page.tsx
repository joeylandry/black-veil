import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DecoDivider } from "@/components/deco-divider";
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

  return (
    <div className="page-wrap document-page">
      <Link href="/archive" className="back-link">← Return to catalog</Link>
      <article className={`document-sheet document-${record.format} ${record.anomaly ? "document-anomaly" : ""}`}>
        <header className="document-header">
          <div className="document-labels">
            <span>{record.format}</span>
            <span>Public record · {record.year}</span>
          </div>
          <p className="document-source">{record.source}</p>
          <time>{record.date}</time>
          <h1>{record.title}</h1>
          <DecoDivider compact />
        </header>
        <div className="document-body">
          {record.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {record.markings && (
          <aside className="document-markings" aria-label="Archival markings">
            {record.markings.map((mark) => <span key={mark}>{mark}</span>)}
          </aside>
        )}
        {record.anomaly && <TerminalDiscovery />}
      </article>
      <nav className="document-nav" aria-label="Archive navigation">
        <Link href="/archive">All records</Link>
        <Link href="/archive/masquerade-night-desk-note">Related memorandum</Link>
      </nav>
    </div>
  );
}
