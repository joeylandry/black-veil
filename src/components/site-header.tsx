"use client";

import Link from "next/link";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteHeader() {
  const registerUnlocked = useStorageValue(eventConfig.storageKeys.registerUnlocked) === "true";

  return (
    <header className="site-header">
      <Link href="/" className="header-mark" aria-label="The Black Veil, home">
        <BlackVeilInsignia />
        <span>The Black Veil</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/archive">Archive</Link>
        <Link href="/about">About</Link>
        <Link href="/guest-ledger">Guest ledger</Link>
        {registerUnlocked && <Link href="/black-rose">Black Rose Trials</Link>}
      </nav>
    </header>
  );
}
