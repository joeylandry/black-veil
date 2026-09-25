import type { Metadata } from "next";
import { BenchAccessGate } from "@/components/bench/bench-gate";
import { BenchSection } from "@/components/bench/bench-section";

export const metadata: Metadata = {
  title: "The Restoration Bench",
  description: "Present-day restoration tickets filed against the Manchester record.",
  robots: { index: false, follow: false },
};

export default function BenchIndexPage() {
  return (
    <div className="page-wrap ctf-page bench-page">
      <BenchAccessGate>
        <BenchSection />
      </BenchAccessGate>
    </div>
  );
}
