import type { Metadata } from "next";
import { GuestLedger } from "@/components/guest-ledger";

export const metadata: Metadata = {
  title: "Guest Ledger",
  description: "The private membership ledger of The Black Veil. Admission is restricted.",
};

export default function GuestLedgerPage() {
  return <div className="page-wrap guest-ledger-page"><GuestLedger /></div>;
}
