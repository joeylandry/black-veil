import Image from "next/image";
import type { ReactNode } from "react";
import type { Block, CaseRecord } from "@/data/case/types";

/** Renders `{{x:12}}` as a redaction bar roughly twelve characters wide. */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\{\{x:(\d+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <span key={match.index} className="redacted" style={{ width: `${Number(match[1]) * 0.6}em` }} aria-label="redacted">
        {" "}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "masthead":
      return (
        <header className="doc-masthead">
          <p className="doc-masthead-name">{block.name}</p>
          <p className="doc-masthead-line">{block.line}</p>
        </header>
      );
    case "headline":
      return <h2 className={`doc-headline doc-headline-${block.size ?? "l"}`}>{block.text}</h2>;
    case "deck":
      return <p className="doc-deck">{block.text}</p>;
    case "byline":
      return <p className="doc-byline">{block.text}</p>;
    case "p":
      return (
        <p className="doc-p">
          <RichText text={block.text} />
        </p>
      );
    case "fields":
      return (
        <dl className="doc-fields">
          {block.rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                <RichText text={value} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <figure className="doc-table">
          <div className="doc-table-scroll">
            <table>
              <thead>
                <tr>
                  {block.head.map((cell, index) => (
                    <th key={index}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <figcaption>{block.note}</figcaption>}
        </figure>
      );
    case "image":
      return (
        <figure className={block.size === "small" ? "doc-image doc-image-small" : "doc-image"}>
          <Image src={block.src} alt={block.alt} width={1200} height={800} sizes={block.size === "small" ? "200px" : "(max-width: 760px) 100vw, 720px"} />
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
    case "stamp":
      return <p className={`doc-stamp doc-stamp-${block.tone ?? "red"}`}>{block.text}</p>;
    case "sign":
      return (
        <p className="doc-sign">
          <span className="doc-sign-name">{block.name}</span>
          <span className="doc-sign-title">{block.title}</span>
        </p>
      );
    case "margin":
      return <p className="doc-margin">{block.text}</p>;
    case "box":
      return (
        <aside className="doc-box">
          <p className="doc-box-title">{block.title}</p>
          {block.text.map((line, index) => (
            <p key={index}>
              <RichText text={line} />
            </p>
          ))}
        </aside>
      );
    case "statement":
      return (
        <section className="doc-statement">
          <p className="doc-statement-who">
            {block.who} <span>· {block.role}</span>
          </p>
          {block.text.map((line, index) => (
            <p key={index}>“{line}”</p>
          ))}
        </section>
      );
    case "wire":
      return (
        <section className="doc-wire">
          <p className="doc-wire-meta">{block.meta}</p>
          {block.lines.map((line, index) => (
            <p key={index} className="doc-wire-strip">
              {line}
            </p>
          ))}
        </section>
      );
    case "rule":
      return <hr className="doc-rule" />;
  }
}

/** One exhibit as a physical document. Server-rendered; never import exhibit data client-side. */
export function ExhibitDocument({ exhibit }: { exhibit: CaseRecord }) {
  return (
    <article className={`doc doc-${exhibit.kind}`} aria-label={`${exhibit.number}: ${exhibit.title}`}>
      <p className="doc-tag">
        {exhibit.number} · {exhibit.dated}
      </p>
      {exhibit.blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </article>
  );
}
