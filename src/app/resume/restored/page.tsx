import type { Metadata } from "next";
import { RestoreSession } from "@/components/restore-session";

export const metadata: Metadata = {
  title: "Restoring Your Ledger",
  robots: { index: false, follow: false },
};

export default function ResumeRestoredPage() {
  return (
    <div className="page-wrap">
      <RestoreSession />
    </div>
  );
}
