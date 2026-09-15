import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chronology, 1921–1926",
  description: "The unresolved chronology of The Black Veil inside the documented history of Manchester, New Hampshire.",
};

const years = [
  {
    year: "1921",
    label: "The door opens",
    fiction: "An invitation-only drinking establishment begins receiving callers somewhere in Manchester. No surviving record agrees on its address. Cassandra ‘Cassie’ Castello is named as proprietress.",
    history: "National Prohibition was in force. Manchester’s economy and daily rhythm remained dominated by the enormous Amoskeag works along the Merrimack.",
  },
  {
    year: "1922",
    label: "The strike",
    fiction: "Later Black Veil papers claim mill hands, labor organizers, managers, businessmen, and policemen crossed the same threshold. No real historical person is named as a patron.",
    history: "Amoskeag cut wages by 20 percent and lengthened the work week from 48 to 54 hours. The resulting strike lasted nine months and affected the whole city.",
  },
  {
    year: "1923",
    label: "The whispers",
    fiction: "The club is linked in rumor to Canadian liquor, gambling, private bargains, and people who should not have been seen together. It avoids permanent closure. No record explains why.",
    history: "Manchester remained a multilingual immigrant mill city of French-Canadian, Irish, Greek, Jewish, Eastern European, and other communities, while New England textiles entered a difficult decade.",
  },
  {
    year: "1924",
    label: "The last masquerade",
    fiction: "Something happens on All Hallows’ Eve. Reports mention a death, an accident, police, no police, fleeing guests, and removed evidence. Cassandra disappears. No body is found. The Black Veil closes.",
    history: "The streets, boarding houses, streetcars, mills, canals, and neighborhoods in the surrounding record are grounded in period Manchester. The crime and club are fictional.",
  },
  {
    year: "1925",
    label: "No confirmed activity",
    fiction: "The rooms appear dormant. Cassandra remains missing. A few alleged sightings contradict one another. Someone continues paying expenses connected to the closed house.",
    history: "Amoskeag’s postwar competitive troubles continued through the 1920s, years before the company’s final collapse in the 1930s.",
  },
  {
    year: "1926",
    label: "The envelopes",
    fiction: "Black invitations suddenly circulate for an All Hallows’ Eve masquerade on October 31. They bear the old seal and no signature. Cassandra has been missing for two years.",
    history: "Manchester remains the setting: cold river fog, brick millyard, Elm Street traffic, and an industrial city whose divisions make secrecy plausible.",
  },
];

export default function AboutPage() {
  return (
    <div className="chronology-page">
      <header className="chronology-header">
        <p className="eyebrow">Collection chronology · Manchester, New Hampshire</p>
        <h1>1921–1926</h1>
        <p>The known record separates documented Manchester history from the fictional Black Veil case. It does not settle the case.</p>
      </header>

      <div className="chronology-key" aria-label="Chronology key">
        <span><i className="key-history" /> Documented context</span>
        <span><i className="key-fiction" /> Black Veil fiction</span>
      </div>

      <section className="chronology-ledger" aria-label="Black Veil chronology">
        {years.map((item) => (
          <article key={item.year}>
            <time>{item.year}</time>
            <div className="chronology-entry-heading"><span>{item.label}</span><h2>{item.label}</h2></div>
            <div className="chronology-fact key-history"><strong>Manchester record</strong><p>{item.history}</p></div>
            <div className="chronology-fact key-fiction"><strong>Black Veil file</strong><p>{item.fiction}</p></div>
          </article>
        ))}
      </section>

      <aside className="central-questions">
        <p className="eyebrow">Questions withheld from conclusion</p>
        <h2>Victim or suspect?</h2>
        <p>What happened in 1924? What happened to Cassandra Castello? Who kept the house’s accounts? Who sent the 1926 invitations?</p>
        <Link href="/archive" className="button-link button-light">Examine the evidence</Link>
      </aside>
    </div>
  );
}
