import type { Metadata } from "next";
import { CtfGame } from "@/components/ctf-game";

export const metadata: Metadata = {
  title: "Restricted Postscript",
  description: "A private Black Veil record available only to names entered in the guest register.",
  robots: { index: false, follow: false },
};

export default function BlackRosePage() {
  return <div className="page-wrap ctf-page"><CtfGame /></div>;
}
