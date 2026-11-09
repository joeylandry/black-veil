"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ name }: { name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/file");
    router.refresh();
  }

  return (
    <span className="file-nav-member">
      <span>{name}</span>
      <button type="button" onClick={signOut} disabled={busy} className="link-button">
        Sign out
      </button>
    </span>
  );
}
