import type { Metadata } from "next";
import Link from "next/link";
import { DecoDivider } from "@/components/deco-divider";
import { Masthead } from "@/components/masthead";

export const metadata: Metadata = {
  title: "Our History",
  description: "A brief and necessarily incomplete history of The Black Veil, established 1921.",
};

export default function AboutPage() {
  return (
    <div className="page-wrap about-page">
      <Masthead compact />
      <section className="history-intro">
        <p className="eyebrow">A history approved by management</p>
        <h1>For those who required no introduction.</h1>
        <p className="lede">
          From 1921 until its indefinite closure, The Black Veil was a private house for fine company,
          discreet music, and the particular freedom afforded by an unmarked door.
        </p>
      </section>
      <DecoDivider />
      <section className="history-timeline">
        <article>
          <time>1921</time>
          <div><h2>The first door opens.</h2><p>Silas Vale leased the rooms beneath Bell & Sons and admitted forty-seven founding members. The house flower—a black rose—served where a sign would have been less prudent.</p></div>
        </article>
        <article>
          <time>1922</time>
          <div><h2>Reputation, carefully acquired.</h2><p>The Mirror Hall orchestra became celebrated. The police became curious. Neither development altered the evening programme for long.</p></div>
        </article>
        <article>
          <time>1923</time>
          <div><h2>Rooms within rooms.</h2><p>The Blue Room and Mourning Parlour were added to the club plan. Several accounts describe a west stair that appears on no surviving drawing.</p></div>
        </article>
        <article>
          <time>1924</time>
          <div><h2>The final masquerade.</h2><p>Something occurred during the All Hallows’ Eve gathering. Newspapers named it tragedy, scandal, raid, and accident—sometimes in the same edition. No complete official account survives.</p></div>
        </article>
        <article>
          <time>1925–26</time>
          <div><h2>A closed house keeps its hours.</h2><p>The rent remained paid. Correspondence continued to be collected. In 1926, invitations bearing the original insignia began circulating again. Management denies issuing them.</p></div>
        </article>
      </section>
      <aside className="quote-panel">
        <p>“A gentleman may leave his name at the door. A secret, once inside, belongs to the house.”</p>
        <span>— attributed to Silas Vale</span>
      </aside>
      <div className="center-link"><Link href="/archive" className="button-link">Consult the surviving records</Link></div>
    </div>
  );
}
