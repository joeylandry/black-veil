import Link from "next/link";
import { eventConfig } from "@/config/event";
import { BlackVeilInsignia } from "./black-veil-insignia";
import { DecoDivider } from "./deco-divider";

export function InvitationCard({ fullName }: { fullName?: string }) {
  return (
    <article className="invitation-card">
      <div className="invitation-corners" aria-hidden="true"><i /><i /><i /><i /></div>
      <BlackVeilInsignia />
      <p className="established">By private invitation</p>
      <h1>The Black Veil</h1>
      <p className="request-line">requests the pleasure of {fullName ? <><strong>{fullName}</strong> at</> : "your company at"}</p>
      <h2>An All Hallows’ Eve Masquerade</h2>
      <DecoDivider compact />
      <time>{eventConfig.fictionalEventDate}</time>
      <p className="invitation-details">Cocktails <span>•</span> Dancing <span>•</span> Revelry</p>
      <dl>
        <div><dt>Doors</dt><dd>{eventConfig.doorsTime}</dd></div>
        <div><dt>Place</dt><dd>{eventConfig.location}</dd></div>
        <div><dt>Dress</dt><dd>1920s formal attire and masquerade</dd></div>
        <div><dt>Admission</dt><dd>Present the passphrase at the door</dd></div>
      </dl>
      <p className="identity-line">Your identity will be waiting inside.</p>
      <p className="invitation-warning">
        Every guest entering The Black Veil will assume a name not entirely their own. Confidential
        information will be provided upon arrival. Some may be shared. Some should remain secret.
        Trust accordingly.
      </p>
      <p className="passphrase-line"><span>The words</span><strong>{eventConfig.finalPassphrase}</strong></p>
      <Link href="/black-rose" className="trials-link">A restricted postscript bears your name</Link>
      <Link href="/" className="invitation-home-link">Return to the public rooms</Link>
    </article>
  );
}
