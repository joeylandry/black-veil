import Image from "next/image";
import { ArchiveRecord, sideStories } from "@/data/archive";
import { getBenchLabForRecord } from "@/data/bench";
import { FitHeading } from "@/components/fit-heading";
import { NewspaperSide } from "@/components/newspaper-side";

export function NewspaperArtifact({ record }: { record: ArchiveRecord }) {
  const story = record.body[0] ?? record.excerpt;
  // Each paper carries one present-day conservation slip in its right-hand column.
  const slip = getBenchLabForRecord(record.slug);

  return (
    <article className="newspaper-artifact" aria-label={`${record.title}, ${record.date}`}>
      <div className="newsprint-fold" aria-hidden="true" />
      <header className="newspaper-masthead">
        <p>{record.edition ?? "Manchester, New Hampshire"}</p>
        <FitHeading>{record.masthead ?? "The Manchester Record"}</FitHeading>
        <div><span>{record.date}</span><span>Manchester, New Hampshire</span></div>
      </header>

      <section className="newspaper-lead">
        <p className="newspaper-kicker">{record.catalogNumber} · Special report</p>
        <FitHeading
          as="h3"
          className={record.format === "front-page" ? "newspaper-headline-banner" : undefined}
          maxRem={record.format === "front-page" ? 3.7 : 5.4}
          minRem={2}
        >
          {record.title}
        </FitHeading>
        {record.deck && <p className="newspaper-deck">{record.deck}</p>}
      </section>

      <div className="newspaper-columns">
        <div className="newspaper-copy">
          <p><span className="newspaper-dateline">MANCHESTER, N.H.—</span>{story}</p>
          {record.body.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="continued">Continued on page 6</p>
          {record.columnFiller && (
            <div className="newspaper-filler">
              <h5>{record.columnFiller.headline}</h5>
              <p>{record.columnFiller.body}</p>
            </div>
          )}
        </div>

        {record.image && (
          <figure className="newspaper-photo">
            <div className="newspaper-photo-frame">
              <Image
                src={record.image.src}
                alt={record.image.alt}
                width={record.image.width}
                height={record.image.height}
                sizes="(max-width: 900px) 74vw, 440px"
                style={{ objectPosition: record.image.focalPoint ?? "center" }}
              />
            </div>
            <figcaption>{record.image.caption}</figcaption>
            {record.image.note?.map((paragraph) => (
              <p className="newspaper-photo-note" key={paragraph}>{paragraph}</p>
            ))}
          </figure>
        )}

        <NewspaperSide stories={sideStories(record)}>
          {slip && (
            <div className="newspaper-slip">
              <h4>{slip.slip.headline}</h4>
              <p>{slip.slip.body}</p>
              <p className="newspaper-slip-mark">{slip.ticket} · Bench word: <strong>{slip.benchWord}</strong></p>
            </div>
          )}
        </NewspaperSide>

        {record.continuedArticle && (
          <div className="newspaper-page6">
            <h4>{record.continuedArticle.headline}</h4>
            {record.continuedArticle.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        )}
      </div>

      <footer className="newspaper-footer-ads" aria-label="Period advertisements">
        <div><strong>Warm rooms</strong><span>Furnished · respectable · West Side</span></div>
        <div><strong>Repair while you wait</strong><span>Clocks · typewriters · small machinery</span></div>
        <div><strong>Last streetcar</strong><span>Consult the winter schedule</span></div>
      </footer>
    </article>
  );
}
