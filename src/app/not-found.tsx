import Link from "next/link";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";

export default function NotFound() {
  return (
    <section className="not-found-page">
      <BlackVeilInsignia />
      <p className="eyebrow">Archive fault · Record 404</p>
      <h1>This page has been removed from the ledger.</h1>
      <p>Whether it was lost, destroyed, or never existed is a matter on which management declines to comment.</p>
      <Link href="/archive" className="button-link">Return to surviving records</Link>
    </section>
  );
}
