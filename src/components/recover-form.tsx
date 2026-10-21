"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

/** For a guest whose device forgot them: the name and email they registered with bring them straight back. */
export function RecoverForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter your name and the email you registered with.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    }).catch(() => null);
    if (response?.ok) {
      // /resume/restored loads this guest's page into the device, then opens the guest ledger.
      router.push("/resume/restored");
      return;
    }
    const body = await response?.json().catch(() => null);
    setError(body?.error ?? "The guest ledger could not be reached. Try again in a moment.");
    setBusy(false);
  }

  return (
    <form className="ledger-form ledger-recover" onSubmit={submit} noValidate>
      <header>
        <p className="eyebrow">Already on the list?</p>
        <h1>Find your character.</h1>
        <p>Enter the name and email you registered with. A small spelling slip in your name is fine.</p>
      </header>
      <div className="ledger-fields">
        <label>
          <span>Your name</span>
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Your email</span>
          <input type="email" name="email" autoComplete="email" autoCapitalize="none" inputMode="email" required />
        </label>
      </div>
      {error && <small className="field-error" role="alert">{error}</small>}
      <button className="ledger-submit" type="submit" disabled={busy}>{busy ? "Looking…" : "Find me"}</button>
    </form>
  );
}
