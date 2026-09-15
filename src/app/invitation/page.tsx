import type { Metadata } from "next";
import { InvitationGate } from "@/components/invitation-gate";

export const metadata: Metadata = {
  title: "Private Invitation",
  description: "A black envelope for The Black Veil, Manchester, October 31, 1926.",
};

export default function InvitationPage() {
  return <div className="page-wrap invitation-page"><InvitationGate /></div>;
}
