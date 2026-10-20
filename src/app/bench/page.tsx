import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eventConfig } from "@/config/event";
import { BenchAccessGate } from "@/components/bench/bench-gate";
import { BenchSection } from "@/components/bench/bench-section";

export const metadata: Metadata = {
  title: "The Restoration Bench",
  description: "Present-day restoration tickets filed against the Manchester record.",
  robots: { index: false, follow: false },
};

export default function BenchIndexPage() {
  // The trials are closed for now: send everyone to the game.
  if (!eventConfig.ctfOpen) redirect("/game");
  return (
    <div className="page-wrap ctf-page bench-page">
      <BenchAccessGate>
        <BenchSection />
      </BenchAccessGate>
    </div>
  );
}
