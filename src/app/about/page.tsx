import type { Metadata } from "next";
import Image from "next/image";
import { DecoDivider } from "@/components/deco-divider";
import { Masthead } from "@/components/masthead";
import { ReservationLookup } from "@/components/reservation-lookup";

export const metadata: Metadata = {
  title: "About",
  description: "The Black Veil supper club notice, as it stood before the closing.",
};

export default function AboutPage() {
  return (
    <div className="page-wrap about-page">
      <Masthead compact />
      <section className="history-intro">
        <p className="eyebrow">As it stood before the closing</p>
        <h1>A Manchester supper club, above the river.</h1>
        <p className="lede">
          Preserved by the office of management for public record. This notice has not been
          revised since October 1924.
        </p>
      </section>
      <DecoDivider />
      <section className="old-notice-copy">
        <article>
          <Image
            className="old-notice-image"
            src="/archive/fictional/black-veil-dining-room.png"
            alt="The Black Veil's empty dining room, set for supper with the orchestra stage beyond."
            width={1916}
            height={821}
          />
          <h2>Dining &amp; Orchestra</h2>
          <p>
            The Black Veil receives guests from eight in the evening until the last mill
            whistle. A house orchestra plays nightly excepting Sundays. Supper is served at
            the river tables; reservations are suggested and may be confirmed by telephone
            or in person at the door.
          </p>
        </article>
        <article>
          <Image
            className="old-notice-image"
            src="/archive/fictional/black-veil-dressing-room.png"
            alt="A private dressing room upstairs, with an evening gown, a tuxedo, and a masquerade mask laid out."
            width={1916}
            height={821}
          />
          <h2>By Introduction</h2>
          <p>
            Certain accommodations upstairs are reserved for members introduced personally
            to the proprietress. Management regrets that these rooms cannot be described
            further in a public notice, and asks that guests not press the staff for
            particulars.
          </p>
        </article>
      </section>
      <ReservationLookup />
      <DecoDivider />
      <p className="fine-print old-notice-signature">Established 1921 · Manchester, New Hampshire</p>
    </div>
  );
}
