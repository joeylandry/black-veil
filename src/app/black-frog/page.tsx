import type { Metadata } from "next";
import { BlackFrogGate } from "@/components/black-frog-gate";

export const metadata: Metadata = {
  title: "Restricted Postscript",
  description: "A private Black Veil record available only to names entered in the guest ledger.",
  robots: { index: false, follow: false },
};

export default function BlackFrogPage() {
  return <div className="page-wrap ctf-page"><BlackFrogGate /></div>;
}
