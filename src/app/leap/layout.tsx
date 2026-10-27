import type { ReactNode } from "react";
import Link from "next/link";
import { story } from "@/data/leap/story";
import "./leap.css";

/**
 * LEAP Labs carry their own clean chrome: the Black Veil header and footer step aside on
 * these routes (see SiteHeader / SiteFooter) so the labs read like a training product.
 */
export default function LeapLayout({ children }: { children: ReactNode }) {
  return (
    <div className="leap-root">
      <header className="leap-header">
        <Link href="/leap" className="leap-brand">
          <span className="leap-brand-mark" aria-hidden="true">
            L
          </span>
          <span>
            {story.program} <b>Labs</b>
          </span>
        </Link>
        <nav aria-label="LEAP tracks">
          <Link href="/leap/systems-analyst">Systems Analyst</Link>
          <Link href="/leap/software-engineer">Software Engineer</Link>
        </nav>
      </header>
      <div className="leap-main">{children}</div>
      <footer className="leap-footer">
        <p>
          {story.program} Labs · hands-on simulations for the 10-week onboarding program. {story.firm}, {story.platform} and every person in these labs are
          fictional; the practices are real.
        </p>
        <p>Progress is saved in this browser only.</p>
      </footer>
    </div>
  );
}
