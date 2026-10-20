import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eventConfig } from "@/config/event";
import { SecretPostscript } from "@/components/secret-postscript";

export const metadata: Metadata = {
  title: "Postscript",
  description: "An off-the-record postscript to The Black Veil archive.",
  robots: { index: false, follow: false },
};

export default function PostscriptPage() {
  // The trials are closed for now: send everyone to the game.
  if (!eventConfig.ctfOpen) redirect("/game");
  return <div className="page-wrap"><SecretPostscript /></div>;
}
