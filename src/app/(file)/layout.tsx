import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ToadMark } from "@/components/toad-mark";
import { SignOutButton } from "@/components/file/sign-out-button";
import { getViewer } from "@/lib/case/file";
import { siteConfig } from "@/config/site";

/**
 * Everything past the terminal. Anyone who arrives here without having come through the
 * door is sent back to it first.
 */
export default async function FileLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  if (!store.get(siteConfig.enteredCookie)) redirect("/");

  const viewer = await getViewer();

  return (
    <div className="file-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="file-header">
        <Link href="/file" className="file-brand">
          <ToadMark size={34} />
          <span>
            <span className="file-brand-name">Commonwealth of Massachusetts</span>
            <span className="file-brand-sub">Suffolk, ss. · Superior Court · File {siteConfig.fileNumber}</span>
          </span>
        </Link>
        <nav className="file-nav" aria-label="File">
          <Link href="/file">The file</Link>
          <Link href="/board">Board</Link>
          {viewer.member ? (
            <SignOutButton name={viewer.member.fullName.split(" ")[0]} />
          ) : (
            <Link href="/join" className="file-nav-cta">
              Join
            </Link>
          )}
        </nav>
      </header>
      <main id="main-content" className="file-main">
        {children}
      </main>
      <footer className="file-footer">
        <p>
          File {siteConfig.fileNumber} · impounded {siteConfig.impoundedOn} · seal expired {siteConfig.unsealedOn} · restoration in progress
        </p>
        <p>
          Every person, place and event in this file is fiction. <Link href="/admin">Staff</Link>
        </p>
      </footer>
    </div>
  );
}
