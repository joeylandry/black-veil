"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteHeader() {
  // LEAP Labs bring their own header.
  if (usePathname()?.startsWith("/leap")) return null;
  return (
    <header className="site-header">
      <Link href="/" className="header-mark" aria-label="The Black Veil, home">
        <BlackVeilInsignia />
        <span>The Black Veil</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/archive">Archive</Link>
        <Link href="/guest-ledger">Guest ledger</Link>
        <Link href="/game">Game</Link>
      </nav>
    </header>
  );
}
