import type { Metadata } from "next";
import { InvitationGate } from "@/components/invitation-gate";

export const metadata: Metadata = {
  title: "Private Invitation",
  description: "An invitation from The Black Veil. If it found you, it was meant to.",
};

export default function InvitationPage() {
  return <div className="page-wrap invitation-page"><InvitationGate /></div>;
}
