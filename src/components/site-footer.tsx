import Link from "next/link";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BlackVeilInsignia />
      <p className="eyebrow">Manchester, New Hampshire · Established 1921</p>
      <div className="footer-links">
        <Link href="/archive">Historical records</Link>
        <Link href="/about">About</Link>
        <Link href="/guest-ledger">Private ledger</Link>
      </div>
      <p className="fine-print">Archive catalog last amended: October 31, 1926 · 11:47 P.M.</p>
      <Link href="/postscript" className="footer-secret-link">secret secret flag</Link>
    </footer>
  );
}
