import Link from "next/link";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BlackVeilInsignia />
      <p className="eyebrow">Established 1921 · The public rooms are closed</p>
      <div className="footer-links">
        <Link href="/archive">Historical records</Link>
        <Link href="/about">Management history</Link>
        <Link href="/guest-ledger">Private ledger</Link>
      </div>
      <p className="fine-print">Archive catalog last amended: October 31, 1926 · 11:47 P.M.</p>
    </footer>
  );
}
