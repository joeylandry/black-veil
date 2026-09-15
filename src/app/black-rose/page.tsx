import type { Metadata } from "next";
import { BlackRoseGate } from "@/components/black-rose-gate";

export const metadata: Metadata = {
  title: "Restricted Postscript",
  description: "A private Black Veil record available only to names entered in the guest register.",
  robots: { index: false, follow: false },
};

export default function BlackRosePage() {
  return <div className="page-wrap ctf-page"><BlackRoseGate /></div>;
}
