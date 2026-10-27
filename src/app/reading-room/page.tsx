import type { Metadata } from "next";
import { DeskSection } from "@/components/desks/desk-section";

export const metadata: Metadata = {
  title: "The Reading Room",
  description: "Analyst apprentice tickets: define and validate the digital archive.",
  robots: { index: false, follow: false },
};

export default function ReadingRoomPage() {
  return (
    <div className="page-wrap ctf-page bench-page desk-page">
      <DeskSection deskId="reading-room" />
    </div>
  );
}
