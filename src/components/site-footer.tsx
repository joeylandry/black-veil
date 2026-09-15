import Link from "next/link";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BlackVeilInsignia />
      <p className="eyebrow">Manchester, New Hampshire · Established 1921</p>
      <div className="footer-links">
        <Link href="/archive">Case file</Link>
        <Link href="/about">Chronology</Link>
        <Link href="/guest-ledger">Guest register</Link>
      </div>
      <p className="fine-print">The Black Veil and Cassandra Castello are fictional. Historical sources are identified in the archive.</p>
    </footer>
  );
}
