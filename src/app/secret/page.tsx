import type { Metadata } from "next";
import Link from "next/link";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { ctfChallenges } from "@/data/ctf";

export const metadata: Metadata = {
  title: "The Unlisted Room",
  description: "A record with no directory entry.",
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  const challenge = ctfChallenges.find((item) => item.id === "unlisted-room")!;

  return (
    <div className="page-wrap">
      <section className="invitation-locked">
        <BlackVeilInsignia />
        <p className="eyebrow">Secret flag · The Black Rose Trials</p>
        <h1>The Unlisted Room</h1>
        <p>{challenge.briefing}</p>
        <p className="secret-flag">{challenge.flag}</p>
        <p>Carry this finding back to the trials and enter it for {challenge.points} points.</p>
        <Link href="/black-rose" className="button-link">Return to the trials</Link>
      </section>
    </div>
  );
}
