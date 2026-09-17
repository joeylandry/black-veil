"use client";

import Link from "next/link";
import { eventConfig } from "@/config/event";
import { useStorageValue } from "@/lib/use-storage-value";
import { BlackVeilInsignia } from "./black-veil-insignia";

export function SiteFooter() {
  const registerUnlocked = useStorageValue(eventConfig.storageKeys.registerUnlocked) === "true";

  return (
    <footer className="site-footer">
      <BlackVeilInsignia />
      <p className="eyebrow">Manchester, New Hampshire · Established 1921</p>
      <div className="footer-links">
        <Link href="/archive">Historical records</Link>
        <Link href="/about">About</Link>
        <Link href="/guest-ledger">Private ledger</Link>
        <Link href="/resume">Resume your register</Link>
      </div>
      <p className="fine-print">Archive catalog last amended: October 31, 1926 · 11:47 P.M.</p>
      {registerUnlocked && (
        <Link href="/postscript" className="footer-secret-link">secret secret flag</Link>
      )}
    </footer>
  );
}
