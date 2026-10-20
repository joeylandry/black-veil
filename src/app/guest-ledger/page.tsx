import type { Metadata } from "next";
import { CharacterCard } from "@/components/character-card";
import { GuestLedger } from "@/components/guest-ledger";
import { GuestRoster } from "@/components/guest-roster";

export const metadata: Metadata = {
  title: "Guest Ledger",
  description: "Enter your real name for The Black Veil masquerade in Manchester, October 23, 1926.",
};

export default function GuestLedgerPage() {
  return (
    <div className="page-wrap guest-ledger-page">
      <GuestLedger />
      <CharacterCard />
      <GuestRoster />
    </div>
  );
}
