"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { eventConfig } from "@/config/event";
import { setStorageValue } from "@/lib/use-storage-value";

export function RestoreSession() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((me) => {
        // A guest added without an RSVP still gets their page: this device just remembers them as coming.
        const rsvp = me.rsvp ?? {
          fullName: me.guest.fullName,
          email: me.guest.email,
          attending: "yes",
          note: "",
          dressAcknowledged: true,
          attendanceStatus: "confirmed",
          recordedAt: new Date().toISOString(),
        };
        setStorageValue(eventConfig.storageKeys.rsvp, JSON.stringify(rsvp));
        setStorageValue(eventConfig.storageKeys.ctfProgress, JSON.stringify(me.ctf));
        setStorageValue(eventConfig.storageKeys.puzzleComplete, "true");
        setStorageValue(eventConfig.storageKeys.registerUnlocked, "true");
        setStorageValue(eventConfig.storageKeys.entryMethod, "management-assisted");
        router.replace("/guest-ledger");
      })
      .catch(() => setError("Your sign-in link didn't work. Request a new one."));
  }, [router]);

  if (error) {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Sign-in failed</p>
        <h1>{error}</h1>
        <a className="button-link" href="/resume">Request a new link</a>
      </section>
    );
  }

  return <div className="ledger-checking" aria-live="polite">Restoring your ledger…</div>;
}
