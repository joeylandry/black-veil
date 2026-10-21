import type { Metadata } from "next";
import { GuestLedger } from "@/components/guest-ledger";
import { GuestRoster } from "@/components/guest-roster";

export const metadata: Metadata = {
  title: "Guest Ledger",
  description: "Enter your real name for The Black Veil masquerade in Manchester, October 23, 1926.",
};

export default function GuestLedgerPage() {
  return (
    <div className="page-wrap guest-ledger-page">
      {/* your character and everyone coming come first; the name form and confirmation sit below once you are in */}
      <GuestRoster />
      <GuestLedger />
    </div>
  );
}
