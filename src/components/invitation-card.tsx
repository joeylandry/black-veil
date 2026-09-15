import Link from "next/link";
import { eventConfig } from "@/config/event";
import { BlackVeilInsignia } from "./black-veil-insignia";
import { DecoDivider } from "./deco-divider";

export function InvitationCard({ fullName }: { fullName?: string }) {
  return (
    <article className="invitation-card">
      <div className="invitation-corners" aria-hidden="true"><i /><i /><i /><i /></div>
      <BlackVeilInsignia />
      <p className="established">Manchester, New Hampshire · By private invitation</p>
      <h1>The Black Veil</h1>
      <p className="request-line">requests the pleasure of {fullName ? <><strong>{fullName}</strong> at</> : "your company at"}</p>
      <h2>An All Hallows’ Eve Masquerade</h2>
      <DecoDivider compact />
      <time>{eventConfig.fictionalEventDate}</time>
      <p className="invitation-details">Supper <span>•</span> Dancing <span>•</span> Masks</p>
      <dl>
        <div><dt>Doors</dt><dd>{eventConfig.doorsTime}</dd></div>
        <div><dt>Place</dt><dd>{eventConfig.location}</dd></div>
        <div><dt>Dress</dt><dd>1920s formal attire and masquerade</dd></div>
        <div><dt>Admission</dt><dd>Black envelope and confirmed name</dd></div>
      </dl>
      <p className="identity-line">Your name has been remembered.</p>
      <p className="invitation-warning">
        Management has located your file. If a private identity is prepared for the masquerade,
        it will follow only after the guest register is settled.
      </p>
      <p className="passphrase-line"><span>The enclosure reads</span><strong>{eventConfig.finalPassphrase}</strong></p>
      <Link href="/" className="invitation-home-link">Return to the public rooms</Link>
    </article>
  );
}
