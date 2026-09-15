import Link from "next/link";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="header-mark" aria-label="The Black Veil, home">
        <BlackVeilInsignia />
        <span>The Black Veil</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/archive">Archive</Link>
        <Link href="/about">Our history</Link>
        <Link href="/guest-ledger">Guest ledger</Link>
      </nav>
    </header>
  );
}
