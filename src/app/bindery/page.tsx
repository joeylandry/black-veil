import type { Metadata } from "next";
import { DeskSection } from "@/components/desks/desk-section";

export const metadata: Metadata = {
  title: "The Bindery",
  description: "Engineering apprentice tickets: build and deliver the digital archive.",
  robots: { index: false, follow: false },
};

export default function BinderyPage() {
  return (
    <div className="page-wrap ctf-page bench-page desk-page">
      <DeskSection deskId="bindery" />
    </div>
  );
}
