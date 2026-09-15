import Link from "next/link";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BlackVeilInsignia />
      <p className="eyebrow">Manchester, New Hampshire · Established 1921</p>
      <div className="footer-links">
        <Link href="/archive">Historical records</Link>
        <Link href="/about">Management history</Link>
        <Link href="/guest-ledger">Private ledger</Link>
      </div>
      <p className="fine-print">The Black Veil and Cassandra Castello are fictional. Historical sources are identified in the archive.</p>
    </footer>
  );
}
