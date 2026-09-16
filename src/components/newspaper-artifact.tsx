import Image from "next/image";
import { ArchiveRecord } from "@/data/archive";

export function NewspaperArtifact({ record }: { record: ArchiveRecord }) {
  const story = record.body[0] ?? record.excerpt;

  return (
    <article className="newspaper-artifact" aria-label={`${record.title}, ${record.date}`}>
      <div className="newsprint-fold" aria-hidden="true" />
      <header className="newspaper-masthead">
        <p>{record.edition ?? "Manchester, New Hampshire"}</p>
        <h2>{record.masthead ?? "The Manchester Record"}</h2>
        <div><span>{record.date}</span><span>Manchester, New Hampshire</span></div>
      </header>

      <section className="newspaper-lead">
        <p className="newspaper-kicker">{record.catalogNumber} · Special report</p>
        <h3 className={record.format === "front-page" ? "newspaper-headline-banner" : undefined}>{record.title}</h3>
        {record.deck && <p className="newspaper-deck">{record.deck}</p>}
      </section>

      <div className="newspaper-columns">
        <div className="newspaper-copy">
          <p><span className="newspaper-dateline">MANCHESTER, N.H.—</span>{story}</p>
          {record.body.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="continued">Continued on page 6</p>
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
          </figure>
        )}

        <aside className="newspaper-side" aria-label="Neighboring stories">
          {(record.neighboringCopy ?? ["Cold fog expected along the river", "Street railway notice"])
            .slice(0, 4)
            .map((item) => {
              const headline = typeof item === "string" ? item : item.headline;
              const body = typeof item === "string" ? "Local notices and ordinary city news continued inside this edition." : item.body;
              return (
                <div key={headline}>
                  <h4>{headline}</h4>
                  <p>{body}</p>
                </div>
              );
            })}
        </aside>

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
