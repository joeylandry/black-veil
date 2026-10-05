import type { Metadata } from "next";
import { ChallengeStandings } from "@/components/challenge-standings";
import { CharacterCard } from "@/components/character-card";
import { GuestLedger } from "@/components/guest-ledger";

export const metadata: Metadata = {
  title: "Guest Register",
  description: "Enter your real name for The Black Veil masquerade in Manchester, October 23, 1926.",
};

export default function GuestLedgerPage() {
  return (
    <div className="page-wrap guest-ledger-page">
      <GuestLedger />
      <CharacterCard />
      <ChallengeStandings />
    </div>
  );
}
