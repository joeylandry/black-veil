"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function JoinForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: data.get("fullName"), email: data.get("email"), code: data.get("code") }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? "That didn't work. Try again.");
        return;
      }
      router.push("/file");
      router.refresh();
    } catch {
      setError("The file could not be reached. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        Access code
        <input name="code" required autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="e.g. K7Q2MX" className="code-input" />
      </label>
      <label>
        Full name
        <input name="fullName" required autoComplete="name" maxLength={80} />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" maxLength={200} />
      </label>
      {error && (
        <p className="finding-message" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button" disabled={busy}>
        {busy ? "Opening…" : "Open the file"}
      </button>
    </form>
  );
}
