import type { Metadata } from "next";
import { SecretPostscript } from "@/components/secret-postscript";

export const metadata: Metadata = {
  title: "Postscript",
  description: "An off-the-record postscript to The Black Veil archive.",
  robots: { index: false, follow: false },
};

export default function PostscriptPage() {
  return <div className="page-wrap"><SecretPostscript /></div>;
}
