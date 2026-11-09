import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExhibitDocument } from "@/components/exhibit/exhibit-document";
import { getRecord } from "@/data/case/records";

export async function generateMetadata({ params }: PageProps<"/file/record/[slug]">): Promise<Metadata> {
  const record = getRecord((await params).slug);
  return { title: record ? record.title : "Not in the file" };
}

/** A front-matter paper: open to every reader from the first day. */
export default async function RecordPage({ params }: PageProps<"/file/record/[slug]">) {
  const record = getRecord((await params).slug);
  if (!record) notFound();

  return (
    <div className="week-page">
      <nav className="week-crumbs" aria-label="File">
        <Link href="/file">← The file</Link>
      </nav>
      <header className="week-header">
        <p className="eyebrow">{record.number}</p>
        <h1>{record.title}</h1>
        <p className="week-summary">{record.summary}</p>
      </header>
      <div className="record-doc">
        <ExhibitDocument exhibit={record} />
      </div>
    </div>
  );
}
