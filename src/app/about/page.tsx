import type { Metadata } from "next";
import Link from "next/link";
import { DecoDivider } from "@/components/deco-divider";
import { Masthead } from "@/components/masthead";

export const metadata: Metadata = {
  title: "Our History",
  description: "A sourced chronology of Manchester and the fictional Black Veil, 1921–1926.",
};

export default function AboutPage() {
  return (
    <div className="page-wrap about-page">
      <Masthead compact />
      <section className="history-intro">
        <p className="eyebrow">A history approved by management</p>
        <h1>A Manchester house remembered imperfectly.</h1>
        <p className="lede">
          The Black Veil and Cassandra Castello are fictional. The mills, strike, river,
          streets, immigrant communities, and pressures surrounding them belong to Manchester history.
        </p>
      </section>
      <DecoDivider />
      <section className="history-timeline">
        <article>
          <time>1921</time>
          <div><h2>The first door opens.</h2><p>A fictional private club begins operating somewhere between Elm Street, the river, and the Amoskeag works. Surviving records disagree about its address.</p></div>
        </article>
        <article>
          <time>1922</time>
          <div><h2>The city walks out.</h2><p>Amoskeag cuts wages by twenty percent and lengthens the work week. The real strike lasts nine months. Later fictional papers claim laborers and owners both passed through The Black Veil.</p></div>
        </article>
        <article>
          <time>1923</time>
          <div><h2>Whispers follow the river.</h2><p>Prohibition enforcement, Canadian liquor, and private meetings enter the club’s fictional record. No surviving account agrees on who protected the house.</p></div>
        </article>
        <article>
          <time>1924</time>
          <div><h2>The final masquerade.</h2><p>Something occurs on All Hallows’ Eve. Reports call it murder, accident, disturbance, and rumor. Proprietress Cassandra Castello disappears. No body is found.</p></div>
        </article>
        <article>
          <time>1925–26</time>
          <div><h2>A closed house keeps its hours.</h2><p>The file thins. Then black envelopes bearing the old insignia begin circulating in Manchester. Cassandra is still missing. The sender is unknown.</p></div>
        </article>
      </section>
      <aside className="quote-panel">
        <p>“If Cassandra disappeared two years ago, who sent the invitations?”</p>
        <span>— question entered without signature, October 1926</span>
      </aside>
      <div className="center-link"><Link href="/archive" className="button-link">Consult the surviving records</Link></div>
    </div>
  );
}
