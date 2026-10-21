import type { Metadata } from "next";
import Link from "next/link";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";

export const metadata: Metadata = {
  title: "The Game",
  description: "The game for The Black Veil, October 23, 1926.",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  return (
    <div className="page-wrap game-page">
      <section className="game-soon">
        <BlackVeilInsignia />
        <p className="eyebrow">The game · October 23, 1926</p>
        <h1>Opens at gameplay.</h1>
        <p>Your objectives, your secrets and everything you need for the night will appear here when the game begins. Nothing needs doing yet.</p>
        <p className="game-soon-note">In the meantime, find your character on the <Link href="/guest-ledger">guest ledger</Link>.</p>
      </section>
    </div>
  );
}
