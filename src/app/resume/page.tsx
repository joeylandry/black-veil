import type { Metadata } from "next";
import { ResumeForm } from "@/components/resume-form";

export const metadata: Metadata = {
  title: "Resume Your Ledger",
  description: "Sign back in to The Black Veil guest ledger on a new device.",
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <div className="page-wrap">
      <ResumeForm />
    </div>
  );
}
